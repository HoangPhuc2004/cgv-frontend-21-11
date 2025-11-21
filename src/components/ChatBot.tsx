import { useState, useRef, useEffect, useCallback } from 'react';
// SỬA: Thêm RotateCcw
import { X, MessageCircle, Send, RotateCcw } from 'lucide-react'; 
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { useAuth } from './AuthContext';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom'; 

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  bookingData?: any; 
}

// SỬA: Đưa tin nhắn chào mừng ra ngoài làm hằng số
const initialMessage: Message = {
  id: 'initial-1',
  text: "Xin chào! 🍿 Tôi là CGV-Bot. Tôi có thể giúp bạn tra cứu suất chiếu hoặc đặt vé. Bạn muốn xem phim gì hôm nay?",
  sender: 'bot',
  timestamp: new Date()
};

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null); 
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { token, isAuthenticated } = useAuth();
  const navigate = useNavigate(); 

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Tải lịch sử chat khi user đăng nhập hoặc tải lại trang
  useEffect(() => {
      // Chỉ tải nếu đã đăng nhập
      if (isAuthenticated && token) {
          console.log("Đã đăng nhập, đang tải lịch sử chat...");
          fetch('http://localhost:5001/api/chat/history', {
              headers: {
                  'Authorization': `Bearer ${token}`
              }
          })
          .then(res => res.json())
          .then(data => {
              if (data.messages && data.messages.length > 0) {
                  // Định dạng lại message từ DB (chuyển đổi timestamp)
                  const loadedMessages = data.messages.map((msg: any) => ({
                      ...msg,
                      id: `db-${msg.id}`, // Đảm bảo ID là duy nhất
                      timestamp: new Date(msg.timestamp) 
                  }));
                  
                  // Nối tin nhắn chào mừng với lịch sử đã tải
                  setMessages([initialMessage, ...loadedMessages]);
                  setConversationId(data.conversation_id);
                  console.log(`Đã tải ${loadedMessages.length} tin nhắn cho conv_id: ${data.conversation_id}`);
              } else {
                  console.log("Không tìm thấy lịch sử chat cũ.");
                  // Đảm bảo chat là mới nếu không có lịch sử
                  setConversationId(null); 
                  setMessages([initialMessage]); // Reset về tin nhắn đầu
              }
          })
          .catch(err => console.error("Lỗi tải lịch sử chat:", err));
      } else {
           // Nếu người dùng logout, reset lại chat
           setMessages([initialMessage]);
           setConversationId(null);
      }
  }, [isAuthenticated, token]); // Chạy lại khi trạng thái đăng nhập thay đổi

  // Logic điều hướng (Giữ nguyên)
  const handleNavigateToBooking = (bookingData: any) => {
    if (!bookingData || !bookingData.movie_id || !bookingData.showtime_id) {
        console.error("Lỗi: Chatbot bookingData bị thiếu thông tin.", bookingData);
        return;
    }
    
    const navigationState = {
        movie: { 
            movie_id: bookingData.movie_id, 
            title: bookingData.title 
        },
        showtime: {
            showtime_id: bookingData.showtime_id,
            cinema_name: bookingData.cinema_name,
            start_time: bookingData.start_time,
            ticket_price: bookingData.ticket_price,
        },
        format: (bookingData.features && bookingData.features[0]) || '2D'
    };
    
    setIsOpen(false);
    
    navigate(
      `/movie-detail/${bookingData.movie_id}/seat-selection`, 
      { state: navigationState }
    );
  };

  // HÀM GỬI TIN NHẮN ĐÃ NÂNG CẤP
  const handleSendMessage = async () => {
    if (inputValue.trim() === '' || isTyping) return;

    const userInputText = inputValue.trim();
    const userMessage: Message = { id: `user-${Date.now()}`, text: userInputText, sender: 'user', timestamp: new Date() };

    // Cập nhật UI ngay lập tức
    const newMessagesForUI = [...messages, userMessage];
    setMessages(newMessagesForUI); 
    setInputValue('');
    setIsTyping(true);

    // Chuẩn bị payload cho backend
    let apiBody: any;
    
    if (isAuthenticated && token) {
        // === NGƯỜI DÙNG ĐÃ ĐĂNG NHẬP (Stateful) ===
        apiBody = {
            message: userInputText,
            conversation_id: conversationId // Gửi ID hiện tại (hoặc null nếu là mới)
        };
    } else {
        // === KHÁCH (GUEST) (Stateless) (Req 3) ===
        // Gửi lịch sử từ state (stateless)
        // Lấy 10 tin nhắn cuối (bao gồm cả tin nhắn mới của user)
        const historyForGuest = newMessagesForUI.map(msg => ({
            text: msg.text,
            sender: msg.sender
        })).slice(-10); 
        
        apiBody = {
            message: userInputText,
            history: historyForGuest 
        };
    }

    try {
        const response = await fetch('http://localhost:5001/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // (Req 3) Chỉ gửi token nếu đã đăng nhập
                ...(token && { 'Authorization': `Bearer ${token}` }) 
            },
            body: JSON.stringify(apiBody)
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.message || 'Phản hồi từ server không tốt.');
        }

        const data = await response.json();
        
        // (Req 2) Lưu conversation_id mới (nếu có)
        if (data.conversation_id && isAuthenticated) {
            setConversationId(data.conversation_id);
        }
        
        let botText = data.reply;
        let bookingData = null;

        // (Req 4) Logic xử lý nút bấm (Giữ nguyên)
        const jsonMatch = data.reply.match(/(\[.*\]|\{.*\})/s);
        let parsedReply = null;
        
        if (jsonMatch && jsonMatch[1]) {
            try {
                parsedReply = JSON.parse(jsonMatch[1]);
                const potentialText = data.reply.replace(jsonMatch[1], "").trim();
                if (potentialText && potentialText.length > 0) {
                    botText = potentialText; 
                }
            } catch (e) {
                botText = data.reply;
                parsedReply = null; 
            }
        } else {
            botText = data.reply;
        }

        if (parsedReply) {
            let selectedShowtime = null;
            if (Array.isArray(parsedReply) && parsedReply.length > 0) {
                selectedShowtime = parsedReply[0];
            } else if (typeof parsedReply === 'object' && parsedReply !== null && !Array.isArray(parsedReply)) {
                if (parsedReply.showtime_id) {
                    selectedShowtime = parsedReply;
                } else if (parsedReply.message) {
                    botText = parsedReply.message;
                }
            }

            if (selectedShowtime) {
                bookingData = selectedShowtime; 
                // Tự động tạo văn bản cho nút bấm
                const startTime = new Date(selectedShowtime.start_time);
                const showtimeString = startTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                botText = `OK! Đã chọn suất **${selectedShowtime.title || "phim"}** lúc **${showtimeString}** tại **${selectedShowtime.cinema_name || "rạp"}**. \n\nMời bạn nhấn nút bên dưới để tiếp tục chọn ghế.`;
            }
        }
        // Kết thúc logic nút bấm

        const botResponse: Message = { 
            id: `bot-${Date.now()}`, 
            text: botText, 
            sender: 'bot', 
            timestamp: new Date(),
            bookingData: bookingData 
        };
        setMessages(prev => [...prev, botResponse]);

    } catch (error) {
        console.error("Lỗi khi gọi API chat:", error);
        const errorResponse: Message = { id: `bot-error-${Date.now()}`, text: "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại. 🛠️", sender: 'bot', timestamp: new Date() };
        setMessages(prev => [...prev, errorResponse]);
    } finally {
        setIsTyping(false);
        setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };

  // --- HÀM MỚI ĐỂ KHỞI ĐỘNG LẠI CHAT ---
  const handleNewChat = () => {
    setMessages([initialMessage]); // Reset tin nhắn về ban đầu
    setConversationId(null);       // Quan trọng: Xóa ID phiên
    setIsTyping(false);            // Dừng gõ (nếu có)
    inputRef.current?.focus();     // Focus lại ô nhập
  };
  // ------------------------------------

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-red-600 hover:bg-red-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 z-50 flex items-center justify-center"
          aria-label="Mở hội thoại"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[380px] h-[600px] bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden z-50 border border-gray-200">
          
          {/* SỬA: THÊM NÚT RESTART VÀO HEADER */}
          <div className="bg-red-600 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white rounded-full p-2"><MessageCircle className="w-5 h-5 text-red-600" /></div>
              <div><h3 className="font-semibold">Hỗ trợ CGV</h3><p className="text-xs text-red-100">Đang hoạt động</p></div>
            </div>
            
            <div className="flex items-center gap-1">
              {/* NÚT RESTART MỚI */}
              <button 
                onClick={handleNewChat} 
                className="hover:bg-red-700 rounded-full p-1 transition-colors" 
                aria-label="Bắt đầu lại hội thoại"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
              
              {/* NÚT ĐÓNG CŨ */}
              <button 
                onClick={() => setIsOpen(false)} 
                className="hover:bg-red-700 rounded-full p-1 transition-colors" 
                aria-label="Đóng hội thoại"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          {/* KẾT THÚC SỬA HEADER */}

          <ScrollArea className="flex-1 min-h-0 p-4 bg-gray-50">
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-lg py-2 px-3 ${ message.sender === 'user' ? 'bg-red-600 text-white' : 'bg-white text-gray-900 border border-gray-200' }`}>
                    {message.sender === 'bot' ? (
                      <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1">
                        <ReactMarkdown>{message.text}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm">{message.text}</p>
                    )}
                    
                    {/* Hiển thị nút "Đến trang chọn ghế" */}
                    {message.sender === 'bot' && message.bookingData && (
                        <Button 
                            onClick={() => handleNavigateToBooking(message.bookingData)}
                            className="mt-3 w-full bg-red-600 hover:bg-red-700 text-white"
                        >
                            Đến trang chọn ghế
                        </Button>
                    )}
                    
                    <p className={`text-xs mt-1 text-right ${ message.sender === 'user' ? 'text-red-100' : 'text-gray-500' }`}>
                      {message.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              {isTyping && ( <div className="flex justify-start"><div className="bg-white text-gray-900 border border-gray-200 rounded-lg p-3"><div className="flex gap-1"><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div></div></div></div> )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <div className="p-4 bg-white border-t border-gray-200 rounded-b-lg">
            <form onSubmit={handleFormSubmit} className="flex gap-2">
              <input ref={inputRef} type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyDown} placeholder="Nhập tin nhắn của bạn..." disabled={isTyping} className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed" />
              <Button type="submit" disabled={isTyping || inputValue.trim() === ''} className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed" size="icon"><Send className="w-4 h-4" /></Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}