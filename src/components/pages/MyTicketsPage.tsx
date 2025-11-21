import { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Calendar, Clock, MapPin, Ticket, Download, QrCode, Users, Loader2 } from 'lucide-react';
import { Separator } from '../ui/separator';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom'; // SỬA LỖI: Thêm import useNavigate

interface Booking {
  booking_id: number;
  movie_title: string;
  cinema_name: string;
  screen?: string; 
  start_time: string;
  seats: string; 
  number_of_tickets: number;
  total_amount: string;
  booking_date?: string; 
}

// SỬA LỖI: Xóa prop `onNavigate` vì nó không được truyền từ App.tsx
export function MyTicketsPage() {
  const [selectedTab, setSelectedTab] = useState('upcoming');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const { token, isAuthenticated } = useAuth();
  const navigate = useNavigate(); // SỬA LỖI: Khởi tạo hook useNavigate

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    const fetchBookings = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:5001/api/users/me/bookings', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
          throw new Error('Không thể tải danh sách vé.');
        }
        const data = await response.json();
        const formattedData = data.map((item: any) => ({
            ...item,
            screen: `Phòng ${item.booking_id % 5 + 1}`, // Dữ liệu giả
            seats: Array.isArray(item.seats) ? item.seats.join(', ') : (item.seats || 'N/A'), // SỬA LỖI: Đảm bảo 'seats' là string
            booking_date: new Date(new Date(item.start_time).getTime() - 3 * 24 * 60 * 60 * 1000).toLocaleDateString('vi-VN') // Dữ liệu giả
        }))
        setBookings(formattedData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookings();
  }, [token, isAuthenticated]);

  const upcomingTickets = bookings.filter(ticket => new Date(ticket.start_time) >= new Date());
  const usedTickets = bookings.filter(ticket => new Date(ticket.start_time) < new Date());
  
  const filteredTickets = selectedTab === 'upcoming' ? upcomingTickets : usedTickets;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-red-50 to-white py-12 border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-2">
            <Ticket className="w-8 h-8 text-red-600" />
            <h1 className="text-4xl text-gray-900">Vé Của Tôi</h1>
          </div>
          <p className="text-gray-600">Quản lý và xem tất cả vé đã đặt</p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="bg-white border border-gray-200 mb-8">
              <TabsTrigger 
                value="upcoming" 
                className="data-[state=active]:bg-red-600 data-[state=active]:text-white"
              >
                Sắp Tới ({upcomingTickets.length})
              </TabsTrigger>
              <TabsTrigger 
                value="used"
                className="data-[state=active]:bg-red-600 data-[state=active]:text-white"
              >
                Đã Sử Dụng ({usedTickets.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={selectedTab}>
              {loading ? (
                 <div className="flex justify-center items-center min-h-[40vh]">
                    <Loader2 className="w-12 h-12 animate-spin text-red-600" />
                 </div>
              ) : !isAuthenticated ? (
                <div className="text-center py-16">
                  <Ticket className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl text-gray-900 mb-2">Vui lòng đăng nhập</h3>
                  <p className="text-gray-600 mb-6">Bạn cần đăng nhập để xem vé đã đặt.</p>
                </div>
              ) : filteredTickets.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredTickets.map((ticket) => (
                    <Card key={ticket.booking_id} className="bg-white border-gray-200 overflow-hidden hover:border-red-600 transition-all shadow-sm hover:shadow-md">
                      <CardContent className="p-0">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-2xl mb-2">{ticket.movie_title}</h3>
                              <p className="text-red-100 text-sm">{ticket.cinema_name}</p>
                            </div>
                            <Badge className={selectedTab === 'upcoming' ? 'bg-green-500' : 'bg-gray-500'}>
                              {selectedTab === 'upcoming' ? 'Sắp chiếu' : 'Đã xem'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(ticket.start_time).toLocaleDateString('vi-VN')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>{new Date(ticket.start_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit'})}</span>
                            </div>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="p-6 space-y-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500 mb-1">Phòng chiếu</p>
                              <p className="text-gray-900">{ticket.screen || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 mb-1">Ghế ngồi</p>
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4 text-red-600" />
                                <p className="text-gray-900">{ticket.seats || 'N/A'}</p>
                              </div>
                            </div>
                            <div>
                              <p className="text-gray-500 mb-1">Ngày đặt</p>
                              <p className="text-gray-900">{ticket.booking_date || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 mb-1">Mã vé</p>
                              <p className="text-gray-900">CGV{ticket.booking_id.toString().padStart(5, '0')}</p>
                            </div>
                          </div>

                          <Separator className="bg-gray-200" />

                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-gray-500 text-sm mb-1">Tổng tiền</p>
                              <p className="text-2xl text-red-600">{Number(ticket.total_amount).toLocaleString('vi-VN')}đ</p>
                            </div>
                            {selectedTab === 'upcoming' && (
                              <div className="bg-gray-100 p-3 rounded-lg">
                                <QrCode className="w-12 h-12 text-gray-600" />
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2">
                            {selectedTab === 'upcoming' ? (
                              <>
                                <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                                  <QrCode className="w-4 h-4 mr-2" />
                                  Xem Mã QR
                                </Button>
                                <Button variant="outline" className="flex-1 border-gray-300 text-gray-700">
                                  <Download className="w-4 h-4 mr-2" />
                                  Tải Về
                                </Button>
                              </>
                            ) : (
                              <Button variant="outline" className="w-full border-gray-300 text-gray-700">
                                <Download className="w-4 h-4 mr-2" />
                                Tải Hóa Đơn
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Ticket className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl text-gray-900 mb-2">Không có vé nào</h3>
                  <p className="text-gray-600 mb-6">
                    {selectedTab === 'upcoming' 
                      ? 'Bạn chưa có vé sắp chiếu nào.'
                      : 'Bạn chưa có vé đã sử dụng nào.'}
                  </p>
                  {/* SỬA LỖI: Dùng navigate('/movies') thay vì onNavigate('movies') */}
                  <Button onClick={() => navigate('/movies')} className="bg-red-600 hover:bg-red-700 text-white">
                    Đặt Vé Ngay
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
}