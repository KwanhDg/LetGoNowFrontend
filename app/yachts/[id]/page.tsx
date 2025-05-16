import { notFound } from 'next/navigation';
import YachtDetail from './YachtDetail';
import { Metadata } from 'next';
import type { Yacht } from './types';

// Add revalidation time
export const revalidate = 60; // Revalidate every 60 seconds

async function getYachtData(id: string, retries = 3): Promise<Yacht> {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Attempt ${i + 1} to fetch yacht data for id: ${id}`);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/yachts/${id}`, {
        next: { revalidate: 60 },
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
        },
      });

      if (!response.ok) {
        console.error(`Error fetching yacht (attempt ${i + 1}):`, response.statusText);
        if (i === retries - 1) {
          console.error('All retry attempts failed');
          notFound();
        }
        // Wait for 1 second before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }

      const yacht = await response.json();

      if (!yacht) {
        console.error(`No yacht found with id: ${id} (attempt ${i + 1})`);
        if (i === retries - 1) {
          console.error('No yacht found after all retry attempts');
          notFound();
        }
        // Wait for 1 second before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }

      // Transform the data to match our interface
      const yachtWithRooms: Yacht = {
        ...yacht,
        rooms: yacht.rooms || [],
        rating: yacht.rating || 0,
        reviewCount: yacht.review_count || 0,
        highlights: yacht.highlights || [],
        itinerary: yacht.itinerary || [],
        included: yacht.included || [],
        notIncluded: yacht.not_included || [],
        reviews: yacht.reviews || [],
        departureTime: yacht.departure_time || '',
        shortDescription: yacht.short_description || '',
      };

      return yachtWithRooms;
    } catch (error) {
      console.error(`Unexpected error (attempt ${i + 1}):`, error);
      if (i === retries - 1) {
        console.error('All retry attempts failed due to unexpected errors');
        notFound();
      }
      // Wait for 1 second before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  throw new Error('Failed to fetch yacht data after all retries');
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const yacht = await getYachtData(params.id);
    return {
      title: `${yacht.name} - LetGoNow`,
      description: yacht.description,
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Yacht Details - LetGoNow',
      description: 'View yacht details and book your next adventure',
    };
  }
}

export default async function YachtDetailPage({ params }: { params: { id: string } }) {
  try {
    const yacht = await getYachtData(params.id);
    return <YachtDetail yacht={yacht} />;
  } catch (error) {
    console.error('Error in YachtDetailPage:', error);
    notFound();
  }
}