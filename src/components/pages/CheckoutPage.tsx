import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, MapPin, Film, CreditCard, Wallet, QrCode, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';

interface CheckoutPageProps {
  bookingData: any;
}

export function CheckoutPage({ bookingData }: CheckoutPageProps) {
  const navigate = useNavigate(); // <-- THÊM DÒNG NÀY
  const { user, token } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [promoCode, setPromoCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });

  useEffect(() => {
    if (user) {
        setFormData(prev => ({ ...prev, name: user.name, email: user.email, phone: user.phone || ''}));
    }
  }, [user]);

  const handlePayment = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      if (!token) throw new Error("Bạn cần đăng nhập để hoàn tất đặt vé.");
      await new Promise(resolve => setTimeout(resolve, 2000));
      const response = await fetch('http://localhost:5001/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          showtime_id: bookingData.showtime.showtime_id,
          seats: bookingData.seats,
        })
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Đặt vé không thành công.');
      }
      setIsSuccess(true);
      // Sửa: 'my-tickets' -> '/my-tickets'
      setTimeout(() => navigate('/my-tickets'), 2000); // <-- SỬA Ở ĐÂY
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="bg-white max-w-md w-full mx-4 text-center">
          <CardContent className="p-12">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Thanh Toán Thành Công!</h2>
            <p className="text-gray-600 mb-6">Vé của bạn đã được đặt. Vui lòng kiểm tra email và mục "Vé của tôi".</p>
            <Button onClick={() => navigate('/my-tickets')} className="w-full bg-red-600 hover:bg-red-700">Xem Vé Của Tôi</Button> {/* <-- SỬA Ở ĐÂY */}
          </CardContent>
        </Card>
      </div>
    );
  }

  const serviceFee = 10000;
  const finalPrice = bookingData.totalPrice + serviceFee;
  const qrCodeData = encodeURIComponent(`Thanh toan ve phim CGV. So tien: ${finalPrice} VND. Ma dat ve: ${bookingData.showtime.showtime_id}`);

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-white border-b py-6"><div className="container mx-auto px-4"><h1 className="text-3xl font-semibold mb-1">Thanh Toán</h1><p className="text-gray-600">Hoàn tất đặt vé của bạn</p></div></section>
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-white"><CardHeader><CardTitle>Thông Tin Liên Hệ</CardTitle></CardHeader><CardContent className="space-y-4"><div className="space-y-2"><Label htmlFor="name">Họ và Tên</Label><Input id="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required /></div><div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required /></div><div className="space-y-2"><Label htmlFor="phone">Số Điện Thoại</Label><Input id="phone" type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} required /></div></div></CardContent></Card>
              <Card className="bg-white">
                <CardHeader><CardTitle>Phương Thức Thanh Toán</CardTitle></CardHeader>
                <CardContent>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                    <Label htmlFor="card" className={`flex items-center p-4 rounded-lg border-2 cursor-pointer ${paymentMethod === 'card' ? 'border-red-600 bg-red-50' : 'border-gray-200'}`}><RadioGroupItem value="card" id="card" className="mr-3" /><CreditCard className="w-5 h-5 text-red-600 mr-3" /><div><p>Thẻ Tín Dụng / Ghi Nợ</p><p className="text-xs text-gray-500">Visa, Mastercard, JCB</p></div></Label>
                    <Label htmlFor="momo" className={`flex items-center p-4 rounded-lg border-2 cursor-pointer ${paymentMethod === 'momo' ? 'border-red-600 bg-red-50' : 'border-gray-200'}`}><RadioGroupItem value="momo" id="momo" className="mr-3" /><Wallet className="w-5 h-5 text-pink-600 mr-3" /><div><p>Ví MoMo</p><p className="text-xs text-gray-500">Thanh toán qua ví điện tử</p></div></Label>
                    <Label htmlFor="vnpay" className={`flex items-center p-4 rounded-lg border-2 cursor-pointer ${paymentMethod === 'vnpay' ? 'border-red-600 bg-red-50' : 'border-gray-200'}`}><RadioGroupItem value="vnpay" id="vnpay" className="mr-3" /><QrCode className="w-5 h-5 text-blue-600 mr-3" /><div><p>VNPAY / VietQR</p><p className="text-xs text-gray-500">Quét mã qua ứng dụng ngân hàng</p></div></Label>
                  </RadioGroup>
                  {paymentMethod === 'card' && <div className="mt-6 space-y-4 border-t pt-6"><div className="space-y-2"><Label htmlFor="cardNumber">Số Thẻ</Label><Input id="cardNumber" placeholder="1234 5678 9012 3456"/></div><div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label htmlFor="expiry">Ngày Hết Hạn</Label><Input id="expiry" placeholder="MM/YY"/></div><div className="space-y-2"><Label htmlFor="cvv">CVV</Label><Input id="cvv" placeholder="123"/></div></div></div>}
                  {(paymentMethod === 'momo' || paymentMethod === 'vnpay') && (<div className="mt-6 border-t pt-6 flex flex-col items-center"><p className="mb-4 text-center">Quét mã QR để thanh toán bằng {paymentMethod === 'momo' ? 'ví MoMo' : 'VNPAY'}</p><img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrCodeData}`} alt={`Mã QR cho ${paymentMethod}`} className="w-48 h-48 p-1 border rounded-md" /></div>)}
                </CardContent>
              </Card>
              <Card className="bg-white"><CardHeader><CardTitle>Mã Khuyến Mãi</CardTitle></CardHeader><CardContent><div className="flex gap-3"><Input placeholder="Nhập mã khuyến mãi" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} /><Button variant="outline">Áp Dụng</Button></div></CardContent></Card>
            </div>
            <div className="lg:col-span-1">
              <Card className="bg-white sticky top-24">
                <CardHeader><CardTitle>Tóm Tắt Đơn Hàng</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-2"><Film className="w-4 h-4 text-red-600 mt-1" /><div><p className="text-sm text-gray-600">Phim</p><p className="font-semibold text-gray-900">{bookingData.movie.title}</p></div></div>
                    <div className="flex items-start gap-2"><MapPin className="w-4 h-4 text-red-600 mt-1" /><div><p className="text-sm text-gray-600">Rạp</p><p className="font-semibold text-gray-900">{bookingData.showtime.cinema_name}</p></div></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-start gap-2"><Calendar className="w-4 h-4 text-red-600 mt-1" /><div><p className="text-sm text-gray-600">Ngày</p><p className="font-semibold text-gray-900">{new Date(bookingData.showtime.start_time).toLocaleDateString('vi-VN')}</p></div></div>
                      <div className="flex items-start gap-2"><Clock className="w-4 h-4 text-red-600 mt-1" /><div><p className="text-sm text-gray-600">Suất</p><p className="font-semibold text-gray-900">{new Date(bookingData.showtime.start_time).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'})}</p></div></div>
                    </div>
                    <div><p className="text-sm text-gray-600 mb-1">Ghế</p><div className="flex flex-wrap gap-1">{bookingData.seats.map((seat: string) => (<Badge key={seat} className="bg-red-100 text-red-700">{seat}</Badge>))}</div></div>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex justify-between text-gray-600"><span>Tổng vé ({bookingData.seats.length})</span><span>{bookingData.totalPrice.toLocaleString('vi-VN')}đ</span></div>
                    <div className="flex justify-between text-gray-600"><span>Phí dịch vụ</span><span>{serviceFee.toLocaleString('vi-VN')}đ</span></div>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-xl font-bold text-gray-900"><span>Tổng cộng</span><span className="text-red-600">{finalPrice.toLocaleString('vi-VN')}đ</span></div>
                  {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                  <Button onClick={handlePayment} disabled={isProcessing} className="w-full bg-red-600 hover:bg-red-700 text-white py-6 text-lg disabled:opacity-50">
                    {isProcessing && <Loader2 className="w-5 h-5 mr-2 animate-spin"/>}
                    {isProcessing ? 'Đang xử lý...' : 'Thanh Toán Ngay'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}