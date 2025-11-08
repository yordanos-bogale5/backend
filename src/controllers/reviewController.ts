import { Request, Response } from 'express';
import { HostawayService } from '../services/hostawayService';
import { GooglePlacesService } from '../services/googlePlacesService';
import { ReviewService } from '../services/reviewService';
import { ReviewQuery } from '../types';

export class ReviewController {
  constructor(
    private hostawayService: HostawayService,
    private googlePlacesService: GooglePlacesService,
    private reviewService: ReviewService
  ) {}

  /**
   * GET /api/reviews/hostaway
   * Fetch and normalize Hostaway reviews
   */
  getHostawayReviews = async (req: Request, res: Response): Promise<void> => {
    try {
      // Fetch from API (will be empty in sandbox)
      let hostawayReviews = await this.hostawayService.fetchReviews();

      // If no reviews from API, use mock data
      if (hostawayReviews.length === 0) {
        console.log('No reviews from Hostaway API, using mock data');
        hostawayReviews = this.hostawayService.getMockReviews();
      }

      // Normalize and store reviews
      const normalizedReviews = hostawayReviews.map(review => 
        this.hostawayService.normalizeReview(review)
      );

      this.reviewService.addReviews(normalizedReviews);

      res.json({
        success: true,
        count: normalizedReviews.length,
        data: normalizedReviews,
      });
    } catch (error) {
      console.error('Error fetching Hostaway reviews:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch Hostaway reviews',
      });
    }
  };

  /**
   * POST /api/reviews/google
   * Fetch Google reviews for a property
   */
  getGoogleReviews = async (req: Request, res: Response): Promise<void> => {
    try {
      const { propertyName, address, useMock } = req.body;

      if (!propertyName) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'propertyName is required',
        });
        return;
      }

      let googleReviews;

      // Use mock data if requested or if no API key
      if (useMock || !process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_PLACES_API_KEY === 'your_google_api_key_here') {
        console.log('Using mock Google reviews');
        googleReviews = this.googlePlacesService.getMockReviews(propertyName);
      } else {
        googleReviews = await this.googlePlacesService.fetchReviewsByPropertyName(propertyName, address);
      }

      // Normalize and store reviews
      const normalizedReviews = googleReviews.map(review =>
        this.googlePlacesService.normalizeReview(review, propertyName)
      );

      this.reviewService.addReviews(normalizedReviews);

      res.json({
        success: true,
        count: normalizedReviews.length,
        data: normalizedReviews,
      });
    } catch (error) {
      console.error('Error fetching Google reviews:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch Google reviews',
      });
    }
  };

  /**
   * GET /api/reviews
   * Get all reviews with filtering, sorting, and pagination
   */
  getAllReviews = async (req: Request, res: Response): Promise<void> => {
    try {
      const query: ReviewQuery = {
        filters: {
          source: req.query.source as any,
          minRating: req.query.minRating ? Number(req.query.minRating) : undefined,
          maxRating: req.query.maxRating ? Number(req.query.maxRating) : undefined,
          category: req.query.category as string,
          channel: req.query.channel as string,
          startDate: req.query.startDate as string,
          endDate: req.query.endDate as string,
          propertyName: req.query.propertyName as string,
          status: req.query.status as string,
          isApproved: req.query.isApproved ? req.query.isApproved === 'true' : undefined,
        },
        sortBy: (req.query.sortBy as any) || 'submittedAt',
        sortOrder: (req.query.sortOrder as any) || 'desc',
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 50,
      };

      // Filter reviews
      let reviews = this.reviewService.filterReviews(query.filters || {});

      // Sort reviews
      reviews = this.reviewService.sortReviews(
        reviews,
        query.sortBy || 'submittedAt',
        query.sortOrder || 'desc'
      );

      // Paginate reviews
      const result = this.reviewService.paginateReviews(
        reviews,
        query.page || 1,
        query.limit || 50
      );

      res.json(result);
    } catch (error) {
      console.error('Error getting reviews:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to get reviews',
      });
    }
  };

  /**
   * GET /api/reviews/approved
   * Get approved reviews for public display
   */
  getApprovedReviews = async (req: Request, res: Response): Promise<void> => {
    try {
      const propertyName = req.query.propertyName as string;
      let reviews = this.reviewService.getApprovedReviews();

      // Filter by property if specified
      if (propertyName) {
        reviews = reviews.filter(r => 
          r.propertyName.toLowerCase().includes(propertyName.toLowerCase())
        );
      }

      // Sort by date (newest first)
      reviews = this.reviewService.sortReviews(reviews, 'submittedAt', 'desc');

      res.json({
        success: true,
        count: reviews.length,
        data: reviews,
      });
    } catch (error) {
      console.error('Error getting approved reviews:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to get approved reviews',
      });
    }
  };

  /**
   * PUT /api/reviews/:id/approve
   * Toggle approval status of a review
   */
  toggleApproval = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const review = this.reviewService.toggleApproval(id);

      if (!review) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Review not found',
        });
        return;
      }

      res.json({
        success: true,
        data: review,
      });
    } catch (error) {
      console.error('Error toggling approval:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to toggle approval',
      });
    }
  };

  /**
   * GET /api/reviews/stats
   * Get dashboard statistics
   */
  getStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = this.reviewService.getDashboardStats();
      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error('Error getting stats:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to get statistics',
      });
    }
  };
}

