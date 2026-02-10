
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Message, ChatSession } from './types';

const SYSTEM_INSTRUCTION = "You are Mr.Billu, a cool, friendly, and smart 18-year-old boy. Talk naturally and warmly. You are fluent in both Bengali (Bangla) and English. If the user speaks in Bengali, respond in Bengali. If the user speaks in English, respond in English. Be helpful and empathetic. You are a friend. Never mention you are an AI. If asked about your owner, creator, developer, or who made you, answer that you were created by Developer Bellal Hasan and ALWAYS append the marker [DEVELOPER_CARD] at the end of your message.";

const STORAGE_KEY = 'billu_chat_sessions_v7';
const THEME_KEY = 'billu_theme_pref';

// Custom Visual Logo Component
const BilluLogo = ({ className = "w-10 h-10" }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="48" fill="url(#grad1)" />
    <path d="M30 45C30 45 35 40 50 40C65 40 70 45 70 45" stroke="white" strokeWidth="6" strokeLinecap="round" />
    <circle cx="35" cy="55" r="5" fill="white" />
    <circle cx="65" cy="55" r="5" fill="white" />
    <path d="M40 75C40 75 45 82 50 82C55 82 60 75 60 75" stroke="white" strokeWidth="4" strokeLinecap="round" />
    <defs>
      <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#4F46E5', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#7C3AED', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
  </svg>
);

const DeveloperCard = () => (
  <div className="mt-4 p-5 bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/10 rounded-2xl shadow-xl animate-slide-up max-w-sm w-full overflow-hidden">
    <div className="flex items-center gap-4 mb-5">
      <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center shadow-lg text-white font-bold text-sm">BH</div>
      <div>
        <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">Developer Bellal Hasan</h3>
        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Creator of Mr.Billu</p>
      </div>
    </div>
    
    <div className="space-y-2">
      <a href="https://www.facebook.com/Bellal214399" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-xl transition-all group">
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          <span className="text-xs font-bold text-blue-700 dark:text-blue-400">Facebook</span>
        </div>
        <span className="text-[10px] font-bold text-blue-400 group-hover:translate-x-1 transition-transform">Contact now →</span>
      </a>

      <a href="https://wa.me/8801604064675" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-xl transition-all group">
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.672 1.433 5.661 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">WhatsApp</span>
        </div>
        <span className="text-[10px] font-bold text-emerald-400 group-hover:translate-x-1 transition-transform">Contact now →</span>
      </a>

      <a href="https://t.me/Prime_Bellal" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 bg-sky-50 dark:bg-sky-900/20 hover:bg-sky-100 dark:hover:bg-sky-900/30 rounded-xl transition-all group">
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 text-sky-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.14-.24.24-.43.24l.2-2.82 5.127-4.632c.223-.198-.048-.307-.346-.11l-6.338 3.99-2.73-.853c-.594-.185-.605-.594.124-.878l10.682-4.116c.495-.18.93.118.78.878z"/></svg>
          <span className="text-xs font-bold text-sky-700 dark:text-sky-400">Telegram</span>
        </div>
        <span className="text-[10px] font-bold text-sky-400 group-hover:translate-x-1 transition-transform">Contact now →</span>
      </a>
    </div>
  </div>
);

const App: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  
  const chatRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const createNewChat = useCallback(() => {
    const newId = Date.now().toString();
    const newSession: ChatSession = {
      id: newId,
      title: 'New Chat',
      messages: [],
      updatedAt: Date.now(),
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newId);
    setIsSidebarOpen(false);
    return newId;
  }, []);

  // Initialize Theme and Sessions
  useEffect(() => {
    const splashTimer = setTimeout(() => setShowSplash(false), 2500);

    const savedTheme = localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldShowDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    setIsDarkMode(shouldShowDark);
    if (shouldShowDark) document.documentElement.classList.add('dark');

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setSessions(JSON.parse(saved));
    }
    
    // Always start with a new empty chat on load
    // This empty session won't be saved unless a message is sent.
    createNewChat();

    return () => clearTimeout(splashTimer);
  }, [createNewChat]);

  // Persist sessions - only save those with at least one message
  useEffect(() => {
    const sessionsWithMessages = sessions.filter(s => s.messages.length > 0);
    if (sessionsWithMessages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionsWithMessages));
    }
  }, [sessions]);

  const toggleTheme = () => {
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(THEME_KEY, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(THEME_KEY, 'light');
    }
  };

  const currentSession = sessions.find(s => s.id === currentSessionId);
  const messages = currentSession?.messages || [];

  const getAi = useCallback(() => {
    return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }, []);

  const initChat = useCallback(() => {
    const ai = getAi();
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });
    chatRef.current = chat;
  }, [getAi]);

  useEffect(() => {
    initChat();
  }, [currentSessionId, initChat]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isLoading]);

  const handleSendMessage = async () => {
    const content = inputValue.trim();
    if (!content || !currentSessionId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content,
      timestamp: Date.now(),
    };

    setSessions(prev => prev.map(s => {
      if (s.id === currentSessionId) {
        const isFirstUserMessage = s.messages.filter(m => m.role === 'user').length === 0;
        return {
          ...s,
          title: isFirstUserMessage ? (content.length > 25 ? content.substring(0, 25) + '...' : content) : s.title,
          messages: [...s.messages, userMessage],
          updatedAt: Date.now()
        };
      }
      return s;
    }));

    setInputValue('');
    setIsLoading(true);

    try {
      if (!chatRef.current) initChat();
      const response = await chatRef.current.sendMessage({ message: content });
      const responseText = response.text || '';

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: responseText,
        timestamp: Date.now(),
      };

      setSessions(prev => prev.map(s => {
        if (s.id === currentSessionId) {
          return {
            ...s,
            messages: [...s.messages, aiMessage],
            updatedAt: Date.now()
          };
        }
        return s;
      }));
    } catch (error) {
      console.error("Chat Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectSession = (id: string) => {
    setCurrentSessionId(id);
    setIsSidebarOpen(false);
  };

  const deleteSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    if (id === currentSessionId) {
      if (updated.length > 0) {
        setCurrentSessionId(updated[0].id);
      } else {
        createNewChat();
      }
    }
  };

  if (showSplash) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white dark:bg-[#0d0d0d] transition-all duration-500">
        <div className="w-24 h-24 animate-pulse">
          <BilluLogo className="w-full h-full" />
        </div>
        <h1 className="mt-6 text-3xl font-black tracking-tighter text-gray-900 dark:text-white">Mr.Billu</h1>
        <div className="mt-10 flex gap-2">
          <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:0s]"></div>
          <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
          <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen w-full bg-white dark:bg-[#0d0d0d] relative overflow-hidden font-sans transition-colors duration-300`}>
      
      {/* Sidebar Drawer */}
      <div 
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsSidebarOpen(false)}
      />
      <aside className={`fixed left-0 top-0 bottom-0 w-[280px] bg-[#f7f7f7] dark:bg-[#121212] border-r border-gray-200 dark:border-white/10 z-50 sidebar-transition flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b border-gray-200 dark:border-white/5">
          <button 
            onClick={() => createNewChat()}
            className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl text-sm font-semibold text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/10 transition-all shadow-sm active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
              <span>New Chat</span>
            </div>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-hide">
          <p className="text-[10px] font-bold text-gray-400 dark:text-white/30 uppercase tracking-[0.2em] px-3 py-3">Saved History</p>
          {/* Only show sessions that have messages in history */}
          {sessions.filter(s => s.messages.length > 0).map(s => (
            <div 
              key={s.id}
              onClick={() => selectSession(s.id)}
              className={`group flex items-center justify-between px-3 py-3 rounded-lg cursor-pointer transition-all ${s.id === currentSessionId ? 'bg-black/5 dark:bg-white/10' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{s.title}</span>
              </div>
              <button 
                onClick={(e) => deleteSession(e, s.id)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          ))}
          {sessions.filter(s => s.messages.length > 0).length === 0 && (
            <p className="px-3 py-4 text-[11px] text-gray-400 dark:text-white/10 text-center font-medium italic">No conversations saved yet</p>
          )}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-white/5 space-y-3">
          <button 
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            {isDarkMode ? (
              <><svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" /></svg><span className="text-sm font-medium text-gray-700 dark:text-gray-300">Light Mode</span></>
            ) : (
              <><svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg><span className="text-sm font-medium text-gray-700">Dark Mode</span></>
            )}
          </button>
          <div className="flex items-center gap-3 px-3">
            <BilluLogo className="w-8 h-8" />
            <div className="flex-1">
              <p className="text-[11px] font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide">Mr.Billu AI</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#0d0d0d] relative transition-colors duration-300">
        
        {/* Navigation Bar */}
        <header className="h-[72px] flex items-center justify-between px-6 border-b border-gray-100 dark:border-white/5 bg-white/80 dark:bg-[#0d0d0d]/80 backdrop-blur-xl sticky top-0 z-30">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-gray-500 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          
          <div className="flex items-center gap-2">
            <BilluLogo className="w-8 h-8" />
            <h1 className="font-extrabold text-xl text-gray-900 dark:text-white tracking-tighter">Mr.Billu</h1>
          </div>

          <div className="w-10"></div>
        </header>

        {/* Chat Messages */}
        <main 
          ref={scrollRef}
          className="flex-1 overflow-y-auto scrollbar-hide flex flex-col"
        >
          <div className="max-w-3xl w-full mx-auto px-4 sm:px-8 py-8 flex-1 flex flex-col">
            {messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center animate-slide-up">
                <BilluLogo className="w-24 h-24 mb-6 shadow-2xl shadow-indigo-500/10 rounded-full" />
                <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Mr.Billu</h2>
                <p className="mt-3 text-gray-400 dark:text-white/20 font-bold uppercase tracking-[0.4em] text-[10px]">Your Bilingual Friend</p>
              </div>
            ) : (
              <div className="space-y-10">
                {messages.map((msg) => {
                  const hasCard = msg.role === 'model' && msg.content.includes('[DEVELOPER_CARD]');
                  const cleanContent = msg.content.replace('[DEVELOPER_CARD]', '').trim();

                  return (
                    <div 
                      key={msg.id} 
                      className={`flex gap-5 group animate-slide-up ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      {msg.role === 'model' && (
                        <div className="w-11 h-11 flex-shrink-0 mt-1">
                          <BilluLogo className="w-full h-full drop-shadow-lg" />
                        </div>
                      )}
                      <div className={`relative max-w-[85%] sm:max-w-[75%] ${msg.role === 'user' ? 'bg-[#f4f4f4] dark:bg-[#2f2f2f] px-6 py-4 rounded-[1.8rem] rounded-tr-[0.4rem]' : 'px-1 py-2'}`}>
                        <p className="text-[16px] md:text-[17px] leading-[1.65] text-gray-800 dark:text-gray-100 whitespace-pre-wrap font-medium">
                          {cleanContent}
                        </p>
                        {hasCard && <DeveloperCard />}
                      </div>
                      {msg.role === 'user' && (
                        <div className="w-10 h-10 rounded-full bg-black dark:bg-white flex-shrink-0 flex items-center justify-center border border-gray-200 dark:border-white/10 shadow-md mt-1">
                          <svg className="w-5 h-5 text-white dark:text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {isLoading && (
              <div className="flex gap-5 justify-start animate-slide-up mt-10">
                <div className="w-11 h-11 flex-shrink-0 mt-1 opacity-50">
                  <BilluLogo className="w-full h-full" />
                </div>
                <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-white/5 px-6 py-4 rounded-3xl border border-gray-100 dark:border-white/5">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-duration:0.8s]"></div>
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Action Area */}
        <footer className="p-4 sm:p-6 bg-white dark:bg-[#0d0d0d] transition-colors duration-300">
          <div className="max-w-3xl mx-auto flex flex-col items-center">
            <div className="w-full relative flex items-center bg-white dark:bg-[#212121] border border-gray-200 dark:border-white/10 rounded-[2.2rem] focus-within:border-gray-400 dark:focus-within:border-white/20 transition-all px-5 py-2">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Talk to Mr.Billu..."
                className="flex-1 bg-transparent border-none text-black dark:text-white placeholder-gray-400 dark:placeholder-white/20 outline-none resize-none max-h-48 min-h-[3.5rem] py-4 text-[17px] font-medium scrollbar-hide"
                rows={1}
              />
              <button 
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className={`ml-3 w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  inputValue.trim() && !isLoading
                    ? 'bg-black dark:bg-white text-white dark:text-black hover:scale-105 active:scale-90 shadow-xl' 
                    : 'bg-gray-100 dark:bg-white/5 text-gray-300 dark:text-white/10 scale-90 cursor-not-allowed'
                }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            
            <div className="mt-4 flex flex-col items-center gap-1 opacity-20 hover:opacity-100 transition-opacity">
              <p className="text-[6px] font-black text-gray-500 dark:text-white uppercase tracking-[0.6em] text-center">
                powered by Developer Bellal Hasan
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;
