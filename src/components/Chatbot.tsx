"use client";

import { useState, useRef, useEffect } from "react";
import chatData from "../../chat-data.json";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "bot",
      text: "안녕하세요! 성남시 생활 정보 AI 상담원입니다. 아래 질문 버튼을 클릭하시면 친절하게 안내해 드리겠습니다.",
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 자동 스크롤
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleQuestionClick = (question: string, answer: string) => {
    const userMessageId = `user-${Date.now()}`;
    const botMessageId = `bot-${Date.now()}`;

    // 1. 유저 질문 추가
    setMessages((prev) => [
      ...prev,
      { id: userMessageId, sender: "user", text: question },
    ]);

    // 2. 약간의 딜레이를 주어 AI 답변이 출력되도록 함 (타이핑 느낌 제공)
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: botMessageId, sender: "bot", text: answer },
      ]);
    }, 400);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans">
      {/* 챗봇 대화창 */}
      <div
        className={`fixed bottom-24 right-5 w-[360px] h-[500px] max-w-[calc(100vw-40px)] max-h-[calc(100vh-120px)] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden transition-all duration-300 transform md:bottom-24 md:right-5 ${
          isOpen
            ? "scale-100 opacity-100 translate-y-0 pointer-events-auto"
            : "scale-95 opacity-0 translate-y-5 pointer-events-none"
        }
        max-md:fixed max-md:inset-0 max-md:w-full max-md:h-full max-md:max-w-full max-md:max-h-full max-md:rounded-none max-md:bottom-0 max-md:right-0`}
      >
        {/* 상단 헤더 */}
        <div className="bg-blue-600 text-white px-4 py-4 flex justify-between items-center shrink-0">
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse"></div>
            <div>
              <h3 className="font-bold text-sm">AI 상담원</h3>
              <p className="text-[11px] text-blue-100">온라인 상태</p>
            </div>
          </div>
          {/* 닫기 버튼 */}
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-full hover:bg-blue-700 transition-colors"
            aria-label="채팅창 닫기"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* 말풍선 대화 영역 */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.sender === "bot" && (
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-2 shrink-0 text-xs font-bold">
                  AI
                </div>
              )}
              <div
                className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-blue-600 text-white rounded-tr-none"
                    : "bg-white text-gray-800 border border-gray-100 rounded-tl-none shadow-sm"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* 질문 추천 버튼 영역 */}
        <div className="p-3 bg-white border-t border-gray-100 shrink-0">
          <p className="text-xs text-gray-400 mb-2 pl-1">자주 묻는 질문</p>
          <div className="flex flex-col gap-1.5 max-h-[140px] overflow-y-auto pr-1">
            {chatData.map((item, index) => (
              <button
                key={index}
                onClick={() => handleQuestionClick(item.question, item.answer)}
                className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 text-gray-700 text-xs rounded-xl border border-gray-100 transition-colors truncate"
              >
                {item.question}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 플로팅 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-xl hover:bg-blue-700 transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
        aria-label="챗봇 열기"
      >
        {isOpen ? (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        ) : (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        )}
      </button>
    </div>
  );
}
