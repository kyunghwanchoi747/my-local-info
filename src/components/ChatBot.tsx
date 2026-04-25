"use client";

import { useState, useEffect, useRef } from "react";
import chatData from "../../chat-data.json";

interface Message {
  type: "user" | "bot";
  text: string;
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { type: "bot", text: "안녕하세요! 궁금하신 점을 선택해 주세요." }
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 대화 추가 시 자동 스크롤
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleQuestionClick = (question: string, answer: string) => {
    // 사용자 질문 추가
    const userMsg: Message = { type: "user", text: question };
    setMessages((prev) => [...prev, userMsg]);

    // 약간의 지연 후 봇 답변 추가 (자연스러운 느낌)
    setTimeout(() => {
      const botMsg: Message = { type: "bot", text: answer };
      setMessages((prev) => [...prev, botMsg]);
    }, 500);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* 채팅창 영역 */}
      {isOpen && (
        <div className="fixed inset-0 md:inset-auto md:bottom-20 md:right-0 w-full md:w-[360px] h-full md:h-[500px] bg-white md:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          {/* 헤더 */}
          <div className="bg-blue-600 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">
                🤖
              </div>
              <div>
                <h3 className="font-bold text-sm">AI 상담원</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  <span className="text-xs text-blue-100">온라인</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 대화 영역 */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 scrollbar-hide"
          >
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"} animate-in fade-in duration-300`}
              >
                <div className={`max-w-[80%] p-3 text-sm shadow-sm ${
                  msg.type === "user" 
                    ? "bg-blue-600 text-white rounded-2xl rounded-tr-none" 
                    : "bg-white text-gray-800 rounded-2xl rounded-tl-none border border-gray-100"
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* 질문 버튼 영역 */}
          <div className="p-4 bg-white border-t border-gray-100 max-h-[180px] overflow-y-auto">
            <div className="flex flex-wrap gap-2">
              {chatData.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuestionClick(item.question, item.answer)}
                  className="text-xs bg-gray-50 hover:bg-blue-50 hover:text-blue-600 text-gray-600 px-3 py-2 rounded-full border border-gray-200 transition-all text-left"
                >
                  {item.question}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 플로팅 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95 ${
          isOpen ? "bg-gray-100 text-gray-600" : "bg-blue-600 text-white"
        }`}
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="19 9l-7 7-7-7" />
          </svg>
        ) : (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>
    </div>
  );
}
