import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

// --- Định nghĩa kiểu dữ liệu ---
interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  memberSince?: string; // Consider removing or fetching real data if needed
}
interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  register: (name: string, email: string, password: string) => Promise<any>;
  login: (email: string, password: string, name?: string) => Promise<any>;
  logout: () => void;
  fetchUser: () => Promise<void>; // Keep fetchUser for manual refresh if needed
  loadingAuth: boolean; // Add loading state
}

// --- Tạo Context ---
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- Auth Provider Component ---
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true); // Add loading state
  const API_URL = 'http://localhost:5001/api';

  // Function to validate token and fetch user data
  const validateTokenAndFetchUser = useCallback(async (currentToken: string) => {
    try {
      const response = await fetch(`${API_URL}/users/me`, {
        headers: { 'Authorization': `Bearer ${currentToken}` }
      });
      if (response.ok) {
        const userData = await response.json();
        // Assuming your API returns user_id and username
        const currentUser: User = { 
            id: userData.user_id, 
            name: userData.username, 
            email: userData.email, 
            phone: userData.phone,
            // memberSince: new Date().toLocaleDateString('vi-VN') // Maybe fetch this if available
        }; 
        setUser(currentUser);
        setToken(currentToken);
         // Optionally save updated user data back to localStorage
        localStorage.setItem('cgv_user', JSON.stringify(currentUser)); 
      } else {
        // Token is invalid or expired
        logout(); // Clear invalid token and user data
      }
    } catch (error) {
      console.error("Lỗi khi xác thực token:", error);
      logout(); // Clear on error
    } finally {
      setLoadingAuth(false); // Finish loading
    }
  }, []); // Removed token from dependencies

  // Effect to load initial auth state from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('cgv_token');
    const savedUserJson = localStorage.getItem('cgv_user');
    
    if (savedToken) {
      // If token exists, validate it
      validateTokenAndFetchUser(savedToken);
       // Optionally, load user from localStorage immediately for faster UI update, 
       // but it might be slightly stale until validation completes.
       if (savedUserJson) {
           try {
               setUser(JSON.parse(savedUserJson));
           } catch (e) {
               console.error("Error parsing saved user data:", e);
               localStorage.removeItem('cgv_user'); // Clear corrupted data
           }
       }
    } else {
      // No token found, finish loading
      setLoadingAuth(false);
    }
  }, [validateTokenAndFetchUser]); // Run only once on mount

  // Manual fetch function (can be removed if not needed elsewhere)
   const fetchUser = useCallback(async () => {
       const currentToken = localStorage.getItem('cgv_token');
       if (currentToken) {
           setLoadingAuth(true); // Indicate loading when manually fetching
           await validateTokenAndFetchUser(currentToken);
       }
   }, [validateTokenAndFetchUser]);

  // SỬA: Thêm các trường mới vào hàm register
  const register = async (
    name: string, 
    email: string, 
    password: string,
    phone: string,
    birthday: string,
    address: string,
    gender: string
  ) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // SỬA: Gửi đầy đủ dữ liệu trong body
      body: JSON.stringify({ 
        name, 
        email, 
        password,
        phone,
        birthday,
        address,
        gender 
      }),
    });
    return response.json(); // Let caller handle response
  };
  
  const login = async (email: string, password: string) => {
    setLoadingAuth(true); // Set loading before login attempt
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        if (data.token) {
          localStorage.setItem('cgv_token', data.token);
          // Directly set user and token from login response for immediate update
          const loggedInUser: User = { 
              id: data.user.id, 
              name: data.user.name, 
              email: data.user.email 
              // phone: data.user.phone // Add if returned by login API
          };
          setUser(loggedInUser);
          setToken(data.token);
          localStorage.setItem('cgv_user', JSON.stringify(loggedInUser));
        }
        setLoadingAuth(false); // Finish loading after login attempt
        return data; // Return data for caller to check success/failure
    } catch (error) {
         console.error("Login API error:", error);
         setLoadingAuth(false); // Finish loading on error
         // Rethrow or return an error structure
         throw new Error("Lỗi kết nối khi đăng nhập.");
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('cgv_user');
    localStorage.removeItem('cgv_token');
     // Optionally: window.location.href = '/'; // Force reload if needed
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        register,
        login,
        logout,
        fetchUser,
        loadingAuth // Provide loading state
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// --- Custom Hook ---
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
