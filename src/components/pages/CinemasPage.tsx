import { useState, useEffect } from 'react';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, Clock, Navigation, Filter, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface Cinema {
  cinema_id: number;
  name: string;
  address: string;
  city: string;
  phone: string;
  screens: number;
  features: string[];
  hours: string;
  image_url: string;
}

interface CityWithCount {
    name: string;
    count: number;
}

export function CinemasPage() {
  const [allCinemas, setAllCinemas] = useState<Cinema[]>([]);
  const [cities, setCities] = useState<CityWithCount[]>([]);
  const [selectedCity, setSelectedCity] = useState('Tất Cả Thành Phố');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllCinemas = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:5001/api/cinemas');
        if (!response.ok) throw new Error('Failed to fetch cinemas');
        const data: Cinema[] = await response.json();
        setAllCinemas(data);

        // Tính toán số lượng rạp cho mỗi thành phố
        const cityCounts = data.reduce((acc, cinema) => {
          acc[cinema.city] = (acc[cinema.city] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const citiesWithCount = Object.keys(cityCounts).map(cityName => ({
          name: cityName,
          count: cityCounts[cityName]
        }));
        
        setCities([
          { name: 'Tất Cả Thành Phố', count: data.length },
          ...citiesWithCount
        ]);
        
      } catch (error) {
        console.error("Không thể tải danh sách rạp:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllCinemas();
  }, []);

  const filteredCinemas = selectedCity === 'Tất Cả Thành Phố' 
    ? allCinemas 
    : allCinemas.filter(cinema => cinema.city === selectedCity);

  return (
    <div className="min-h-screen bg-white">
      <section className="relative h-[400px] bg-gradient-to-b from-red-50 to-white">
        <div className="absolute inset-0 opacity-20">
          <ImageWithFallback src="https://images.unsplash.com/photo-1504050376847-144186a87c66" alt="Rạp chiếu phim" className="w-full h-full object-cover" />
        </div>
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl"><h1 className="text-5xl text-gray-900 mb-4">Hệ Thống Rạp</h1><p className="text-xl text-gray-700">Tìm rạp CGV gần bạn nhất.</p></div>
        </div>
      </section>

      <section className="py-8 bg-white border-b border-gray-200 sticky top-[73px] z-10 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-4"><Filter className="w-5 h-5 text-red-600" /><h2 className="text-xl text-gray-900">Lọc Theo Thành Phố</h2></div>
          <div className="flex flex-wrap gap-3">
            {cities.map((city) => (
              <button key={city.name} onClick={() => setSelectedCity(city.name)}
                className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all flex items-center gap-2 ${selectedCity === city.name ? 'border-red-600 bg-red-600 text-white' : 'border-gray-200 bg-white text-gray-700 hover:border-red-300'}`}>
                <span>{city.name}</span>
                <Badge className={`${selectedCity === city.name ? 'bg-white text-red-600' : 'bg-gray-100 text-gray-700'}`}>{city.count}</Badge>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="mb-6"><p className="text-gray-600">Hiển thị <span className="text-red-600 font-semibold">{filteredCinemas.length}</span> rạp</p></div>
          
          {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-[450px] w-full" />)}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCinemas.map((cinema) => (
                <Card key={cinema.cinema_id} className="bg-white border-gray-200 overflow-hidden hover:border-red-600 transition-all group shadow-sm hover:shadow-md">
                  <div className="relative h-48 overflow-hidden">
                    <ImageWithFallback src={cinema.image_url} alt={cinema.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"/>
                    <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold">{cinema.screens} Phòng Chiếu</div>
                    <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-xs font-semibold">{cinema.city}</div>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-gray-900 truncate">{cinema.name}</CardTitle>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {cinema.features?.map((feature) => (<Badge key={feature} variant="outline" className="border-red-200 text-red-600 bg-red-50">{feature}</Badge>))}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-2 text-gray-600 text-sm"><MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-600" /><span>{cinema.address}</span></div>
                    <div className="flex items-center gap-2 text-gray-600 text-sm"><Phone className="w-4 h-4 text-red-600" /><span>{cinema.phone}</span></div>
                    <div className="flex items-center gap-2 text-gray-600 text-sm"><Clock className="w-4 h-4 text-red-600" /><span>{cinema.hours}</span></div>
                    <div className="flex gap-2 pt-2">
                      <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white">Xem Lịch Chiếu</Button>
                      <Button variant="outline" size="icon" className="border-gray-300 text-gray-700"><Navigation className="w-4 h-4" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}