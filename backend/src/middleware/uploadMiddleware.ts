import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { Request } from 'express';

// Tipos MIME permitidos
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'application/pdf'
];

// Tamanho máximo por arquivo (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Configuração do storage
const storage = multer.diskStorage({
  destination: (req: Request, file, cb) => {
    const userId = (req as any).user?.id;
    if (!userId) {
      return cb(new Error('Usuário não autenticado'), '');
    }
    
    const userDir = path.join('uploads', 'verifications', userId);
    
    // Criar diretório se não existir
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }
    
    cb(null, userDir);
  },
  filename: (req, file, cb) => {
    // Sanitizar nome do arquivo
    const timestamp = Date.now();
    const side = file.fieldname; // 'front' ou 'back'
    const extension = path.extname(file.originalname).toLowerCase();
    
    // Validar extensão
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf'];
    if (!allowedExtensions.includes(extension)) {
      return cb(new Error('Tipo de arquivo não permitido'), '');
    }
    
    const filename = `${side}_${timestamp}${extension}`;
    cb(null, filename);
  }
});

// Filtro de arquivos
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Verificar tipo MIME
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(new Error('Tipo de arquivo não permitido. Use apenas JPG, PNG ou PDF.'));
  }
  
  cb(null, true);
};

// Configuração do multer
export const uploadConfig = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 2 // Máximo 2 arquivos (frente e verso)
  }
});

// Middleware para upload de documentos de verificação
export const uploadVerificationDocuments = uploadConfig.fields([
  { name: 'front', maxCount: 1 },
  { name: 'back', maxCount: 1 }
]);

// Middleware para compressão de imagens
export const compressImages = async (req: Request, res: any, next: any) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    
    if (!files) {
      return next();
    }

    const compressionPromises: Promise<void>[] = [];

    // Processar cada arquivo
    Object.keys(files).forEach(fieldname => {
      files[fieldname].forEach(file => {
        // Só comprimir imagens, não PDFs
        if (file.mimetype.startsWith('image/')) {
          const compressionPromise = compressImage(file);
          compressionPromises.push(compressionPromise);
        }
      });
    });

    // Aguardar todas as compressões
    await Promise.all(compressionPromises);
    
    next();
  } catch (error) {
    console.error('Erro na compressão de imagens:', error);
    next(error);
  }
};

// Função para comprimir uma imagem
async function compressImage(file: Express.Multer.File): Promise<void> {
  try {
    const inputPath = file.path;
    const outputPath = inputPath + '_compressed';
    
    // Comprimir imagem mantendo qualidade razoável
    await sharp(inputPath)
      .resize(1200, 1200, { 
        fit: 'inside',
        withoutEnlargement: true 
      })
      .jpeg({ 
        quality: 85,
        progressive: true 
      })
      .toFile(outputPath);
    
    // Substituir arquivo original pelo comprimido
    fs.unlinkSync(inputPath);
    fs.renameSync(outputPath, inputPath);
    
  } catch (error) {
    console.error('Erro ao comprimir imagem:', error);
    // Se falhar na compressão, continua com o arquivo original
  }
}

// Middleware para limpeza de arquivos em caso de erro
export const cleanupFiles = (req: Request, res: any, next: any) => {
  const originalSend = res.send;
  
  res.send = function(data: any) {
    // Se houve erro (status >= 400), limpar arquivos
    if (res.statusCode >= 400) {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      if (files) {
        Object.keys(files).forEach(fieldname => {
          files[fieldname].forEach(file => {
            if (fs.existsSync(file.path)) {
              fs.unlinkSync(file.path);
            }
          });
        });
      }
    }
    
    originalSend.call(this, data);
  };
  
  next();
};

// Rate limiting para uploads (simples implementação em memória)
const uploadAttempts = new Map<string, { count: number; resetTime: number }>();

export const uploadRateLimit = (req: Request, res: any, next: any) => {
  const userId = (req as any).user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'Usuário não autenticado' });
  }
  
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutos
  const maxAttempts = 5; // Máximo 5 uploads por janela
  
  const userAttempts = uploadAttempts.get(userId);
  
  if (!userAttempts || now > userAttempts.resetTime) {
    // Primeira tentativa ou janela expirou
    uploadAttempts.set(userId, { count: 1, resetTime: now + windowMs });
    return next();
  }
  
  if (userAttempts.count >= maxAttempts) {
    return res.status(429).json({ 
      error: 'Muitas tentativas de upload. Tente novamente em 15 minutos.' 
    });
  }
  
  // Incrementar contador
  userAttempts.count++;
  uploadAttempts.set(userId, userAttempts);
  
  next();
};