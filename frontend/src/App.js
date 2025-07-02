import React, { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FileText, Upload, Send, Loader2, Sparkles, MessageSquare, FileUp, X } from 'lucide-react';

// PDF.js worker setup
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

// Modern Gradient Background Component
const GradientBackground = () => (
  <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50 opacity-60" />
);

// Enhanced Logo Component
const SmartHRLogo = () => (
  <div className="flex items-center gap-3">
    <div className="relative">
      <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
        <Sparkles className="w-6 h-6 text-white" />
      </div>
      <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white animate-pulse" />
    </div>
    <div>
      <h1 className="text-2xl font-bold text-white tracking-tight">SmartHR AI</h1>
      <div className="text-indigo-200 text-xs font-medium">Intelligent HR Assistant</div>
    </div>
  </div>
);

// FAQ Section Component
const FaqSection = ({ onQuestionClick, questions, title }) => {
  if (questions.length === 0) return null;

  return (
    <div className="mt-8 p-6 bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-indigo-600" />
        <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
      </div>
      <div className="grid gap-3">
        {questions.map((q, i) => (
          <button
            key={i}
            onClick={() => onQuestionClick(q)}
            className="group text-left p-4 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all duration-300 hover:scale-[1.02]"
          >
            <div className="text-slate-700 font-medium leading-relaxed group-hover:text-indigo-700 transition-colors">
              {q}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// Enhanced Chat Bubble Component
const ChatBubble = ({ item, isSelected, onClick }) => {
  const isQuestion = item.type === 'question';
  
  return (
    <div className={`flex mb-6 ${isQuestion ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] ${isQuestion ? 'cursor-pointer' : ''} transition-all duration-300`}
        onClick={onClick}
      >
        {isQuestion ? (
          <div
            className={`
              px-6 py-4 rounded-2xl rounded-br-md bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg
              ${isSelected ? 'ring-4 ring-indigo-300 ring-opacity-50 scale-[1.02]' : ''}
              hover:shadow-xl transition-all duration-300
            `}
          >
            <div className="font-medium leading-relaxed whitespace-pre-wrap">{item.text}</div>
          </div>
        ) : (
          <div className="px-6 py-4 bg-white rounded-2xl rounded-bl-md shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300">
            <div className="prose prose-slate max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  ul: ({ node, ...props }) => (
                    <ul className="list-disc list-outside pl-5 mt-3 space-y-2" {...props} />
                  ),
                  li: ({ node, ...props }) => (
                    <li className="text-slate-700 leading-relaxed" {...props} />
                  ),
                  strong: ({ node, ...props }) => (
                    <strong className="text-slate-900 font-semibold" {...props} />
                  ),
                  p: ({ node, ...props }) => (
                    <p className="text-slate-700 leading-relaxed mb-3 last:mb-0" {...props} />
                  ),
                }}
              >
                {item.text}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Loading Animation Component
const LoadingBubble = () => (
  <div className="flex justify-start mb-6">
    <div className="px-6 py-4 bg-white rounded-2xl rounded-bl-md shadow-lg border border-slate-200">
      <div className="flex items-center gap-3">
        <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
        <div className="text-slate-600 font-medium">Thinking...</div>
      </div>
    </div>
  </div>
);

export default function App() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState('main');

  const [mainChat, setMainChat] = useState({
    history: [],
    sessionId: null,
    activePdf: null,
    pdfFileName: '',
    highlightedPages: [],
    selectedQuestionIndex: null,
  });

  const [customChat, setCustomChat] = useState({
    history: [],
    sessionId: null,
    activePdf: null,
    pdfFileName: '',
    faqs: [],
    highlightedPages: [],
    selectedQuestionIndex: null,
  });

  const [numPages, setNumPages] = useState(null);
  const fileInputRef = useRef(null);
  const chatContainerRef = useRef(null);

  const isCustomMode = mode === 'custom';
  const currentChat = isCustomMode ? customChat : mainChat;
  const setCurrentChat = isCustomMode ? setCustomChat : setMainChat;

  const staticFaqs = [
    "What types of leaves do I have, and how many days are left?",
    "How do I report workplace harassment confidentially?",
    "Am I eligible for permanent WFH? How do I apply?",
    "How much maternity or paternity leave can I take?",
  ];

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [currentChat.history, isLoading]);

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setIsLoading(true);
    setError('');
    setCustomChat({
      history: [],
      faqs: [],
      sessionId: null,
      activePdf: null,
      pdfFileName: '',
      highlightedPages: [],
      selectedQuestionIndex: null,
    });

    const newSessionId = crypto.randomUUID();
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('session_id', newSessionId);

    try {
      await fetch('http://127.0.0.1:8000/process-file', {
        method: 'POST',
        body: formData,
      });

      const faqFormData = new FormData();
      faqFormData.append('session_id', newSessionId);
      const faqResponse = await fetch('http://127.0.0.1:8000/generate-faqs', {
        method: 'POST',
        body: faqFormData,
      });
      const faqData = await faqResponse.json();

      setCustomChat(prev => ({
        ...prev,
        sessionId: newSessionId,
        activePdf: URL.createObjectURL(selectedFile),
        pdfFileName: selectedFile.name,
        faqs: faqData.faqs || [],
      }));
      setMode('custom');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
      if (e.target) e.target.value = '';
    }
  };

  const endCustomChat = () => {
    setMode('main');
    setCustomChat({
      history: [],
      faqs: [],
      sessionId: null,
      activePdf: null,
      pdfFileName: '',
      highlightedPages: [],
      selectedQuestionIndex: null,
    });
  };

  const performQuery = async (questionToAsk) => {
    if (!questionToAsk.trim()) return;
    setIsLoading(true);
    setError('');

    const newQuestionIndex = currentChat.history.length;
    const newHistoryWithQuestion = [
      ...currentChat.history,
      { type: 'question', text: questionToAsk },
    ];
    setCurrentChat(prev => ({
      ...prev,
      history: newHistoryWithQuestion,
      selectedQuestionIndex: newQuestionIndex,
    }));

    const formData = new FormData();
    formData.append('question', questionToAsk);
    if (currentChat.sessionId) formData.append('session_id', currentChat.sessionId);

    try {
      const response = await fetch('http://127.0.0.1:8000/ask', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'API Error');
      }
      const data = await response.json();

      const pages = [...new Set(data.sources.map((s) => s.page))];
      const sourceFile = data.sources.length > 0 ? data.sources[0].source : currentChat.pdfFileName;
      const answerItem = {
        type: 'answer',
        text: data.answer,
        pages: pages,
        sourceFile: sourceFile,
      };

      setCurrentChat(prev => ({
        ...prev,
        history: [...prev.history, answerItem],
        highlightedPages: pages,
        pdfFileName: sourceFile,
        activePdf:
          sourceFile && sourceFile !== prev.pdfFileName && !isCustomMode
            ? `http://127.0.0.1:8000/static/${sourceFile}`
            : prev.activePdf,
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
      setQuery('');
    }
  };

  const handleHistoryClick = (index) => {
    if (currentChat.history[index]?.type === 'question') {
      const answerItem = currentChat.history[index + 1];
      if (answerItem && answerItem.type === 'answer') {
        const isUploadedFile =
          answerItem.sourceFile === currentChat.pdfFileName &&
          currentChat.activePdf?.startsWith('blob:');
        setCurrentChat(prev => ({
          ...prev,
          selectedQuestionIndex: index,
          highlightedPages: answerItem.pages || [],
          pdfFileName: answerItem.sourceFile || prev.pdfFileName,
          activePdf:
            answerItem.sourceFile &&
            answerItem.sourceFile !== prev.pdfFileName &&
            !isUploadedFile
              ? `http://127.0.0.1:8000/static/${answerItem.sourceFile}`
              : prev.activePdf,
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await performQuery(query);
  };

  const handleFaqClick = async (question) => {
    setQuery(question);
    await performQuery(question);
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50 font-inter">
      {/* Enhanced Header */}
      <header className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 shadow-2xl border-b border-indigo-500/20">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/90 via-purple-600/90 to-indigo-700/90" />
        <div className="relative px-8 py-6 flex justify-between items-center">
          <SmartHRLogo />
          {isCustomMode && (
            <button
              onClick={endCustomChat}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-xl border border-white/20 transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <X className="w-4 h-4" />
              <span className="font-medium">End Custom Chat</span>
            </button>
          )}
        </div>
        {isCustomMode && (
          <div className="px-8 pb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-100 rounded-full text-sm font-medium border border-emerald-400/30">
              <FileText className="w-4 h-4" />
              Custom Document Mode
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* PDF Panel */}
        <div className="flex-1 bg-gradient-to-br from-slate-100 to-slate-200 overflow-y-auto relative">
          <GradientBackground />
          <div className="relative z-10 p-8">
            {currentChat.activePdf ? (
              <Document
                file={currentChat.activePdf}
                onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                onLoadError={(err) => setError(`Failed to load PDF: ${err.message}`)}
                className="flex flex-col items-center gap-6"
              >
                {Array.from(new Array(numPages || 0), (el, index) => (
                  <div
                    key={`page_${index + 1}`}
                    className={`transition-all duration-500 ${
                      currentChat.highlightedPages.includes(index + 1)
                        ? 'ring-4 ring-indigo-400 ring-opacity-60 shadow-2xl scale-105'
                        : 'shadow-lg hover:shadow-xl'
                    } rounded-xl overflow-hidden bg-white`}
                  >
                    <Page pageNumber={index + 1} className="rounded-xl" />
                  </div>
                ))}
              </Document>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                <div className="w-32 h-32 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl flex items-center justify-center shadow-lg">
                  <FileText className="w-16 h-16 text-indigo-400" />
                </div>
                <div className="space-y-3">
                  <h2 className="text-3xl font-bold text-slate-800">Document Viewer</h2>
                  <p className="text-slate-600 text-lg max-w-md leading-relaxed">
                    Ask about company policies or upload a document to begin your AI-powered HR assistance.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chat Panel */}
        <div className="flex-1 flex flex-col bg-white shadow-2xl border-l border-slate-200">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-8" ref={chatContainerRef}>
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="text-red-800 font-medium">{error}</div>
              </div>
            )}

            {currentChat.history.map((item, index) => (
              <ChatBubble
                key={index}
                item={item}
                isSelected={currentChat.selectedQuestionIndex === index}
                onClick={item.type === 'question' ? () => handleHistoryClick(index) : undefined}
              />
            ))}

            {isLoading && <LoadingBubble />}

            {!isLoading && (
              <FaqSection
                onQuestionClick={handleFaqClick}
                questions={isCustomMode ? customChat.faqs || [] : staticFaqs}
                title={
                  isCustomMode
                    ? "Questions about your Document"
                    : "Frequently Asked Questions"
                }
              />
            )}
          </div>

          {/* Input Area */}
          <div className="p-6 bg-gradient-to-r from-slate-50 to-blue-50 border-t border-slate-200">
            <form onSubmit={handleSubmit} className="flex items-end gap-4">
              <div className="flex-1 relative">
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  placeholder={
                    isCustomMode
                      ? `Ask about ${currentChat.pdfFileName}...`
                      : "Ask about company policies..."
                  }
                  className="w-full p-4 pr-12 text-slate-800 bg-white rounded-2xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none shadow-sm transition-all duration-300 placeholder-slate-500"
                  disabled={isLoading}
                  rows={1}
                />
              </div>

              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="hidden"
                disabled={isLoading}
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="p-4 bg-white hover:bg-slate-50 border border-slate-300 hover:border-indigo-300 rounded-2xl transition-all duration-300 hover:scale-105 shadow-sm group"
                title="Upload custom PDF to start a new chat"
              >
                <FileUp className="w-5 h-5 text-slate-600 group-hover:text-indigo-600 transition-colors" />
              </button>

              <button
                type="submit"
                disabled={isLoading || !query.trim()}
                className="p-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-slate-300 disabled:to-slate-400 text-white rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg disabled:shadow-none disabled:scale-100"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}