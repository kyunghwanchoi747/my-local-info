"use client";

import { useState, useEffect, useRef } from "react";

export default function AdminPage() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [password, setPassword] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // 자동 스크롤
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // 실시간 메시지 폴링 (2초 간격)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAuthorized) {
      const fetchMessages = async () => {
        try {
          const res = await fetch("/api/chat-poll");
          const data = await res.json();
          if (data.messages) {
            setMessages(data.messages);
          }
        } catch (e) {
          console.error("Polling error:", e);
        }
      };

      fetchMessages(); // 초기 실행
      interval = setInterval(fetchMessages, 2000);
    }
    return () => clearInterval(interval);
  }, [isAuthorized]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin1234") {
      setIsAuthorized(true);
    } else {
      alert("비밀번호가 올바르지 않습니다.");
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    try {
      await fetch("/api/chat-human", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText, sender: "admin" }),
      });
      setInputText("");
      
      // 즉시 목록 갱신을 위해 폴링 대기 없이 추가 (UI 반응성)
      setMessages(prev => [...prev, { text: inputText, sender: "admin" }]);
    } catch (e) {
      console.error("Send error:", e);
    }
  };

  // 로그인 전 화면
  if (!isAuthorized) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 p-4">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-sm border border-gray-100">
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-orange-100 rounded-full mb-4">
              <span className="text-4xl">🔐</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">관리자 전용</h1>
            <p className="text-gray-500 text-sm mt-2">상담 관리를 위해 비밀번호를 입력해 주세요.</p>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border-2 border-gray-100 rounded-2xl px-5 py-3 mb-6 focus:border-orange-500 focus:ring-0 outline-none transition-all"
            placeholder="비밀번호 입력"
            autoFocus
          />
          <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-orange-200 transition-all active:scale-95">
            접속하기
          </button>
        </form>
      </div>
    );
  }

  // 관리자 대화 관리 화면
  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-10 flex flex-col items-center">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[85vh] border border-gray-200">
        {/* 헤더 */}
        <div className="bg-orange-500 p-6 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl">
              🎧
            </div>
            <div>
              <h2 className="font-bold text-lg">실시간 상담 매니저</h2>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span className="text-xs text-orange-100">시스템 정상 가동 중</span>
              </div>
            </div>
          </div>
          <div className="text-sm bg-black/10 px-4 py-2 rounded-full">
            총 메시지: {messages.length}개
          </div>
        </div>
        
        {/* 대화 영역 */}
        <div 
          ref={scrollRef} 
          className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50"
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-3">
              <span className="text-5xl">💬</span>
              <p>아직 도착한 상담 메시지가 없습니다.</p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} animate-in fade-in duration-300`}
              >
                <div className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                  <span className="text-[10px] text-gray-400 mb-1 px-2">
                    {msg.sender === "user" ? "방문자" : "나 (관리자)"}
                  </span>
                  <div className={`max-w-[85%] md:max-w-[70%] p-4 text-sm shadow-sm rounded-2xl ${
                    msg.sender === "user" 
                      ? "bg-orange-500 text-white rounded-tr-none shadow-orange-100" 
                      : "bg-white text-gray-800 rounded-tl-none border border-gray-200"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 답장 입력창 */}
        <form onSubmit={handleSend} className="p-6 bg-white border-t border-gray-100 flex gap-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-orange-500 transition-all outline-none"
            placeholder="상담 내용을 입력하세요..."
          />
          <button 
            disabled={!inputText.trim()}
            className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-orange-100 transition-all active:scale-95 flex items-center gap-2"
          >
            <span>전송</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
