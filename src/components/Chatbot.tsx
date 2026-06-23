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
      text: "안녕하세요! 성남시봇입니다. 아래 질문 버튼을 클릭하거나 직접 질문을 입력하시면 답변해 드리겠습니다.",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 자동 스크롤
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isLoading]);

  // 버튼형 고정 답변 처리
  const handleQuestionClick = (question: string, answer: string) => {
    const userMessageId = `user-${Date.now()}`;
    const botMessageId = `bot-${Date.now()}`;

    setMessages((prev) => [
      ...prev,
      { id: userMessageId, sender: "user", text: question },
    ]);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: botMessageId, sender: "bot", text: answer },
      ]);
    }, 400);
  };

  // 실시간 AI 답변 호출 함수
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userText = inputValue;
    const userMessageId = `user-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: userMessageId, sender: "user", text: userText },
    ]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userText }),
      });

      if (!response.ok) {
        throw new Error("서버와의 통신이 실패했습니다.");
      }

      const data = await response.json();
      const botMessageId = `bot-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        {
          id: botMessageId,
          sender: "bot",
          text: data.response || "죄송합니다. 답변을 생성하지 못했습니다.",
        },
      ]);
    } catch (error: any) {
      const botMessageId = `bot-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        {
          id: botMessageId,
          sender: "bot",
          text: `오류가 발생했습니다: ${error.message || "알 수 없는 에러"}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
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
        <div className="bg-orange-500 text-white px-4 py-4 flex justify-between items-center shrink-0">
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse"></div>
            <div>
              <h3 className="font-bold text-sm">성남시봇</h3>
              <p className="text-[11px] text-orange-100">온라인 상태</p>
            </div>
          </div>
          {/* 닫기 버튼 */}
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-full hover:bg-orange-600 transition-colors"
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
                <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mr-2 shrink-0 text-xs font-bold">
                  봇
                </div>
              )}
              <div
                className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-orange-500 text-white rounded-tr-none"
                    : "bg-white text-gray-800 border border-gray-100 rounded-tl-none shadow-sm"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {/* 로딩 스피너 */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mr-2 shrink-0 text-xs font-bold">
                봇
              </div>
              <div className="bg-white text-gray-800 border border-gray-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center space-x-1">
                <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 질문 추천 버튼 영역 */}
        <div className="p-3 bg-white border-t border-gray-100 shrink-0">
          <p className="text-xs text-gray-400 mb-1.5 pl-1">자주 묻는 질문</p>
          <div className="flex flex-wrap gap-1.5 max-h-[85px] overflow-y-auto pr-1">
            {chatData.map((item, index) => (
              <button
                key={index}
                onClick={() => handleQuestionClick(item.question, item.answer)}
                className="px-2.5 py-1 bg-gray-50 hover:bg-orange-50 hover:text-orange-600 text-gray-700 text-[11px] rounded-lg border border-gray-100 transition-colors shrink-0 max-w-full truncate"
              >
                {item.question}
              </button>
            ))}
          </div>
        </div>

        {/* 메시지 직접 입력창 */}
        <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-100 flex gap-2 shrink-0">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="성남시봇에게 물어보세요..."
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 disabled:bg-gray-50 disabled:text-gray-400"
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="px-4 py-2 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 active:scale-95 disabled:bg-gray-200 disabled:text-gray-400 transition-all cursor-pointer"
          >
            전송
          </button>
        </form>
      </div>

      {/* 플로팅 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 cursor-pointer overflow-hidden border-2 border-orange-500 bg-white transition-all duration-300"
        aria-label="챗봇 열기"
      >
        <img
          src="/chatbot-button.jpg"
          alt="성남시봇 열기"
          className="w-full h-full object-cover"
        />
      </button>
    </div>
  );
}
