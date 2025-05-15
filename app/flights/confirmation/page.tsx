'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const AIRLINE_LOGOS: Record<string, string> = {
  HVN: '/assets/airlines/vietnamairlines.png',
  QH: '/assets/airlines/bamboo.png',
  VJ: '/assets/airlines/vietjet.png',
};

function formatPrice(price: number) {
  return price.toLocaleString('vi-VN');
}

export default function ConfirmationPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);
  const [bookingData, setBookingData] = useState<any>(null);
  const [bookingCode, setBookingCode] = useState('');
  const [sent, setSent] = useState(false);

  useEffect(() => {
    // Lấy dữ liệu booking từ localStorage
    const data = typeof window !== 'undefined' ? localStorage.getItem('flightBookingData') : null;
    if (data) {
      setBookingData(JSON.parse(data));
    } else {
      router.push('/flights');
    }
  }, [router]);

  useEffect(() => {
    if (bookingData && !sent) {
      // Gọi API tạo booking
      fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...bookingData,
          payment_status: 'completed',
          booking_code: 'FL' + Math.random().toString(36).substring(2, 8).toUpperCase(),
        }),
      })
        .then(() => {
          setSent(true);
          setBookingCode('FL' + Math.random().toString(36).substring(2, 8).toUpperCase());
          localStorage.removeItem('flightBookingData');
        })
        .catch(() => {
          // Nếu lỗi thì vẫn cho chuyển hướng về trang chủ
          setSent(true);
        });
    }
  }, [bookingData, sent]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      router.push('/flights');
    }
  }, [countdown, router]);

  if (!bookingData) return null;

  return (
    <div className="container mx-auto px-4 py-8 mt-20">
      {/* Progress bar */}
      <div className="flex items-center justify-center gap-12 mb-8">
        <div className="flex flex-col items-center">
          <div className="w-7 h-7 rounded-full border-4 border-teal-400 bg-white flex items-center justify-center">
            <div className="w-4 h-4 bg-teal-400 rounded-full"></div>
          </div>
          <div className="font-bold mt-2 text-teal-600">Chọn chuyến bay</div>
          <div className="text-xs text-gray-500">Hoàn thành</div>
        </div>
        <div className="h-1 w-16 bg-teal-400 rounded-full"></div>
        <div className="flex flex-col items-center">
          <div className="w-7 h-7 rounded-full border-4 border-teal-400 bg-white flex items-center justify-center">
            <div className="w-4 h-4 bg-teal-400 rounded-full"></div>
          </div>
          <div className="font-bold mt-2 text-teal-600">Đặt chỗ</div>
          <div className="text-xs text-gray-500">Hoàn thành</div>
        </div>
        <div className="h-1 w-16 bg-teal-400 rounded-full"></div>
        <div className="flex flex-col items-center">
          <div className="w-7 h-7 rounded-full border-4 border-teal-400 bg-white flex items-center justify-center">
            <div className="w-4 h-4 bg-teal-400 rounded-full"></div>
          </div>
          <div className="font-bold mt-2 text-teal-600">Thanh toán</div>
          <div className="text-xs text-gray-500">Hoàn thành</div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        {/* Box xác nhận */}
        <div className="bg-white rounded-2xl shadow-md p-8 mb-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Đặt vé thành công!</h1>
            <p className="text-gray-600">Cảm ơn bạn đã đặt vé với LetGoNow</p>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-6">
              <div className="text-lg font-semibold">Mã đặt chỗ</div>
              <div className="text-2xl font-bold text-teal-600">{bookingCode}</div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-4 mb-4">
                <img src={AIRLINE_LOGOS[bookingData.flight.airline.iata]} alt={bookingData.flight.airline.name} className="h-10 w-20 object-contain" />
                <div>
                  <div className="font-semibold">{bookingData.flight.airline.name}</div>
                  <div className="text-gray-500 text-sm">Chuyến bay {bookingData.flight.flight?.iata || ''}</div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{bookingData.flight.departure.iata}</div>
                  <div className="text-gray-500">
                    {new Date(bookingData.flight.departure.scheduled).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <div className="flex-1 px-4">
                  <div className="flex items-center">
                    <div className="flex-1 h-0.5 bg-gray-300"></div>
                    <div className="mx-2 text-gray-500">→</div>
                    <div className="flex-1 h-0.5 bg-gray-300"></div>
                  </div>
                  <div className="text-center text-sm text-gray-500 mt-1">2 giờ</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{bookingData.flight.arrival.iata}</div>
                  <div className="text-gray-500">
                    {new Date(bookingData.flight.arrival.scheduled).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-500 mb-1">Hành khách</div>
                <div className="font-medium">
                  {bookingData.passengers.length} hành khách
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Ghế</div>
                <div className="font-medium">{bookingData.selected_seats?.join(', ')}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Dịch vụ bổ sung</div>
                <div className="font-medium">
                  Hành lý: {bookingData.selected_baggage}<br />
                  Bữa ăn: {bookingData.selected_meal}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Thông tin liên hệ</div>
                <div className="font-medium">
                  {bookingData.contact.name}<br />
                  {bookingData.contact.email}<br />
                  {bookingData.contact.phone}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6 mt-6">
            <div className="bg-blue-50 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <div className="font-semibold text-blue-800 mb-1">Thông tin quan trọng</div>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Vé điện tử đã được gửi đến email của bạn</li>
                    <li>• Vui lòng kiểm tra email để xem chi tiết vé</li>
                    <li>• Mã đặt chỗ của bạn là: <span className="font-bold">{bookingCode}</span></li>
                    <li>• Vui lòng đến sân bay sớm ít nhất 2 giờ trước giờ khởi hành</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => router.push('/flights')}
                className="px-8 py-3 rounded-full bg-[#7ee3e0] text-gray-800 font-bold text-lg hover:bg-[#5fd3d0] transition"
              >
                Quay lại trang chủ
              </button>
              <div className="text-sm text-gray-500 mt-4">
                Tự động chuyển hướng sau {countdown} giây...
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 