import axios, { AxiosInstance } from 'axios';
import { HostawayApiResponse, HostawayReview, NormalizedReview } from '../types';

export class HostawayService {
  private client: AxiosInstance;
  private accountId: string;

  constructor(apiKey: string, accountId: string, baseUrl: string) {
    this.accountId = accountId;
    this.client = axios.create({
      baseURL: baseUrl,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Fetch reviews from Hostaway API
   * Note: Sandbox API returns no reviews, so we'll use mock data
   */
  async fetchReviews(): Promise<HostawayReview[]> {
    try {
      const response = await this.client.get<HostawayApiResponse>(
        `/reviews?accountId=${this.accountId}`
      );

      if (response.data.status === 'success') {
        return response.data.result || [];
      }

      return [];
    } catch (error) {
      console.error('Error fetching Hostaway reviews:', error);
      // Return empty array instead of throwing to allow mock data fallback
      return [];
    }
  }

  /**
   * Normalize Hostaway review to common format
   */
  normalizeReview(review: HostawayReview): NormalizedReview {
    // Calculate overall rating from categories if not provided
    let overallRating = review.rating;
    if (!overallRating && review.reviewCategory && review.reviewCategory.length > 0) {
      const sum = review.reviewCategory.reduce((acc, cat) => acc + cat.rating, 0);
      overallRating = Math.round((sum / review.reviewCategory.length) * 10) / 10;
    }

    return {
      id: `hostaway-${review.id}`,
      source: 'hostaway',
      type: review.type,
      status: review.status,
      overallRating,
      reviewText: review.publicReview,
      categories: review.reviewCategory.map(cat => ({
        category: cat.category,
        rating: cat.rating,
      })),
      submittedAt: review.submittedAt,
      reviewerName: review.guestName,
      propertyName: review.listingName,
      channel: this.extractChannel(review.type),
      isApproved: false, // Default to not approved
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Extract channel from review type or other metadata
   */
  private extractChannel(type: string): string {
    // Map review types to channels
    const channelMap: Record<string, string> = {
      'host-to-guest': 'Hostaway',
      'guest-to-host': 'Hostaway',
    };

    return channelMap[type] || 'Unknown';
  }

  /**
   * Get mock review data (since sandbox has no reviews)
   */
  getMockReviews(): HostawayReview[] {
    return [
      {
        id: 7453,
        type: 'host-to-guest',
        status: 'published',
        rating: null,
        publicReview: 'Shane and family are wonderful! Would definitely host again :)',
        reviewCategory: [
          { category: 'cleanliness', rating: 10 },
          { category: 'communication', rating: 10 },
          { category: 'respect_house_rules', rating: 10 },
        ],
        submittedAt: '2020-08-21 22:45:14',
        guestName: 'Shane Finkelstein',
        listingName: '2B N1 A - 29 Shoreditch Heights',
      },
      {
        id: 7454,
        type: 'guest-to-host',
        status: 'published',
        rating: 9,
        publicReview: 'Amazing property in the heart of Shoreditch! The apartment was spotless and exactly as described. Host was very responsive and helpful throughout our stay.',
        reviewCategory: [
          { category: 'cleanliness', rating: 10 },
          { category: 'communication', rating: 9 },
          { category: 'location', rating: 10 },
          { category: 'value', rating: 8 },
        ],
        submittedAt: '2023-11-15 14:30:22',
        guestName: 'Emma Thompson',
        listingName: '2B N1 A - 29 Shoreditch Heights',
      },
      {
        id: 7455,
        type: 'guest-to-host',
        status: 'published',
        rating: 8,
        publicReview: 'Great location and modern amenities. The only minor issue was some noise from the street at night, but overall a fantastic stay.',
        reviewCategory: [
          { category: 'cleanliness', rating: 9 },
          { category: 'communication', rating: 8 },
          { category: 'location', rating: 10 },
          { category: 'value', rating: 7 },
        ],
        submittedAt: '2023-11-10 09:15:33',
        guestName: 'Michael Chen',
        listingName: '1B S2 B - 15 Camden Lock',
      },
      {
        id: 7456,
        type: 'guest-to-host',
        status: 'published',
        rating: 10,
        publicReview: 'Absolutely perfect! The apartment exceeded all expectations. Beautiful design, super clean, and the host went above and beyond to make our stay comfortable.',
        reviewCategory: [
          { category: 'cleanliness', rating: 10 },
          { category: 'communication', rating: 10 },
          { category: 'location', rating: 10 },
          { category: 'value', rating: 10 },
        ],
        submittedAt: '2023-11-08 18:45:11',
        guestName: 'Sarah Johnson',
        listingName: '3B W1 C - 42 Notting Hill Gate',
      },
      {
        id: 7457,
        type: 'guest-to-host',
        status: 'published',
        rating: 7,
        publicReview: 'Good property overall. Check-in was smooth and the location is convenient. However, the WiFi was a bit slow and the heating took a while to warm up.',
        reviewCategory: [
          { category: 'cleanliness', rating: 8 },
          { category: 'communication', rating: 7 },
          { category: 'location', rating: 9 },
          { category: 'value', rating: 6 },
        ],
        submittedAt: '2023-11-05 12:20:45',
        guestName: 'David Martinez',
        listingName: '1B S2 B - 15 Camden Lock',
      },
      {
        id: 7458,
        type: 'guest-to-host',
        status: 'published',
        rating: 9,
        publicReview: 'Lovely apartment with stunning views! Everything was as described and the host provided excellent recommendations for local restaurants.',
        reviewCategory: [
          { category: 'cleanliness', rating: 9 },
          { category: 'communication', rating: 10 },
          { category: 'location', rating: 9 },
          { category: 'value', rating: 8 },
        ],
        submittedAt: '2023-11-01 16:30:00',
        guestName: 'Lisa Anderson',
        listingName: '3B W1 C - 42 Notting Hill Gate',
      },
      {
        id: 7459,
        type: 'guest-to-host',
        status: 'published',
        rating: 6,
        publicReview: 'The property has potential but needs some maintenance. The shower pressure was weak and one of the bedroom lights wasn\'t working. Location is great though.',
        reviewCategory: [
          { category: 'cleanliness', rating: 7 },
          { category: 'communication', rating: 8 },
          { category: 'location', rating: 9 },
          { category: 'value', rating: 5 },
        ],
        submittedAt: '2023-10-28 10:15:22',
        guestName: 'Robert Wilson',
        listingName: '2B N1 A - 29 Shoreditch Heights',
      },
      {
        id: 7460,
        type: 'guest-to-host',
        status: 'published',
        rating: 10,
        publicReview: 'Five stars all around! This is our second time staying at a Flex Living property and we\'re never disappointed. Highly recommend!',
        reviewCategory: [
          { category: 'cleanliness', rating: 10 },
          { category: 'communication', rating: 10 },
          { category: 'location', rating: 10 },
          { category: 'value', rating: 10 },
        ],
        submittedAt: '2023-10-25 20:45:30',
        guestName: 'Jennifer Lee',
        listingName: '3B W1 C - 42 Notting Hill Gate',
      },
    ];
  }
}

