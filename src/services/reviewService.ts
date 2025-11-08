import { NormalizedReview, ReviewFilters, SortField, SortOrder, DashboardStats } from '../types';
import { ApprovalPersistenceService } from './approvalPersistence';

export class ReviewService {
  private reviews: Map<string, NormalizedReview> = new Map();
  private approvalPersistence: ApprovalPersistenceService;

  constructor(approvalPersistence?: ApprovalPersistenceService) {
    this.approvalPersistence = approvalPersistence || new ApprovalPersistenceService();
  }

  /**
   * Add or update a review
   * Restores approval status from persistent storage
   */
  addReview(review: NormalizedReview): void {
    // Restore approval status from persistence
    const persistedApprovalStatus = this.approvalPersistence.getApprovalStatus(review.id);
    review.isApproved = persistedApprovalStatus;

    this.reviews.set(review.id, review);
  }

  /**
   * Add multiple reviews
   */
  addReviews(reviews: NormalizedReview[]): void {
    reviews.forEach(review => this.addReview(review));
  }

  /**
   * Get a review by ID
   */
  getReview(id: string): NormalizedReview | undefined {
    return this.reviews.get(id);
  }

  /**
   * Get all reviews
   */
  getAllReviews(): NormalizedReview[] {
    return Array.from(this.reviews.values());
  }

  /**
   * Filter reviews based on criteria
   */
  filterReviews(filters: ReviewFilters): NormalizedReview[] {
    let filtered = this.getAllReviews();

    if (filters.source && filters.source !== 'all') {
      filtered = filtered.filter(r => r.source === filters.source);
    }

    if (filters.minRating !== undefined) {
      filtered = filtered.filter(r => r.overallRating !== null && r.overallRating >= filters.minRating!);
    }

    if (filters.maxRating !== undefined) {
      filtered = filtered.filter(r => r.overallRating !== null && r.overallRating <= filters.maxRating!);
    }

    if (filters.category) {
      filtered = filtered.filter(r => 
        r.categories.some(cat => cat.category.toLowerCase() === filters.category!.toLowerCase())
      );
    }

    if (filters.channel) {
      filtered = filtered.filter(r => r.channel?.toLowerCase() === filters.channel!.toLowerCase());
    }

    if (filters.startDate) {
      filtered = filtered.filter(r => new Date(r.submittedAt) >= new Date(filters.startDate!));
    }

    if (filters.endDate) {
      filtered = filtered.filter(r => new Date(r.submittedAt) <= new Date(filters.endDate!));
    }

    if (filters.propertyName) {
      filtered = filtered.filter(r => 
        r.propertyName.toLowerCase().includes(filters.propertyName!.toLowerCase())
      );
    }

    if (filters.status) {
      filtered = filtered.filter(r => r.status.toLowerCase() === filters.status!.toLowerCase());
    }

    if (filters.isApproved !== undefined) {
      filtered = filtered.filter(r => r.isApproved === filters.isApproved);
    }

    return filtered;
  }

  /**
   * Sort reviews
   */
  sortReviews(reviews: NormalizedReview[], sortBy: SortField, sortOrder: SortOrder): NormalizedReview[] {
    const sorted = [...reviews];

    sorted.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'submittedAt':
          comparison = new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
          break;
        case 'overallRating':
          comparison = (a.overallRating || 0) - (b.overallRating || 0);
          break;
        case 'propertyName':
          comparison = a.propertyName.localeCompare(b.propertyName);
          break;
        case 'reviewerName':
          comparison = a.reviewerName.localeCompare(b.reviewerName);
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }

  /**
   * Paginate reviews
   */
  paginateReviews(reviews: NormalizedReview[], page: number, limit: number) {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedReviews = reviews.slice(startIndex, endIndex);

    return {
      data: paginatedReviews,
      pagination: {
        page,
        limit,
        total: reviews.length,
        totalPages: Math.ceil(reviews.length / limit),
      },
    };
  }

  /**
   * Approve or unapprove a review
   * Persists the approval state to disk
   */
  toggleApproval(id: string): NormalizedReview | null {
    const review = this.reviews.get(id);
    if (!review) return null;

    // Toggle approval status
    review.isApproved = !review.isApproved;

    // Persist the new approval status
    this.approvalPersistence.setApprovalStatus(id, review.isApproved);

    this.reviews.set(id, review);
    return review;
  }

  /**
   * Get approved reviews only
   */
  getApprovedReviews(): NormalizedReview[] {
    return this.getAllReviews().filter(r => r.isApproved);
  }

  /**
   * Calculate rating trend for a property
   * Compares current average rating to average rating from previous 7 days
   */
  private calculateTrend(propertyName: string): { trend: 'up' | 'down' | 'stable'; trendValue: number } {
    const allReviews = this.getAllReviews();
    const propertyReviews = allReviews.filter(r => r.propertyName === propertyName && r.overallRating !== null);

    if (propertyReviews.length === 0) {
      return { trend: 'stable', trendValue: 0 };
    }

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // Current period: last 7 days
    const currentPeriodReviews = propertyReviews.filter(r => {
      const reviewDate = new Date(r.submittedAt);
      return reviewDate >= sevenDaysAgo && reviewDate <= now;
    });

    // Previous period: 8-14 days ago
    const previousPeriodReviews = propertyReviews.filter(r => {
      const reviewDate = new Date(r.submittedAt);
      return reviewDate >= fourteenDaysAgo && reviewDate < sevenDaysAgo;
    });

    // If no reviews in either period, return stable
    if (currentPeriodReviews.length === 0 || previousPeriodReviews.length === 0) {
      return { trend: 'stable', trendValue: 0 };
    }

    // Calculate averages
    const currentAvg = currentPeriodReviews.reduce((sum, r) => sum + (r.overallRating || 0), 0) / currentPeriodReviews.length;
    const previousAvg = previousPeriodReviews.reduce((sum, r) => sum + (r.overallRating || 0), 0) / previousPeriodReviews.length;

    const change = Math.round((currentAvg - previousAvg) * 10) / 10;

    if (change > 0.2) {
      return { trend: 'up', trendValue: change };
    } else if (change < -0.2) {
      return { trend: 'down', trendValue: change };
    } else {
      return { trend: 'stable', trendValue: change };
    }
  }

  /**
   * Extract top issue from low-rated or unapproved reviews
   * Analyzes review text for common keywords
   */
  private extractTopIssue(propertyName: string): string {
    const allReviews = this.getAllReviews();
    const problematicReviews = allReviews.filter(r =>
      r.propertyName === propertyName &&
      ((r.overallRating !== null && r.overallRating <= 6) || !r.isApproved)
    );

    if (problematicReviews.length === 0) {
      return '—';
    }

    // Common issue keywords to search for
    const issueKeywords: Record<string, string[]> = {
      'WiFi': ['wifi', 'wi-fi', 'internet', 'connection', 'network'],
      'Cleanliness': ['clean', 'dirty', 'mess', 'hygiene', 'tidy'],
      'Noise': ['noise', 'noisy', 'loud', 'quiet', 'sound'],
      'Location': ['location', 'far', 'distance', 'transport', 'access'],
      'Check-in': ['check-in', 'checkin', 'check in', 'arrival', 'key'],
      'Maintenance': ['broken', 'repair', 'fix', 'maintenance', 'damage'],
      'Communication': ['communication', 'response', 'contact', 'reply', 'host'],
      'Amenities': ['amenity', 'amenities', 'facility', 'facilities', 'equipment'],
    };

    // Count mentions of each issue
    const issueCounts: Record<string, number> = {};

    problematicReviews.forEach(review => {
      const reviewTextLower = review.reviewText.toLowerCase();

      Object.entries(issueKeywords).forEach(([issue, keywords]) => {
        const mentioned = keywords.some(keyword => reviewTextLower.includes(keyword));
        if (mentioned) {
          issueCounts[issue] = (issueCounts[issue] || 0) + 1;
        }
      });
    });

    // Find the most frequent issue
    const issues = Object.entries(issueCounts);
    if (issues.length === 0) {
      return 'No issues';
    }

    const topIssue = issues.reduce((max, current) =>
      current[1] > max[1] ? current : max
    );

    return `${topIssue[0]} (${topIssue[1]} mention${topIssue[1] > 1 ? 's' : ''})`;
  }

  /**
   * Calculate property health status
   * Based on average rating and approval ratio
   */
  private calculateStatus(averageRating: number, approvalRatio: number): 'good' | 'warning' | 'critical' {
    // Good: rating >= 8.0 AND approval ratio >= 70%
    if (averageRating >= 8.0 && approvalRatio >= 70) {
      return 'good';
    }

    // Critical: rating < 6.0 OR approval ratio < 50%
    if (averageRating < 6.0 || approvalRatio < 50) {
      return 'critical';
    }

    // Warning: everything else
    return 'warning';
  }

  /**
   * Calculate dashboard statistics
   */
  getDashboardStats(): DashboardStats {
    const allReviews = this.getAllReviews();
    const reviewsWithRating = allReviews.filter(r => r.overallRating !== null);

    // Calculate average rating
    const totalRating = reviewsWithRating.reduce((sum, r) => sum + (r.overallRating || 0), 0);
    const averageRating = reviewsWithRating.length > 0 
      ? Math.round((totalRating / reviewsWithRating.length) * 10) / 10 
      : 0;

    // Count by source
    const reviewsBySource = {
      hostaway: allReviews.filter(r => r.source === 'hostaway').length,
      google: allReviews.filter(r => r.source === 'google').length,
    };

    // Group by property
    const propertyMap = new Map<string, { count: number; totalRating: number; ratingCount: number; approvedCount: number }>();
    allReviews.forEach(review => {
      const existing = propertyMap.get(review.propertyName) || { count: 0, totalRating: 0, ratingCount: 0, approvedCount: 0 };
      existing.count++;
      if (review.overallRating !== null) {
        existing.totalRating += review.overallRating;
        existing.ratingCount++;
      }
      if (review.isApproved) {
        existing.approvedCount++;
      }
      propertyMap.set(review.propertyName, existing);
    });

    const reviewsByProperty = Array.from(propertyMap.entries()).map(([propertyName, data]) => {
      const averageRating = data.ratingCount > 0
        ? Math.round((data.totalRating / data.ratingCount) * 10) / 10
        : 0;

      const approvalRatio = data.count > 0
        ? Math.round((data.approvedCount / data.count) * 100)
        : 0;

      const { trend, trendValue } = this.calculateTrend(propertyName);
      const topIssue = this.extractTopIssue(propertyName);
      const status = this.calculateStatus(averageRating, approvalRatio);

      return {
        propertyName,
        count: data.count,
        averageRating,
        trend,
        trendValue,
        topIssue,
        status,
        approvalRatio,
      };
    });

    // Calculate category averages
    const categoryMap = new Map<string, { totalRating: number; count: number }>();
    allReviews.forEach(review => {
      review.categories.forEach(cat => {
        const existing = categoryMap.get(cat.category) || { totalRating: 0, count: 0 };
        existing.totalRating += cat.rating;
        existing.count++;
        categoryMap.set(cat.category, existing);
      });
    });

    const categoryAverages = Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      averageRating: Math.round((data.totalRating / data.count) * 10) / 10,
    }));

    return {
      totalReviews: allReviews.length,
      averageRating,
      approvedReviews: allReviews.filter(r => r.isApproved).length,
      pendingReviews: allReviews.filter(r => !r.isApproved).length,
      reviewsBySource,
      reviewsByProperty,
      categoryAverages,
    };
  }

  /**
   * Clear all reviews (useful for testing)
   */
  clearReviews(): void {
    this.reviews.clear();
  }
}

