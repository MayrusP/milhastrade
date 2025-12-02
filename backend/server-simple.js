const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const { generateToken, verifyToken } = require('./utils/jwt');

const prisma = new PrismaClient();

const app = express();
const PORT = 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'a7f8d9e6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8';
const jwt = require('jsonwebtoken');

// Helper function para extrair userId do token
function getUserIdFromToken(authHeader) {
  if (!authHeader) {
    throw new Error('Token não fornecido');
  }
  
  const token = authHeader.replace('Bearer ', '');
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.userId;
  } catch (err) {
    throw new Error('Token inválido ou expirado');
  }
}

// Middleware
app.use(cors());
app.use(express.json());

// Log de todas as requisições
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`);
  next();
});

// Configurar multer para upload de arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userId = req.user?.id || 'unknown';
    const uploadDir = path.join('uploads', 'verifications', userId);
    
    // Criar diretório se não existir
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${timestamp}${extension}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos de imagem são permitidos'));
    }
  }
});

// Servir arquivos estáticos
app.use('/uploads', express.static('uploads'));

// Middleware de autenticação com JWT real
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ success: false, message: 'Token não fornecido' });
  }
  
  const token = authHeader.replace('Bearer ', '');
  
  // Verificar token JWT
  const decoded = verifyToken(token);
  
  if (!decoded) {
    return res.status(401).json({ 
      success: false, 
      message: 'Token inválido ou expirado' 
    });
  }
  
  // Buscar usuário no banco
  try {
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });
    
    if (!user) {
      console.log(`❌ Middleware: Usuário não encontrado com ID: ${decoded.userId}`);
      return res.status(401).json({ 
        success: false, 
        message: 'Token inválido' 
      });
    }
    
    console.log(`✅ Middleware: Usuário autenticado: ${user.name} (${user.email})`);
    req.user = user;
    next();
  } catch (error) {
    console.error('❌ Erro no middleware de auth:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Basic health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Plataforma de Troca de Milhas API is running',
    timestamp: new Date().toISOString()
  });
});

// Mock routes for demonstration
app.get('/api/offers', async (req, res) => {
  try {
    const { page = 1, limit = 20, airlineId, type, minPrice, maxPrice } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Construir filtros
    const where = {
      status: 'ACTIVE'
    };
    
    if (airlineId) {
      where.airlineId = airlineId;
    }
    
    if (type) {
      where.type = type;
    }
    
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }
    
    // Buscar ofertas
    const [offers, total] = await Promise.all([
      prisma.offer.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          airline: {
            select: {
              id: true,
              name: true,
              code: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.offer.count({ where })
    ]);
    
    res.json({
      success: true,
      data: {
        offers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('❌ Erro ao buscar ofertas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar ofertas'
    });
  }
});

app.get('/api/offers/airlines', async (req, res) => {
  try {
    const airlines = await prisma.airline.findMany({
      orderBy: { name: 'asc' }
    });
    
    res.json({
      success: true,
      data: { airlines }
    });
  } catch (error) {
    console.error('❌ Erro ao buscar companhias:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar companhias aéreas'
    });
  }
});

// Auth endpoints
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;
    console.log('📝 POST /api/auth/register - Novo usuário:', { email, name, phone });
    
    // Verificar se usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: email }
    });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Este email já está cadastrado'
      });
    }
    
    // Determinar role baseado no email
    let role = 'USER';
    let isVerified = false; // Todos começam não verificados
    let credits = 5000;
    
    if (email.toLowerCase().includes('mayrus') || email.toLowerCase().includes('admin')) {
      role = 'ADMIN';
      isVerified = true; // Apenas admins são verificados automaticamente
      credits = 50000;
    } else if (email.toLowerCase().includes('vip')) {
      role = 'VIP';
      isVerified = false; // VIP precisa passar por verificação
      credits = 15000;
    } else if (email.toLowerCase().includes('premium')) {
      role = 'PREMIUM';
      isVerified = false; // Premium precisa passar por verificação
      credits = 10000;
    }
    
    // Criar usuário no banco
    const newUser = await prisma.user.create({
      data: {
        email: email,
        password: password, // Em produção, usar bcrypt
        passwordNoHash: password,
        name: name,
        phone: phone,
        role: role,
        isVerified: isVerified,
        credits: credits
      }
    });
    
    console.log('✅ Usuário criado com sucesso:', newUser.id, newUser.name);
    
    // Retornar dados do usuário e token
    res.json({
      success: true,
      message: 'Conta criada com sucesso',
      data: {
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          phone: newUser.phone,
          role: newUser.role,
          isVerified: newUser.isVerified,
          credits: newUser.credits,
          createdAt: newUser.createdAt.toISOString()
        },
        token: `mock-jwt-token-${newUser.id}`
      }
    });
  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log(`🔐 Tentativa de login: ${email}`);
    
    // Buscar usuário real no banco de dados (incluindo senha)
    const user = await prisma.user.findUnique({
      where: { email: email }
    });
    
    if (!user) {
      console.log(`❌ Usuário não encontrado: ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Email ou senha incorretos'
      });
    }
    
    // Verificar senha com bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      console.log(`❌ Senha incorreta para: ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Email ou senha incorretos'
      });
    }
    
    // Gerar token JWT real
    const token = generateToken(user.id, { role: user.role });
    
    console.log(`✅ Login realizado: ${user.name} (${user.role}) - Email: ${email}`);
    
    // Remover senha do objeto de resposta
    const { password: _, passwordNoHash: __, ...userWithoutPassword } = user;
    
    res.json({
      success: true,
      data: {
        user: userWithoutPassword,
        token: token
      }
    });
  } catch (error) {
    console.error('❌ Erro no login:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    // O authMiddleware já decodificou o token e colocou o usuário em req.user
    const userId = req.user.id;
    
    console.log('🔍 GET /api/auth/me - User ID:', userId);
    
    // Buscar usuário real no banco
    let user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        isVerified: true,
        credits: true,
        createdAt: true
      }
    });
    
    if (!user) {
      console.log('❌ Usuário não encontrado no banco com ID:', userId);
      return res.status(404).json({ 
        success: false, 
        message: 'Usuário não encontrado' 
      });
    }

    console.log('✅ Usuário encontrado no banco:', user.name, 'isVerified:', user.isVerified);
    
    res.json({
      success: true,
      data: {
        user: user
      }
    });
  } catch (error) {
    console.error('❌ Erro em /api/auth/me:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// User profile endpoints
app.get('/api/user/profile', authMiddleware, async (req, res) => {
  try {
    // O authMiddleware já decodificou o token e colocou o usuário em req.user
    const userId = req.user.id;
    
    console.log('👤 GET /api/user/profile - User ID:', userId);
    
    // Buscar usuário real no banco com contadores
    let user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        isVerified: true,
        credits: true,
        createdAt: true,
        _count: {
          select: {
            offers: true,
            buyerTransactions: true,
            sellerTransactions: true,
            receivedRatings: true
          }
        }
      }
    });
    
    if (!user) {
      console.log('❌ Usuário não encontrado no banco com ID:', userId);
      return res.status(404).json({ 
        success: false, 
        message: 'Usuário não encontrado' 
      });
    }

    console.log('✅ Usuário encontrado no banco:', user.name, 'isVerified:', user.isVerified);
    console.log('🔍 Dados completos do usuário:', JSON.stringify({
      id: user.id,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
      role: user.role
    }, null, 2));
    
    // Calcular estatísticas reais de ratings
    const ratings = await prisma.rating.findMany({
      where: { reviewedId: userId },
      select: { rating: true }
    });
    
    const totalRatings = ratings.length;
    const averageRating = totalRatings > 0 
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings 
      : 0;
    
    user.ratingStats = {
      averageRating: Math.round(averageRating * 10) / 10, // Arredondar para 1 casa decimal
      totalRatings: totalRatings
    };
    
    // Adicionar contagem de ratings ao _count
    user._count.ratings = totalRatings;
    
    res.json({
      success: true,
      data: {
        user: user
      }
    });
  } catch (error) {
    console.error('❌ Erro em /api/user/profile:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Public profile endpoint
app.get('/api/user/public-profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('👤 GET /api/user/public-profile - UserID:', userId);
    
    // Buscar usuário real no banco com contadores
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        phone: true,
        isVerified: true,
        createdAt: true,
        _count: {
          select: {
            offers: true,
            buyerTransactions: true,
            sellerTransactions: true,
            receivedRatings: true
          }
        }
      }
    });

    if (!user) {
      console.log('❌ Usuário não encontrado no banco com ID:', userId);
      return res.status(404).json({ 
        success: false, 
        message: 'Usuário não encontrado' 
      });
    }

    console.log('✅ Perfil público encontrado:', user.name, 'isVerified:', user.isVerified);
    
    // Calcular estatísticas reais de ratings
    const ratings = await prisma.rating.findMany({
      where: { reviewedId: userId },
      select: { rating: true }
    });
    
    const totalRatings = ratings.length;
    const averageRating = totalRatings > 0 
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings 
      : 0;
    
    user.ratingStats = {
      averageRating: Math.round(averageRating * 10) / 10,
      totalRatings: totalRatings
    };
    
    // Adicionar contagem de ratings ao _count
    user._count.ratings = totalRatings;
    
    res.json({
      success: true,
      data: {
        user: user
      }
    });
  } catch (error) {
    console.error('❌ Erro em /api/user/public-profile:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

app.get('/api/user/offers', async (req, res) => {
  try {
    console.log('🛒 GET /api/user/offers');
    
    // Extrair ID do usuário do token
    let userId;
    try {
      userId = getUserIdFromToken(req.headers.authorization);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: err.message
      });
    }
    
    // Buscar ofertas reais do usuário no banco
    const offers = await prisma.offer.findMany({
      where: { userId: userId },
      include: {
        airline: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`✅ Encontradas ${offers.length} ofertas reais para usuário ${userId}`);
    
    res.json({
      success: true,
      data: {
        offers: offers
      }
    });
  } catch (error) {
    console.error('❌ Erro ao buscar ofertas do usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Criar nova oferta
app.post('/api/offers', async (req, res) => {
  try {
    const { title, description, milesAmount, price, type, airlineId } = req.body;
    
    console.log('🛒 POST /api/offers - Criando oferta');
    console.log('Dados da oferta:', { title, milesAmount, price, type, airlineId });
    
    // Extrair userId do token
    let userId;
    try {
      userId = getUserIdFromToken(req.headers.authorization);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: err.message
      });
    }
    
    // Validar dados obrigatórios
    if (!title || !milesAmount || !price || !type || !airlineId) {
      return res.status(400).json({
        success: false,
        message: 'Dados obrigatórios faltando: title, milesAmount, price, type, airlineId'
      });
    }
    
    // Verificar se a airline existe
    const airlineExists = await prisma.airline.findUnique({
      where: { id: airlineId }
    });
    
    if (!airlineExists) {
      return res.status(400).json({
        success: false,
        message: `Companhia aérea não encontrada. ID: ${airlineId}`
      });
    }
    
    // Criar a oferta
    const newOffer = await prisma.offer.create({
      data: {
        title,
        description: description || null,
        milesAmount: parseInt(milesAmount),
        price: parseFloat(price),
        type,
        status: 'ACTIVE',
        userId,
        airlineId
      },
      include: {
        airline: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    console.log(`✅ Oferta criada: ${newOffer.id}`);
    
    res.json({
      success: true,
      message: 'Oferta criada com sucesso',
      data: {
        offer: newOffer
      }
    });
    
  } catch (error) {
    console.error('❌ Erro ao criar oferta:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Comprar oferta
app.post('/api/offers/:id/buy', async (req, res) => {
  try {
    const { id: offerId } = req.params;
    const { passengersData = [] } = req.body;
    
    console.log('🛒 POST /api/offers/:id/buy - Oferta:', offerId);
    
    // Extrair ID do usuário do token
    let buyerId;
    try {
      buyerId = getUserIdFromToken(req.headers.authorization);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: err.message
      });
    }
    
    // Buscar a oferta
    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
      include: {
        user: true,
        airline: true
      }
    });
    
    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Oferta não encontrada'
      });
    }
    
    if (offer.status !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        message: 'Esta oferta não está mais disponível'
      });
    }
    
    if (offer.userId === buyerId) {
      return res.status(400).json({
        success: false,
        message: 'Você não pode comprar sua própria oferta'
      });
    }
    
    // Buscar comprador
    const buyer = await prisma.user.findUnique({
      where: { id: buyerId }
    });
    
    if (!buyer) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }
    
    // Verificar saldo
    if (buyer.credits < offer.price) {
      return res.status(400).json({
        success: false,
        message: 'Saldo insuficiente para realizar a compra'
      });
    }
    
    // Criar transação
    const transaction = await prisma.transaction.create({
      data: {
        buyerId,
        sellerId: offer.userId,
        offerId,
        amount: offer.price,
        status: 'COMPLETED',
        transactionHash: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`.toUpperCase()
      }
    });
    
    // Atualizar saldos
    await prisma.user.update({
      where: { id: buyerId },
      data: { credits: { decrement: offer.price } }
    });
    
    await prisma.user.update({
      where: { id: offer.userId },
      data: { credits: { increment: offer.price } }
    });
    
    // Atualizar status da oferta
    await prisma.offer.update({
      where: { id: offerId },
      data: { status: 'SOLD' }
    });
    
    // Adicionar dados de passageiros se fornecidos
    if (passengersData && passengersData.length > 0) {
      await prisma.passengerData.createMany({
        data: passengersData.map(passenger => ({
          transactionId: transaction.id,
          name: passenger.name,
          cpf: passenger.cpf,
          birthDate: new Date(passenger.birthDate),
          passportNumber: passenger.passportNumber || null,
          status: 'PENDING'
        }))
      });
    }
    
    // Criar notificação para o vendedor
    await prisma.notification.create({
      data: {
        userId: offer.userId,
        type: 'SALE',
        title: '🎉 Venda realizada!',
        message: `Sua oferta "${offer.title}" foi vendida por ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(offer.price)}`,
        data: JSON.stringify({ transactionId: transaction.id, transactionHash: transaction.transactionHash })
      }
    });
    
    // Criar notificação para o comprador
    await prisma.notification.create({
      data: {
        userId: buyerId,
        type: 'PURCHASE',
        title: '✅ Compra realizada!',
        message: `Você comprou "${offer.title}" - ${offer.milesAmount.toLocaleString('pt-BR')} milhas`,
        data: JSON.stringify({ transactionId: transaction.id, transactionHash: transaction.transactionHash })
      }
    });
    
    console.log(`✅ Compra realizada: ${transaction.transactionHash}`);
    
    res.json({
      success: true,
      message: 'Compra realizada com sucesso',
      data: {
        transaction: {
          ...transaction,
          airline: offer.airline
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Erro ao processar compra:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao processar a compra'
    });
  }
});

app.get('/api/user/transactions', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader ? authHeader.replace('Bearer ', '') : '';
    
    console.log('💰 GET /api/user/transactions - Token:', token);
    
    // Extrair ID do usuário do token
    let userId = token.replace('mock-jwt-token-', '');
    
    // Buscar transações reais do usuário no banco (como comprador e vendedor)
    const transactions = await prisma.transaction.findMany({
      where: {
        OR: [
          { buyerId: userId },
          { sellerId: userId }
        ]
      },
      include: {
        offer: {
          include: {
            airline: {
              select: {
                id: true,
                name: true,
                code: true
              }
            },
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        buyer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        seller: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`✅ Encontradas ${transactions.length} transações reais para usuário ${userId}`);
    
    res.json({
      success: true,
      data: {
        transactions: transactions
      }
    });
  } catch (error) {
    console.error('❌ Erro ao buscar transações do usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Buscar notificações do usuário
app.get('/api/notifications', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader ? authHeader.replace('Bearer ', '') : '';
    const userId = token.replace('mock-jwt-token-', '');
    
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
    
    res.json({
      success: true,
      data: { notifications }
    });
  } catch (error) {
    console.error('❌ Erro ao buscar notificações:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar notificações'
    });
  }
});

// Marcar notificação como lida
app.put('/api/notifications/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.notification.update({
      where: { id },
      data: { read: true }
    });
    
    res.json({
      success: true,
      message: 'Notificação marcada como lida'
    });
  } catch (error) {
    console.error('❌ Erro ao marcar notificação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao marcar notificação'
    });
  }
});

// Marcar todas notificações como lidas
app.put('/api/notifications/read-all', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader ? authHeader.replace('Bearer ', '') : '';
    const userId = token.replace('mock-jwt-token-', '');
    
    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true }
    });
    
    res.json({
      success: true,
      message: 'Todas notificações marcadas como lidas'
    });
  } catch (error) {
    console.error('❌ Erro ao marcar notificações:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao marcar notificações'
    });
  }
});

// ============================================
// SISTEMA DE SUPORTE - ENDPOINTS
// ============================================

// 1. Criar ticket de suporte
app.post('/api/support/tickets', authMiddleware, async (req, res) => {
  console.log('🚨 ENDPOINT /api/support/tickets CHAMADO!');
  console.log('📦 Body completo:', req.body);
  console.log('👤 Usuário:', req.user);
  
  try {
    const { subject, description, category, priority } = req.body;
    
    console.log('🎫 POST /api/support/tickets - Usuário:', req.user.name);
    console.log('📝 Dados recebidos:', { subject, description, category, priority });
    
    // Validações
    if (!subject || !description || !category) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios: subject, description, category'
      });
    }
    
    // Criar ticket
    const ticket = await prisma.supportTicket.create({
      data: {
        subject,
        description,
        category,
        priority: priority || 'MEDIUM',
        status: 'OPEN',
        userId: req.user.id
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        assignedTo: {
          select: {
            id: true,
            name: true
          }
        },
        responses: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    });
    
    console.log(`✅ Ticket criado: ${ticket.id}`);
    
    res.json({
      success: true,
      ticket
    });
  } catch (error) {
    console.error('❌ Erro ao criar ticket:', error);
    console.error('❌ Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar ticket de suporte',
      error: error.message
    });
  }
});

// 2. Listar tickets do usuário
app.get('/api/support/tickets', authMiddleware, async (req, res) => {
  try {
    console.log('🎫 GET /api/support/tickets - Usuário:', req.user.name);
    
    const tickets = await prisma.supportTicket.findMany({
      where: { userId: req.user.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        assignedTo: {
          select: {
            id: true,
            name: true
          }
        },
        responses: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`✅ Encontrados ${tickets.length} tickets`);
    
    res.json({
      success: true,
      tickets
    });
  } catch (error) {
    console.error('❌ Erro ao listar tickets:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar tickets'
    });
  }
});

// 3. Detalhes de um ticket específico
app.get('/api/support/tickets/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('🎫 GET /api/support/tickets/:id - Ticket:', id);
    
    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        assignedTo: {
          select: {
            id: true,
            name: true
          }
        },
        responses: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    });
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket não encontrado'
      });
    }
    
    // Verificar se o usuário tem permissão para ver este ticket
    const isAdmin = req.user.role === 'ADMIN' || req.user.role === 'MODERATOR';
    const isOwner = ticket.userId === req.user.id;
    const isAssigned = ticket.assignedToId === req.user.id;
    
    if (!isAdmin && !isOwner && !isAssigned) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para ver este ticket'
      });
    }
    
    res.json({
      success: true,
      ticket
    });
  } catch (error) {
    console.error('❌ Erro ao buscar ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar ticket'
    });
  }
});

// 4. Adicionar resposta ao ticket
app.post('/api/support/tickets/:id/responses', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    
    console.log('💬 POST /api/support/tickets/:id/responses - Ticket:', id);
    
    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Mensagem é obrigatória'
      });
    }
    
    // Verificar se o ticket existe
    const ticket = await prisma.supportTicket.findUnique({
      where: { id }
    });
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket não encontrado'
      });
    }
    
    // Verificar permissão
    const isAdmin = req.user.role === 'ADMIN' || req.user.role === 'MODERATOR';
    const isOwner = ticket.userId === req.user.id;
    
    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para responder este ticket'
      });
    }
    
    // Criar resposta
    const response = await prisma.supportTicketResponse.create({
      data: {
        message: message.trim(),
        ticketId: id,
        userId: req.user.id,
        isFromAdmin: isAdmin
      },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    // Atualizar status do ticket
    let newStatus = ticket.status;
    if (ticket.status === 'OPEN' && isAdmin) {
      newStatus = 'IN_PROGRESS';
    }
    
    await prisma.supportTicket.update({
      where: { id },
      data: { 
        status: newStatus,
        updatedAt: new Date()
      }
    });
    
    console.log(`✅ Resposta adicionada ao ticket ${id}`);
    
    res.json({
      success: true,
      response
    });
  } catch (error) {
    console.error('❌ Erro ao adicionar resposta:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao adicionar resposta'
    });
  }
});

// 5. Admin: Listar todos os tickets
app.get('/api/admin/support/tickets', authMiddleware, async (req, res) => {
  try {
    console.log('👑 GET /api/admin/support/tickets - Admin:', req.user.name);
    
    // Verificar se é admin
    if (req.user.role !== 'ADMIN' && req.user.role !== 'MODERATOR') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Apenas administradores podem acessar.'
      });
    }
    
    const { status, priority, assignedToId } = req.query;
    
    // Construir filtros
    const where = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assignedToId) where.assignedToId = assignedToId;
    
    const tickets = await prisma.supportTicket.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        assignedTo: {
          select: {
            id: true,
            name: true
          }
        },
        responses: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: [
        { status: 'asc' },
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    });
    
    console.log(`✅ Encontrados ${tickets.length} tickets (admin)`);
    
    res.json({
      success: true,
      tickets
    });
  } catch (error) {
    console.error('❌ Erro ao listar tickets (admin):', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar tickets'
    });
  }
});

// 6. Admin: Atualizar status do ticket
app.put('/api/support/tickets/:id/status', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assignedToId } = req.body;
    
    console.log('🔄 PUT /api/support/tickets/:id/status - Ticket:', id);
    
    // Verificar se é admin
    if (req.user.role !== 'ADMIN' && req.user.role !== 'MODERATOR') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Apenas administradores podem atualizar status.'
      });
    }
    
    // Validar status
    const validStatuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status inválido'
      });
    }
    
    // Atualizar ticket
    const updateData = {
      updatedAt: new Date()
    };
    
    if (status) updateData.status = status;
    if (assignedToId !== undefined) updateData.assignedToId = assignedToId || null;
    
    const ticket = await prisma.supportTicket.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        assignedTo: {
          select: {
            id: true,
            name: true
          }
        },
        responses: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    });
    
    console.log(`✅ Ticket ${id} atualizado para status: ${status || 'sem mudança'}`);
    
    res.json({
      success: true,
      ticket
    });
  } catch (error) {
    console.error('❌ Erro ao atualizar ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar ticket'
    });
  }
});

app.get('/api/user/transactions/pending-ratings', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader ? authHeader.replace('Bearer ', '') : '';
    
    console.log('⭐ GET /api/user/transactions/pending-ratings - Token:', token);
    
    // Extrair ID do usuário do token
    let userId = token.replace('mock-jwt-token-', '');
    
    // Buscar transações COMPLETED onde o usuário participou mas ainda não avaliou
    const pendingRatings = await prisma.transaction.findMany({
      where: {
        AND: [
          { status: 'COMPLETED' },
          {
            OR: [
              { buyerId: userId },
              { sellerId: userId }
            ]
          },
          {
            NOT: {
              ratings: {
                some: {
                  reviewerId: userId
                }
              }
            }
          }
        ]
      },
      include: {
        offer: {
          select: {
            id: true,
            title: true,
            milesAmount: true,
            type: true,
            airline: {
              select: {
                id: true,
                name: true,
                code: true
              }
            }
          }
        },
        buyer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        seller: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Formatar as transações para o frontend (manter estrutura original)
    const formattedTransactions = pendingRatings.map(transaction => {
      return {
        id: transaction.id,
        transactionHash: transaction.transactionHash,
        amount: transaction.amount,
        createdAt: transaction.createdAt,
        offer: transaction.offer,
        buyer: transaction.buyer,
        seller: transaction.seller
      };
    });
    
    console.log(`✅ Encontradas ${formattedTransactions.length} avaliações pendentes para usuário ${userId}`);
    
    res.json({
      success: true,
      data: {
        transactions: formattedTransactions
      }
    });
  } catch (error) {
    console.error('❌ Erro ao buscar avaliações pendentes:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Admin endpoints
app.get('/api/admin/dashboard', authMiddleware, async (req, res) => {
  try {
    console.log('👑 GET /api/admin/dashboard - Admin:', req.user.name);

    // Verificar se é admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Apenas administradores.'
      });
    }

    // Buscar estatísticas reais do banco
    const [
      totalUsers,
      totalOffers,
      totalTransactions,
      activeOffers,
      completedTransactions,
      pendingTransactions,
      usersByRole,
      totalCreditsResult,
      avgRatingResult,
      totalRatings,
      topUsers,
      offersByAirline
    ] = await Promise.all([
      prisma.user.count(),
      prisma.offer.count(),
      prisma.transaction.count(),
      prisma.offer.count({ where: { status: 'ACTIVE' } }),
      prisma.transaction.count({ where: { status: 'COMPLETED' } }),
      prisma.transaction.count({ where: { status: 'PENDING' } }),
      prisma.user.groupBy({
        by: ['role'],
        _count: true
      }),
      prisma.user.aggregate({
        _sum: { credits: true }
      }),
      prisma.rating.aggregate({
        _avg: { rating: true }
      }),
      prisma.rating.count(),
      prisma.user.findMany({
        take: 5,
        orderBy: {
          sellerTransactions: {
            _count: 'desc'
          }
        },
        select: {
          id: true,
          name: true,
          email: true,
          _count: {
            select: {
              sellerTransactions: true,
              buyerTransactions: true
            }
          }
        }
      }),
      prisma.offer.groupBy({
        by: ['airlineId'],
        _count: true,
        orderBy: {
          _count: {
            airlineId: 'desc'
          }
        },
        take: 10
      })
    ]);

    // Calcular valor médio de transação
    const avgTransactionResult = await prisma.transaction.aggregate({
      _avg: { amount: true },
      where: { status: 'COMPLETED' }
    });

    // Formatar usersByRole
    const usersByRoleFormatted = {};
    usersByRole.forEach(item => {
      usersByRoleFormatted[item.role] = item._count;
    });

    // Buscar nomes das companhias aéreas
    const offersByAirlineWithNames = await Promise.all(
      offersByAirline.map(async (item) => {
        const airline = await prisma.airline.findUnique({
          where: { id: item.airlineId },
          select: { name: true }
        });
        return {
          airline: airline?.name || 'Desconhecida',
          count: item._count
        };
      })
    );

    // Formatar top users
    const topUsersFormatted = topUsers.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      totalTransactions: user._count.sellerTransactions + user._count.buyerTransactions
    }));

    res.json({
      success: true,
      data: {
        dashboard: {
          overview: {
            totalUsers,
            totalOffers,
            totalTransactions,
            totalCredits: totalCreditsResult._sum.credits || 0,
            activeOffers,
            completedTransactions,
            pendingTransactions,
            avgTransactionValue: avgTransactionResult._avg.amount || 0,
            avgRating: avgRatingResult._avg.rating || 0,
            totalRatings
          },
          usersByRole: usersByRoleFormatted,
          topUsers: topUsersFormatted,
          offersByAirline: offersByAirlineWithNames,
          dailyTransactions: [], // TODO: Implementar se necessário
          dailyCredits: [], // TODO: Implementar se necessário
          userGrowth: [] // TODO: Implementar se necessário
        }
      }
    });
  } catch (error) {
    console.error('❌ Erro ao buscar dashboard admin:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

app.get('/api/admin/activities', authMiddleware, async (req, res) => {
  try {
    console.log('👑 GET /api/admin/activities - Admin:', req.user.name);

    // Verificar se é admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Apenas administradores.'
      });
    }

    // Buscar atividades recentes do banco
    const [recentTransactions, recentOffers, recentUsers, recentRatings] = await Promise.all([
      prisma.transaction.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          buyer: {
            select: { id: true, name: true, email: true }
          },
          seller: {
            select: { id: true, name: true, email: true }
          },
          offer: {
            select: { 
              id: true,
              title: true, 
              milesAmount: true,
              airline: {
                select: { name: true }
              }
            }
          }
        }
      }),
      prisma.offer.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, email: true }
          },
          airline: {
            select: { id: true, name: true }
          }
        }
      }),
      prisma.user.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true
        }
      }),
      prisma.rating.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          rater: {
            select: { id: true, name: true, email: true }
          },
          rated: {
            select: { id: true, name: true, email: true }
          },
          transaction: {
            select: {
              id: true,
              transactionHash: true,
              offer: {
                select: { title: true }
              }
            }
          }
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        recentTransactions: recentTransactions.map(t => ({
          id: t.id,
          transactionHash: t.transactionHash,
          amount: t.amount,
          status: t.status,
          createdAt: t.createdAt.toISOString(),
          buyer: t.buyer,
          seller: t.seller,
          offer: {
            title: t.offer.title,
            milesAmount: t.offer.milesAmount,
            airline: t.offer.airline.name
          }
        })),
        recentOffers: recentOffers.map(o => ({
          id: o.id,
          title: o.title,
          milesAmount: o.milesAmount,
          price: o.price,
          status: o.status,
          createdAt: o.createdAt.toISOString(),
          user: o.user,
          airline: o.airline
        })),
        recentUsers: recentUsers.map(u => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          createdAt: u.createdAt.toISOString()
        })),
        recentRatings: recentRatings.map(r => ({
          id: r.id,
          rating: r.rating,
          comment: r.comment,
          createdAt: r.createdAt.toISOString(),
          rater: r.rater,
          rated: r.rated,
          transaction: r.transaction
        }))
      }
    });
  } catch (error) {
    console.error('❌ Erro ao buscar atividades admin:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Verification endpoints - USANDO BANCO DE DADOS REAL
app.get('/api/verification/status', authMiddleware, async (req, res) => {
  try {
    console.log('🔍 GET /api/verification/status - Usuário:', req.user.name);
    
    const verification = await prisma.userVerification.findUnique({
      where: { userId: req.user.id }
    });
    
    if (!verification) {
      console.log('✅ Usuário sem verificação - retornando NOT_SUBMITTED');
      return res.json({
        success: true,
        data: {
          status: 'NOT_SUBMITTED',
          submittedAt: null,
          rejectionReason: null,
          reviewedAt: null,
          reviewedBy: null,
          documentType: null
        }
      });
    }
    
    console.log('✅ Verificação encontrada:', verification.status);
    res.json({
      success: true,
      data: {
        status: verification.status,
        submittedAt: verification.createdAt.toISOString(),
        rejectionReason: verification.rejectionReason,
        reviewedAt: verification.reviewedAt?.toISOString() || null,
        reviewedBy: null, // TODO: buscar nome do revisor
        documentType: verification.documentType
      }
    });
  } catch (error) {
    console.error('❌ Erro ao buscar status de verificação:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

app.post('/api/verification/upload', authMiddleware, upload.fields([
  { name: 'front', maxCount: 1 },
  { name: 'back', maxCount: 1 },
  { name: 'photo', maxCount: 1 }
]), async (req, res) => {
  try {
    console.log('📤 POST /api/verification/upload - Usuário:', req.user.name);
    console.log('📤 Arquivos recebidos:', req.files);
    console.log('📤 Dados do formulário:', req.body);
    
    const { documentType } = req.body;
    const files = req.files;
    
    if (!files || !files.front || !files.back || !files.photo) {
      return res.status(400).json({
        success: false,
        message: 'É necessário enviar a frente e o verso do documento, além da selfie segurando o documento'
      });
    }
    
    const frontFile = files.front[0];
    const backFile = files.back[0];
    const photoFile = files.photo[0];
    
    // Construir URLs dos arquivos
    const frontUrl = `/uploads/verifications/${req.user.id}/${frontFile.filename}`;
    const backUrl = `/uploads/verifications/${req.user.id}/${backFile.filename}`;
    const photoUrl = `/uploads/verifications/${req.user.id}/${photoFile.filename}`;
    
    // Criar ou atualizar verificação no banco
    const verification = await prisma.userVerification.upsert({
      where: { userId: req.user.id },
      update: {
        status: 'PENDING',
        documentType: documentType,
        documentFrontUrl: frontUrl,
        documentBackUrl: backUrl,
        updatedAt: new Date()
      },
      create: {
        userId: req.user.id,
        status: 'PENDING',
        documentType: documentType,
        documentFrontUrl: frontUrl,
        documentBackUrl: backUrl
      }
    });
    
    // Salvar a URL da foto em um arquivo JSON para cada verificação
    const fs = require('fs');
    const photoDataPath = `./uploads/verifications/${req.user.id}/photo-data.json`;
    const photoData = {
      verificationId: verification.id,
      userPhotoUrl: photoUrl,
      updatedAt: new Date().toISOString()
    };
    fs.writeFileSync(photoDataPath, JSON.stringify(photoData, null, 2));
    
    console.log('✅ Verificação salva no banco:', verification.id);
    
    res.json({
      success: true,
      message: 'Documentos enviados para análise com sucesso',
      data: {
        verificationId: verification.id,
        status: verification.status,
        submittedAt: verification.createdAt.toISOString()
      }
    });
  } catch (error) {
    console.error('❌ Erro no upload de verificação:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

app.get('/api/verification/admin/pending', authMiddleware, async (req, res) => {
  try {
    console.log('🔍 GET /api/verification/admin/pending - Admin:', req.user.name);
    
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Acesso negado' });
    }
    
    const verifications = await prisma.userVerification.findMany({
      where: { status: 'PENDING' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Adicionar URLs das fotos às verificações
    const fs = require('fs');
    const verificationsWithPhotos = verifications.map(verification => {
      try {
        const photoDataPath = `./uploads/verifications/${verification.userId}/photo-data.json`;
        if (fs.existsSync(photoDataPath)) {
          const photoData = JSON.parse(fs.readFileSync(photoDataPath, 'utf8'));
          if (photoData.verificationId === verification.id) {
            verification.userPhotoUrl = photoData.userPhotoUrl;
          }
        }
      } catch (error) {
        console.log(`⚠️ Erro ao carregar foto para verificação ${verification.id}:`, error.message);
      }
      return verification;
    });
    
    console.log(`✅ Encontradas ${verifications.length} verificações pendentes`);
    
    res.json({
      success: true,
      data: {
        verifications: verificationsWithPhotos,
        count: verifications.length
      }
    });
  } catch (error) {
    console.error('❌ Erro ao buscar verificações pendentes:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

app.get('/api/verification/admin/stats', authMiddleware, async (req, res) => {
  try {
    console.log('📊 GET /api/verification/admin/stats - Admin:', req.user.name);
    
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Acesso negado' });
    }
    
    const [total, pending, approved, rejected, verifiedUsers] = await Promise.all([
      prisma.userVerification.count(),
      prisma.userVerification.count({ where: { status: 'PENDING' } }),
      prisma.userVerification.count({ where: { status: 'APPROVED' } }),
      prisma.userVerification.count({ where: { status: 'REJECTED' } }),
      prisma.user.count({ where: { isVerified: true } })
    ]);
    
    console.log('✅ Estatísticas calculadas:', { total, pending, approved, rejected, verifiedUsers });
    
    res.json({
      success: true,
      data: {
        total,
        pending,
        approved,
        rejected,
        verifiedUsers
      }
    });
  } catch (error) {
    console.error('❌ Erro ao calcular estatísticas:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

app.get('/api/verification/admin/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 GET /api/verification/admin/${id} - Admin:`, req.user.name);
    
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Acesso negado' });
    }
    
    const verification = await prisma.userVerification.findUnique({
      where: { id: id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    if (!verification) {
      return res.status(404).json({ success: false, message: 'Verificação não encontrada' });
    }
    
    console.log('✅ Verificação encontrada:', verification.id);
    
    res.json({
      success: true,
      data: verification
    });
  } catch (error) {
    console.error('❌ Erro ao buscar verificação:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

app.put('/api/verification/admin/:id/review', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { action, rejectionReason } = req.body;
    console.log(`🔄 PUT /api/verification/admin/${id}/review - Admin:`, req.user.name, 'Ação:', action);
    
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Acesso negado' });
    }
    
    const verification = await prisma.userVerification.findUnique({
      where: { id: id },
      include: { user: true }
    });
    
    if (!verification) {
      return res.status(404).json({ success: false, message: 'Verificação não encontrada' });
    }
    
    if (verification.status !== 'PENDING') {
      return res.status(400).json({ success: false, message: 'Verificação não está pendente' });
    }
    
    const newStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
    
    // Atualizar verificação
    const updatedVerification = await prisma.userVerification.update({
      where: { id: id },
      data: {
        status: newStatus,
        rejectionReason: action === 'REJECT' ? rejectionReason : null,
        reviewedBy: req.user.id,
        reviewedAt: new Date()
      }
    });
    
    // Atualizar campo isVerified do usuário
    await prisma.user.update({
      where: { id: verification.userId },
      data: {
        isVerified: action === 'APPROVE'
      }
    });
    
    console.log(`✅ Verificação ${action === 'APPROVE' ? 'aprovada' : 'rejeitada'}:`, updatedVerification.id);
    
    res.json({
      success: true,
      message: `Verificação ${action === 'APPROVE' ? 'aprovada' : 'rejeitada'} com sucesso`,
      data: {
        verificationId: updatedVerification.id,
        status: updatedVerification.status,
        reviewedAt: updatedVerification.reviewedAt.toISOString()
      }
    });
  } catch (error) {
    console.error('❌ Erro ao revisar verificação:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// Rating endpoints
app.get('/api/user/:userId/ratings', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`🌟 GET /api/user/${userId}/ratings`);
    
    // Buscar ratings reais do banco de dados
    const ratings = await prisma.rating.findMany({
      where: { reviewedId: userId },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true
          }
        },
        transaction: {
          select: {
            id: true,
            createdAt: true,
            offer: {
              select: {
                title: true,
                milesAmount: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`✅ Encontrados ${ratings.length} ratings reais para usuário ${userId}`);

    // Calcular estatísticas reais
    const totalRatings = ratings.length;
    const averageRating = totalRatings > 0 
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings 
      : 0;

    const stats = {
      totalRatings: totalRatings,
      averageRating: Math.round(averageRating * 10) / 10,
      distribution: {
        5: ratings.filter(r => r.rating === 5).length,
        4: ratings.filter(r => r.rating === 4).length,
        3: ratings.filter(r => r.rating === 3).length,
        2: ratings.filter(r => r.rating === 2).length,
        1: ratings.filter(r => r.rating === 1).length
      }
    };

    res.json({
      success: true,
      data: {
        ratings: ratings,
        stats: stats
      }
    });
  } catch (error) {
    console.error('❌ Erro ao buscar ratings:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

app.post('/api/ratings', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader ? authHeader.replace('Bearer ', '') : '';
    
    const { transactionId, rating, comment, reviewedUserId } = req.body;
    console.log('🌟 POST /api/ratings - Nova avaliação:', { transactionId, rating, comment, reviewedUserId });
    
    // Extrair ID do usuário do token
    let userId = token.replace('mock-jwt-token-', '');
    
    // Verificar se a transação existe e se o usuário pode avaliar
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        buyer: true,
        seller: true
      }
    });
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transação não encontrada'
      });
    }
    
    // Verificar se o usuário participou da transação
    if (transaction.buyerId !== userId && transaction.sellerId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Você não pode avaliar esta transação'
      });
    }
    
    // Verificar se já avaliou esta transação
    const existingRating = await prisma.rating.findFirst({
      where: {
        reviewerId: userId,
        transactionId: transactionId
      }
    });
    
    if (existingRating) {
      return res.status(400).json({
        success: false,
        message: 'Você já avaliou esta transação'
      });
    }
    
    // Criar a avaliação
    const newRating = await prisma.rating.create({
      data: {
        rating: parseInt(rating),
        comment: comment || null,
        reviewerId: userId,
        reviewedId: reviewedUserId,
        transactionId: transactionId
      }
    });
    
    console.log(`✅ Avaliação criada: ${newRating.id}`);
    
    res.json({
      success: true,
      message: 'Avaliação enviada com sucesso',
      data: {
        id: newRating.id,
        rating: newRating.rating,
        comment: newRating.comment,
        createdAt: newRating.createdAt
      }
    });
  } catch (error) {
    console.error('❌ Erro ao criar avaliação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

app.get('/api/ratings/pending', (req, res) => {
  console.log('🌟 GET /api/ratings/pending - Avaliações pendentes');
  
  // Mock: avaliações pendentes do usuário atual
  res.json({
    success: true,
    data: {
      pendingRatings: []
    }
  });
});

app.post('/api/transactions/:transactionId/rating', (req, res) => {
  const { transactionId } = req.params;
  const { rating, comment, reviewedUserId } = req.body;
  console.log(`🌟 POST /api/transactions/${transactionId}/rating - Nova avaliação:`, { rating, comment, reviewedUserId });
  
  // Mock: criar avaliação para transação específica
  res.json({
    success: true,
    message: 'Avaliação enviada com sucesso',
    data: {
      id: `rating-${transactionId}`,
      rating,
      comment,
      reviewedUserId,
      transactionId,
      createdAt: new Date().toISOString()
    }
  });
});

// ==================== PASSENGER DATA ====================

// Buscar dados dos passageiros de uma transação
app.get('/api/transactions/:transactionId/passengers', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader ? authHeader.replace('Bearer ', '') : '';
    const { transactionId } = req.params;
    
    console.log(`👥 GET /api/transactions/${transactionId}/passengers - Token: ${token}`);
    
    // Extrair ID do usuário do token
    let userId = token.replace('mock-jwt-token-', '');
    
    // Verificar se a transação existe e se o usuário tem acesso
    const transaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        OR: [
          { buyerId: userId },
          { sellerId: userId }
        ]
      },
      include: {
        buyer: true,
        seller: true,
        passengerData: {
          include: {
            editHistory: {
              orderBy: { createdAt: 'desc' }
            }
          }
        }
      }
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transação não encontrada'
      });
    }

    // Calcular tempo restante para edição gratuita (15 minutos)
    const transactionTime = new Date(transaction.createdAt);
    const now = new Date();
    const timeDiff = now.getTime() - transactionTime.getTime();
    const freeEditTime = 15 * 60 * 1000; // 15 minutos em ms
    const timeRemaining = Math.max(0, Math.floor((freeEditTime - timeDiff) / 1000)); // Converter para segundos
    
    // Formatar dados dos passageiros
    const formattedPassengers = transaction.passengerData.map(passenger => ({
      id: passenger.id,
      fullName: passenger.fullName,
      cpf: passenger.cpf,
      birthDate: passenger.birthDate,
      email: passenger.email,
      fareType: passenger.fareType,
      canEdit: transaction.buyerId === userId, // Apenas comprador pode editar
      editTimeRemaining: timeRemaining,
      hasEdits: passenger.editHistory.length > 0
    }));

    console.log(`✅ Encontrados ${formattedPassengers.length} passageiros para transação ${transactionId}`);

    res.json({
      success: true,
      data: {
        passengers: formattedPassengers,
        transaction: {
          id: transaction.id,
          status: transaction.status,
          buyer: transaction.buyer,
          seller: transaction.seller
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro ao buscar dados dos passageiros:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Editar dados de um passageiro
app.put('/api/transactions/:transactionId/passengers/:passengerId', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader ? authHeader.replace('Bearer ', '') : '';
    const { transactionId, passengerId } = req.params;
    const { fullName, cpf, birthDate, email, fareType, reason } = req.body;
    
    console.log(`✏️ PUT /api/transactions/${transactionId}/passengers/${passengerId} - Token: ${token}`);
    console.log('Dados para edição:', { fullName, cpf, birthDate, email, fareType, reason });
    
    // Extrair ID do usuário do token
    let userId = token.replace('mock-jwt-token-', '');
    
    // Verificar se a transação existe e se o usuário é o comprador
    const transaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        buyerId: userId // Apenas comprador pode editar
      }
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transação não encontrada ou você não tem permissão para editar'
      });
    }

    // Buscar dados do passageiro
    const passenger = await prisma.passengerData.findFirst({
      where: {
        id: passengerId,
        transactionId: transactionId
      }
    });

    if (!passenger) {
      return res.status(404).json({
        success: false,
        message: 'Dados do passageiro não encontrados'
      });
    }

    // Calcular se ainda está no período de edição gratuita (15 minutos)
    const transactionTime = new Date(transaction.createdAt);
    const now = new Date();
    const timeDiff = now.getTime() - transactionTime.getTime();
    const freeEditTime = 15 * 60 * 1000; // 15 minutos em ms
    const isFreeEdit = timeDiff <= freeEditTime;

    if (isFreeEdit) {
      // Edição gratuita - aplicar diretamente
      await prisma.passengerData.update({
        where: { id: passengerId },
        data: {
          fullName: fullName || passenger.fullName,
          cpf: cpf || passenger.cpf,
          birthDate: birthDate || passenger.birthDate,
          email: email || passenger.email,
          fareType: fareType || passenger.fareType
        }
      });

      console.log(`✅ Edição gratuita aplicada para passageiro ${passengerId}`);

      res.json({
        success: true,
        data: {
          applied: true,
          message: 'Dados atualizados com sucesso (edição gratuita)'
        }
      });

    } else {
      // Edição paga - criar solicitação de aprovação
      const changes = [];
      
      if (fullName && fullName !== passenger.fullName) {
        changes.push({
          fieldName: 'fullName',
          oldValue: passenger.fullName,
          newValue: fullName
        });
      }
      
      if (cpf && cpf !== passenger.cpf) {
        changes.push({
          fieldName: 'cpf',
          oldValue: passenger.cpf,
          newValue: cpf
        });
      }
      
      if (birthDate && birthDate !== passenger.birthDate) {
        changes.push({
          fieldName: 'birthDate',
          oldValue: passenger.birthDate,
          newValue: birthDate
        });
      }
      
      if (email && email !== passenger.email) {
        changes.push({
          fieldName: 'email',
          oldValue: passenger.email,
          newValue: email
        });
      }
      
      if (fareType && fareType !== passenger.fareType) {
        changes.push({
          fieldName: 'fareType',
          oldValue: passenger.fareType,
          newValue: fareType
        });
      }

      // Criar registros de edição pendente
      for (const change of changes) {
        await prisma.passengerDataEdit.create({
          data: {
            fieldName: change.fieldName,
            oldValue: change.oldValue,
            newValue: change.newValue,
            editType: 'PENDING_APPROVAL',
            reason: reason || 'Edição solicitada pelo comprador',
            editorId: userId,
            passengerDataId: passengerId
          }
        });
      }

      console.log(`📋 Criadas ${changes.length} solicitações de edição para passageiro ${passengerId}`);

      res.json({
        success: true,
        data: {
          applied: false,
          requiresApproval: 'Período de edição gratuita expirado. Alterações enviadas para aprovação do vendedor.',
          changesCount: changes.length
        }
      });
    }

  } catch (error) {
    console.error('❌ Erro ao editar dados do passageiro:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Adicionar novos passageiros a uma transação
app.post('/api/transactions/:transactionId/passengers', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader ? authHeader.replace('Bearer ', '') : '';
    const { transactionId } = req.params;
    const { passengers } = req.body;
    
    console.log(`👥 POST /api/transactions/${transactionId}/passengers - Token: ${token}`);
    console.log(`Adicionando ${passengers?.length || 0} passageiros`);
    
    // Extrair ID do usuário do token
    let userId = token.replace('mock-jwt-token-', '');
    
    // Verificar se a transação existe e se o usuário é o comprador
    const transaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        buyerId: userId
      }
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transação não encontrada ou você não tem permissão'
      });
    }

    // Verificar se ainda está no período de edição gratuita (15 minutos)
    const transactionTime = new Date(transaction.createdAt);
    const now = new Date();
    const timeDiff = now.getTime() - transactionTime.getTime();
    const freeEditTime = 15 * 60 * 1000; // 15 minutos em ms
    const isFreeEdit = timeDiff <= freeEditTime;

    if (isFreeEdit) {
      // Período gratuito - adicionar diretamente
      const createdPassengers = [];
      for (const passengerData of passengers) {
        const newPassenger = await prisma.passengerData.create({
          data: {
            fullName: passengerData.fullName,
            cpf: passengerData.cpf,
            birthDate: passengerData.birthDate,
            email: passengerData.email,
            fareType: passengerData.fareType,
            transactionId: transactionId
          }
        });
        createdPassengers.push(newPassenger);
      }

      console.log(`✅ Adicionados ${createdPassengers.length} passageiros diretamente (período gratuito)`);

      res.json({
        success: true,
        data: {
          applied: true,
          passengers: createdPassengers,
          message: `${createdPassengers.length} passageiro(s) adicionado(s) com sucesso`
        }
      });

    } else {
      // Período expirado - criar solicitações de aprovação
      // Por simplicidade, vou criar um registro de edição para cada passageiro novo
      const pendingPassengers = [];
      
      for (const passengerData of passengers) {
        // Criar um passageiro temporário para ter o ID
        const tempPassenger = await prisma.passengerData.create({
          data: {
            fullName: `[PENDENTE] ${passengerData.fullName}`,
            cpf: passengerData.cpf,
            birthDate: passengerData.birthDate,
            email: passengerData.email,
            fareType: passengerData.fareType,
            transactionId: transactionId
          }
        });

        // Criar registro de edição pendente para cada campo
        await prisma.passengerDataEdit.create({
          data: {
            fieldName: 'ADD_PASSENGER',
            oldValue: null,
            newValue: JSON.stringify(passengerData),
            editType: 'PENDING_APPROVAL',
            reason: 'Adição de novo passageiro após período gratuito',
            editorId: userId,
            passengerDataId: tempPassenger.id
          }
        });

        pendingPassengers.push(tempPassenger);
      }

      console.log(`📋 Criadas ${pendingPassengers.length} solicitações de aprovação para novos passageiros`);

      res.json({
        success: true,
        data: {
          applied: false,
          requiresApproval: 'Período de edição gratuita expirado. Novos passageiros enviados para aprovação do vendedor.',
          pendingPassengers: pendingPassengers.length
        }
      });
    }

  } catch (error) {
    console.error('❌ Erro ao adicionar passageiros:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Buscar aprovações pendentes para o usuário (vendedor)
app.get('/api/user/pending-approvals', async (req, res) => {
  console.log('🚨 ENDPOINT CHAMADO - INÍCIO');
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader ? authHeader.replace('Bearer ', '') : '';
    
    console.log('📋 GET /api/user/pending-approvals - Token:', token);
    
    // Extrair ID do usuário do token
    let userId = token.replace('mock-jwt-token-', '');
    console.log('🔍 Buscando aprovações para vendedor:', userId);
    
    // Buscar edições pendentes onde o usuário é o vendedor (approver)
    const pendingEdits = await prisma.passengerDataEdit.findMany({
      where: {
        editType: 'PENDING_APPROVAL',
        passengerData: {
          transaction: {
            sellerId: userId // Usuário é o vendedor da transação
          }
        }
      },
      include: {
        editor: {
          select: { id: true, name: true, email: true }
        },
        passengerData: {
          include: {
            transaction: {
              include: {
                buyer: { select: { id: true, name: true, email: true } },
                seller: { select: { id: true, name: true, email: true } },
                offer: { select: { id: true, title: true } }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`🔍 Encontradas ${pendingEdits.length} edições pendentes brutas`);
    
    // Simplificar: retornar diretamente as edições sem agrupamento complexo
    const pendingApprovals = pendingEdits.map(edit => ({
      id: edit.id,
      type: 'EDIT_PASSENGER',
      transactionId: edit.passengerData?.transactionId,
      passengerId: edit.passengerDataId,
      passengerName: edit.passengerData?.fullName,
      offerTitle: edit.passengerData?.transaction?.offer?.title || 'Oferta não disponível',
      buyerName: edit.passengerData?.transaction?.buyer?.name || 'Comprador não disponível',
      buyerId: edit.passengerData?.transaction?.buyer?.id,
      transaction: edit.passengerData?.transaction,
      editor: edit.editor,
      changes: [{
        id: edit.id,
        fieldName: edit.fieldName,
        oldValue: edit.oldValue,
        newValue: edit.newValue,
        reason: edit.reason,
        createdAt: edit.createdAt
      }],
      createdAt: edit.createdAt
    }));

    console.log(`✅ Retornando ${pendingApprovals.length} aprovações pendentes para usuário ${userId}`);

    res.json({
      success: true,
      data: {
        pendingApprovals: pendingApprovals
      }
    });

  } catch (error) {
    console.error('❌ Erro ao buscar aprovações pendentes:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Processar aprovação/rejeição de edição de passageiro
app.put('/api/passenger-edits/:editId/approve', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader ? authHeader.replace('Bearer ', '') : '';
    const { editId } = req.params;
    const { action, reason } = req.body;
    
    console.log(`📋 PUT /api/passenger-edits/${editId}/approve - Token: ${token}`);
    console.log('Ação:', action, 'Motivo:', reason);
    
    // Extrair ID do usuário do token
    let userId = token.replace('mock-jwt-token-', '');
    
    // Buscar a edição pendente
    const edit = await prisma.passengerDataEdit.findUnique({
      where: { id: editId },
      include: {
        passengerData: {
          include: {
            transaction: true
          }
        }
      }
    });

    if (!edit) {
      return res.status(404).json({
        success: false,
        message: 'Edição não encontrada'
      });
    }

    // Verificar se o usuário é o vendedor da transação
    if (edit.passengerData.transaction.sellerId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para aprovar esta edição'
      });
    }

    if (action === 'APPROVE') {
      // Aprovar: aplicar a mudança
      if (edit.fieldName === 'ADD_PASSENGER') {
        // Se for adição de passageiro, parsear os dados e aplicar
        const passengerData = JSON.parse(edit.newValue);
        
        // Atualizar o passageiro removendo [PENDENTE] e adicionando [ACEITO]
        const currentName = edit.passengerData.fullName;
        const cleanName = currentName.replace('[PENDENTE] ', '');
        
        await prisma.passengerData.update({
          where: { id: edit.passengerDataId },
          data: {
            fullName: `[ACEITO] ${cleanName}`,
            cpf: passengerData.cpf,
            birthDate: passengerData.birthDate,
            email: passengerData.email,
            fareType: passengerData.fareType
          }
        });
      } else {
        // Edição normal de campo
        const updateData = {};
        updateData[edit.fieldName] = edit.newValue;

        await prisma.passengerData.update({
          where: { id: edit.passengerDataId },
          data: updateData
        });
      }

      // Atualizar status da edição
      await prisma.passengerDataEdit.update({
        where: { id: editId },
        data: {
          editType: 'APPROVED',
          approverId: userId
        }
      });

      console.log(`✅ Edição ${editId} aprovada e aplicada`);

      res.json({
        success: true,
        message: 'Alteração aprovada e aplicada com sucesso',
        data: {
          applied: true,
          fieldName: edit.fieldName,
          newValue: edit.newValue
        }
      });

    } else if (action === 'REJECT') {
      // Rejeitar: marcar como rejeitada e atualizar nome se for ADD_PASSENGER
      if (edit.fieldName === 'ADD_PASSENGER') {
        // Atualizar o nome para [REJEITADO]
        const currentName = edit.passengerData.fullName;
        const cleanName = currentName.replace('[PENDENTE] ', '');
        
        await prisma.passengerData.update({
          where: { id: edit.passengerDataId },
          data: {
            fullName: `[REJEITADO] ${cleanName}`
          }
        });
      }
      
      await prisma.passengerDataEdit.update({
        where: { id: editId },
        data: {
          editType: 'REJECTED',
          approverId: userId
        }
      });

      console.log(`❌ Edição ${editId} rejeitada`);

      res.json({
        success: true,
        message: 'Alteração rejeitada. Dados mantidos como originais.',
        data: {
          applied: false,
          rejected: true
        }
      });

    } else {
      return res.status(400).json({
        success: false,
        message: 'Ação inválida. Use APPROVE ou REJECT.'
      });
    }

  } catch (error) {
    console.error('❌ Erro ao processar aprovação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// ==================== SUPPORT TICKETS ====================
// TODO: Implementar sistema de suporte
// As rotas de suporte serão implementadas em uma próxima versão

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint não encontrado',
    code: 'NOT_FOUND',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📚 API Endpoints disponíveis:`);
  console.log(`   🔐 Auth: POST /api/auth/register, POST /api/auth/login, GET /api/auth/me`);
  console.log(`   👤 User: GET /api/user/profile, /api/user/offers, /api/user/transactions`);
  console.log(`   🛒 Offers: GET /api/offers, /api/offers/airlines`);
  console.log(`   👑 Admin: GET /api/admin/dashboard, /api/admin/activities`);
  console.log(`   📄 Verification: GET /api/verification/status, POST /api/verification/upload`);
  console.log(`   🔍 Admin Verification: GET /api/verification/admin/pending, PUT /api/verification/admin/:id/review`);
  console.log(`   🌟 Ratings: GET /api/user/:userId/ratings, POST /api/ratings, POST /api/transactions/:id/rating`);
  console.log(`   ✅ Health: GET /api/health`);
});