import { GooglePlaceReview, NormalizedReview } from '../types';
export declare class GooglePlacesService {
    private client;
    private apiKey;
    constructor(apiKey: string);
    /**
     * Search for a place by name and address
     */
    searchPlace(propertyName: string, address?: string): Promise<string | null>;
    /**
     * Fetch reviews for a specific place
     */
    fetchReviews(placeId: string): Promise<GooglePlaceReview[]>;
    /**
     * Fetch reviews by property name
     */
    fetchReviewsByPropertyName(propertyName: string, address?: string): Promise<GooglePlaceReview[]>;
    /**
     * Normalize Google review to common format
     * Google uses 1-5 scale, we normalize to 1-10 scale to match Hostaway
     */
    normalizeReview(review: GooglePlaceReview, propertyName: string): NormalizedReview;
    /**
     * Extract categories from review text using keyword analysis
     * This is a simple implementation - could be enhanced with NLP
     */
    private extractCategories;
    /**
     * Get mock Google reviews for testing
     */
    getMockReviews(propertyName: string): GooglePlaceReview[];
}
//# sourceMappingURL=googlePlacesService.d.ts.map