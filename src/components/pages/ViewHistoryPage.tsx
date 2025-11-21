import { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Calendar, Star, Clock, MapPin, History, Search, Filter, Loader2 } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Separator } from '../ui/separator';
import { useAuth } from '../AuthContext';

interface Booking {
  booking_id: number;
  movie_title: string;
  poster_url: string;
  cinema_name: string;
  start_time: string;
  genre: string; 
  rating?: number; // Giả sử API có thể có rating
}

export function ViewHistoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [history, setHistory] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const { token, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    const fetchHistory = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:5001/api/users/me/bookings', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Không thể tải lịch sử xem phim.');
        
        const data: Booking[] = await response.json();
        const pastBookings = data.filter(item => new Date(item.start_time) <= new Date());
        setHistory(pastBookings);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHistory();
  }, [token, isAuthenticated]);

  const filteredHistory = history.filter(item =>
    item.movie_title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star key={star} className={`w-4 h-4 ${star <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-b from-red-50 to-white py-12 border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-2"><History className="w-8 h-8 text-red-600" /><h1 className="text-4xl text-gray-900">Lịch Sử Xem Phim</h1></div>
          <p className="text-gray-600">Tất cả phim bạn đã xem tại CGV</p>
        </div>
      </section>

      <section className="py-8 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 max-w-4xl">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <Input placeholder="Tìm kiếm phim..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 border-gray-300 focus:border-red-600 focus:ring-red-600" />
            </div>
            <Button variant="outline" className="border-gray-300 text-gray-700"><Filter className="w-4 h-4 mr-2" />Lọc</Button>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-4">
            {loading ? (
              <div className="flex justify-center py-16"><Loader2 className="w-12 h-12 animate-spin text-red-600" /></div>
            ) : !isAuthenticated ? (
              <div className="text-center py-16"><h3 className="text-xl">Vui lòng đăng nhập để xem lịch sử.</h3></div>
            ) : filteredHistory.length > 0 ? (
              filteredHistory.map((item) => (
                <Card key={item.booking_id} className="bg-white border-gray-200 overflow-hidden hover:border-red-600 transition-all shadow-sm hover:shadow-md">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-48 h-64 md:h-auto flex-shrink-0">
                        <ImageWithFallback src={item.poster_url} alt={item.movie_title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 p-6">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-xl text-gray-900 mb-1">{item.movie_title}</h3>
                            <p className="text-sm text-gray-600">{item.genre}</p>
                          </div>
                          <Badge variant="outline" className="border-green-600 text-green-600">Đã xem</Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-red-600" /><span>{item.cinema_name}</span></div>
                          <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-red-600" /><span>{new Date(item.start_time).toLocaleDateString('vi-VN')}</span></div>
                          <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-red-600" /><span>{new Date(item.start_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit'})}</span></div>
                        </div>
                        <Separator className="my-4 bg-gray-200" />
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div>
                            <p className="text-sm text-gray-600 mb-2">Đánh giá của bạn</p>
                            {renderStars(4)} {/* Dữ liệu giả, có thể thêm vào DB sau */}
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">Đánh Giá Lại</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-16">
                <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl text-gray-900 mb-2">Chưa có lịch sử xem phim</h3>
                <p className="text-gray-600">Hãy đặt vé và trải nghiệm những bộ phim tuyệt vời tại CGV!</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}