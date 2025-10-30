/**
 * Types pour l'intégration Google Reviews via Places API
 */

export interface GoogleReview {
  name: string;
  location: string;
  rating: number;
  comment: string;
  date?: string;
  profilePhoto?: string;
}

export interface GoogleReviewsResponse {
  reviews: GoogleReview[];
  averageRating: number;
  totalReviews: number;
}

// Types bruts de l'API Google Places (New)
export interface GooglePlacesReview {
  authorAttribution?: {
    displayName?: string;
    uri?: string;
    photoUri?: string;
  };
  rating: number;
  text?: {
    text: string;
    languageCode?: string;
  };
  originalText?: {
    text: string;
    languageCode?: string;
  };
  publishTime: string;
  relativePublishTimeDescription?: string;
}

export interface GooglePlacesResponse {
  reviews?: GooglePlacesReview[];
  rating?: number;
  userRatingCount?: number;
}
