import { supabase } from '../../../lib/supabase';
import { notFound } from 'next/navigation';
import YachtDetail from './YachtDetail';
import { Metadata } from 'next';
import type { Yacht } from './types';

async function getYachtData(id: string) {
  try {
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
      console.error('Error fetching yacht:', yachtError);
      notFound();
    }

    if (!yacht) {
      console.error('No yacht found with id:', id);
      notFound();
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
    console.error('Unexpected error:', error);
    notFound();
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const yacht = await getYachtData(params.id);
  return {
    title: `${yacht.name} - LetGoNow`,
    description: yacht.description,
  };
}

export default async function YachtDetailPage({ params }: { params: { id: string } }) {
  const yacht = await getYachtData(params.id);
  return <YachtDetail yacht={yacht} />;
}