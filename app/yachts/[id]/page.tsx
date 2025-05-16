import { supabase } from '../../../lib/supabase';
import { notFound } from 'next/navigation';
import YachtDetail from './YachtDetail';
import { Metadata } from 'next';
import type { Yacht } from './types';

async function getYachtData(id: string, retries = 3): Promise<Yacht> {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Attempt ${i + 1} to fetch yacht data for id: ${id}`);
      
      // First get the yacht data with all related data
      const { data: yacht, error: yachtError } = await supabase
        .from('yachts')
        .select(`
          *,
          rooms (
            id,
            name,
            area,
            max_guests,
            price,
            images
          )
        `)
        .eq('id', id)
        .single();

      if (yachtError) {
        console.error(`Error fetching yacht (attempt ${i + 1}):`, yachtError);
        if (i === retries - 1) notFound();
        continue;
      }

      if (!yacht) {
        console.error(`No yacht found with id: ${id} (attempt ${i + 1})`);
        if (i === retries - 1) notFound();
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
      if (i === retries - 1) notFound();
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