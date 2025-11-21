import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Clock, Star, Ticket, MapPin, ArrowRight } from 'lucide-react'; // Đã thêm ArrowRight
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Skeleton } from '../ui/skeleton';
import { useNavigate } from 'react-router-dom';

interface Movie {
  movie_id: number;
  title: string;
  genre: string;
  rating: number;
  duration_minutes: number;
  poster_url: string;
}

// SỬA LỖI: Xóa prop onNavigate
export function HomePage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // SỬA LỖI: Khởi tạo hook

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5001/api/movies?status=now-showing');
        const data = await response.json();
        setMovies(data.slice(0, 4)); // Chỉ lấy 4 phim cho trang chủ
      } catch (error) {
        console.error("Lỗi khi tải phim đang chiếu:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  const handleMovieClick = (movieId: number) => {
    // SỬA LỖI: Dùng navigate với cú pháp URL param
    navigate(`/movie-detail/${movieId}`);
  };

  // Dữ liệu cho phần Tin Tức & Ưu Đãi (Mới thêm vào)
  const promotions = [
    {
      id: 1,
      titleHeader: "THỨ 4 VUI VẺ",
      titleDetail: "Thứ 4 Vui Vẻ - Vé Chỉ 50K",
      desc: "Áp dụng cho tất cả các rạp CGV trên toàn quốc vào thứ 4 hàng tuần.",
      headerColor: "bg-[#254eda]", // Xanh đậm
      btnLink: "/promotions"
    },
    {
      id: 2,
      titleHeader: "THÀNH VIÊN U22",
      titleDetail: "Thành Viên U22",
      desc: "Giá vé ưu đãi đặc biệt dành cho học sinh, sinh viên dưới 22 tuổi.",
      headerColor: "bg-[#7134bc]", // Tím
      btnLink: "/promotions"
    },
    {
      id: 3,
      titleHeader: "CGV CULTUREPLEX",
      titleDetail: "CGV Cultureplex",
      desc: "Trải nghiệm không gian văn hóa phức hợp đỉnh cao đầu tiên tại Việt Nam.",
      headerColor: "bg-[#b42b1e]", // Đỏ cam
      btnLink: "/events"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* === 1. HERO SECTION (Banner) === */}
      <section className="relative h-[600px] bg-gray-900">
        <div className="absolute inset-0 opacity-60">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1485700330317-57a99a571ecb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaW5lbWElMjB0aGVhdGVyJTIwc2VhdHN8ZW58MXx8fHwxNzYwMjM2OTk3fDA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Rạp chiếu phim"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl text-white">
            <h2 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight uppercase drop-shadow-2xl">
              Trải Nghiệm Điện Ảnh <br/> <span className="text-red-600">Chưa Từng Có</span>
            </h2>
            <p className="text-xl text-gray-200 mb-8 font-light">
              Màn hình cao cấp, âm thanh sống động và những khoảnh khắc khó quên tại CGV.
            </p>
            <div className="flex gap-4">
              <Button
                onClick={() => navigate('/movies')}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-red-600/30 transition-all"
              >
                Đặt Vé Ngay
              </Button>
              <Button
                onClick={() => navigate('/showtimes')}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-red-600/30 transition-all"
              >
                Xem Lịch Chiếu
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Now Showing */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl text-gray-900">Phim Đang Chiếu</h2>
            <Button variant="ghost" onClick={() => navigate('/movies')} className="text-red-600 hover:text-red-700"> {/* SỬA LỖI: Dùng navigate */}
              Xem Tất Cả →
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} className="bg-white border-gray-200 overflow-hidden">
                  <Skeleton className="h-80 w-full" />
                  <CardContent className="p-4 space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ))
            ) : (
              movies.map((movie) => (
                <Card
                  key={movie.movie_id}
                  onClick={() => handleMovieClick(movie.movie_id)}
                  className="bg-white border-gray-200 overflow-hidden hover:border-red-600 transition-all group cursor-pointer shadow-sm hover:shadow-md"
                >
                  <div className="relative h-80 overflow-hidden">
                    <ImageWithFallback
                      src={movie.poster_url}
                      alt={movie.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 px-3 py-1 rounded-full flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-gray-900 text-sm">{movie.rating}</span>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="text-gray-900 mb-2 truncate">{movie.title}</h3>
                    <p className="text-gray-600 text-sm mb-3 truncate">{movie.genre}</p>
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
                      <Clock className="w-4 h-4" />
                      <span>{movie.duration_minutes} phút</span>
                    </div>
                    <Button
                      onClick={(e) => { e.stopPropagation(); handleMovieClick(movie.movie_id); }}
                      className="w-full bg-red-600 hover:bg-red-700 text-white"
                    >
                      Đặt Vé
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-red-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Ticket className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl text-gray-900 mb-2">Đặt Vé Dễ Dàng</h3>
              <p className="text-gray-600">
                Đặt vé trực tuyến chỉ với vài cú nhấp chuột
              </p>
            </div>
            <div className="text-center">
              <div className="bg-red-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl text-gray-900 mb-2">Nhiều Địa Điểm</h3>
              <p className="text-gray-600">
                Tìm rạp CGV gần bạn khắp cả nước
              </p>
            </div>
            <div className="text-center">
              <div className="bg-red-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl text-gray-900 mb-2">Trải Nghiệm Cao Cấp</h3>
              <p className="text-gray-600">
                Ghế sang trọng, 4DX, IMAX và nhiều hơn nữa
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
