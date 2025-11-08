import { HostawayReview, NormalizedReview } from '../types';
export declare class HostawayService {
    private client;
    private accountId;
    constructor(apiKey: string, accountId: string, baseUrl: string);
    /**
     * Fetch reviews from Hostaway API
     * Note: Sandbox API returns no reviews, so we'll use mock data
     */
    fetchReviews(): Promise<HostawayReview[]>;
    /**
     * Normalize Hostaway review to common format
     */
    normalizeReview(review: HostawayReview): NormalizedReview;
    /**
     * Extract channel from review type or other metadata
     */
    private extractChannel;
    /**
     * Get mock review data (since sandbox has no reviews)
     */
    getMockReviews(): HostawayReview[];
}
//# sourceMappingURL=hostawayService.d.ts.map