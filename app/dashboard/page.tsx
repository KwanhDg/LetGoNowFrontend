'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import React from 'react';

interface Booking {
  id: number;
  code?: string;
  user_id: string;
  service_type: string; // 'flight' | 'yacht'
  service_id: number;
  booking_date: string;
  status: string;
  // Thông tin mở rộng
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  guests?: number;
  total?: number;
  // Flight
  flight_from?: string;
  flight_to?: string;
  flight_date?: string;
  // Yacht
  yacht_name?: string;
  yacht_date?: string;
  room_type?: string;
}

interface User {
  id: string;
  email: string;
  role: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    checkUser();
    fetchBookings();

    // Đăng ký realtime
    const channel = supabase
      .channel('bookings-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        (payload) => {
          fetchBookings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    // Fetch user role from profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    setUser({
      id: user.id,
      email: user.email!,
      role: profile?.role || 'user'
    });
  };

  const fetchBookings = async () => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('booking_date', { ascending: false });

    if (error) {
      console.error('Error fetching bookings:', error);
      return;
    }

    setBookings(data || []);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleChangeStatus = async (bookingId: number, newStatus: string) => {
    setUpdatingStatus(true);
    await supabase.from('bookings').update({ status: newStatus }).eq('id', bookingId);
    await fetchBookings();
    setUpdatingStatus(false);
    setShowModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <img src="/assets/icon/logo.png" alt="LetGoNow" className="h-10 w-auto" />
              <h1 className="ml-4 text-2xl font-bold text-gray-900">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900">Tổng đơn đặt</h3>
            <p className="mt-2 text-3xl font-bold text-teal-600">{bookings.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900">Đơn đặt hôm nay</h3>
            <p className="mt-2 text-3xl font-bold text-teal-600">
              {bookings.filter(booking => 
                new Date(booking.booking_date).toDateString() === new Date().toDateString()
              ).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900">Đơn đặt đang chờ</h3>
            <p className="mt-2 text-3xl font-bold text-teal-600">
              {bookings.filter(booking => booking.status === 'pending').length}
            </p>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Đơn đặt gần đây</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã đặt chỗ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khách hàng</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dịch vụ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thông tin</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số lượng</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng tiền</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày đặt</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.code || booking.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.customer_name || booking.user_id || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {booking.service_type === 'flight' ? (
                        <span className="inline-flex items-center gap-1 text-blue-600 font-semibold">✈️ Vé máy bay</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-teal-600 font-semibold">🚢 Du thuyền</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.service_type === 'flight'
                        ? `${booking.flight_from || '-'} → ${booking.flight_to || '-'}${booking.flight_date ? ' (' + booking.flight_date + ')' : ''}`
                        : `${booking.yacht_name || '-'}${booking.yacht_date ? ' (' + booking.yacht_date + ')' : ''}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.guests || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.total ? booking.total.toLocaleString() + 'đ' : '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {booking.status === 'pending' ? 'Chờ thanh toán' : booking.status === 'confirmed' ? 'Đã thanh toán' : 'Đã huỷ'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(booking.booking_date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button className="text-teal-600 hover:text-teal-900" onClick={() => { setSelectedBooking(booking); setShowModal(true); }}>Chi tiết</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal chi tiết booking */}
      {showModal && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl" onClick={() => setShowModal(false)}>&times;</button>
            <h2 className="text-xl font-bold mb-4">Chi tiết đơn đặt chỗ #{selectedBooking.id}</h2>
            <div className="space-y-2">
              <div><b>Khách hàng:</b> {selectedBooking.customer_name || selectedBooking.user_id || '-'}</div>
              <div><b>Dịch vụ:</b> {selectedBooking.service_type === 'flight' ? '✈️ Vé máy bay' : '🚢 Du thuyền'}</div>
              {selectedBooking.service_type === 'flight' ? (
                <>
                  <div><b>Chuyến bay:</b> {selectedBooking.flight_from || '-'} → {selectedBooking.flight_to || '-'} {selectedBooking.flight_date ? '(' + selectedBooking.flight_date + ')' : ''}</div>
                </>
              ) : (
                <div><b>Du thuyền:</b> {selectedBooking.yacht_name || '-'}</div>
              )}
              <div><b>Số khách:</b> {selectedBooking.guests || '-'}</div>
              <div><b>Tổng tiền:</b> {selectedBooking.total ? selectedBooking.total.toLocaleString() + 'đ' : '-'}</div>
              <div><b>Trạng thái:</b> 
                <select value={selectedBooking.status} onChange={e => handleChangeStatus(selectedBooking.id, e.target.value)} disabled={updatingStatus} className="ml-2 border rounded px-2 py-1">
                  <option value="confirmed">Đã thanh toán</option>
                  <option value="pending">Chờ thanh toán</option>
                  <option value="cancelled">Đã huỷ</option>
                </select>
              </div>
              <div><b>Ngày đặt:</b> {new Date(selectedBooking.booking_date).toLocaleString()}</div>
              {selectedBooking.customer_email && <div><b>Email:</b> {selectedBooking.customer_email}</div>}
              {selectedBooking.customer_phone && <div><b>SĐT:</b> {selectedBooking.customer_phone}</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 