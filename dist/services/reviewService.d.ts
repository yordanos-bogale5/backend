import { NormalizedReview, ReviewFilters, SortField, SortOrder, DashboardStats } from '../types';
import { ApprovalPersistenceService } from './approvalPersistence';
export declare class ReviewService {
    private reviews;
    private approvalPersistence;
    constructor(approvalPersistence?: ApprovalPersistenceService);
    /**
     * Add or update a review
     * Restores approval status from persistent storage
     */
    addReview(review: NormalizedReview): void;
    /**
     * Add multiple reviews
     */
    addReviews(reviews: NormalizedReview[]): void;
    /**
     * Get a review by ID
     */
    getReview(id: string): NormalizedReview | undefined;
    /**
     * Get all reviews
     */
    getAllReviews(): NormalizedReview[];
    /**
     * Filter reviews based on criteria
     */
    filterReviews(filters: ReviewFilters): NormalizedReview[];
    /**
     * Sort reviews
     */
    sortReviews(reviews: NormalizedReview[], sortBy: SortField, sortOrder: SortOrder): NormalizedReview[];
    /**
     * Paginate reviews
     */
    paginateReviews(reviews: NormalizedReview[], page: number, limit: number): {
        data: NormalizedReview[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    };
    /**
     * Approve or unapprove a review
     * Persists the approval state to disk
     */
    toggleApproval(id: string): NormalizedReview | null;
    /**
     * Get approved reviews only
     */
    getApprovedReviews(): NormalizedReview[];
    /**
     * Calculate rating trend for a property
     * Compares current average rating to average rating from previous 7 days
     */
    private calculateTrend;
    /**
     * Extract top issue from low-rated or unapproved reviews
     * Analyzes review text for common keywords
     */
    private extractTopIssue;
    /**
     * Calculate property health status
     * Based on average rating and approval ratio
     */
    private calculateStatus;
    /**
     * Calculate dashboard statistics
     */
    getDashboardStats(): DashboardStats;
    /**
     * Clear all reviews (useful for testing)
     */
    clearReviews(): void;
}
//# sourceMappingURL=reviewService.d.ts.map