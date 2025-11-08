import { Router } from 'express';
import { ReviewController } from '../controllers/reviewController';

export function createReviewRoutes(reviewController: ReviewController): Router {
  const router = Router();

  // Fetch Hostaway reviews
  router.get('/hostaway', reviewController.getHostawayReviews);

  // Fetch Google reviews
  router.post('/google', reviewController.getGoogleReviews);

  // Get all reviews with filtering and sorting
  router.get('/', reviewController.getAllReviews);

  // Get approved reviews for public display
  router.get('/approved', reviewController.getApprovedReviews);

  // Get dashboard statistics
  router.get('/stats', reviewController.getStats);

  // Toggle review approval
  router.put('/:id/approve', reviewController.toggleApproval);

  return router;
}

