import { useState, useEffect } from 'react';
// SỬA LỖI: Hoàn nguyên import về sử dụng alias '@'
import { ImageWithFallback } from '@/components/figma/ImageWithFallback'; 
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
// SỬA: Xóa Tabs, Thêm Filter
import { Clock, Star, Calendar, Loader2, Film, Filter } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';

interface Movie {
  movie_id: number;
  title: string;
  genre: string;
  rating: number;
  duration_minutes: number;
  release_date: string;
  poster_url: string;
}

// Mảng các thể loại phim có thể có
const MOVIE_GENRES = [
  'Tất Cả', 'Hành Động', 'Hài', 'Tình Cảm', 'Kinh Dị', 
  'Hoạt Hình', 'Phiêu Lưu', 'Khoa Học Viễn Tưởng', 'Gia Đình', 'Chính Kịch'
];


export function MoviesPage() {
  // SỬA: Xóa selectedTab, thay bằng selectedGenre
  const [allMovies, setAllMovies] = useState<Movie[]>([]); // Lưu trữ tất cả phim
  const [allGenres, setAllGenres] = useState<string[]>(['Tất Cả']);
  const [selectedGenre, setSelectedGenre] = useState('Tất Cả');

  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        // SỬA: Tải tất cả phim, không lọc theo status nữa
        const response = await fetch(`http://localhost:5001/api/movies`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data: Movie[] = await response.json();
        setAllMovies(data); // Lưu tất cả phim
        
        // SỬA: Tự động tạo danh sách thể loại từ dữ liệu
        // Tách các thể loại (VD: "Action, Drama") thành các thể loại riêng lẻ
        const allGenresFromData = data.flatMap(movie => 
            movie.genre ? movie.genre.split(',').map(g => g.trim()) : []
        );
        // Lọc ra các thể loại duy nhất, sắp xếp và thêm "Tất Cả" vào đầu
        const uniqueGenres = ['Tất Cả', ...Array.from(new Set(allGenresFromData)).sort()];
        setAllGenres(uniqueGenres);

      } catch (error) {
        console.error(`Lỗi khi tải phim:`, error);
        setAllMovies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []); // SỬA: Xóa selectedTab khỏi dependency array

  const handleMovieClick = (movieId: number) => {
    navigate(`/movie-detail/${movieId}`); 
  };

  // SỬA: Lọc phim dựa trên selectedGenre
  const filteredMovies = allMovies.filter(movie => {
    if (selectedGenre === 'Tất Cả') {
      return true; // Hiển thị tất cả nếu chọn 'Tất Cả'
    }
    // Sửa: Kiểm tra xem chuỗi genre của phim (VD: "Action, Drama") có chứa thể loại đã chọn (VD: "Action") không
    return movie.genre && movie.genre.includes(selectedGenre);
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section (Giữ nguyên) */}
      <section className="relative h-[400px] bg-gradient-to-b from-red-50 to-white">
        <div className="absolute inset-0 opacity-20">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1515100235140-6cb3498e8031?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3ZpZSUyMHRoZWF0ZXIlMjBhdWRpdG9yaXVtfGVufDF8fHx8MTc2MDIzODI1OXww&ixlib.rb-4.1.0&q=80&w=1080"
            alt="Rạp chiếu phim"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl">
            <h1 className="text-5xl text-gray-900 mb-4">Tất Cả Phim</h1>
            <p className="text-xl text-gray-700">
              Khám phá bộ sưu tập phim đầy đủ đang chiếu và sắp ra mắt
            </p>
          </div>
        </div>
      </section>

      {/* Movies Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          
          {/* SỬA: Xóa Tabs, thay bằng bộ lọc Genre */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-800">Chọn thể loại yêu thích của bạn</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {allGenres.map((genre) => (
                <Button
                  key={genre}
                  variant={selectedGenre === genre ? "destructive" : "outline"}
                  onClick={() => setSelectedGenre(genre)}
                  className={`transition-all ${selectedGenre !== genre ? 'border-gray-300 text-gray-700 hover:bg-gray-100' : 'bg-red-600'}`}
                >
                  {genre}
                </Button>
              ))}
            </div>
          </div>
          {/* KẾT THÚC SỬA ĐỔI */}

          {/* SỬA: Xóa <TabsContent> */}
          <div>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {Array.from({ length: 8 }).map((_, index) => (
                      <Card key={index} className="bg-white border-gray-200 overflow-hidden">
                          <Skeleton className="aspect-[2/3] w-full" />
                          <CardContent className="p-4 space-y-3">
                              <Skeleton className="h-5 w-3/4" />
                              <Skeleton className="h-4 w-1/2" />
                              <Skeleton className="h-9 w-full" />
                          </CardContent>
                      </Card>
                  ))}
              </div>
            ) : filteredMovies.length > 0 ? ( // SỬA: Dùng filteredMovies
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {/* SỬA: Dùng filteredMovies.map */}
                {filteredMovies.map((movie) => {
                  
                  // SỬA: Logic xác định Sắp Chiếu
                  const isComingSoon = movie.release_date && new Date(movie.release_date) > new Date();

                  return (
                    <Card key={movie.movie_id} onClick={() => handleMovieClick(movie.movie_id)} className="bg-white border-gray-200 overflow-hidden hover:border-red-600 transition-all group cursor-pointer shadow-sm hover:shadow-md flex flex-col">
                      <div className="relative w-full" style={{ paddingBottom: '150%' }}>
                        {movie.poster_url ? (
                          <ImageWithFallback
                            src={movie.poster_url}
                            alt={movie.title}
                            className="absolute top-0 left-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="absolute top-0 left-0 w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                             <Film className="w-12 h-12"/>
                          </div>
                        )}
                        
                        {/* SỬA: Chỉ hiển thị rating nếu KHÔNG Sắp Chiếu */}
                        {!isComingSoon && movie.rating > 0 && (
                          <div className="absolute top-3 right-3 bg-white/90 px-3 py-1 rounded-full flex items-center gap-1.5 backdrop-blur-sm">
                            <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                            <span className="text-gray-900 text-xs font-medium">{movie.rating}</span>
                          </div>
                        )}
                        
                        {/* SỬA: Hiển thị badge Sắp Chiếu */}
                        {isComingSoon && (
                          <div className="absolute top-3 left-3">
                            <Badge className="bg-red-600 text-white text-xs px-2.5 py-1">Sắp Chiếu</Badge>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4 flex flex-col flex-grow">
                        <h3 className="text-gray-900 text-base font-semibold mb-1 h-12 group-hover:text-red-600 transition-colors">{movie.title}</h3>
                        <p className="text-gray-500 text-xs mb-2 h-8">{movie.genre}</p>
                        <div className="flex items-center justify-between text-gray-500 text-xs mb-3">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{movie.duration_minutes} phút</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{movie.release_date ? new Date(movie.release_date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }) : 'N/A'}</span>
                          </div>
                        </div>
                        <Button 
                          onClick={(e) => { e.stopPropagation(); handleMovieClick(movie.movie_id); }} 
                          className="w-full bg-red-600 hover:bg-red-700 text-white mt-auto text-sm h-9"
                        >
                          {/* SỬA: Thay đổi text nút */}
                          {isComingSoon ? 'Thông Tin Thêm' : 'Đặt Vé'}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20 text-gray-500 col-span-full">
                  <Film className="w-16 h-16 mx-auto text-gray-300 mb-4"/>
                  <h3 className="text-xl text-gray-800">Không có phim nào</h3>
                  {/* SỬA: Cập nhật thông báo */}
                  <p>Không tìm thấy phim nào thuộc thể loại <span className="font-semibold text-gray-700">"{selectedGenre}"</span>.</p>
              </div>
            )}
          </div>
          {/* SỬA: Xóa </TabsContent> và </Tabs> */}
        </div>
      </section>
    </div>
  );
}