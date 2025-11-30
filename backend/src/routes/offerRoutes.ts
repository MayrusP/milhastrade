import { Router } from 'express';
import { OfferController } from '../controllers/offerController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Public routes
router.get('/', OfferController.getOffers);
router.get('/airlines', OfferController.getAirlines);

// Protected routes
router.post('/', authMiddleware, OfferController.createOffer);
router.get('/user/my-offers', authMiddleware, OfferController.getUserOffers);

// These need to be after the specific routes to avoid conflicts
router.get('/:id', OfferController.getOfferById);
router.put('/:id', authMiddleware, OfferController.updateOffer);
router.delete('/:id', authMiddleware, OfferController.deleteOffer);

export default router;