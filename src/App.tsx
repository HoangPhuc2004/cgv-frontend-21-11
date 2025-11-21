import { useState, lazy, Suspense, useEffect } from 'react';
import { Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom';
// SỬA LỖI: Xóa AuthProvider, nó đã có ở main.tsx
// import { AuthProvider } from '@/components/AuthContext'; 
import { ChatBot } from '@/components/ChatBot';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Loader2 } from 'lucide-react';

// --- Lazy load page components ---
const HomePage = lazy(() => import('@/components/pages/HomePage').then(module => ({ default: module.HomePage })));
const MoviesPage = lazy(() => import('@/components/pages/MoviesPage').then(module => ({ default: module.MoviesPage })));
const PromotionsPage = lazy(() => import('@/components/pages/PromotionsPage').then(module => ({ default: module.PromotionsPage })));
const EventsPage = lazy(() => import('@/components/pages/EventsPage').then(module => ({ default: module.EventsPage })));
const MyAccountPage = lazy(() => import('@/components/pages/MyAccountPage').then(module => ({ default: module.MyAccountPage })));
const EditProfilePage = lazy(() => import('@/components/pages/EditProfilePage').then(module => ({ default: module.EditProfilePage })));
const MyTicketsPage = lazy(() => import('@/components/pages/MyTicketsPage').then(module => ({ default: module.MyTicketsPage })));
const ViewHistoryPage = lazy(() => import('@/components/pages/ViewHistoryPage').then(module => ({ default: module.ViewHistoryPage })));
const MovieDetailPage = lazy(() => import('@/components/pages/MovieDetailPage').then(module => ({ default: module.MovieDetailPage })));
const SeatSelectionPage = lazy(() => import('@/components/pages/SeatSelectionPage').then(module => ({ default: module.SeatSelectionPage })));
const CheckoutPage = lazy(() => import('@/components/pages/CheckoutPage').then(module => ({ default: module.CheckoutPage })));
const ShowtimesPage = lazy(() => import('@/components/pages/ShowtimesPage').then(module => ({ default: module.ShowtimesPage })));

// --- Wrapper Components to handle props/state for routed components ---

function MovieDetailWrapper() {
  const { movieId } = useParams<{ movieId: string }>();
  const navigate = useNavigate();
  
  // Thêm kiểm tra NaN (lỗi từ các bước trước)
  const numericMovieId = Number(movieId);
  useEffect(() => {
    if (isNaN(numericMovieId)) {
      console.error("Movie ID không hợp lệ:", movieId);
      navigate('/');
    }
  }, [numericMovieId, navigate, movieId]);

  if (isNaN(numericMovieId)) {
    return null; // Không render gì nếu ID không hợp lệ
  }

  // SỬA LỖI: Xóa prop onNavigate
  return <MovieDetailPage movieId={numericMovieId} />;
}

function SeatSelectionWrapper() {
  const location = useLocation();
  const navigate = useNavigate();

  // --- THÊM KHỐI CODE NÀY ---
  if (!location.state) {
     navigate('/'); // Điều hướng về trang chủ nếu không có dữ liệu
     return null; 
  }
  // --- KẾT THÚC THÊM ---

  // SỬA LỖI: Xóa prop onNavigate (dòng này giữ nguyên)
  return <SeatSelectionPage bookingData={location.state} />;
}

function CheckoutWrapper() {
    const location = useLocation();
    const navigate = useNavigate();
    
     // KHỐI CODE BẢO VỆ NÀY RẤT QUAN TRỌNG
     if (!location.state) {
         navigate('/'); // Điều hướng về trang chủ
         return null; // Dừng render component
     }
    
    // Dòng này chỉ chạy khi location.state có dữ liệu
    return <CheckoutPage bookingData={location.state} />;
}

function HomePageWrapper() {
     // SỬA LỖI: Xóa prop onNavigate
    return <HomePage />;
}

function MoviesPageWrapper() {
    // Component này đã tự dùng useNavigate()
    return <MoviesPage />;
}

function ShowtimesPageWrapper() {
    // SỬA LỖI: Xóa prop onNavigate
    return <ShowtimesPage />;
}

function MyTicketsPageWrapper() {
    // Component này đã tự dùng useNavigate()
    return <MyTicketsPage />;
}


// --- Main App Component ---
export default function App() {
  const location = useLocation();
  const currentPageSlug = location.pathname.split('/')[1] || 'home';

  return (
    // SỬA LỖI: Xóa <AuthProvider> bị trùng lặp
    <div className="min-h-screen bg-white flex flex-col">
      <Header currentPage={currentPageSlug} /> 
      <main className="flex-grow">
        <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-16 h-16 animate-spin text-red-600"/></div>}>
          <Routes>
            <Route path="/" element={<HomePageWrapper />} />
            <Route path="/home" element={<HomePageWrapper />} />
            <Route path="/movies" element={<MoviesPageWrapper />} />
            <Route path="/showtimes" element={<ShowtimesPageWrapper />} />
            <Route path="/promotions" element={<PromotionsPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/my-account" element={<MyAccountPage />} />
            <Route path="/edit-profile" element={<EditProfilePage />} />
            <Route path="/my-tickets" element={<MyTicketsPageWrapper />} />
            <Route path="/view-history" element={<ViewHistoryPage />} />
            
            {/* SỬA LỖI: Thêm lại route cho trang chi tiết phim */}
            <Route path="/movie-detail/:movieId" element={<MovieDetailWrapper />} /> 
            
            {/* SỬA LỖI: Cập nhật route trang ghế (thực hiện yêu cầu mới của bạn) */}
            <Route path="/movie-detail/:movieId/seat-selection" element={<SeatSelectionWrapper />} />
            
            {/* SỬA LỖI: Xóa route /seat-selection cũ bị trùng */}
            {/* <Route path="/seat-selection" element={<SeatSelectionWrapper />} /> */}
            
            <Route path="/checkout" element={<CheckoutWrapper />} />
            <Route path="*" element={<HomePageWrapper />} /> 
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <ChatBot />
    </div>
    // SỬA LỖI: Xóa </AuthProvider> bị trùng lặp
  );
}