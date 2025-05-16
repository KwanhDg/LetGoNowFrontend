export interface Image {
  url: string;
  alt?: string;
}

export interface Room {
  id: number;
  name: string;
  area: number;
  max_guests: number;
  price: number;
  images: Image[];
}

export interface Review {
  id: number;
  user: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Yacht {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: string;
  location: string;
  images: Image[];
  rooms: Room[];
  created_at: string;
  updated_at: string;
  rating: number;
  reviewCount: number;
  highlights: string[];
  itinerary: {
    time: string;
    activity: string;
  }[];
  included: string[];
  notIncluded: string[];
  reviews: Review[];
  departureTime: string;
  shortDescription: string;
} 