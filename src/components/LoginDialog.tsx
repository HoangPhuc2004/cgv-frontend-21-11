import { useState } from 'react';
// Sửa đường dẫn import: Thêm @/components/
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// Sửa đường dẫn import: Thêm @/components/
import { useAuth } from '@/components/AuthContext'; 
import { Mail, Lock, User, Phone, Calendar, MapPin } from 'lucide-react';

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  const { login, register } = useAuth();
  const [activeTab, setActiveTab] = useState('login');
  
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  // SỬA: Thêm state cho các trường mới
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerBirthday, setRegisterBirthday] = useState('');
  const [registerAddress, setRegisterAddress] = useState('');
  const [registerGender, setRegisterGender] = useState('male'); // Mặc định là 'male'
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null); // Clear success message on new attempt
    try {
        const data = await login(loginEmail, loginPassword);
        if (data.token) {
            onOpenChange(false); // Close dialog on successful login
             // Clear form fields after successful login
             setLoginEmail('');
             setLoginPassword('');
        } else {
            setError(data.message || 'Đăng nhập thất bại.');
        }
    } catch (err) {
        setError('Đã có lỗi xảy ra, vui lòng thử lại.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
  e.preventDefault();
  // ... (kiểm tra mật khẩu giữ nguyên) ...
  try {
      // SỬA: Truyền tất cả state vào hàm register
      const data = await register(
        registerName, 
        registerEmail, 
        registerPassword,
        registerPhone,
        registerBirthday,
        registerAddress,
        registerGender
      );

      if (data.user) {
          setSuccess('Đăng ký thành công! Vui lòng chuyển qua tab Đăng nhập.');
          // Clear registration form fields
          setRegisterName('');
          setRegisterEmail('');
          setRegisterPassword('');
          setRegisterConfirmPassword('');

          // SỬA: Xóa các trường mới sau khi thành công
          setRegisterPhone('');
          setRegisterBirthday('');
          setRegisterAddress('');
          setRegisterGender('male');

          setActiveTab('login'); 
      } else {
          setError(data.message || 'Đăng ký thất bại.');
      }
  } catch (err) {
      setError('Đã có lỗi xảy ra khi đăng ký, vui lòng thử lại.');
  }
};
  
  // Clear errors/success message when switching tabs or closing dialog
  const handleTabChange = (value: string) => {
      setActiveTab(value);
      setError(null);
      setSuccess(null);
  }
  const handleOpenChange = (isOpen: boolean) => {
      onOpenChange(isOpen);
       if (!isOpen) {
           setError(null);
           setSuccess(null);
           // Optionally clear fields on close
           // setLoginEmail(''); setLoginPassword(''); ...
       }
  }


  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl">Chào mừng đến với CGV</DialogTitle>
          <DialogDescription>
            Đăng nhập hoặc tạo tài khoản để có trải nghiệm tốt nhất
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-100">
            <TabsTrigger value="login">Đăng Nhập</TabsTrigger>
            <TabsTrigger value="register">Đăng Ký</TabsTrigger>
          </TabsList>

          {/* Login Tab */}
          <TabsContent value="login" className="mt-6">
            <form onSubmit={handleLogin} className="space-y-4">
              {error && activeTab === 'login' && <p className="text-sm text-red-600 text-center">{error}</p>}
               {success && activeTab === 'login' && <p className="text-sm text-green-600 text-center">{success}</p>}
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <Input 
                    id="login-email" 
                    type="email" 
                    placeholder="you@example.com" 
                    required 
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="pl-10 border-gray-300" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Mật Khẩu</Label>
                 <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input 
                        id="login-password" 
                        type="password" 
                        placeholder="••••••••" 
                        required 
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="pl-10 border-gray-300" 
                    />
                 </div>
              </div>
              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">Đăng Nhập</Button>
            </form>
          </TabsContent>

          {/* Register Tab */}
          <TabsContent value="register" className="mt-6">
            <form onSubmit={handleRegister} className="space-y-3">
              {error && activeTab === 'register' && <p className="text-sm text-red-600 text-center">{error}</p>}
              <div className="space-y-2">
                <Label htmlFor="register-name">Họ và Tên</Label>
                 <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input 
                        id="register-name" 
                        placeholder="Nguyễn Văn A" 
                        required 
                        value={registerName}
                        onChange={(e) => setRegisterName(e.target.value)}
                        className="pl-10 border-gray-300" 
                    />
                 </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-email">Email</Label>
                 <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input 
                        id="register-email" 
                        type="email" 
                        placeholder="you@example.com" 
                        required 
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        className="pl-10 border-gray-300" 
                    />
                 </div>
              </div>
              {/* SỬA: Thêm trường Số Điện Thoại */}
              <div className="space-y-2">
                <Label htmlFor="register-phone">Số Điện Thoại</Label>
                <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input 
                        id="register-phone" 
                        type="tel"
                        placeholder="Số điện thoại (tùy chọn)" 
                        value={registerPhone}
                        onChange={(e) => setRegisterPhone(e.target.value)}
                        className="pl-10 border-gray-300" 
                    />
                </div>
              </div>

              {/* SỬA: Thêm trường Ngày Sinh */}
              <div className="space-y-2">
                <Label htmlFor="register-birthday">Ngày Sinh</Label>
                <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input 
                        id="register-birthday" 
                        type="date" 
                        value={registerBirthday}
                        onChange={(e) => setRegisterBirthday(e.target.value)}
                        className="pl-10 border-gray-300 text-gray-700"
                        placeholder="Ngày sinh (tùy chọn)"
                    />
                </div>
              </div>

              {/* SỬA: Thêm trường Địa Chỉ */}
              <div className="space-y-2">
                <Label htmlFor="register-address">Địa Chỉ</Label>
                <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input 
                        id="register-address" 
                        placeholder="Địa chỉ (tùy chọn)" 
                        value={registerAddress}
                        onChange={(e) => setRegisterAddress(e.target.value)}
                        className="pl-10 border-gray-300" 
                    />
                </div>
              </div>

              {/* SỬA: Thêm trường Giới Tính (giống EditProfilePage.tsx) */}
              <div className="space-y-2">
                <Label className="text-gray-900">Giới Tính</Label>
                <div className="flex gap-4 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="gender" 
                      value="male" 
                      checked={registerGender === 'male'} 
                      onChange={(e) => setRegisterGender(e.target.value)} 
                      className="text-red-600 focus:ring-red-600"
                    /> 
                    <span className="text-gray-700">Nam</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="gender" 
                      value="female" 
                      checked={registerGender === 'female'} 
                      onChange={(e) => setRegisterGender(e.target.value)} 
                      className="text-red-600 focus:ring-red-600"
                    /> 
                    <span className="text-gray-700">Nữ</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="gender" 
                      value="other" 
                      checked={registerGender === 'other'} 
                      onChange={(e) => setRegisterGender(e.target.value)} 
                      className="text-red-600 focus:ring-red-600"
                    /> 
                    <span className="text-gray-700">Khác</span>
                  </label>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-password">Mật Khẩu</Label>
                 <div className="relative">
                     <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                     <Input 
                        id="register-password" 
                        type="password" 
                        placeholder="•••••••• (ít nhất 6 ký tự)" 
                        required 
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        className="pl-10 border-gray-300" 
                     />
                 </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Xác Nhận Mật Khẩu</Label>
                 <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input 
                        id="confirm-password" 
                        type="password" 
                        placeholder="••••••••" 
                        required 
                        value={registerConfirmPassword}
                        onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                        className="pl-10 border-gray-300" 
                    />
                 </div>
              </div>
              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 mt-4">Đăng Ký</Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

