import { API_URL } from './api';

export async function getBookingsByUserId(user_id?: string) {
  let url = '';
  if (user_id) {
    url = `${API_URL}/bookings/user/${user_id}`;
  } else {
    url = `${API_URL}/bookings`;
  }
  const res = await fetch(url);
  if (!res.ok) return { data: [] };
  const data = await res.json();
  return { data };
}

export async function createBooking(booking: any) {
  const res = await fetch(`${API_URL}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(booking),
  });
  if (!res.ok) {
    const errorText = await res.text();
    console.error('Booking API error:', res.status, errorText);
    return { data: null, error: errorText };
  }
  const data = await res.json();
  return { data };
}

export async function deleteBooking(id: number) {
  const res = await fetch(`${API_URL}/bookings/${id}`, { method: 'DELETE' });
  return res.ok;
} 