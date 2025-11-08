import { Request, Response } from 'express';
import { HostawayService } from '../services/hostawayService';
import { GooglePlacesService } from '../services/googlePlacesService';
import { ReviewService } from '../services/reviewService';
export declare class ReviewController {
    private hostawayService;
    private googlePlacesService;
    private reviewService;
    constructor(hostawayService: HostawayService, googlePlacesService: GooglePlacesService, reviewService: ReviewService);
    /**
     * GET /api/reviews/hostaway
     * Fetch and normalize Hostaway reviews
     */
    getHostawayReviews: (req: Request, res: Response) => Promise<void>;
    /**
     * POST /api/reviews/google
     * Fetch Google reviews for a property
     */
    getGoogleReviews: (req: Request, res: Response) => Promise<void>;
    /**
     * GET /api/reviews
     * Get all reviews with filtering, sorting, and pagination
     */
    getAllReviews: (req: Request, res: Response) => Promise<void>;
    /**
     * GET /api/reviews/approved
     * Get approved reviews for public display
     */
    getApprovedReviews: (req: Request, res: Response) => Promise<void>;
    /**
     * PUT /api/reviews/:id/approve
     * Toggle approval status of a review
     */
    toggleApproval: (req: Request, res: Response) => Promise<void>;
    /**
     * GET /api/reviews/stats
     * Get dashboard statistics
     */
    getStats: (req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=reviewController.d.ts.map