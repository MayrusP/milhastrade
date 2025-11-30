import { Router } from 'express';
import { TransactionController } from '../controllers/transactionController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// All transaction routes require authentication
router.use(authMiddleware);

router.post('/', TransactionController.createTransaction);
router.get('/user', TransactionController.getUserTransactions);
router.get('/stats', TransactionController.getTransactionStats);
router.get('/:id', TransactionController.getTransactionById);
router.put('/:id/status', TransactionController.updateTransactionStatus);

export default router;