export interface HostawayReviewCategory {
    category: string;
    rating: number;
}
export interface HostawayReview {
    id: number;
    type: string;
    status: string;
    rating: number | null;
    publicReview: string;
    reviewCategory: HostawayReviewCategory[];
    submittedAt: string;
    guestName: string;
    listingName: string;
}
export interface HostawayApiResponse {
    status: string;
    result: HostawayReview[];
}
export interface NormalizedReviewCategory {
    category: string;
    rating: number;
}
export interface NormalizedReview {
    id: string;
    source: 'hostaway' | 'google';
    type: string;
    status: string;
    overallRating: number | null;
    reviewText: string;
    categories: NormalizedReviewCategory[];
    submittedAt: string;
    reviewerName: string;
    propertyName: string;
    channel?: string;
    isApproved: boolean;
    createdAt: string;
}
export interface GooglePlaceReview {
    author_name: string;
    author_url?: string;
    language: string;
    profile_photo_url?: string;
    rating: number;
    relative_time_description: string;
    text: string;
    time: number;
}
export interface GooglePlaceDetails {
    result: {
        name: string;
        rating?: number;
        reviews?: GooglePlaceReview[];
        user_ratings_total?: number;
    };
    status: string;
}
export interface GooglePlacesSearchResult {
    candidates: Array<{
        place_id: string;
        name: string;
        formatted_address?: string;
    }>;
    status: string;
}
export interface ReviewFilters {
    source?: 'hostaway' | 'google' | 'all';
    minRating?: number;
    maxRating?: number;
    category?: string;
    channel?: string;
    startDate?: string;
    endDate?: string;
    propertyName?: string;
    status?: string;
    isApproved?: boolean;
}
export type SortField = 'submittedAt' | 'overallRating' | 'propertyName' | 'reviewerName';
export type SortOrder = 'asc' | 'desc';
export interface ReviewQuery {
    filters?: ReviewFilters;
    sortBy?: SortField;
    sortOrder?: SortOrder;
    page?: number;
    limit?: number;
}
export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
export interface ApiError {
    error: string;
    message: string;
    statusCode: number;
}
export interface PropertyPerformance {
    propertyName: string;
    count: number;
    averageRating: number;
    trend: 'up' | 'down' | 'stable';
    trendValue: number;
    topIssue: string;
    status: 'good' | 'warning' | 'critical';
    approvalRatio: number;
}
export interface DashboardStats {
    totalReviews: number;
    averageRating: number;
    approvedReviews: number;
    pendingReviews: number;
    reviewsBySource: {
        hostaway: number;
        google: number;
    };
    reviewsByProperty: PropertyPerformance[];
    categoryAverages: Array<{
        category: string;
        averageRating: number;
    }>;
}
//# sourceMappingURL=index.d.ts.map