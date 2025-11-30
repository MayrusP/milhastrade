import { Router } from 'express';
import { verificationController } from '../controllers/verificationController';
import { authMiddleware } from '../middleware/authMiddleware';
import { 
  uploadVerificationDocuments, 
  compressImages, 
  cleanupFiles, 
  uploadRateLimit 
} from '../middleware/uploadMiddleware';

const router = Router();

// Middleware de autenticação para todas as rotas
router.use(authMiddleware);

// Rotas do usuário
router.post(
  '/upload',
  uploadRateLimit,
  cleanupFiles,
  uploadVerificationDocuments,
  compressImages,
  verificationController.uploadDocuments
);

router.get('/status', verificationController.getVerificationStatus);

// Rotas administrativas
router.get('/admin/pending', verificationController.getPendingVerifications);
router.get('/admin/stats', verificationController.getVerificationStats);
router.get('/admin/:id', verificationController.getVerificationDetails);
router.put('/admin/:id/review', verificationController.reviewVerification);

export default router;