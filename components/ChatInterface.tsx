
import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { ChatMessage } from '../types';
import { streamChatResponse } from '../services/geminiService';

export const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: "Salam! Mən sizin interyer dizayn köməkçinizəm. Təmir, materiallar, büdcə və ya dizayn üslubları haqqında suallarınızı verə bilərsiniz." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => scrollToBottom(), [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      setMessages(prev => [...prev, { role: 'model', text: '' }]);
      let fullText = '';
      await streamChatResponse(messages, userMsg.text, (chunk) => {
        fullText += chunk;
        setMessages(prev => {
          const newHistory = [...prev];
          newHistory[newHistory.length - 1] = { role: 'model', text: fullText };
          return newHistory;
        });
      });
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "Xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.", isError: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto p-4 lg:p-6 w-full">
      <div className="flex-1 bg-slate-800 rounded-2xl border border-slate-700 shadow-xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-700 bg-slate-800/50 backdrop-blur flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-500/20 rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6 text-teal-400" />
          </div>
          <div>
            <h2 className="font-bold text-white">Podmayak AI Asistent</h2>
            <p className="text-xs text-slate-400">Professional interyer məsləhətçisi</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-700">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${msg.role === 'user' ? 'bg-indigo-600' : 'bg-teal-600'}`}>
                {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
              </div>
              <div className={`max-w-[80%] rounded-2xl p-4 ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : msg.isError ? 'bg-red-900/50 border border-red-800 text-red-200 rounded-tl-none' : 'bg-slate-700/50 text-slate-200 rounded-tl-none'}`}>
                <div className="prose prose-invert prose-sm max-w-none"><ReactMarkdown>{msg.text}</ReactMarkdown></div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-slate-900 border-t border-slate-700">
          <div className="relative flex items-end gap-2 bg-slate-800 rounded-xl border border-slate-700 focus-within:border-teal-500 transition-colors p-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Təmir, qiymətlər və ya dizayn barədə soruşun..."
              className="w-full bg-transparent border-none text-slate-200 placeholder-slate-500 focus:ring-0 resize-none max-h-32 py-3 px-2"
              rows={1}
              style={{ minHeight: '44px' }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className={`p-3 rounded-lg mb-0.5 transition-all ${input.trim() && !isLoading ? 'bg-teal-600 text-white hover:bg-teal-500 shadow-lg shadow-teal-500/20' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
