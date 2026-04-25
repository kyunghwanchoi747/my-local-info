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
    { type: "bot", text: "안녕하세요! 궁금하신 점을 선택하거나 직접 물어봐 주세요." }
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isHumanMode, setIsHumanMode] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 대화 추가 시 자동 스크롤
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // 상담원 모드일 때 2초마다 새 메시지 확인 (폴링)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isHumanMode && isOpen) {
      interval = setInterval(async () => {
        try {
          const response = await fetch("/api/chat-poll");
          const data = await response.json();
          
          if (data.messages && data.messages.length > 0) {
            // 관리자가 보낸 마지막 메시지 확인
            const adminMsgs = data.messages.filter((m: any) => m.sender === "admin");
            if (adminMsgs.length > 0) {
              const latestAdminMsg = adminMsgs[adminMsgs.length - 1].text;
              
              setMessages((prev) => {
                const lastMsg = prev[prev.length - 1];
                // 중복 표시 방지 (마지막 메시지와 다를 때만 추가)
                if (lastMsg.type === "user" || lastMsg.text !== latestAdminMsg) {
                  return [...prev, { type: "bot", text: latestAdminMsg }];
                }
                return prev;
              });
            }
          }
        } catch (e) {
          console.error("Polling error:", e);
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isHumanMode, isOpen]);

  const handleQuestionClick = (question: string, answer: string) => {
    const userMsg: Message = { type: "user", text: question };
    setMessages((prev) => [...prev, userMsg]);

    setTimeout(() => {
      const botMsg: Message = { type: "bot", text: answer };
      setMessages((prev) => [...prev, botMsg]);
    }, 500);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const userText = inputText.trim();
    setInputText("");
    const userMsg: Message = { type: "user", text: userText };
    setMessages((prev) => [...prev, userMsg]);

    if (isHumanMode) {
      // 상담원 모드: 메시지 저장 API 호출
      try {
        await fetch("/api/chat-human", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: userText, sender: "user" }),
        });
      } catch (e) {
        console.error("Human chat error:", e);
      }
      return;
    }

    // AI 모드: AI 답변 API 호출
    setIsLoading(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: userText }]
        }),
      });

      const data = await response.json();
      const botMsg: Message = { type: "bot", text: data.response || "죄송합니다. 답변을 생성하지 못했습니다." };
      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [...prev, { type: "bot", text: "오류가 발생했습니다. 잠시 후 다시 시도해 주세요." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* 채팅창 영역 */}
      {isOpen && (
        <div className="fixed inset-0 md:inset-auto md:bottom-20 md:right-0 w-full md:w-[360px] h-full md:h-[550px] bg-white md:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          {/* 헤더 */}
          <div className={`${isHumanMode ? "bg-orange-500" : "bg-blue-600"} p-4 text-white flex items-center justify-between transition-colors`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">
                {isHumanMode ? "🎧" : "🤖"}
              </div>
              <div>
                <h3 className="font-bold text-sm">{isHumanMode ? "상담원 연결됨" : "AI 상담원"}</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  <span className="text-xs text-white/80">온라인</span>
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
                    ? (isHumanMode ? "bg-orange-500" : "bg-blue-600") + " text-white rounded-2xl rounded-tr-none" 
                    : "bg-white text-gray-800 rounded-2xl rounded-tl-none border border-gray-100"
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start animate-in fade-in duration-300">
                <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 하단 영역 (질문 버튼 + 입력창) */}
          <div className="bg-white border-t border-gray-100">
            {!isHumanMode && (
              <div className="p-3 flex gap-2 overflow-x-auto scrollbar-hide border-b border-gray-50">
                <button
                  onClick={() => {
                    setIsHumanMode(true);
                    setMessages(prev => [...prev, { type: "bot", text: "상담원에게 연결 중입니다. 메시지를 남겨주시면 곧 답변해 드리겠습니다." }]);
                  }}
                  className="whitespace-nowrap text-xs bg-orange-50 hover:bg-orange-100 text-orange-600 px-3 py-2 rounded-full border border-orange-200 transition-all font-bold"
                >
                  🎧 상담원 연결
                </button>
                {chatData.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuestionClick(item.question, item.answer)}
                    className="whitespace-nowrap text-xs bg-gray-50 hover:bg-blue-50 hover:text-blue-600 text-gray-600 px-3 py-2 rounded-full border border-gray-200 transition-all"
                  >
                    {item.question}
                  </button>
                ))}
              </div>
            )}

            {/* 텍스트 입력창 */}
            <form onSubmit={handleSendMessage} className="p-3 flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={isHumanMode ? "상담원에게 메시지 보내기..." : "메시지를 입력하세요..."}
                className="flex-1 bg-gray-100 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className={`${isHumanMode ? "bg-orange-500 hover:bg-orange-600" : "bg-blue-600 hover:bg-blue-700"} text-white p-2 rounded-xl disabled:bg-gray-300 transition-colors`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 플로팅 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95 ${
          isOpen ? "bg-gray-100 text-gray-600" : (isHumanMode ? "bg-orange-500" : "bg-blue-600") + " text-white"
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
