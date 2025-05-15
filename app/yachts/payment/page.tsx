'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createBooking } from '../../../lib/bookings';

const PAYMENT_METHODS = [
  { id: 'credit_card', name: 'Thẻ tín dụng/ghi nợ', icon: '💳', description: 'Visa, Mastercard, JCB, American Express' },
  { id: 'bank_transfer', name: 'Chuyển khoản ngân hàng', icon: '🏦', description: 'Chuyển khoản qua ngân hàng' },
  { id: 'momo', name: 'Ví MoMo', icon: '👛', description: 'Thanh toán qua ví MoMo' },
  { id: 'zalopay', name: 'ZaloPay', icon: '📱', description: 'Thanh toán qua ZaloPay' },
];

const BANKS = [
  { id: 'vcb', name: 'Vietcombank', account: '1234567890', holder: 'CONG TY TNHH LETGONOW' },
  { id: 'tcb', name: 'Techcombank', account: '0987654321', holder: 'CONG TY TNHH LETGONOW' },
];

const mockBooking = {
  yacht_id: 1,
  yacht: 'Paradise Luxury',
  date: '2024-07-20',
  guests: 4,
  number_of_guests: 4,
  room: 'Suite',
  total: 25000000,
  total_price: 25000000,
  contact: {
    name: 'Nguyễn Văn A',
    phone: '0123456789',
    email: 'nguyenvana@email.com',
  }
};

function formatPrice(price: number) {
  return price.toLocaleString('vi-VN');
}

export default function YachtPaymentPage() {
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    const formatted = value.replace(/(\d{4})/g, '$1 ').trim();
    setCardNumber(formatted);
  };
  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 4) {
      const formatted = value.replace(/(\d{2})(\d{0,2})/, (_, m, y) => y ? `${m}/${y}` : m);
      setExpiryDate(formatted);
    }
  };
  const isCardValid = () => cardNumber && cardHolder && expiryDate && cvv;

  const handleInsertBooking = async () => {
    if (isSubmitting || isSubmittingRef.current) return false;
    setIsSubmitting(true);
    isSubmittingRef.current = true;
    // Lấy dữ liệu booking từ localStorage nếu có
    let bookingData = mockBooking;
    if (typeof window !== 'undefined') {
      const storedData = localStorage.getItem('yachtBookingData');
      if (storedData) bookingData = JSON.parse(storedData);
    }
    // Đảm bảo có yacht_id
    if (!bookingData.yacht_id) {
      alert('Không tìm thấy mã du thuyền (yacht_id). Vui lòng quay lại chọn lại du thuyền!');
      setIsSubmitting(false);
      isSubmittingRef.current = false;
      return false;
    }
    // Xử lý booking_date an toàn
    let bookingDateIso = '';
    if (bookingData.date && !isNaN(new Date(bookingData.date).getTime())) {
      bookingDateIso = new Date(bookingData.date).toISOString();
    } else {
      bookingDateIso = new Date().toISOString();
    }
    // Chuẩn hóa dữ liệu gửi lên backend
    const payload: any = {
      service_type: 'yacht',
      booking_date: bookingDateIso,
      yacht_id: Number(bookingData.yacht_id),
      number_of_guests: Number(bookingData.number_of_guests ?? bookingData.guests),
      total_price: Number(bookingData.total_price ?? bookingData.total),
      customer_name: bookingData.contact?.name,
      customer_email: bookingData.contact?.email,
      customer_phone: bookingData.contact?.phone,
      special_requests: '',
      status: 'confirmed',
    };
    const result = await createBooking(payload);
    setIsSubmitting(false);
    isSubmittingRef.current = false;
    if (!result.error && typeof window !== 'undefined') {
      localStorage.removeItem('yachtBookingData');
    }
    if (result.error) {
      console.error('Insert booking error:', result.error);
      return false;
    }
    return !result.error;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleInsertBooking();
    router.push('/yachts/confirmation');
  };

  return (
    <div className="container mx-auto px-4 py-8 mt-20">
      {/* Progress bar */}
      <div className="flex items-center justify-center gap-12 mb-8">
        <div className="flex flex-col items-center">
          <div className="w-7 h-7 rounded-full border-4 border-teal-400 bg-white flex items-center justify-center">
            <div className="w-4 h-4 bg-teal-400 rounded-full"></div>
          </div>
          <div className="font-bold mt-2 text-teal-600">Chọn du thuyền</div>
          <div className="text-xs text-gray-500">Hoàn thành</div>
        </div>
        <div className="h-1 w-16 bg-teal-400 rounded-full"></div>
        <div className="flex flex-col items-center">
          <div className="w-7 h-7 rounded-full border-4 border-teal-400 bg-white flex items-center justify-center">
            <div className="w-4 h-4 bg-teal-400 rounded-full"></div>
          </div>
          <div className="font-bold mt-2 text-teal-600">Nhập thông tin</div>
          <div className="text-xs text-gray-500">Hoàn thành</div>
        </div>
        <div className="h-1 w-16 bg-teal-400 rounded-full"></div>
        <div className="flex flex-col items-center">
          <div className="w-7 h-7 rounded-full border-4 border-teal-400 bg-white flex items-center justify-center">
            <div className="w-4 h-4 bg-teal-400 rounded-full"></div>
          </div>
          <div className="font-bold mt-2 text-teal-600">Thanh toán</div>
          <div className="text-xs text-gray-500">Đang thực hiện</div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Box thông tin đặt chỗ */}
        <div className="bg-white rounded-2xl shadow-md p-6 w-full md:w-1/3 mb-6 md:mb-0">
          <div className="font-bold text-lg mb-2">Thông tin đặt chỗ</div>
          <div className="mb-2"><span className="text-gray-500">Du thuyền:</span> <span className="font-semibold">{mockBooking.yacht}</span></div>
          <div className="mb-2"><span className="text-gray-500">Ngày đi:</span> <span className="font-semibold">{new Date(mockBooking.date).toLocaleDateString('vi-VN')}</span></div>
          <div className="mb-2"><span className="text-gray-500">Số khách:</span> <span className="font-semibold">{mockBooking.guests}</span></div>
          <div className="mb-2"><span className="text-gray-500">Loại phòng:</span> <span className="font-semibold">{mockBooking.room}</span></div>
          <div className="border-t pt-4 mt-4 flex items-center justify-between">
            <div className="font-bold">Tổng tiền</div>
            <div className="font-bold text-xl text-teal-700">{formatPrice(mockBooking.total)} VND</div>
          </div>
        </div>

        {/* Box thanh toán */}
        <div className="flex-1 bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-6">Chọn phương thức thanh toán</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {PAYMENT_METHODS.map(method => (
              <button
                key={method.id}
                type="button"
                onClick={() => setSelectedMethod(method.id)}
                className={`p-4 rounded-xl border ${selectedMethod === method.id ? 'bg-teal-100 border-teal-400 text-teal-700' : 'bg-gray-50 border-gray-200 text-gray-700'}`}
                disabled={isSubmitting}
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{method.icon}</div>
                  <div>
                    <div className="font-semibold">{method.name}</div>
                    <div className="text-sm text-gray-500">{method.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {selectedMethod === 'credit_card' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số thẻ</label>
                <input type="text" value={cardNumber} onChange={handleCardNumberChange} maxLength={19} placeholder="1234 5678 9012 3456" className="w-full p-3 rounded-xl border border-gray-300 focus:border-teal-400 focus:ring-1 focus:ring-teal-400" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên chủ thẻ</label>
                <input type="text" value={cardHolder} onChange={e => setCardHolder(e.target.value)} placeholder="NGUYEN VAN A" className="w-full p-3 rounded-xl border border-gray-300 focus:border-teal-400 focus:ring-1 focus:ring-teal-400" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày hết hạn</label>
                  <input type="text" value={expiryDate} onChange={handleExpiryDateChange} maxLength={5} placeholder="MM/YY" className="w-full p-3 rounded-xl border border-gray-300 focus:border-teal-400 focus:ring-1 focus:ring-teal-400" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                  <input type="text" value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))} maxLength={3} placeholder="123" className="w-full p-3 rounded-xl border border-gray-300 focus:border-teal-400 focus:ring-1 focus:ring-teal-400" required />
                </div>
              </div>
              <button type="button" className="w-full mt-6 px-8 py-3 rounded-full bg-[#7ee3e0] text-gray-800 font-bold text-lg hover:bg-[#5fd3d0] transition" onClick={async () => { const ok = await handleInsertBooking(); if (ok) router.push('/yachts/confirmation'); }} disabled={!isCardValid() || isSubmitting}>
                Thanh toán {formatPrice(mockBooking.total)} VND
              </button>
            </div>
          )}

          {selectedMethod === 'bank_transfer' && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="font-semibold mb-2">Thông tin chuyển khoản</div>
                <div className="space-y-2">
                  {BANKS.map(bank => (
                    <div key={bank.id} className="p-3 bg-white rounded-lg border border-gray-200">
                      <div className="font-medium">{bank.name}</div>
                      <div className="text-sm text-gray-600">Số tài khoản: {bank.account}</div>
                      <div className="text-sm text-gray-600">Chủ tài khoản: {bank.holder}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-4 bg-yellow-50 rounded-xl">
                <div className="font-semibold text-yellow-800 mb-2">Lưu ý quan trọng</div>
                <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
                  <li>Vui lòng chuyển khoản đúng số tiền {formatPrice(mockBooking.total)} VND</li>
                  <li>Nội dung chuyển khoản: YACHT {mockBooking.yacht.toUpperCase().replace(/\s/g, '')}</li>
                  <li>Vé sẽ được gửi qua email sau khi xác nhận thanh toán</li>
                </ul>
              </div>
              <button type="button" className="w-full mt-4 px-8 py-3 rounded-full bg-[#7ee3e0] text-gray-800 font-bold text-lg hover:bg-[#5fd3d0] transition" onClick={async () => { const ok = await handleInsertBooking(); if (ok) router.push('/yachts/confirmation'); }} disabled={isSubmitting}>
                Tôi đã chuyển khoản
              </button>
            </div>
          )}

          {(selectedMethod === 'momo' || selectedMethod === 'zalopay') && (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📱</div>
              <div className="font-semibold mb-2">Quét mã QR để thanh toán</div>
              <div className="text-gray-500 mb-4">Vui lòng mở ứng dụng {selectedMethod === 'momo' ? 'MoMo' : 'ZaloPay'} và quét mã QR bên dưới</div>
              <div className="bg-gray-100 p-4 rounded-xl inline-block">
                <div className="w-48 h-48 bg-white flex items-center justify-center text-gray-400">QR CODE</div>
              </div>
              <button type="button" className="w-full mt-8 px-8 py-3 rounded-full bg-[#7ee3e0] text-gray-800 font-bold text-lg hover:bg-[#5fd3d0] transition" onClick={async () => { const ok = await handleInsertBooking(); if (ok) router.push('/yachts/confirmation'); }} disabled={isSubmitting}>
                Tôi đã thanh toán
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 