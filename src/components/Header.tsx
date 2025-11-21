import { useState } from 'react';
// Sửa đường dẫn import: Thêm @/components/
import { Button } from '@/components/ui/button'; 
import { Ticket, User, ChevronDown, Edit, History, LogOut } from 'lucide-react';
// Sửa đường dẫn import: Thêm @/components/
import { useAuth } from '@/components/AuthContext'; 
// Sửa đường dẫn import: Thêm @/components/
import { LoginDialog } from '@/components/LoginDialog'; 
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
// Sửa đường dẫn import: Thêm @/components/
} from '@/components/ui/dropdown-menu'; 
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  currentPage: string;
}

export function Header({ currentPage }: HeaderProps) {
  const { isAuthenticated, user, logout } = useAuth();
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { id: 'home', label: 'Trang Chủ', path: '/' },
    { id: 'movies', label: 'Phim', path: '/movies' },
    { id: 'showtimes', label: 'Lịch Chiếu', path: '/showtimes' },
    { id: 'promotions', label: 'Khuyến Mãi', path: '/promotions' },
    { id: 'events', label: 'Sự Kiện', path: '/events' }
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsDropdownOpen(false);
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <button
                onClick={() => handleNavigation('/')}
                className="text-3xl text-red-600 hover:text-red-700 transition-colors"
              >
                CGV
              </button>
              <nav className="hidden md:flex gap-6">
                {navItems.slice(1).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.path)}
                    className={`transition-colors ${
                      currentPage === item.id
                        ? 'text-red-600'
                        : 'text-gray-700 hover:text-red-600'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                  <DropdownMenuTrigger asChild>
                    <div
                      onMouseEnter={() => setIsDropdownOpen(true)}
                      onMouseLeave={() => setIsDropdownOpen(false)}
                    >
                      <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                        <User className="w-4 h-4 mr-2" />
                        {user?.name}
                        <ChevronDown className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-56 bg-white"
                    onMouseEnter={() => setIsDropdownOpen(true)}
                    onMouseLeave={() => setIsDropdownOpen(false)}
                  >
                    <DropdownMenuItem
                      onClick={() => handleNavigation('/my-account')}
                      className="cursor-pointer hover:bg-gray-50"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Trang Của Tôi
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleNavigation('/edit-profile')}
                      className="cursor-pointer hover:bg-gray-50"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Chỉnh Sửa Thông Tin
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleNavigation('/my-tickets')}
                      className="cursor-pointer hover:bg-gray-50"
                    >
                      <Ticket className="w-4 h-4 mr-2" />
                      Vé Đã Đặt
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleNavigation('/view-history')}
                      className="cursor-pointer hover:bg-gray-50"
                    >
                      <History className="w-4 h-4 mr-2" />
                      Lịch Sử Xem
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        handleLogout();
                        setIsDropdownOpen(false);
                      }}
                      className="cursor-pointer hover:bg-gray-50 text-red-600"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Đăng Xuất
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  variant="outline"
                  className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                  onClick={() => setShowLoginDialog(true)}
                >
                  Đăng Nhập
                </Button>
              )}
              <Button 
                onClick={() => handleNavigation('/showtimes')} 
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Ticket className="w-4 h-4 mr-2" />
                Đặt Vé
              </Button>
            </div>
          </div>
        </div>
      </header>

      <LoginDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
    </>
  );
}

