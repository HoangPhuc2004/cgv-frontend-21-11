import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Film, Users, X, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom'; // <-- SỬA LỖI 1: Thêm import

// --- Interfaces ---
interface Movie {
  title: string;
  movie_id: number;
}
interface Showtime {
  showtime_id: number;
  cinema_name: string;
  start_time: string;
  ticket_price: string;
}
interface SeatSelectionPageProps {
  bookingData: {
    movie: Movie;
    showtime: Showtime;
    format: string;
  };
  // onNavigate: (page: string, data?: any) => void; // <-- SỬA LỖI 2: Xóa onNavigate
}

// --- Hằng số cho ghế và giá vé (Từ code Figma) ---
const ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
const SEATS_PER_ROW = 12;

const TICKET_PRICES = {
  standard: 85000,
  vip: 120000,
  couple: 200000,
};
// --- Kết thúc hằng số ---


export function SeatSelectionPage({ bookingData }: SeatSelectionPageProps) { // <-- SỬA LỖI 3: Xóa onNavigate
  const navigate = useNavigate(); // <-- SỬA LỖI 4: Khởi tạo hook
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [occupiedSeats, setOccupiedSeats] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // --- An toàn dữ liệu: Kiểm tra bookingData trước khi sử dụng ---
  const { movie, showtime, format } = bookingData || {};

  useEffect(() => {
    // Chỉ fetch khi có showtime_id
    if (!showtime?.showtime_id) {
      setLoading(false);
      return;
    }

    const fetchOccupiedSeats = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:5001/api/showtimes/${showtime.showtime_id}/occupied-seats`);
        if (!response.ok) throw new Error("Lỗi mạng khi tải dữ liệu ghế.");
        const data = await response.json();
        setOccupiedSeats(data);
      } catch (error) {
        console.error("Lỗi khi tải danh sách ghế đã đặt:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOccupiedSeats();
  }, [showtime?.showtime_id]);

  
  // --- Logic tính giá và loại ghế (Từ code Figma) ---
  const getSeatType = (row: string, seatNum: number) => {
    if (['H', 'I', 'J'].includes(row)) return 'vip';
    // Ghế 5 và 6 là ghế đôi
    if (seatNum === 5 || seatNum === 6) return 'couple';
    return 'standard';
  };

  const getSeatPrice = (seatId: string) => {
    const row = seatId[0];
    const seatNum = parseInt(seatId.substring(1));
    const type = getSeatType(row, seatNum);

    // Lấy giá từ TICKET_PRICES, nếu không có thì mặc định là giá standard
    return TICKET_PRICES[type as keyof typeof TICKET_PRICES] || TICKET_PRICES.standard;
  };

  const getTotalPrice = () => {
    return selectedSeats.reduce((total, seatId) => {
      return total + getSeatPrice(seatId);
    }, 0);
  };
  // --- Kết thúc logic tính giá ---


  const handleSeatClick = (seatId: string) => {
    if (occupiedSeats.includes(seatId) || loading) return;
    
    setSelectedSeats(prev => {
        if (prev.includes(seatId)) {
            return prev.filter(s => s !== seatId);
        }
        if (prev.length < 8) { // Giới hạn chọn 8 ghế
            return [...prev, seatId];
        }
        return prev;
    });
  };

  const handleContinue = () => {
    // <-- SỬA LỖI 5: Dùng navigate thay vì onNavigate
    navigate('/checkout', { 
        state: { 
            ...bookingData, 
            seats: selectedSeats, 
            totalPrice: getTotalPrice() // Dùng hàm tính tổng tiền mới
        } 
    });
  };
  
  // --- Logic màu ghế ---
  const getSeatClass = (seatId: string, row: string, seatNum: number) => {
    const isOccupied = occupiedSeats.includes(seatId);
    const isSelected = selectedSeats.includes(seatId);
    const type = getSeatType(row, seatNum);

    if (isOccupied) return 'bg-gray-500 cursor-not-allowed text-white';
    if (isSelected) return 'bg-red-600 text-white cursor-pointer hover:bg-red-700 border-red-700';
    
    // Dùng class pink/purple
    if (type === 'vip') return 'bg-purple-100 text-purple-700 cursor-pointer hover:bg-purple-200 border-2 border-purple-300';
    if (type === 'couple') return 'bg-pink-100 text-pink-700 cursor-pointer hover:bg-pink-200 border-2 border-pink-300';
    
    return 'bg-gray-100 text-gray-700 cursor-pointer hover:bg-gray-200 border-2 border-gray-300';
  };
  // --- Kết thúc logic màu ghế ---


  // --- Giao diện khi thiếu dữ liệu ---
  if (!bookingData || !movie || !showtime) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-center">
        <div>
          <h1 className="text-2xl font-bold text-red-600 mb-2">Đã xảy ra lỗi</h1>
          <p className="text-gray-600 mb-4">Không tìm thấy thông tin suất chiếu. Vui lòng thử lại.</p>
          {/* // <-- SỬA LỖI 6: Dùng navigate thay vì onNavigate */}
          <Button onClick={() => navigate('/home')}>Về Trang Chủ</Button>
        </div>
      </div>
    );
  }

  const totalPrice = getTotalPrice();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-white border-b border-gray-200 py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl text-gray-900 mb-2">Chọn Ghế Ngồi</h1>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                <div className="flex items-center gap-2"><Film className="w-4 h-4 text-red-600" /><span>{movie.title}</span></div>
                <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-red-600" /><span>{showtime.cinema_name}</span></div>
                <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-red-600" /><span>{new Date(showtime.start_time).toLocaleDateString('vi-VN')}</span></div>
                <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-red-600" /><span>{new Date(showtime.start_time).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'})}</span></div>
              </div>
            </div>
            {/* // <-- SỬA LỖI 7: Dùng navigate thay vì onNavigate */}
            <Button variant="outline" onClick={() => navigate(`/movie-detail/${movie.movie_id}`)} className="border-gray-300 text-gray-700">
              <X className="w-4 h-4 mr-2" /> Hủy
            </Button>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Seat Map */}
            <div className="lg:col-span-2">
              <Card className="bg-white border-gray-200">
                <CardContent className="p-8">
                  {/* Screen */}
                  <div className="mb-8">
                    <div className="flex justify-center">
                      <div className="bg-white border-2 border-gray-300 text-gray-900 text-center py-3 px-12 rounded-lg shadow-sm">
                        <p className="font-semibold">MÀN HÌNH</p>
                      </div>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="flex flex-wrap justify-center gap-6 mb-8 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gray-100 border-2 border-gray-300 rounded"></div>
                      <span className="text-gray-700">Thường ({TICKET_PRICES.standard/1000}k)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-purple-100 border-2 border-purple-300 rounded"></div>
                      <span className="text-gray-700">VIP ({TICKET_PRICES.vip/1000}k)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-pink-100 border-2 border-pink-300 rounded"></div>
                      <span className="text-gray-700">Đôi ({TICKET_PRICES.couple/1000}k)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gray-500 rounded"></div>
                      <span className="text-gray-700">Đã đặt</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-red-600 rounded"></div>
                      <span className="text-gray-700">Đang chọn</span>
                    </div>
                  </div>

                  {loading ? (
                    <div className="flex justify-center items-center h-64"><Loader2 className="w-12 h-12 animate-spin text-red-600"/></div>
                  ) : (
                    <div className="flex justify-center overflow-x-auto">
                      <div className="inline-block"> 
                        {ROWS.map((row) => (
                          <div key={row} className="flex items-center justify-center gap-2 mb-2">
                            <div className="w-8 text-center text-gray-600">{row}</div>
                            <div className="flex gap-2">
                              {Array.from({ length: SEATS_PER_ROW }, (_, i) => i + 1).map((seatNum) => {
                                const seatId = `${row}${seatNum}`;
                                return (
                                  <button key={seatId} onClick={() => handleSeatClick(seatId)} disabled={occupiedSeats.includes(seatId)}
                                    className={`w-8 h-8 rounded text-xs transition-all ${getSeatClass(seatId, row, seatNum)}`}>
                                    {seatNum}
                                  </button>
                                );
                              })}
                            </div>
                            <div className="w-8 text-center text-gray-600">{row}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <p className="text-center text-sm text-gray-600 mt-8">* Bạn có thể chọn tối đa 8 ghế</p>
                </CardContent>
              </Card>
            </div>

            {/* Booking Summary */}
            <div className="lg:col-span-1">
              <Card className="bg-white border-gray-200 sticky top-24">
                <CardHeader><CardTitle className="text-gray-900">Thông Tin Đặt Vé</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Phim</p>
                    <p className="font-semibold text-gray-900">{movie.title}</p>
                  </div>
                   <div>
                      <p className="text-sm text-gray-600">Định dạng</p>
                      <Badge className="bg-blue-100 text-blue-700">{format}</Badge>
                    </div>

                  <Separator className="my-4"/>

                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-gray-900">Ghế đã chọn</h3>
                      <div className="flex items-center gap-1 text-gray-600"><Users className="w-4 h-4" /><span className="text-sm">{selectedSeats.length}/8</span></div>
                    </div>
                    {selectedSeats.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedSeats.map((seat) => (
                          <Badge key={seat} className="bg-red-100 text-red-700 px-3 py-1 cursor-pointer hover:bg-red-200" onClick={() => handleSeatClick(seat)}>
                            {seat} <X className="w-3 h-3 ml-1" />
                          </Badge>
                        ))}
                      </div>
                    ) : (<p className="text-sm text-gray-500">Chưa chọn ghế nào</p>)}
                  </div>

                  <Separator className="my-4"/>

                  <div className="flex justify-between text-xl text-gray-900">
                    <span className="font-medium">Tổng cộng</span>
                    <span className="font-bold text-red-600">{totalPrice.toLocaleString('vi-VN')}đ</span>
                  </div>

                  <Button onClick={handleContinue} disabled={selectedSeats.length === 0}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-6 text-lg disabled:opacity-50 disabled:cursor-not-allowed">
                    Tiếp Tục Thanh Toán
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