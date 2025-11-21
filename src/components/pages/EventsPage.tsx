import { useState, useEffect } from 'react';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Ticket, Users, ArrowRight, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useAuth } from '@/components/AuthContext';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

// Thay đổi "date" thành "event_date" để khớp với backend
interface Event {
  event_id: number;
  title: string;
  description: string;
  event_date: string; // Đã sửa
  location: string;
  city: string;
  category: string;
  price: number;
  image_url: string;
  available_times: string[];
}

export function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingEvent, setBookingEvent] = useState<Event | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const { token, isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const res = await fetch('http://localhost:5001/api/events');
        const data = await res.json();
        setEvents(data);
      } catch (error) { console.error("Lỗi tải sự kiện:", error); }
      finally { setLoading(false); }
    };
    fetchEvents();
  }, []);

  const handleOpenDialog = (event: Event) => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để đặt vé.");
      return;
    }
    setBookingEvent(event);
    setQuantity(1);
    setSelectedTime(event.available_times[0]);
  };

  const handleCloseDialog = () => setBookingEvent(null);

  const handleConfirmBooking = async () => {
    if (bookingEvent && token) {
      try {
        const response = await fetch('http://localhost:5001/api/events/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            event_id: bookingEvent.event_id,
            number_of_tickets: quantity,
            total_amount: bookingEvent.price * quantity
          })
        });
        if (!response.ok) throw new Error("Đặt vé thất bại, vui lòng thử lại.");
        
        toast.success("Đặt vé sự kiện thành công!");
        handleCloseDialog();
      } catch (error: any) {
        toast.error(error.message);
      }
    }
  };

  return (
    <>
      <div className="min-h-screen bg-white">
        <section className="relative h-[400px] bg-gradient-to-b from-red-50 to-white">
          <div className="absolute inset-0 opacity-20"><ImageWithFallback src="https://images.unsplash.com/photo-1706419202046-e4982f00b082" alt="Sự kiện" className="w-full h-full object-cover"/></div>
          <div className="relative container mx-auto px-4 h-full flex items-center"><div className="max-w-2xl"><h1 className="text-5xl text-gray-900 mb-4">Sự Kiện Đặc Biệt</h1><p className="text-xl text-gray-700">Trải nghiệm điện ảnh vượt ra ngoài màn ảnh.</p></div></div>
        </section>
        
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            {loading ? <div className="flex justify-center"><Loader2 className="w-12 h-12 animate-spin text-red-600" /></div> :
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                  <Card key={event.event_id} className="bg-white border-gray-200 overflow-hidden flex flex-col hover:border-red-600 transition-all group shadow-sm hover:shadow-md">
                    <div className="relative h-48 overflow-hidden">
                        <ImageWithFallback src={event.image_url} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                        <div className="absolute top-4 left-4"><Badge className="bg-red-600 text-white border-0">{event.category}</Badge></div>
                    </div>
                    <CardHeader><CardTitle className="truncate">{event.title}</CardTitle></CardHeader>
                    <CardContent className="flex-grow flex flex-col">
                        <p className="text-gray-600 text-sm line-clamp-2 flex-grow">{event.description}</p>
                        <div className="space-y-2 text-sm mt-3">
                            {/* Sử dụng event.event_date */}
                            <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-red-600"/><span>{new Date(event.event_date).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}</span></div>
                            <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-red-600"/><span>{event.location}</span></div>
                        </div>
                        <div className="pt-3 border-t mt-4">
                            <div className="flex items-center justify-between mt-3 mb-4"><span className="text-gray-600 text-sm">Giá vé từ</span><span className="font-semibold text-xl text-red-600">{Number(event.price).toLocaleString('vi-VN')}đ</span></div>
                            <Button onClick={() => handleOpenDialog(event)} className="w-full bg-red-600 hover:bg-red-700 text-white"><Ticket className="w-4 h-4 mr-2" />Đặt Vé Sự Kiện</Button>
                        </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            }
          </div>
        </section>
      </div>

      <Dialog open={!!bookingEvent} onOpenChange={handleCloseDialog}>
        {bookingEvent && (
          <DialogContent className="sm:max-w-lg bg-white">
            <DialogHeader>
              <DialogTitle className="text-2xl">{bookingEvent.title}</DialogTitle>
              <DialogDescription>{bookingEvent.description}</DialogDescription>
            </DialogHeader>
            <Separator className="my-4" />
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Thành phố</Label><Input readOnly value={bookingEvent.city} /></div>
                <div><Label>Rạp</Label><Input readOnly value={bookingEvent.location} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantity">Số lượng vé</Label>
                  <Select value={quantity.toString()} onValueChange={(val) => setQuantity(Number(val))}>
                      <SelectTrigger id="quantity"><SelectValue /></SelectTrigger>
                      <SelectContent>{Array.from({ length: 8 }, (_, i) => i + 1).map(q => <SelectItem key={q} value={q.toString()}>{q}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="showtime">Chọn suất</Label>
                  <Select value={selectedTime} onValueChange={setSelectedTime}>
                      <SelectTrigger id="showtime"><SelectValue /></SelectTrigger>
                      <SelectContent>{bookingEvent.available_times.map(time => <SelectItem key={time} value={time}>{time}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <Separator className="my-4" />
            <div className="flex justify-between items-center text-xl font-bold">
              <span>Tổng cộng:</span>
              <span className="text-red-600">{(bookingEvent.price * quantity).toLocaleString('vi-VN')}đ</span>
            </div>
            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={handleCloseDialog}>Hủy</Button>
              <Button className="bg-red-600 hover:bg-red-700" onClick={handleConfirmBooking}>Xác Nhận Đặt Vé <ArrowRight className="w-4 h-4 ml-2" /></Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}