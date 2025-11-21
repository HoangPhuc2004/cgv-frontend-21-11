import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { User, Mail, Phone, Calendar, Ticket, Star, Gift, LogOut, Settings, Heart, Clock } from 'lucide-react';

// Định nghĩa kiểu dữ liệu cho một vé đặt
interface Booking {
  booking_id: number;
  movie_title: string;
  cinema_name: string;
  start_time: string;
  total_amount: string;
}

export function MyAccountPage() {
  const { user, token, logout } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    // Hàm để gọi API lấy lịch sử đặt vé
    const fetchBookings = async () => {
      if (!token) return;

      try {
        const response = await fetch('http://localhost:5001/api/users/me/bookings', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Không thể tải lịch sử đặt vé.');
        }

        const data = await response.json();
        setBookings(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchBookings();
  }, [token]); // Chạy lại khi token thay đổi

  if (!user) {
    // Có thể chuyển hướng về trang chủ nếu chưa đăng nhập
    return <div>Vui lòng đăng nhập...</div>;
  }
  
  // Lấy 3 vé đặt gần nhất để hiển thị
  const recentBookings = bookings.slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-red-50 to-white py-12 border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center">
                <User className="w-12 h-12 text-white" />
              </div>
              <div>
                <h1 className="text-4xl text-gray-900 mb-2">{user.name}</h1>
                <div className="flex items-center gap-4 text-gray-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>{user.email}</span>
                  </div>
                  {/* Dữ liệu phone sẽ được cập nhật sau khi gọi API */}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                <Settings className="w-4 h-4 mr-2" />
                Chỉnh Sửa
              </Button>
              <Button
                onClick={logout}
                variant="outline"
                className="border-red-600 text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Đăng Xuất
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-red-50 to-white border-red-200">
              <CardContent className="p-6 text-center">
                <Ticket className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <p className="text-3xl text-gray-900 mb-1">{bookings.length}</p>
                <p className="text-sm text-gray-600">Vé Đã Đặt</p>
              </CardContent>
            </Card>
            {/* Các card thống kê khác */}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Booking History */}
            <div className="lg:col-span-2">
              <Card className="bg-white border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <Clock className="w-5 h-5 text-red-600" />
                    Lịch Sử Đặt Vé Gần Đây
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentBookings.length > 0 ? recentBookings.map((booking) => (
                    <div key={booking.booking_id} className="border border-gray-200 rounded-lg p-4 hover:border-red-600 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-gray-900 mb-1">{booking.movie_title}</h3>
                          <p className="text-sm text-gray-600">{booking.cinema_name}</p>
                        </div>
                        <Badge className={new Date(booking.start_time) > new Date() ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}>
                          {new Date(booking.start_time) > new Date() ? 'Sắp tới' : 'Đã xem'}
                        </Badge>
                      </div>
                      <Separator className="my-3 bg-gray-200" />
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Ngày & Giờ</p>
                          <p className="text-gray-900">{new Date(booking.start_time).toLocaleString('vi-VN')}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Tổng tiền</p>
                          <p className="text-red-600">{Number(booking.total_amount).toLocaleString('vi-VN')}đ</p>
                        </div>
                        <div className="col-span-2 flex justify-end items-end">
                          <Button variant="outline" size="sm" className="border-red-600 text-red-600 hover:bg-red-50">
                            Xem Chi Tiết
                          </Button>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <p className="text-gray-500 text-center py-8">Bạn chưa đặt vé nào.</p>
                  )}
                </CardContent>
              </Card>
            </div>
            {/* Sidebar (Favorite Movies, etc.) */}
          </div>
        </div>
      </section>
    </div>
  );
}