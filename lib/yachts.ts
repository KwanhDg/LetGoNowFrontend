import { API_URL } from './api';

export interface Image {
  id: number;
  url: string;
}

export interface Yacht {
  id: number;
  name: string;
  description: string;
  price: number;
  images: Image[];
}

export async function getYachts() {
  try {
    const res = await fetch(`${API_URL}/yachts`);
    if (!res.ok) return { data: [] };
    const data = await res.json();
    return { data };
  } catch (error) {
    console.error('Unexpected error fetching yachts:', error);
    return { data: [] };
  }
}

export async function getYachtById(id: number) {
  try {
    const res = await fetch(`${API_URL}/yachts/${id}`);
    if (!res.ok) return { data: null };
    const data = await res.json();
    return { data };
  } catch (error) {
    console.error('Unexpected error fetching yacht:', error);
    return { data: null };
  }
} 