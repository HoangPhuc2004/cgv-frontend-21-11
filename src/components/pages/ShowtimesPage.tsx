import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, MapPin, Clock, Film, Filter, Calendar as CalendarIcon, Star, Loader2, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// --- ImageWithFallback Component (inlined from previous version) ---
const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaWo9InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg==';

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

// --- Type Definitions ---
interface MovieWithShowtimes {
  movie_id: number;
  title: string;
  genre: string;
  duration_minutes: number;
  rating: number;
  age_rating: string;
  poster_url: string;
  features: string[];
  times: { showtime_id: number; start_time: string; ticket_price: string; }[];
}
interface Cinema { cinema_id: number; name: string; city: string; }
interface CityWithCount { city: string; count: string; }

const API_URL = 'http://localhost:5001/api';

// --- Helper function to generate dates ---
const generateDates = (startOffset: number) => {
    const dates = [];
    const daysOfWeek = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + startOffset + i);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      dates.push({
        fullDate: date,
        displayDate: `${day}/${month}`,
        dayOfWeek: daysOfWeek[date.getDay()],
      });
    }
    return dates;
};

// --- Component ---
export function ShowtimesPage() {
  const navigate = useNavigate(); // <-- THÊM DÒNG NÀY
  const [dateOffset, setDateOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [cities, setCities] = useState<CityWithCount[]>([]);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [cinemasInCity, setCinemasInCity] = useState<Cinema[]>([]);
  const [selectedCinemaId, setSelectedCinemaId] = useState<number | null>(null);
  const [movies, setMovies] = useState<MovieWithShowtimes[]>([]);
  const [loading, setLoading] = useState({ cities: true, cinemas: true, showtimes: true });
  const [citySearchTerm, setCitySearchTerm] = useState('');

  const allDates = generateDates(0);
  const visibleDates = allDates.slice(dateOffset, dateOffset + 7);

  const handlePrevDates = () => { setDateOffset(prev => Math.max(0, prev - 7)); };
  const handleNextDates = () => { setDateOffset(prev => prev + 7); };

  // 1. Fetch cities on component load
  useEffect(() => {
    const fetchCities = async () => {
      setLoading(prev => ({ ...prev, cities: true }));
      try {
        const res = await fetch(`${API_URL}/cinemas/cities`);
        if (!res.ok) throw new Error('Could not fetch cities.');
        const data: CityWithCount[] = await res.json();
        const sortedCities = data.sort((a, b) => {
            const topCities = ['TP. Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng'];
            const aIndex = topCities.indexOf(a.city);
            const bIndex = topCities.indexOf(b.city);
            if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
            if (aIndex !== -1) return -1;
            if (bIndex !== -1) return 1;
            return a.city.localeCompare(b.city);
        });
        setCities(sortedCities);
      } catch (e) { 
          console.error("Error fetching cities:", e); 
      } finally {
        setLoading(prev => ({...prev, cities: false, cinemas: false, showtimes: false}));
      }
    };
    fetchCities();
  }, []);

  // 2. Fetch cinemas when city changes
  useEffect(() => {
    if (!selectedCity) {
        setCinemasInCity([]);
        setSelectedCinemaId(null);
        return;
    };
    const fetchCinemas = async () => {
      setLoading(prev => ({...prev, cinemas: true, showtimes: true}));
      setCinemasInCity([]);
      setSelectedCinemaId(null);
      setMovies([]);
      try {
        const res = await fetch(`${API_URL}/cinemas?city=${encodeURIComponent(selectedCity)}`);
        const data: Cinema[] = await res.json();
        setCinemasInCity(data);
      } catch (e) { 
          console.error("Error fetching cinemas:", e); 
          setCinemasInCity([]);
      } finally { 
          setLoading(prev => ({...prev, cinemas: false}))
      }
    };
    fetchCinemas();
  }, [selectedCity]);

  // 3. Fetch showtimes when date or cinema changes
  useEffect(() => {
    if (!selectedDate || !selectedCinemaId) {
        setMovies([]);
        if(selectedCinemaId !== null || selectedCity !== null) {
            setLoading(prev => ({...prev, showtimes: false}));
        }
        return;
    };
    const fetchShowtimes = async () => {
      setLoading(prev => ({...prev, showtimes: true}));
      const dateString = selectedDate.toISOString().split('T')[0];
      try {
        const res = await fetch(`${API_URL}/showtimes-by-cinema?cinemaId=${selectedCinemaId}&date=${dateString}`);
        if (!res.ok) throw new Error(`Error ${res.status} fetching showtimes.`);
        const data = await res.json();
        setMovies(data);
      } catch (e) { 
        console.error("Error fetching showtimes:", e); 
        setMovies([]); 
      }
      finally { setLoading(prev => ({...prev, showtimes: false }))}
    };
    fetchShowtimes();
  }, [selectedDate, selectedCinemaId]);

  const filteredCities = cities.filter(c =>
    c.city.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(citySearchTerm.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""))
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-red-50 to-white py-12 border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-2">
            <CalendarIcon className="w-8 h-8 text-red-600" />
            <h1 className="text-4xl text-gray-900">Lịch Chiếu</h1>
          </div>
          <p className="text-xl text-gray-600">Chọn ngày, thành phố và rạp để xem lịch chiếu phim</p>
        </div>
      </section>

      {/* Filters Section */}
      <section className="bg-white py-6 border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 space-y-6">
          {/* Date Carousel */}
          <div>
            <div className="flex items-center gap-2 mb-3">
               <CalendarIcon className="w-5 h-5 text-red-600" />
               <h3 className="text-gray-900 font-semibold">Chọn Ngày</h3>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={handlePrevDates} disabled={dateOffset === 0} className="flex-shrink-0 border-gray-300 hover:border-red-600 hover:bg-red-50 disabled:opacity-50"><ChevronLeft className="w-5 h-5" /></Button>
              <div className="flex flex-1 gap-2">
                  {visibleDates.map((dateInfo) => (
                      <button key={dateInfo.fullDate.toString()} onClick={() => setSelectedDate(dateInfo.fullDate)}
                          className={`flex-1 p-3 rounded-lg border-2 transition-all text-center flex flex-col items-center justify-center ${ selectedDate?.toDateString() === dateInfo.fullDate.toDateString() ? 'border-red-600 bg-red-600 text-white shadow-md' : 'border-gray-200 bg-white hover:border-red-300 hover:bg-red-50' }`}>
                          <p className={`text-xs mb-1 ${selectedDate?.toDateString() === dateInfo.fullDate.toDateString() ? 'text-white/80' : 'text-gray-500'}`}>{dateInfo.dayOfWeek}</p>
                          <p className={`font-semibold ${selectedDate?.toDateString() === dateInfo.fullDate.toDateString() ? 'text-white' : 'text-gray-900'}`}>{dateInfo.displayDate}</p>
                      </button>
                  ))}
              </div>
              <Button variant="outline" size="icon" onClick={handleNextDates} className="flex-shrink-0 border-gray-300 hover:border-red-600 hover:bg-red-50"><ChevronRight className="w-5 h-5" /></Button>
            </div>
          </div>

          {/* City Filter */}
          <div>
            <div className="flex flex-wrap items-center gap-4 mb-3">
               <div className="flex items-center gap-2 flex-shrink-0">
                 <Filter className="w-5 h-5 text-red-600" />
                 <h3 className="text-gray-900 font-semibold">Chọn Thành Phố</h3>
               </div>
               <div className="flex-1">
                  <div className="flex items-center w-full border border-gray-300 rounded-lg bg-white focus-within:ring-1 focus-within:ring-red-500 focus-within:border-red-500 transition-all pl-4">
                      <Search className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                      <input
                        type="text"
                        placeholder="Tìm thành phố..."
                        value={citySearchTerm}
                        onChange={(e) => setCitySearchTerm(e.target.value)}
                        className="pr-3 py-1.5 w-full bg-transparent border-none focus:ring-0 text-gray-900 placeholder-gray-500"
                      />
                  </div>
               </div>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              {loading.cities ? <Loader2 className="w-5 h-5 animate-spin"/> :
                filteredCities.map(c => (
                    <button
                        key={c.city}
                        onClick={() => setSelectedCity(c.city)}
                        className={`px-4 py-2 rounded-lg border-2 transition-all font-medium flex items-center gap-2 ${
                            selectedCity === c.city
                            ? 'bg-red-600 border-red-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900 hover:bg-red-50 hover:border-red-300'
                        }`}
                    >
                        {c.city}
                        <span
                        className={`flex items-center justify-center text-xs w-5 h-5 rounded-full ${
                            selectedCity === c.city
                            ? 'bg-white text-red-600'
                            : 'bg-gray-200 text-gray-800'
                        }`}
                        >
                        {c.count}
                        </span>
                    </button>
                ))
              }
            </div>
          </div>

          {/* Cinema Selection */}
          {selectedCity && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-5 h-5 text-red-600" />
                <h3 className="text-gray-900 font-semibold">Chọn Rạp</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {loading.cinemas ? <Loader2 className="w-5 h-5 animate-spin"/> : 
                    cinemasInCity.length > 0 ? cinemasInCity.map((cinema) => (
                        <button
                            key={cinema.cinema_id}
                            onClick={() => setSelectedCinemaId(cinema.cinema_id)}
                            className={`px-4 py-2 rounded-lg border-2 transition-all font-medium ${
                                selectedCinemaId === cinema.cinema_id
                                ? 'bg-red-600 border-red-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900 hover:bg-red-50 hover:border-red-300'
                            }`}
                        >
                            {cinema.name}
                        </button>
                    )) : <p className="text-sm text-gray-500">Không có rạp tại thành phố này.</p>
                }
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Movies List */}
      <section className="bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          { loading.showtimes ? (
              <div className="flex justify-center py-20"><Loader2 className="w-16 h-16 animate-spin text-red-600"/></div>
          ) : !selectedCity || !selectedCinemaId ? (
              <div className="text-center py-20 bg-white rounded-lg border-2 border-dashed border-gray-300">
                  <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl text-gray-800 mb-2">Vui lòng chọn thành phố và rạp</h3>
                  <p className="text-gray-500">Chọn bộ lọc ở trên để xem lịch chiếu phim.</p>
              </div>
          ) : movies.length > 0 ? (
              <div className="space-y-6">
                  <div className="p-4 bg-white rounded-lg border-l-4 border-red-600 shadow-sm">
                      <p className="text-gray-600 text-lg">Lịch chiếu tại <span className="font-semibold text-red-600">{cinemasInCity.find(c => c.cinema_id === selectedCinemaId)?.name}</span> vào ngày <span className="font-semibold text-red-600">{selectedDate?.toLocaleDateString('vi-VN')}</span></p>
                  </div>
                  {movies.map(movie => (
                      <Card key={movie.movie_id} className="bg-white border-gray-200 overflow-hidden flex flex-col md:flex-row hover:shadow-lg transition-shadow duration-300">
                          <div className="md:w-48 flex-shrink-0"><ImageWithFallback src={movie.poster_url} alt={movie.title} className="w-full h-full object-cover"/></div>
                          <div className="flex-1 p-4 md:p-6">
                              <div className="flex items-center gap-2 mb-2"><h3 className="font-bold text-xl text-gray-900 cursor-pointer hover:text-red-600" onClick={() => onNavigate('movie-detail', { movieId: movie.movie_id })}>{movie.title}</h3><Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 flex-shrink-0">{movie.age_rating}</Badge></div>
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600 mb-4">
                                  <span className="flex items-center gap-1.5"><Film className="w-4 h-4" />{movie.genre}</span>
                                  <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{movie.duration_minutes} phút</span>
                                  <span className="flex items-center gap-1.5"><Star className="w-4 h-4 text-yellow-500"/>{movie.rating}/10</span>
                              </div>
                              <div className="mb-4">
                                  <p className="text-sm font-semibold text-gray-800 mb-2">Định dạng:</p>
                                  <div className="flex flex-wrap gap-2">{movie.features?.map(f => <Badge key={f} variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">{f}</Badge>)}</div>
                              </div>
                              <div>
                                  <p className="text-sm font-semibold text-gray-800 mb-2">Suất chiếu:</p>
                                  <div className="flex flex-wrap gap-2">
                                      {movie.times.map(time => (
                                          <Button key={time.showtime_id} variant="outline" className="..." 
                                            onClick={() => navigate(`/movie-detail/${movie.movie_id}/seat-selection`, { // <-- SỬA Ở ĐÂY
                                                state: { 
                                                    movie: { movie_id: movie.movie_id, title: movie.title }, 
                                                    showtime: { ...time, cinema_name: cinemasInCity.find(c=>c.cinema_id === selectedCinemaId)?.name }, 
                                                    format: movie.features?.[0] || '2D' 
                                                } 
                                            })}>
                                              {new Date(time.start_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                          </Button>
                                      ))}
                                  </div>
                              </div>
                          </div>
                      </Card>
                  ))}
              </div>
          ) : (
              <div className="text-center py-20 bg-white rounded-lg border-2 border-dashed border-gray-300">
                  <CalendarIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-xl text-gray-800">Không có suất chiếu phù hợp</h3>
                  <p className="text-gray-500">Vui lòng thử chọn ngày khác hoặc rạp chiếu khác.</p>
              </div>
          )}
        </div>
      </section>
    </div>
  );
}