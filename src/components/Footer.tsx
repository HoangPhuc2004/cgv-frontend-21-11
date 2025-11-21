export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-2xl text-red-600 mb-4">CGV</h3>
            <p className="text-gray-600">
              Chuỗi rạp chiếu phim hàng đầu Việt Nam mang đến trải nghiệm giải trí đẳng cấp thế giới.
            </p>
          </div>
          <div>
            <h4 className="text-gray-900 mb-4">Liên Kết Nhanh</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-red-600">Về Chúng Tôi</a></li>
              <li><a href="#" className="text-gray-600 hover:text-red-600">Tuyển Dụng</a></li>
              <li><a href="#" className="text-gray-600 hover:text-red-600">Liên Hệ</a></li>
              <li><a href="#" className="text-gray-600 hover:text-red-600">Câu Hỏi Thường Gặp</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-gray-900 mb-4">Dịch Vụ</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-red-600">Vé Xem Phim</a></li>
              <li><a href="#" className="text-gray-600 hover:text-red-600">Thẻ Quà Tặng</a></li>
              <li><a href="#" className="text-gray-600 hover:text-red-600">Thành Viên</a></li>
              <li><a href="#" className="text-gray-600 hover:text-red-600">Sự Kiện Doanh Nghiệp</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-gray-900 mb-4">Theo Dõi Chúng Tôi</h4>
            <p className="text-gray-600 mb-4">
              Cập nhật phim mới và ưu đãi mới nhất
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-600 hover:text-red-600">Facebook</a>
              <a href="#" className="text-gray-600 hover:text-red-600">Instagram</a>
              <a href="#" className="text-gray-600 hover:text-red-600">Twitter</a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-200 pt-8 text-center text-gray-600">
          <p>&copy; 2025 CGV Cinemas. Bảo lưu mọi quyền.</p>
        </div>
      </div>
    </footer>
  );
}
