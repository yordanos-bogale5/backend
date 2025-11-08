import axios, { AxiosInstance } from 'axios';
import { GooglePlaceDetails, GooglePlacesSearchResult, GooglePlaceReview, NormalizedReview } from '../types';

export class GooglePlacesService {
  private client: AxiosInstance;
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.client = axios.create({
      baseURL: 'https://maps.googleapis.com/maps/api/place',
    });
  }

  /**
   * Search for a place by name and address
   */
  async searchPlace(propertyName: string, address?: string): Promise<string | null> {
    try {
      const query = address ? `${propertyName} ${address}` : propertyName;
      
      const response = await this.client.get<GooglePlacesSearchResult>('/findplacefromtext/json', {
        params: {
          input: query,
          inputtype: 'textquery',
          fields: 'place_id,name,formatted_address',
          key: this.apiKey,
        },
      });

      if (response.data.status === 'OK' && response.data.candidates.length > 0) {
        return response.data.candidates[0].place_id;
      }

      return null;
    } catch (error) {
      console.error('Error searching for place:', error);
      return null;
    }
  }

  /**
   * Fetch reviews for a specific place
   */
  async fetchReviews(placeId: string): Promise<GooglePlaceReview[]> {
    try {
      const response = await this.client.get<GooglePlaceDetails>('/details/json', {
        params: {
          place_id: placeId,
          fields: 'name,rating,reviews,user_ratings_total',
          key: this.apiKey,
        },
      });

      if (response.data.status === 'OK' && response.data.result.reviews) {
        return response.data.result.reviews;
      }

      return [];
    } catch (error) {
      console.error('Error fetching Google reviews:', error);
      return [];
    }
  }

  /**
   * Fetch reviews by property name
   */
  async fetchReviewsByPropertyName(propertyName: string, address?: string): Promise<GooglePlaceReview[]> {
    const placeId = await this.searchPlace(propertyName, address);
    
    if (!placeId) {
      console.log(`No place found for: ${propertyName}`);
      return [];
    }

    return this.fetchReviews(placeId);
  }

  /**
   * Normalize Google review to common format
   * Google uses 1-5 scale, we normalize to 1-10 scale to match Hostaway
   */
  normalizeReview(review: GooglePlaceReview, propertyName: string): NormalizedReview {
    // Convert Google's 1-5 rating to 1-10 scale (multiply by 2)
    const normalizedRating = review.rating * 2;

    return {
      id: `google-${review.time}-${review.author_name.replace(/\s/g, '-')}`,
      source: 'google',
      type: 'guest-review',
      status: 'published',
      overallRating: normalizedRating,
      reviewText: review.text,
      categories: this.extractCategories(review.text, normalizedRating),
      submittedAt: new Date(review.time * 1000).toISOString(),
      reviewerName: review.author_name,
      propertyName,
      channel: 'Google',
      isApproved: false,
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Extract categories from review text using keyword analysis
   * This is a simple implementation - could be enhanced with NLP
   */
  private extractCategories(text: string, rating: number): Array<{ category: string; rating: number }> {
    const categories: Array<{ category: string; rating: number }> = [];
    const lowerText = text.toLowerCase();

    // Define keywords for each category
    const categoryKeywords: Record<string, string[]> = {
      cleanliness: ['clean', 'spotless', 'tidy', 'dirty', 'messy', 'hygiene'],
      location: ['location', 'convenient', 'central', 'nearby', 'close to', 'walking distance'],
      communication: ['host', 'responsive', 'helpful', 'communication', 'contact', 'reply'],
      value: ['value', 'price', 'worth', 'expensive', 'affordable', 'money'],
      amenities: ['amenities', 'facilities', 'wifi', 'kitchen', 'bathroom', 'bedroom'],
    };

    // Check for each category
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      const hasKeyword = keywords.some(keyword => lowerText.includes(keyword));
      
      if (hasKeyword) {
        // Adjust rating based on sentiment (simplified)
        let categoryRating = rating;
        
        // Check for negative words near category keywords
        const negativeWords = ['not', 'poor', 'bad', 'terrible', 'awful', 'disappointing'];
        const hasNegative = negativeWords.some(word => lowerText.includes(word));
        
        if (hasNegative && rating < 4) {
          categoryRating = Math.max(1, rating - 1);
        }

        categories.push({
          category,
          rating: categoryRating,
        });
      }
    }

    // If no categories found, add a general category
    if (categories.length === 0) {
      categories.push({
        category: 'overall',
        rating,
      });
    }

    return categories;
  }

  /**
   * Get mock Google reviews for testing
   */
  getMockReviews(propertyName: string): GooglePlaceReview[] {
    const baseTime = Math.floor(Date.now() / 1000);
    
    return [
      {
        author_name: 'John Smith',
        language: 'en',
        rating: 5,
        relative_time_description: '2 weeks ago',
        text: 'Excellent property! The location is perfect, right in the heart of the city. The apartment was spotlessly clean and had all the amenities we needed. Would definitely stay again!',
        time: baseTime - (14 * 24 * 60 * 60),
      },
      {
        author_name: 'Maria Garcia',
        language: 'en',
        rating: 4,
        relative_time_description: '1 month ago',
        text: 'Great place overall. Very clean and modern. The only downside was the noise from the street at night, but the location makes up for it. Host was very responsive.',
        time: baseTime - (30 * 24 * 60 * 60),
      },
      {
        author_name: 'Tom Brown',
        language: 'en',
        rating: 5,
        relative_time_description: '2 months ago',
        text: 'Outstanding! Everything was perfect from check-in to check-out. The apartment is beautiful, well-maintained, and in a fantastic location. Highly recommend!',
        time: baseTime - (60 * 24 * 60 * 60),
      },
    ];
  }
}

