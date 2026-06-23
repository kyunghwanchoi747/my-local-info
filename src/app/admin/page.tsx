"use client";

import { useState, useEffect, useRef } from "react";

interface Message {
  id: string;
  sender: "user" | "bot" | "admin";
  text: string;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // 로그인 처리
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin1234") {
      setIsAuthenticated(true);
    } else {
      alert("비밀번호가 틀렸습니다.");
    }
  };

  // 폴링(2초마다 관리자/유저 메시지 확인)
  useEffect(() => {
    if (isAuthenticated) {
      pollingRef.current = setInterval(async () => {
        try {
          const response = await fetch("/api/chat-poll");
          if (response.ok) {
            const data = await response.json();
            if (data.messages && Array.isArray(data.messages)) {
              setMessages((prev) => {
                const existingIds = new Set(prev.map((m) => m.id));
                const newMsgs = data.messages
                  .filter((m: any) => (m.sender === "user" || m.sender === "admin") && !existingIds.has(m.id))
                  .map((m: any) => ({
                    id: m.id,
                    sender: m.sender,
                    text: m.text,
                  }));

                if (newMsgs.length > 0) {
                  return [...prev, ...newMsgs];
                }
                return prev;
              });
            }
          }
        } catch (error) {
          console.error("폴링 오류:", error);
        }
      }, 2000);
    }

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [isAuthenticated]);

  // 자동 스크롤
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // 관리자 메시지 전송
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const adminMessageId = `admin-${Date.now()}`;
    const text = inputValue;
    setInputValue("");

    // 낙관적 업데이트
    setMessages((prev) => [
      ...prev,
      { id: adminMessageId, sender: "admin", text },
    ]);

    try {
      await fetch("/api/chat-human", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: adminMessageId,
          message: text,
          sender: "admin",
        }),
      });
    } catch (error) {
      console.error("메시지 전송 실패:", error);
    }
  };

  // 비로그인 상태 화면
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm">
          <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">관리자 페이지</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors"
            >
              로그인
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 로그인 상태 화면 (상담 페이지)
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-2xl h-[80vh] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden">
        {/* 헤더 */}
        <div className="bg-orange-500 text-white px-6 py-4 flex justify-between items-center shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <div>
              <h2 className="font-bold text-lg">실시간 상담 관리자</h2>
              <p className="text-xs text-orange-100">방문자와 대화 중</p>
            </div>
          </div>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="text-sm px-3 py-1.5 bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors"
          >
            로그아웃
          </button>
        </div>

        {/* 메시지 말풍선 영역 */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p>대기 중인 메시지가 없습니다.</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.sender !== "user" && (
                  <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mr-3 shrink-0 text-sm font-bold">
                    나
                  </div>
                )}
                <div
                  className={`max-w-[75%] px-5 py-3 rounded-2xl text-[15px] leading-relaxed shadow-sm ${
                    msg.sender === "user"
                      ? "bg-orange-500 text-white rounded-tr-none"
                      : "bg-white text-gray-800 border border-gray-100 rounded-tl-none"
                  }`}
                >
                  {msg.text}
                </div>
                {msg.sender === "user" && (
                  <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center ml-3 shrink-0 text-sm font-bold">
                    유저
                  </div>
                )}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 메시지 입력창 */}
        <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100 flex gap-3 shrink-0">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="답변을 입력하세요..."
            className="flex-1 px-5 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all text-sm"
          />
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="px-6 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 active:scale-95 disabled:bg-gray-200 disabled:text-gray-400 transition-all cursor-pointer"
          >
            전송
          </button>
        </form>
      </div>
    </div>
  );
}
