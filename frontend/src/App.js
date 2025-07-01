import React, { useState, useEffect } from 'react';

// --- STYLES OBJECT (LIGHT THEME) ---
const styles = {
  appContainer: { fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif", minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', padding: '2rem', color: '#333' },
  container: { maxWidth: '800px', margin: '0 auto' },
  header: { textAlign: 'center', marginBottom: '2.5rem' },
  headerH1: { fontSize: '2.8rem', fontWeight: 'bold', color: '#2c3e50', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  headerIcon: { height: '2.8rem', width: '2.8rem', marginRight: '1rem', color: '#4f46e5' },
  headerP: { fontSize: '1.1rem', color: '#5a677d', marginTop: '0.5rem' },
  searchBox: { backgroundColor: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(10px)', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', border: '1px solid rgba(0, 0, 0, 0.05)' },
  form: { position: 'relative' },
  inputLabel: { display: 'flex', alignItems: 'center', fontWeight: '500', color: '#374151', marginBottom: '0.75rem' },
  inputLabelIcon: { height: '1.25rem', width: '1.25rem', marginRight: '0.5rem', color: '#4f46e5' },
  inputWrapper: { position: 'relative', width: '100%' },
  input: { width: '100%', padding: '1rem 8rem 1rem 1.5rem', fontSize: '1.1rem', border: '1px solid #d1d5db', borderRadius: '0.75rem', boxSizing: 'border-box', transition: 'box-shadow 0.3s, border-color 0.3s' },
  submitButton: { position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', background: 'linear-gradient(to right, #4f46e5, #6366f1)', color: 'white', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', boxShadow: '0 4px 6px rgba(79, 70, 229, 0.2)', transition: 'transform 0.2s, box-shadow 0.2s' },
  submitButtonDisabled: { opacity: 0.7, cursor: 'not-allowed', boxShadow: 'none' },
  fileInputContainer: { marginTop: '1rem', border: '2px dashed #d1d5db', borderRadius: '0.75rem', padding: '1rem', textAlign: 'center' },
  fileInputLabel: { cursor: 'pointer', color: '#4f46e5', fontWeight: '500' },
  fileName: { marginLeft: '1rem', fontStyle: 'italic', color: '#374151' },
  uploadStatusContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '0.5rem' },
  uploadStatus: { fontSize: '0.9rem', fontWeight: '500' },
  clearButton: { marginLeft: '1rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '0.5rem', padding: '0.25rem 0.75rem', fontSize: '0.8rem', cursor: 'pointer' },
  spinner: { width: '1rem', height: '1rem', border: '2px solid rgba(255,255,255,0.3)', borderLeftColor: '#ffffff', borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite', marginRight: '0.5rem' },
  resultsSection: { marginTop: '2.5rem' },
  faqSection: { marginTop: '1.5rem', padding: '1.5rem', backgroundColor: 'rgba(255, 255, 255, 0.5)', borderRadius: '1rem' },
  faqTitle: { fontSize: '1.25rem', fontWeight: '600', color: '#2c3e50', marginBottom: '1rem', textAlign: 'center' },
  faqGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  faqButton: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    padding: '0.75rem',
    borderRadius: '0.5rem',
    textAlign: 'left',
    cursor: 'pointer',
    fontSize: '0.95rem',
    color: '#374151',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  answerCard: { backgroundColor: '#ffffff', padding: '2rem', borderRadius: '1rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.07), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', animation: 'fadeIn 0.5s ease-out' },
  answerCardH2: { fontSize: '1.75rem', fontWeight: '700', color: '#2c3e50', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center' },
  answerText: { fontSize: '1.05rem', lineHeight: '1.7', whiteSpace: 'pre-wrap', color: '#34495e' },
  sourcesContainer: { marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #eef2f7' },
  sourcesHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' },
  sourcesContainerH3: { fontSize: '1.25rem', fontWeight: '600', color: '#1a202c', margin: '0' },
  accordionToggle: { fontSize: '1.5rem', color: '#4a5568', transition: 'transform 0.3s ease' },
  accordionToggleOpen: { transform: 'rotate(180deg)' },
  sourcesContent: { marginTop: '1rem' },
  sourceCard: { backgroundColor: '#f8f9fa', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '0.75rem', marginTop: '0.75rem' },
  sourceCardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' },
  sourceCardTitle: { margin: '0', fontSize: '1rem', fontWeight: '600' },
  sourceCardScore: { fontSize: '0.9rem', fontWeight: '500', color: '#4f46e5' },
  sourceCardP: { margin: '0', fontFamily: "'Menlo', 'Monaco', 'Courier New', monospace", fontSize: '0.875rem', whiteSpace: 'pre-wrap', wordWrap: 'break-word', backgroundColor: '#ffffff', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' },
  errorBox: { backgroundColor: '#fee2e2', borderLeft: '4px solid #ef4444', color: '#991b1b', padding: '1rem', borderRadius: '0.5rem' },
};

const keyframesStyle = `@keyframes spin { to { transform: rotate(360deg); } } @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`;

const Spinner = () => <div style={styles.spinner}></div>;

const SourceCard = ({ title, score, content }) => (
  <div style={styles.sourceCard}>
    <div style={styles.sourceCardHeader}>
      <h4 style={styles.sourceCardTitle}>{title}</h4>
      <span style={styles.sourceCardScore}>Relevance: {(score * 100).toFixed(1)}%</span>
    </div>
    <p style={styles.sourceCardP}>{content}</p>
  </div>
);

const SourcesAccordion = ({ sources, uploadedFileName }) => {
  const [isOpen, setIsOpen] = useState(true); // Default to open
  if (!sources || sources.length === 0) return null;
  return (
    <div style={styles.sourcesContainer}>
      <div style={styles.sourcesHeader} onClick={() => setIsOpen(!isOpen)}>
        <h3 style={styles.sourcesContainerH3}>Sources</h3>
        <span style={{ ...styles.accordionToggle, ...(isOpen && styles.accordionToggleOpen) }}>▼</span>
      </div>
      {isOpen && (
        <div style={styles.sourcesContent}>
          {sources.map((src, i) => (
            <SourceCard 
              key={i} 
              title={`Source ${i + 1}: ${uploadedFileName || src.source}`} 
              score={src.score}
              content={src.content} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

const FormattedAnswer = ({ text }) => {
  const renderFormattedText = (inputText) => {
    const cleanText = inputText.replace(/\(Source: .*\.pdf\)/g, '').trim();
    const lines = cleanText.split('\n').filter(line => line.trim() !== '');
    const elements = [];
    let listItems = [];
    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(<ol key={`list-${elements.length}`} style={{ paddingLeft: '20px', listStyle: 'decimal', marginBottom: '1rem' }}>{listItems}</ol>);
        listItems = [];
      }
    };
    lines.forEach((line, index) => {
      const renderBold = (text) => {
        const parts = text.split(/(\*\*.*?\*\*)/g).filter(part => part);
        return parts.map((part, i) => {
          if (part.startsWith('**') && part.endsWith('**')) { return <strong key={i}>{part.slice(2, -2)}</strong>; }
          return part;
        });
      };
      const numberedListMatch = line.match(/^(\d+)\.\s+(.*)/);
      if (numberedListMatch) {
        const content = numberedListMatch[2];
        listItems.push(<li key={`item-${index}`} style={{ marginBottom: '0.75rem' }}>{renderBold(content)}</li>);
      } else {
        flushList();
        elements.push(<p key={`p-${index}`} style={{ marginBottom: '1rem' }}>{renderBold(line)}</p>);
      }
    });
    flushList();
    return <div>{elements}</div>;
  };
  return <div style={styles.answerText}>{renderFormattedText(text)}</div>;
};

// --- NEW FAQ COMPONENT ---
const FaqSection = ({ onQuestionClick }) => {
    const questions = [
        "How do I apply for leave?",
        "What is the process for getting a personal loan?",
        "What is the policy on using company assets?",
        "What should I do if I lose my ID card?"
    ];

    return (
        <div style={styles.faqSection}>
            <h3 style={styles.faqTitle}>Frequently Asked Questions</h3>
            <div style={styles.faqGrid}>
                {questions.map((q, i) => (
                    <button 
                        key={i} 
                        style={styles.faqButton}
                        onClick={() => onQuestionClick(q)}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        {q}
                    </button>
                ))}
            </div>
        </div>
    );
};


export default function App() {
  const [query, setQuery] = useState('');
  const [file, setFile] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('idle');
  const [answer, setAnswer] = useState('');
  const [sources, setSources] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = React.useRef(null);
  const formRef = React.useRef(null); // Ref for the form

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setUploadStatus('uploading');
    setError('');
    const newSessionId = crypto.randomUUID();
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('session_id', newSessionId);
    try {
      const response = await fetch('http://127.0.0.1:8000/process-file', { method: 'POST', body: formData });
      if (!response.ok) { const errData = await response.json(); throw new Error(errData.detail || 'Failed to process file.'); }
      const data = await response.json();
      setSessionId(data.session_id);
      setUploadStatus('success');
    } catch (err) {
      setError(err.message);
      setUploadStatus('error');
      setFile(null);
    }
  };

  const handleReset = () => {
    setFile(null);
    setSessionId(null);
    setUploadStatus('idle');
    setAnswer('');
    setSources([]);
    setError('');
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    if(e) e.preventDefault(); // Prevent default form submission if event is passed
    if (!query.trim()) return;

    setIsLoading(true);
    setAnswer('');
    setSources([]);
    setError('');
    const formData = new FormData();
    formData.append('question', query);
    if (sessionId) { formData.append('session_id', sessionId); }
    try {
      const response = await fetch('http://127.0.0.1:8000/ask', { method: 'POST', body: formData });
      if (!response.ok) { const errData = await response.json(); throw new Error(errData.detail || `API Error`); }
      const data = await response.json();
      setAnswer(data.answer);
      setSources(data.sources);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // New function to handle FAQ clicks
  const handleFaqClick = (question) => {
    setQuery(question);
  };

  // Use useEffect to submit the form when query is set by FAQ click
  useEffect(() => {
    // Check if the query was set by a click (and not by typing)
    // A simple way is to check if the query is one of the FAQ questions
    const faqQuestions = [
        "How do I apply for leave?",
        "What is the process for getting a personal loan?",
        "What is the policy on using company assets?",
        "What should I do if I lose my ID card?"
    ];
    if (faqQuestions.includes(query) && !isLoading) {
        handleSubmit();
    }
  }, [query]);

  const buttonStyle = isLoading ? { ...styles.submitButton, ...styles.submitButtonDisabled } : styles.submitButton;

  return (
    <div style={styles.appContainer}>
      <style>{keyframesStyle}</style>
      <div style={styles.container}>
        <header style={styles.header}>
          <h1 style={styles.headerH1}><svg style={styles.headerIcon} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>AI-Powered HR Assistant</h1>
          <p style={styles.headerP}>Your instant and reliable guide to company policies.</p>
        </header>

        <div style={styles.searchBox}>
          <form onSubmit={handleSubmit} ref={formRef}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={styles.inputLabel} htmlFor="question-input"><svg style={styles.inputLabelIcon} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>Ask a question</label>
              <div style={styles.inputWrapper}>
                <input id="question-input" type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="e.g., How do I apply for leave?" style={styles.input} disabled={isLoading} />
                <button type="submit" style={buttonStyle} disabled={isLoading}>{isLoading ? <Spinner /> : null}{isLoading ? 'Asking...' : 'Ask AI'}</button>
              </div>
            </div>
            
            <div style={styles.fileInputContainer}>
              <label style={styles.fileInputLabel} htmlFor="file-upload">
                {uploadStatus === 'uploading' ? 'Processing...' : 'Upload a custom document (optional)'}
              </label>
              <input id="file-upload" type="file" accept=".pdf" onChange={handleFileChange} style={{ display: 'none' }} disabled={uploadStatus === 'uploading'} ref={fileInputRef} />
            </div>
            {uploadStatus !== 'idle' && (
                <div style={styles.uploadStatusContainer}>
                    {uploadStatus === 'success' && <p style={{...styles.uploadStatus, color: 'green'}}>✅ Document "{file.name}" is ready.</p>}
                    {uploadStatus === 'error' && <p style={{...styles.uploadStatus, color: 'red'}}>❌ {error || 'File processing failed.'}</p>}
                    <button type="button" onClick={handleReset} style={styles.clearButton}>Clear</button>
                </div>
            )}
          </form>
        </div>

        <FaqSection onQuestionClick={handleFaqClick} />

        <div style={styles.resultsSection}>
          {isLoading && !answer && <div style={{paddingTop:'2rem'}}><div style={{...styles.spinner, margin:'auto', width:'3rem', height:'3rem'}}></div></div>}
          {error && <div style={styles.errorBox}>{error}</div>}
          
          {answer && (
            <div style={styles.answerCard}>
              <h2 style={styles.answerCardH2}><svg style={{...styles.inputLabelIcon, color: '#2c3e50'}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>Answer</h2>
              <FormattedAnswer text={answer} />
              <SourcesAccordion sources={sources} uploadedFileName={file ? file.name : null} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
