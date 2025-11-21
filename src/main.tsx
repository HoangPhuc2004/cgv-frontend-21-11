import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";
// Sửa đường dẫn import: Sử dụng alias @/
import { AuthProvider } from "@/components/AuthContext"; 

createRoot(document.getElementById("root")!).render(
  // Bọc App trong BrowserRouter và AuthProvider
  <BrowserRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>
);
