import { NextResponse } from 'next/server';
import type { GooglePlacesResponse, GoogleReviewsResponse } from '@/types/google-reviews';

const PLACE_ID = process.env.GOOGLE_PLACE_ID || 'ChIJ51V7Ed_JlkcRs0QzvN_EAxw';
// Utiliser la clé serveur (sans restrictions) si disponible, sinon fallback sur la clé publique
const API_KEY = process.env.GOOGLE_PLACES_API_KEY_SERVER || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

// Cache ISR: 30 minutes (même durée que la homepage)
export const revalidate = 1800;

export async function GET() {
  // Vérification de la configuration
  if (!API_KEY) {
    console.error('❌ NEXT_PUBLIC_GOOGLE_MAPS_API_KEY non configurée');
    return NextResponse.json(
      { error: 'Google Maps API key not configured' },
      { status: 500 }
    );
  }

  if (!PLACE_ID) {
    console.error('❌ GOOGLE_PLACE_ID non configuré');
    return NextResponse.json(
      { error: 'Google Place ID not configured' },
      { status: 500 }
    );
  }

  try {
    console.log('🔍 Fetching Google Reviews for Place ID:', PLACE_ID);

    // Nouvelle API Google Places (v1)
    // https://developers.google.com/maps/documentation/places/web-service/place-details
    const url = `https://places.googleapis.com/v1/places/${PLACE_ID}?fields=reviews,rating,userRatingCount&languageCode=fr&key=${API_KEY}`;

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-FieldMask': 'reviews,rating,userRatingCount',
        'X-Goog-Api-Key': API_KEY || '',
      },
      next: { revalidate: 1800 }, // Cache Next.js ISR
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Google API error (${response.status}):`, errorText);

      // Messages d'erreur spécifiques
      if (response.status === 403) {
        return NextResponse.json(
          { error: 'Places API not enabled or API key invalid. Please enable Places API in Google Cloud Console.' },
          { status: 403 }
        );
      }

      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Place not found. Please verify GOOGLE_PLACE_ID.' },
          { status: 404 }
        );
      }

      throw new Error(`Google API returned ${response.status}`);
    }

    const data: GooglePlacesResponse = await response.json();

    console.log('✅ Received data:', {
      reviewCount: data.reviews?.length || 0,
      rating: data.rating,
      totalReviews: data.userRatingCount,
    });

    // Transformation des données au format attendu par le frontend
    const reviews = data.reviews?.slice(0, 6).map((review) => ({
      name: review.authorAttribution?.displayName || 'Client Google',
      location: 'Avis Google',
      rating: review.rating,
      comment: review.text?.text || review.originalText?.text || '',
      date: review.publishTime,
      profilePhoto: review.authorAttribution?.photoUri,
    })) || [];

    const responseData: GoogleReviewsResponse = {
      reviews,
      averageRating: data.rating || 0,
      totalReviews: data.userRatingCount || 0,
    };

    console.log('✅ Returning', reviews.length, 'reviews');

    return NextResponse.json(responseData, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
      },
    });
  } catch (error) {
    console.error('❌ Error fetching Google reviews:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch Google reviews',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
