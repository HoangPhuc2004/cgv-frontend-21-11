import { useState } from 'react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Tag, Calendar, Gift, Percent, Search, Copy, Check, Filter, Clock, AlertCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { toast } from 'sonner';

interface Promotion {
  id: number;
  title: string;
  description: string;
  discount: string;
  validUntil: string;
  category: string;
  image: string;
  code: string;
  terms: string[];
  featured?: boolean;
}

const promotions: Promotion[] = [
  {
    id: 1,
    title: 'Ưu Đãi Sinh Viên - Giảm 20%',
    description: 'Xuất trình thẻ sinh viên và nhận ưu đãi 20% cho tất cả vé xem phim từ Thứ Hai đến Thứ Năm',
    discount: 'GIẢM 20%',
    validUntil: '2025-12-31',
    category: 'Sinh Viên',
    code: 'STUDENT20',
    terms: [
      'Áp dụng cho sinh viên có thẻ hợp lệ',
      'Chỉ áp dụng từ Thứ Hai đến Thứ Năm',
      'Không áp dụng cho suất chiếu đặc biệt',
      'Mỗi thẻ sinh viên chỉ mua được 1 vé'
    ],
    featured: true,
    image: 'https://images.unsplash.com/photo-1581298253744-fb9993613c73?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9tb3Rpb25hbCUyMGRpc2NvdW50JTIwc2FsZXxlbnwxfHx8fDE3NjAyMzgyNjB8MA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 2,
    title: 'Combo Gia Đình',
    description: 'Mua 4 vé và nhận miễn phí 2 bắp rang bơ lớn + 2 nước ngọt!',
    discount: 'COMBO MIỄN PHÍ',
    validUntil: '2025-06-30',
    category: 'Gia Đình',
    code: 'FAMILY4',
    terms: [
      'Mua tối thiểu 4 vé trong 1 giao dịch',
      'Áp dụng cho tất cả suất chiếu',
      'Combo bao gồm 2 bắp lớn và 2 nước ngọt',
      'Không áp dụng đồng thời với ưu đãi khác'
    ],
    featured: true,
    image: 'https://images.unsplash.com/photo-1707061803305-58383ee49415?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3ZpZSUyMHRpY2tldHMlMjBwb3Bjb3JufGVufDF8fHx8MTc2MDIzODI2NXww&ixlib=rb-4.1.0&q=80&w=1080'
  },
  // ... (Thêm các khuyến mãi khác nếu cần)
];

const categories = ['Tất Cả', 'Sinh Viên', 'Gia Đình', 'Thành Viên', 'Cuối Tuần', 'Cao Tuổi', 'Flash Sale', 'Combo', 'IMAX'];

export function PromotionsPage() {
  const [selectedCategory, setSelectedCategory] = useState('Tất Cả');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPromo, setSelectedPromo] = useState<Promotion | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success('Đã sao chép mã khuyến mãi!');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const isExpiringSoon = (dateString: string) => {
    const expiryDate = new Date(dateString);
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  };

  const isExpired = (dateString: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(dateString) < today;
  };
  
  const getFilteredPromotions = () => {
    let filtered = promotions;

    if (activeTab === 'active') {
      filtered = filtered.filter(p => !isExpired(p.validUntil));
    } else if (activeTab === 'expiring') {
      filtered = filtered.filter(p => isExpiringSoon(p.validUntil) && !isExpired(p.validUntil));
    }

    if (selectedCategory !== 'Tất Cả') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.code.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredPromotions = getFilteredPromotions();
  const featuredPromotions = promotions.filter(p => p.featured && !isExpired(p.validUntil));

  return (
    <div className="min-h-screen bg-white">
      <section className="relative h-[400px] bg-gradient-to-b from-red-50 to-white">
        <div className="absolute inset-0 opacity-20">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1581298253744-fb9993613c73?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9tb3Rpb25hbCUyMGRpc2NvdW50JTIwc2FsZXxlbnwxfHx8fDE3NjAyMzgyNjB8MA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Khuyến mãi"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl">
            <h1 className="text-5xl text-gray-900 mb-4">Khuyến Mãi Đặc Biệt</h1>
            <p className="text-xl text-gray-700">Tiết kiệm hơn cho phim yêu thích với các ưu đãi độc quyền.</p>
          </div>
        </div>
      </section>

      {/* Promotions Grid */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPromotions.map((promo) => {
                const expired = isExpired(promo.validUntil);
                const expiringSoon = isExpiringSoon(promo.validUntil);

                return (
                  <Card 
                    key={promo.id} 
                    className={`bg-white border-gray-200 overflow-hidden hover:border-red-600 transition-all group shadow-sm hover:shadow-md ${ expired ? 'opacity-60' : '' }`}
                  >
                     <div className="relative h-48 overflow-hidden">
                      <ImageWithFallback src={promo.image} alt={promo.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                      <div className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-1"><Percent className="w-4 h-4" /><span>{promo.discount}</span></div>
                      <div className="absolute top-4 left-4"><Badge className="bg-white/90 text-gray-900 border-0">{promo.category}</Badge></div>
                      {expiringSoon && !expired && <div className="absolute bottom-4 left-4"><Badge className="bg-yellow-500 text-white border-0 flex items-center gap-1"><AlertCircle className="w-3 h-3" />Sắp Hết Hạn</Badge></div>}
                      {expired && <div className="absolute inset-0 bg-black/60 flex items-center justify-center"><Badge className="bg-gray-800 text-white text-lg px-4 py-2">Đã Hết Hạn</Badge></div>}
                    </div>
                    <CardHeader><CardTitle>{promo.title}</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-gray-600 text-sm line-clamp-2">{promo.description}</p>
                      <div className="flex items-center gap-2 text-gray-500 text-sm"><Calendar className="w-4 h-4 text-red-600" /><span>Có hiệu lực đến: {new Date(promo.validUntil).toLocaleDateString('vi-VN')}</span></div>
                      <Button onClick={() => setSelectedPromo(promo)} className="w-full bg-red-600 hover:bg-red-700 text-white" disabled={expired}><Gift className="w-4 h-4 mr-2" />{expired ? 'Đã Hết Hạn' : 'Xem Chi Tiết'}</Button>
                    </CardContent>
                  </Card>
                );
            })}
          </div>
        </div>
      </section>

      <Dialog open={!!selectedPromo} onOpenChange={() => setSelectedPromo(null)}>
        {selectedPromo && (
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl text-gray-900">{selectedPromo.title}</DialogTitle>
              <DialogDescription>{selectedPromo.description}</DialogDescription>
            </DialogHeader>
            <div className="space-y-6 mt-4">
              <div className="p-4 bg-red-50 rounded-lg border-2 border-dashed border-red-300 flex items-center justify-between">
                <div><p className="text-sm text-gray-600">Mã Khuyến Mãi:</p><code className="text-2xl text-red-600">{selectedPromo.code}</code></div>
                <Button onClick={() => handleCopyCode(selectedPromo.code)} variant="outline" className="border-red-600 text-red-600 hover:bg-red-100">{copiedCode === selectedPromo.code ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />} Sao chép</Button>
              </div>
              <div><h3 className="text-lg text-gray-900 mb-3">Điều Khoản & Điều Kiện:</h3><ul className="list-disc list-inside space-y-2 text-sm text-gray-600">{selectedPromo.terms.map((term: string, i: number) => <li key={i}>{term}</li>)}</ul></div>
            </div>
            <DialogFooter className="mt-6"><Button onClick={() => setSelectedPromo(null)} variant="outline">Đóng</Button></DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}