import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, Clock, Film, Star, Loader2, ChevronLeft, MapPin, Search, PlayCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar'; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input'; 
import { useNavigate } from 'react-router-dom'; 
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

// === SVG dự phòng ===
const ERROR_IMG_SRC = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHZpZXdCb3g9IjAgMCA4OCA4OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9Ijg4IiBoZWlnaHQ9Ijg4IiBmaWxsPSIjRTNFN0VCIi8+CjxsaW5lIHgxPSIyMCIgeTE9IjIwIiB4Mj0iNjgiIHkyPSI2OCIgc3Ryb2tlPSIjOUNBM0FGIiBzdHJva2Utd2lkdGg9IjQiLz4KPGxpbmUgeDE9IjY4IiB5MT0iMjAiIHgyPSIyMCIgeTI9IjY4IiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS1pZHRoPSI0Ii8+Cjwvc3ZnPgo=';

// Helper component for images with a fallback
function ImageWithFallback(props: React.ImgHTMLAttributes<HTMLImageElement>) { 
  const [didError, setDidError] = useState(false);
  const handleError = () => { setDidError(true); };
  const { src, alt, style, className, ...rest } = props;
  return didError ? (
    <div className={`inline-block bg-gray-100 text-center align-middle ${className ?? ''}`} style={style}>
      <div className="flex items-center justify-center w-full h-full">
        <img src={ERROR_IMG_SRC} alt="Error loading image" {...rest} data-original-url={src} />
      </div>
    </div>
  ) : (
    <img src={src} alt={alt} className={className} style={style} {...rest} onError={handleError} />
  );
}

// === HÀM ĐÃ SỬA LỖI ===
// Hàm này sẽ xử lý được cả 'httpsS://' và link đã là /embed/
const getYouTubeEmbedUrl = (url: string | undefined): string | null => {
  if (!url) return null;
  
  // BƯỚC 1: Dọn dẹp URL (xóa " và sửa 'httpsS')
  let cleanedUrl = url.trim().replace(/^"|"$/g, ''); 
  if (cleanedUrl.length === 0) return null;

  // SỬA LỖI QUAN TRỌNG: Tự động sửa lỗi typo 'httpsS'
  if (cleanedUrl.startsWith('httpsS://')) {
    cleanedUrl = cleanedUrl.replace('httpsS://', 'https://');
  }

  // BƯỚC 2: Thử tạo đối tượng URL
  let urlObj;
  try {
    urlObj = new URL(cleanedUrl);
  } catch (error) {
    console.error("Invalid trailer URL (không thể parse):", cleanedUrl, error); 
    return null;
  }

  // BƯỚC 3: Trích xuất videoId từ các trường hợp
  let videoId = null;

  if (urlObj.hostname === 'youtu.be') {
    // Case 1: https://youtu.be/VIDEO_ID
    videoId = urlObj.pathname.slice(1);
  } else if (urlObj.hostname.includes('youtube.com')) {
    if (urlObj.pathname === '/watch') {
      // Case 2: https://www.youtube.com/watch?v=VIDEO_ID
      videoId = urlObj.searchParams.get('v');
    } else if (urlObj.pathname.startsWith('/embed/')) {
      // Case 3: https://www.youtube.com/embed/VIDEO_ID (Trường hợp của bạn)
      // Tách lấy phần VIDEO_ID (phần tử thứ 2 sau khi split)
      videoId = urlObj.pathname.split('/')[2];
    }
  }
  
  // BƯỚC 4: Trả về link embed chuẩn (nếu tìm thấy videoId)
  if (videoId) {
    // Loại bỏ query params cũ (nếu có) từ videoId
    const finalVideoId = videoId.split('?')[0];
    
    // Luôn trả về link embed đồng nhất có autoplay
    return `https://www.youtube.com/embed/${finalVideoId}?autoplay=1`;
  }
  
  // Nếu không tìm thấy videoId ở tất cả các trường hợp, trả về null
  console.warn("Không thể trích xuất videoId từ:", cleanedUrl);
  return null; 
};

// === PHẦN CÒN LẠI GIỮ NGUYÊN ===

const API_URL = 'http://localhost:5001/api';

export function MovieDetailPage({ movieId }: { movieId: number }) { 
    const navigate = useNavigate(); 
    const [movie, setMovie] = useState<any>(null); 
    const [showtimes, setShowtimes] = useState<any[]>([]); 
    const [loading, setLoading] = useState({ movie: true, showtimes: true });
    
    const [selectedDate, setSelectedDate] = useState(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today;
    });
    const [selectedCity, setSelectedCity] = useState('');
    const [selectedCinemaTime, setSelectedCinemaTime] = useState<any>(null); 

    const [citySearchTerm, setCitySearchTerm] = useState('');
    const [isCitySearchFocused, setIsCitySearchFocused] = useState(false);
    
    const [isTrailerOpen, setIsTrailerOpen] = useState(false);

    // Fetch movie details
    useEffect(() => {
        const fetchMovieDetail = async () => {
            setLoading(prev => ({ ...prev, movie: true }));
            try {
                const res = await fetch(`${API_URL}/movies/${movieId}`);
                if (!res.ok) throw new Error('Could not fetch movie details.');
                const data = await res.json();
                setMovie(data);
            } catch (error) {
                console.error("Error fetching movie details:", error);
            } finally {
                setLoading(prev => ({ ...prev, movie: false }));
            }
        };
        fetchMovieDetail();
    }, [movieId]);

    // Fetch showtimes
    useEffect(() => {
        const fetchShowtimes = async () => {
            setLoading(prev => ({ ...prev, showtimes: true }));
            try {
                const res = await fetch(`${API_URL}/movies/${movieId}/showtimes`);
                if (!res.ok) throw new Error('Could not fetch showtimes.');
                const data = await res.json();
                setShowtimes(data);
            } catch (error) {
                console.error("Error fetching showtimes:", error);
            } finally {
                setLoading(prev => ({ ...prev, showtimes: false }));
            }
        };
        fetchShowtimes();
    }, [movieId]);

    // Filter and group showtimes
    const filteredAndGroupedShowtimes = () => {
        if (!showtimes) return [];
        const validSelectedDate = selectedDate instanceof Date && !isNaN(selectedDate.getTime()) ? selectedDate : new Date();
        const selectedDateOnly = new Date(validSelectedDate);
        selectedDateOnly.setHours(0,0,0,0);

        const filtered = showtimes.filter(st => {
            const showtimeDate = new Date(st.start_time);
            showtimeDate.setHours(0,0,0,0);
            const cityMatch = selectedCity && st.city === selectedCity; 
            return showtimeDate.getTime() === selectedDateOnly.getTime() && cityMatch;
        });

        const grouped = filtered.reduce((acc: any, st: any) => { 
            if (!acc[st.cinema_name]) {
                acc[st.cinema_name] = { cinema_name: st.cinema_name, city: st.city, times: [] };
            }
            acc[st.cinema_name].times.push({
                showtime_id: st.showtime_id,
                start_time: st.start_time,
                ticket_price: st.ticket_price
            });
            return acc;
        }, {});

        Object.values(grouped).forEach((group: any) => { 
            group.times.sort((a: any, b: any) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
        });

        return Object.values(grouped);
    };

    const groupedShowtimes = filteredAndGroupedShowtimes();
    
    // Get unique available cities
    const availableCities = Array.from(new Set(showtimes.map(st => st.city))).sort();

    const filteredAvailableCities = availableCities.filter(city => 
        city.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .includes(
            citySearchTerm.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        )
    );

    // Handle navigation
    const handleBooking = () => {
        if (!selectedCinemaTime || !movie) return;
        const selectedShowtimeInfo = showtimes.find(st => st.showtime_id === selectedCinemaTime.showtimeId);

        if (selectedShowtimeInfo) {
            navigate(`/movie-detail/${movie.movie_id}/seat-selection`, {
                state: {
                    movie: { movie_id: movie.movie_id, title: movie.title },
                    showtime: {
                        showtime_id: selectedShowtimeInfo.showtime_id,
                        cinema_name: selectedShowtimeInfo.cinema_name,
                        start_time: selectedShowtimeInfo.start_time,
                        ticket_price: selectedShowtimeInfo.ticket_price,
                    },
                    format: movie.features?.[0] || '2D'
                }
            });
        }
    };

    const handleDateSelect = (date: Date | undefined) => { 
        if (date) {
            setSelectedDate(date);
            setSelectedCinemaTime(null); 
        }
    };

    const handleCitySelect = (cityValue: string) => { 
        if (cityValue) {
            setSelectedCity(cityValue);
            setSelectedCinemaTime(null); 
            setCitySearchTerm(cityValue); 
            setIsCitySearchFocused(false); 
        }
    };

    const handleCitySearchChange = (e: React.ChangeEvent<HTMLInputElement>) => { 
        const newSearchTerm = e.target.value;
        setCitySearchTerm(newSearchTerm);
        setIsCitySearchFocused(true); 
        
        if (selectedCity && newSearchTerm !== selectedCity) {
            setSelectedCity('');
            setSelectedCinemaTime(null);
        }
    };

    const handleCitySearchFocus = () => {
        setIsCitySearchFocused(true);
    };

    const handleCitySearchBlur = () => {
        setTimeout(() => {
            setIsCitySearchFocused(false);
            if (selectedCity && citySearchTerm !== selectedCity) {
                setCitySearchTerm(selectedCity);
            }
        }, 150); 
    };


    if (loading.movie) {
        return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-16 h-16 animate-spin text-red-600"/></div>;
    }

    if (!movie) {
        return <div className="min-h-screen flex items-center justify-center"><p>Không tìm thấy thông tin phim.</p></div>;
    }

    const todayAtMidnight = new Date();
    todayAtMidnight.setHours(0, 0, 0, 0);

    const embedUrl = getYouTubeEmbedUrl(movie.trailer_url);
    
    // LOG ĐỂ KIỂM TRA LẠI
    console.log("DỮ LIỆU GỐC (movie.trailer_url):", movie.trailer_url);
    console.log("DỮ LIỆU ĐÃ XỬ LÝ (embedUrl):", embedUrl);

    return (
        <div className="min-h-screen bg-white">
            
            {/* === Banner Section === */}
            <section className="relative bg-black py-16 overflow-hidden">
                <ImageWithFallback 
                    src={movie.banner_url} 
                    alt={`${movie.title} banner`} 
                    className="absolute inset-0 w-full h-full object-cover opacity-30" 
                />
                <div className="absolute inset-0 bg-black/50"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent"></div>

                <Button variant="outline" onClick={() => navigate('/movies')} className="absolute top-6 left-6 bg-white/20 text-white border-white/30 hover:bg-white/30 backdrop-blur-sm z-20">
                    <ChevronLeft className="w-4 h-4 mr-2" /> Quay lại
                </Button>

                <div className="relative z-10 container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                        {/* Poster */}
                        <div className="md:col-span-1">
                            <ImageWithFallback 
                                src={movie.poster_url} 
                                alt={`${movie.title} poster`} 
                                className="w-full max-w-[300px] mx-auto md:mx-0 h-auto object-cover rounded-lg shadow-2xl"
                            />
                        </div>
                        
                        {/* Details */}
                        <div className="md:col-span-2 text-white">
                            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 whitespace-nowrap">{movie.title}</h1>
                            <p className="text-white/80 text-xl font-medium mb-6">
                                {movie.original_title || (movieId == 1 ? "Dune: Part Two" : (movieId == 4 ? "Godzilla x Kong: The New Empire" : " "))}
                            </p>
                            <div className="flex flex-wrap items-center gap-3 mb-8">
                                <Badge className="bg-black/60 text-white text-base font-medium py-2 px-4 rounded-lg border-none">
                                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 mr-1.5" />
                                    {movie.rating}/10
                                </Badge>
                                <Badge className="bg-black/60 text-white text-base font-medium py-2 px-4 rounded-lg border-none">
                                    <Clock className="w-5 h-5 text-gray-200 mr-1.5" />
                                    {movie.duration_minutes} phút
                                </Badge>
                                <Badge className="bg-red-600 text-white text-base font-medium py-2 px-4 rounded-lg border-none">
                                    {movie.genre}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* === Main Content Section === */}
            <section className="py-12 bg-gray-50 border-t">
                {/* Giữ layout 2/3 (lg:grid-cols-3) */}
                <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left Column (Info, Synopsis, Trailer) */}
                    <div className="lg:col-span-2 space-y-8">
                        <Card className="bg-white border w-full">
                            <CardContent className="p-6">
                                <h3 className="text-xl font-semibold mb-4 text-gray-900">Thông Tin Phim</h3>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                                    <div><strong className="text-gray-600 block">Đạo diễn:</strong> <span className="text-gray-800">{movie.director || 'N/A'}</span></div>
                                    <div><strong className="text-gray-600 block">Diễn viên:</strong> <span className="text-gray-800">{movie.cast_members?.join(', ') || 'NA'}</span></div>
                                    <div><strong className="text-gray-600 block">Ngôn ngữ:</strong> <span className="text-gray-800">Tiếng Anh (Phụ đề Tiếng Việt)</span></div>
                                    <div><strong className="text-gray-600 block">Khởi chiếu:</strong> <span className="text-gray-800">{new Date(movie.release_date).toLocaleDateString('vi-VN')}</span></div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-white border w-full">
                            <CardContent className="p-6">
                                <h3 className="text-xl font-semibold mb-4 text-gray-900">Nội Dung Phim</h3>
                                <p className="text-gray-700 leading-relaxed">{movie.description}</p>
                            </CardContent>
                        </Card>
                        
                        {/* PHẦN NÀY GIỮ NGUYÊN LOGIC CỦA BẠN */}
                        {embedUrl && (
                          <Card className="bg-white border w-full">
                            <CardContent className="p-6">
                                <h3 className="text-xl font-semibold mb-4 text-gray-900">Trailer Chính Thức</h3>
                                
                                <Dialog open={isTrailerOpen} onOpenChange={setIsTrailerOpen}>
                                  
                                  {/* 1. Nút bấm để mở Dialog */}
                                  <DialogTrigger asChild>
                                    <Button 
                                        className="w-full bg-red-600 hover:bg-red-700 text-white py-4 text-base font-semibold rounded-lg"
                                    >
                                        <PlayCircle className="w-5 h-5 mr-2" />
                                        Xem Trailer
                                    </Button>
                                    </DialogTrigger>

                                    {/* === SỬA LỖI KÍCH THƯỚC === */}
                                    <DialogContent
                                    className="
                                    bg-black 
                                    border-none 
                                    p-0 
                                    overflow-hidden 
                                    rounded-lg 
                                    text-white 
                                    
                                    /* 1. HỦY BỎ max-w mặc định của shadcn */
                                    sm:max-w-none 
                                    
                                    /* 2. ĐẶT KÍCH THƯỚC MỚI THEO % MÀN HÌNH */
                                    w-[95vw]
                                    sm:w-[90vw]
                                    lg:w-[80vw]
                                    "
                                    >
                                    <div className="aspect-video w-full"> 
                                        <iframe
                                            className="w-full h-full" 
                                            src={embedUrl}
                                            title="Official Movie Trailer"
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                                            allowFullScreen
                                        ></iframe>
                                    </div>
                                    </DialogContent>
                                </Dialog>
                            </CardContent>
                          </Card>
                        )}
                    </div>

                    {/* Right Column (Booking Widget) */}
                    <div id="booking-section" className="lg:col-span-1">
                        <Card className="bg-white border sticky top-24 shadow-md w-full">
                            <CardContent className="p-6 space-y-6">
                                <h3 className="text-xl font-semibold text-center text-gray-900">Đặt Vé Ngay</h3>
                                {/* Calendar */}
                                <div className="flex items-center gap-2">
                                    <CalendarIcon className="w-5 h-5 text-red-600" />
                                    <h4 className="font-semibold text-gray-800">Chọn Ngày</h4>
                                </div>
                                <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={handleDateSelect}
                                    fromDate={todayAtMidnight}
                                    captionLayout="buttons" 
                                    className="rounded-lg border border-gray-200 p-3 w-full"
                                    classNames={{
                                        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                                        month: "space-y-4 w-full",
                                        caption: "flex justify-center pt-1 relative items-center",
                                        caption_label: "text-sm font-medium",
                                        nav: "space-x-1 flex items-center",
                                        nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                                        nav_button_previous: "absolute left-1",
                                        nav_button_next: "absolute right-1",
                                        table: "w-full border-collapse",
                                        head_row: "flex justify-between",
                                        head_cell: "text-muted-foreground rounded-md flex-1 text-center font-normal text-[0.8rem]",
                                        row: "flex justify-between w-full mt-2",
                                        cell: "flex-1 text-center text-sm p-0 relative",
                                        day: "h-9 w-9 mx-auto p-0 font-normal aria-selected:opacity-100",
                                        day_selected: "bg-red-600 text-white hover:bg-red-700 hover:text-white focus:bg-red-700 focus:text-white rounded-md",
                                        day_today: "bg-red-50 text-red-600 font-semibold rounded-md",
                                        day_outside: "text-muted-foreground opacity-50",
                                        day_disabled: "text-muted-foreground opacity-50",
                                        day_hidden: "invisible",
                                    }}
                                />
                                {selectedDate && (
                                  <p className="text-sm text-gray-600 -mt-2"> 
                                    Đã chọn: <span className="font-medium text-red-600">{selectedDate.toLocaleDateString('vi-VN')}</span>
                                  </p>
                                )}
                                {/* City Selection */}
                                <div className="flex items-center gap-2 pt-2">
                                    <MapPin className="w-5 h-5 text-red-600" />
                                    <h4 className="font-semibold text-gray-800">Chọn Thành Phố</h4>
                                </div>
                                <div>
                                    <div className="relative flex items-center w-full text-base h-14 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-red-600 transition-all">
                                        <Search className="ml-4 w-5 h-5 text-gray-400 flex-shrink-0" />
                                        <Input
                                            type="text"
                                            placeholder="Tìm thành phố của bạn..."
                                            value={citySearchTerm}
                                            onChange={handleCitySearchChange}
                                            onFocus={handleCitySearchFocus}
                                            onBlur={handleCitySearchBlur}
                                            className="w-full text-base h-full pl-3 pr-4 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0"
                                            disabled={loading.showtimes}
                                        />
                                    </div>
                                    {isCitySearchFocused && (
                                        <div className="mt-4">
                                            {loading.showtimes ? (
                                                <div className="p-2 text-center text-gray-500 text-sm">Đang tải...</div>
                                            ) : filteredAvailableCities.length > 0 ? (
                                                <div className="flex flex-wrap gap-2">
                                                    {filteredAvailableCities.map(city => (
                                                        <Button
                                                            key={city}
                                                            variant="outline"
                                                            size="sm"
                                                            className="text-gray-700 border-gray-300 hover:bg-gray-100 hover:text-gray-900"
                                                            onMouseDown={(e) => { 
                                                                e.preventDefault();
                                                                handleCitySelect(city);
                                                            }}
                                                        >
                                                            {city}
                                                        </Button>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="py-2 text-center text-gray-500 text-sm">Không tìm thấy thành phố.</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <Separator />
                                {/* Showtimes List */}
                                <ScrollArea className="h-64 pr-3"> 
                                    {loading.showtimes ? (
                                        <div className="flex justify-center pt-10"><Loader2 className="w-8 h-8 animate-spin text-red-600"/></div>
                                    ) : !selectedCity ? (
                                        <p className="text-center text-gray-500 pt-10">Vui lòng chọn thành phố để xem suất chiếu.</p>
                                    ) : groupedShowtimes.length > 0 ? (
                                        <div className="space-y-4">
                                            {groupedShowtimes.map((group: any) => ( 
                                                <div key={group.cinema_name}>
                                                    <h4 className="font-semibold text-gray-800 mb-2">{group.cinema_name}</h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {group.times.map((time: any) => ( 
                                                            <Button
                                                                key={time.showtime_id}
                                                                variant={selectedCinemaTime?.showtimeId === time.showtime_id ? "destructive" : "outline"}
                                                                onClick={() => setSelectedCinemaTime({ cinema: group.cinema_name, showtimeId: time.showtime_id, startTime: time.start_time })}
                                                                className={`font-medium ${selectedCinemaTime?.showtimeId !== time.showtime_id ? 'border-gray-300 hover:border-red-600 hover:bg-red-50' : ''}`}
                                                            >
                                                                {new Date(time.start_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                            </Button>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-center text-gray-500 pt-10">Không có suất chiếu nào cho ngày này.</p>
                                    )}
                                </ScrollArea>
                                <Separator />
                                {/* Booking Button */}
                                <Button
                                    onClick={handleBooking}
                                    disabled={!selectedCinemaTime}
                                    className="w-full bg-red-600 hover:bg-red-700 text-white py-6 text-lg disabled:opacity-50"
                                >
                                    Tiếp Tục Chọn Ghế
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>
        </div>
    );
}