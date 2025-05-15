"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { getBookingsByUserId } from '../../../lib/bookings';
import React from "react";

interface Booking {
  id: number;
  user_id: string;
  service_type: string;
  yacht_id?: number;
  flight_number?: string;
  flight_from?: string;
  flight_to?: string;
  departure_date?: string;
  airline?: string;
  booking_date: string;
  status: string;
  total_price?: number;
  number_of_guests?: number;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
}

interface Yacht {
  id: number;
  name: string;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [yachts, setYachts] = useState<Yacht[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    // Lấy bookings từ backend
    const { data: bookingsData } = await getBookingsByUserId();
    setBookings(bookingsData || []);
    // Lấy yachts để join tên (có thể vẫn dùng supabase hoặc API backend nếu có)
    const { data: yachtsData } = await supabase
      .from("yachts")
      .select("id, name");
    setYachts(yachtsData || []);
    setLoading(false);
  };

  const getYachtName = (yacht_id?: number) => {
    if (!yacht_id) return "-";
    const yacht = yachts.find((y) => y.id === yacht_id);
    return yacht ? yacht.name : "-";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">Quản lý đơn đặt chỗ</h1>
      {loading ? (
        <div>Đang tải...</div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã đơn</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại dịch vụ</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khách hàng</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thông tin dịch vụ</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số khách</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng tiền</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày đặt</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{booking.id}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      {booking.service_type === "flight" ? (
                        <span className="inline-flex items-center gap-1 text-blue-600 font-semibold">✈️ Vé máy bay</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-teal-600 font-semibold">🚢 Du thuyền</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{booking.customer_name || booking.user_id || '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {booking.service_type === "flight"
                        ? `${booking.flight_number || "-"} | ${booking.flight_from || "-"} → ${booking.flight_to || "-"} | ${booking.departure_date ? new Date(booking.departure_date).toLocaleString() : "-"} | ${booking.airline || "-"}`
                        : getYachtName(booking.yacht_id)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{booking.number_of_guests || "-"}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{booking.total_price ? booking.total_price.toLocaleString() + "đ" : "-"}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        booking.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : booking.status === "confirmed"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                        {booking.status === "pending"
                          ? "Chờ thanh toán"
                          : booking.status === "confirmed"
                          ? "Đã thanh toán"
                          : "Đã huỷ"}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{new Date(booking.booking_date).toLocaleDateString()}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      <button className="text-teal-600 hover:text-teal-900" onClick={() => { setSelectedBooking(booking); setShowModal(true); }}>Chi tiết</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
                  <div><b>Chuyến bay:</b> {selectedBooking.flight_number || '-'} | {selectedBooking.flight_from || '-'} → {selectedBooking.flight_to || '-'} | {selectedBooking.departure_date ? new Date(selectedBooking.departure_date).toLocaleString() : '-'} | {selectedBooking.airline || '-'}</div>
                </>
              ) : (
                <div><b>Du thuyền:</b> {getYachtName(selectedBooking.yacht_id)}</div>
              )}
              <div><b>Số khách:</b> {selectedBooking.number_of_guests || '-'}</div>
              <div><b>Tổng tiền:</b> {selectedBooking.total_price ? selectedBooking.total_price.toLocaleString() + 'đ' : '-'}</div>
              <div><b>Trạng thái:</b> {selectedBooking.status === 'pending' ? 'Chờ thanh toán' : selectedBooking.status === 'confirmed' ? 'Đã thanh toán' : 'Đã huỷ'}</div>
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