"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Send, History, X, Home, LogOut, FileUp, Sun, Moon, Search, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import ChatBubble from "./components/ChatBubble";
import SkeletonLoader from "./components/SkeletonLoader";
import SuggestedQuestions from "./components/SuggestedQuestions";
import TypingIndicator from "./components/TypingIndicator";
import { useTheme } from "../../../contexts/ThemeContext";
import "./styles.css";

export default function AskPage() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi 👋! Ask me anything about your documents.", sources: [] },
  ]);
  const [chatHistory, setChatHistory] = useState([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState("searching");
  const [listening, setListening] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const recognitionRef = useRef(null);
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  // Load user & token from localStorage
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const storedToken = localStorage.getItem("token");
    const storedBookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]");
    if (!storedUser || !storedToken) {
      router.push("/login");
    } else {
      setUser(storedUser);
      setToken(storedToken);
      setBookmarks(storedBookmarks);
    }
  }, [router]);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Fetch chat history from backend
  useEffect(() => {
    if (user && token) {
      fetch(`http://127.0.0.1:8000/api/chats/${user.username}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.chats) {
            // Sort by timestamp (most recent first) and limit to 20
            const sortedChats = data.chats
              .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
              .slice(0, 20);
            setChatHistory(sortedChats);
          }
        })
        .catch((err) => console.error("Error loading history:", err));
    }
  }, [user, token]);

  // Load selected chat into main chat window
  const loadChat = (chat) => {
    const formatted = [
      { sender: "user", text: chat.question },
      { sender: "bot", text: chat.answer, sources: chat.sources || [] },
    ];
    setMessages([
      { sender: "bot", text: "Hi 👋! Ask me anything about your documents.", sources: [] },
      ...formatted,
    ]);
    setShowHistory(false);
  };

  // Initialize SpeechRecognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onstart = () => setListening(true);
        recognition.onend = () => setListening(false);

        recognition.onresult = (event) => {
          let transcript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          setQuestion(transcript);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  // Detect scroll position to show/hide scroll-to-top button
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setShowScrollTop(container.scrollTop > 300);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  const handleAsk = async (customQuestion = null) => {
    const q = customQuestion || question;
    if (!q.trim() || !user || !token) return;

    // Check if it's a greeting - handle in frontend
    const lowerQ = q.toLowerCase().trim();
    const greetings = [
      'hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening',
      'aslamwalekum', 'salam', 'salaam', 'namaste', 'namaskar',
      'kaise ho', 'how are you', "what's up", 'kya haal hai', 'sup'
    ];

    const isGreeting = greetings.some(greeting => {
      const words = lowerQ.split(/\s+/);
      return words.includes(greeting) || lowerQ === greeting;
    });

    if (isGreeting) {
      // Handle greeting in frontend without API call
      const userMessage = { sender: "user", text: q, timestamp: new Date().toISOString() };
      const greetingResponses = [
        "Hello! 👋 How can I assist you today? Feel free to ask me anything about your documents!",
        "Hi there! 😊 I'm here to help. What would you like to know about your documents?",
        "Hey! 🤖 Great to see you! Ask me anything about your uploaded documents.",
        "Hello! How can I help you explore your documents today?",
        "Hi! 👋 I'm your AI assistant. What questions do you have about your documents?"
      ];
      
      const randomResponse = greetingResponses[Math.floor(Math.random() * greetingResponses.length)];
      const botMessage = { 
        sender: "bot", 
        text: randomResponse, 
        sources: [], 
        timestamp: new Date().toISOString() 
      };

      setMessages([...messages, userMessage, botMessage]);
      setQuestion("");
      return; // Don't call API for greetings
    }

    // Not a greeting - proceed with normal RAG flow
    setLoading(true);
    setIsTyping(true);
    setLoadingStage("searching");

    const newMessages = [...messages, { sender: "user", text: q, timestamp: new Date().toISOString() }];
    setMessages(newMessages);
    setQuestion("");

    // Simulate stage progression
    setTimeout(() => setLoadingStage("thinking"), 1500);

    try {
      const res = await fetch(`http://127.0.0.1:8000/ask/${user.username}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ question: q, top_k: 3 }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Fetch failed: ${res.status} ${errText}`);
      }

      const data = await res.json();

      // Parse sources from response (if available)
      const sources = data.sources || [];

      setMessages([
        ...newMessages,
        {
          sender: "bot",
          text: data.answer || "Sorry, I couldn't find an answer.",
          sources: sources,
          timestamp: new Date().toISOString(),
        },
      ]);

      // Add to sidebar history
      setChatHistory((prev) => [
        ...prev,
        { question: q, answer: data.answer, sources, timestamp: new Date().toISOString() },
      ]);
    } catch (err) {
      console.error(err);
      setMessages([
        ...newMessages,
        { sender: "bot", text: "⚠️ Error: Could not fetch answer.", sources: [], timestamp: new Date().toISOString() },
      ]);
    } finally {
      setLoading(false);
      setIsTyping(false);
    }
  };

  // Handle suggested question selection
  const handleSuggestionSelect = (q) => {
    handleAsk(q);
  };

  // Start/Stop voice recognition
  const handleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition not supported in this browser.");
      return;
    }
    if (listening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    router.push("/login");
  };

  const handleNewChat = () => {
    setMessages([
      { sender: "bot", text: "Hi 👋! Ask me anything about your documents.", sources: [] },
    ]);
  };

  const scrollToTop = () => {
    chatContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Toggle bookmark for a message
  const toggleBookmark = (index) => {
    const newBookmarks = bookmarks.includes(index)
      ? bookmarks.filter(i => i !== index)
      : [...bookmarks, index];
    setBookmarks(newBookmarks);
    localStorage.setItem("bookmarks", JSON.stringify(newBookmarks));
  };

  // Filter messages by search query
  const filteredHistory = chatHistory.filter(chat =>
    chat.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Check if chat is empty (only welcome message)
  const isChatEmpty = messages.length === 1;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#0F172A] via-gray-900 to-[#0F172A] text-white relative flex-col">
      {/* Top Navigation */}
      <div className="sticky top-0 z-50 w-full flex flex-col sm:flex-row justify-between items-center px-3 sm:px-6 py-3 sm:py-4 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700/50 shadow-lg gap-2 sm:gap-0">
        {/* Left side */}
        <div className="flex space-x-3">
          <button
            onClick={() => router.push("/")}
            className="flex items-center space-x-1 bg-gray-700/50 hover:bg-gray-600 px-2 sm:px-3 py-2 rounded-lg transition-colors text-sm"
          >
            <Home className="w-4 h-4 sm:w-5 sm:h-5 text-purple-300" />
            <span className="hidden sm:inline text-sm text-purple-300">Home</span>
          </button>
          <button
            onClick={() => router.push(`/upload/${user?.username}`)}
            className="flex items-center space-x-1 bg-gray-700/50 hover:bg-gray-600 px-2 sm:px-3 py-2 rounded-lg transition-colors text-sm"
          >
            <FileUp className="w-4 h-4 sm:w-5 sm:h-5 text-purple-300" />
            <span className="hidden sm:inline text-sm text-purple-300">Upload</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-1 bg-red-600/80 hover:bg-red-700 px-2 sm:px-3 py-2 rounded-lg transition-colors text-sm"
          >
            <LogOut className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            <span className="hidden sm:inline text-sm text-white">Logout</span>
          </button>
        </div>

        {/* Center heading */}
        <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          AI Chatbot
        </h1>

        {/* Right side */}
        <div className="flex space-x-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center space-x-1 bg-gray-700/50 hover:bg-gray-600 px-2 sm:px-3 py-2 rounded-lg transition-colors"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />}
          </button>
          <button
            onClick={handleNewChat}
            className="flex items-center space-x-1 bg-purple-600/80 hover:bg-purple-700 px-2 sm:px-3 py-2 rounded-lg transition-colors text-sm"
          >
            <span className="text-xs sm:text-sm text-white">+ New</span>
          </button>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center space-x-1 sm:space-x-2 bg-gray-700/50 hover:bg-gray-600 px-2 sm:px-3 py-2 rounded-lg transition-colors text-sm"
          >
            <History className="w-4 h-4 sm:w-5 sm:h-5 text-purple-300" />
            <span className="hidden sm:inline text-sm text-purple-300">History</span>
          </button>
        </div>
      </div>

      {/* Main Content Area with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main chat area */}
        <div className={`flex-1 flex flex-col items-center justify-center p-2 sm:p-4 md:p-6 transition-all duration-300 ${showHistory ? 'mr-0 sm:mr-80 md:mr-72' : ''}`}>
        <div className="w-full max-w-4xl flex flex-col bg-gray-900/60 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-2xl border border-gray-700/40 p-3 sm:p-4 md:p-6 h-[85vh] relative">
          {/* Chat window */}
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2 custom-scrollbar">
            {/* Suggested Questions when chat is empty */}
            {isChatEmpty && (
              <SuggestedQuestions onSelect={handleSuggestionSelect} />
            )}

            {/* Chat Messages */}
            {messages.map((msg, idx) => (
              <ChatBubble
                key={idx}
                message={msg.text}
                isUser={msg.sender === "user"}
                sources={msg.sources || []}
                timestamp={msg.timestamp}
                isBookmarked={bookmarks.includes(idx)}
                onToggleBookmark={toggleBookmark}
                messageIndex={idx}
              />
            ))}

            {/* Typing Indicator */}
            {isTyping && <TypingIndicator />}

            <div ref={chatEndRef} />
          </div>

          {/* Scroll to Top Button */}
          {showScrollTop && (
            <button
              onClick={scrollToTop}
              className="absolute bottom-24 right-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 z-10"
              title="Scroll to top"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 10l7-7m0 0l7 7m-7-7v18"
                />
              </svg>
            </button>
          )}

          {/* Input box */}
          <div className="flex items-center space-x-2 bg-gray-800/50 rounded-xl p-2 border border-gray-700/50">
            <input
              type="text"
              className="flex-1 p-3 bg-transparent text-white placeholder-gray-500 focus:outline-none"
              placeholder="Type or speak your question..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAsk()}
            />
            <button
              onClick={handleVoiceInput}
              className={`p-3 rounded-xl transition-colors ${
                listening
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-gray-700 hover:bg-gray-600"
              }`}
            >
              {listening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            <button
              onClick={() => handleAsk()}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-xl disabled:bg-gray-600 transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
        </div>

        {/* Sidebar (History) - Fixed positioning on larger screens */}
        {showHistory && (
          <div className="w-full sm:w-80 md:w-72 bg-gray-900/95 backdrop-blur-sm p-3 sm:p-4 border-l border-gray-700/50 overflow-y-auto fixed sm:absolute right-0 top-0 h-full z-20 shadow-2xl">
            <div className="flex justify-between items-center mb-4 mt-16">
              <h2 className="text-lg font-bold text-purple-400">Chat History</h2>
              <button onClick={() => setShowHistory(false)} className="hover:bg-gray-700 p-1 rounded">
                <X className="w-5 h-5 text-purple-400" />
              </button>
            </div>
            
            {/* Search bar */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            
            {/* Bookmark filter toggle */}
            <button
              onClick={() => setShowBookmarks(!showBookmarks)}
              className={`mb-3 px-3 py-1.5 rounded-lg text-xs transition-colors ${showBookmarks ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-800/50 text-gray-400'}`}
            >
              <Star className="w-3 h-3 inline mr-1" />
              {showBookmarks ? 'All Messages' : 'Bookmarked'}
            </button>
            
            <ul className="space-y-2">
              {filteredHistory.length === 0 ? (
                <li className="text-gray-500 text-sm text-center py-4">No chat history yet</li>
              ) : (
                filteredHistory.map((chat, idx) => (
                  <li
                    key={idx}
                    onClick={() => loadChat(chat)}
                    className="p-3 bg-gray-800/50 rounded-lg cursor-pointer hover:bg-gray-700/50 transition-colors border border-gray-700/30"
                  >
                    <p className="text-sm text-purple-300 truncate">{chat.question}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(chat.timestamp).toLocaleString()}
                    </p>
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
