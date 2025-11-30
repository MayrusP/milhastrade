import { Router } from 'express';
import { userController } from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Todas as rotas de usuário requerem autenticação
router.use(authenticateToken);

// Obter perfil do usuário
router.get('/profile', userController.getProfile);

// Atualizar perfil
router.put('/profile', userController.updateProfile);

// Adicionar créditos
router.post('/credits/add', userController.addCredits);

export default router;