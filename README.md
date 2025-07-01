# SmartHR - AI-Powered HR Assistant

**SmartHR** is an intelligent, full-stack chatbot application designed to answer employee questions about company HR policies. It leverages a **Retrieval-Augmented Generation (RAG)** architecture to provide accurate, context-aware answers from a knowledge base of HR documents.

The application features a **user-friendly web interface** where employees can:
- Ask questions in natural language
- Upload their own specific documents for querying
- Get instant, reliable answers with **source citations** and **relevance scores**

---

## ✨ Key Features

- ✅ **Conversational Q&A:** Ask questions in plain English and receive human-like answers.
- ✅ **Pre-loaded Knowledge Base:** Comes pre-loaded with company-wide HR policies for immediate use.
- ✅ **Custom Document Upload:** Upload your own PDFs (e.g., team guidelines, project-specific policies) and query them directly.
- ✅ **Source Citation & Scoring:** Every answer is backed by source documents with relevance scores.
- ✅ **Interactive UI:** Clean, modern, and fully responsive interface built with React.
- ✅ **Intelligent FAQ Section:** Includes common HR questions to guide users and showcase chatbot capabilities.
- ✅ **Scalable Backend:** Powered by FastAPI, efficiently handling multiple requests.

---

## 🛠️ Technology Stack

- **Frontend:** React.js
- **Backend:** Python with FastAPI
- **AI & Orchestration:** LangChain
- **LLM Provider:** OpenAI (gpt-4o-mini)
- **Vector Embeddings:** OpenAI (text-embedding-3-small)
- **Vector Store:** FAISS (Facebook AI Similarity Search)

---

## 🚀 Getting Started: Running Locally

### Prerequisites
- Python 3.10+
- Node.js v18+ and npm
- OpenAI API Key

---

### 1. Clone the Repository
```bash
git clone https://github.com/vinaymaurya14/hr_policies_rag.git
cd hr_policies_rag
```

---

### 2. Backend Setup
```bash
# Navigate to the backend directory
cd backend

# Create and activate a Python virtual environment
python3 -m venv venv
source venv/bin/activate
# For Windows: venv\Scripts\activate

# Install the required packages
pip install -r requirements.txt
```

#### Add API Key
Create a `.env` file and add your OpenAI API key:
```env
OPENAI_API_KEY=sk-...your-key-here...
```

#### Build the Knowledge Base
```bash
# Ensure your general policy PDFs are in the `backend/data/` folder
python scripts/ingest.py
```

#### Start the Backend Server
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```
The backend should now be running at: [http://127.0.0.1:8000](http://127.0.0.1:8000)

---

### 3. Frontend Setup
```bash
# Open a new terminal and navigate to the frontend directory
cd frontend

# Install the required packages
npm install

# Start the React development server
npm start
```
The frontend should now be available at: [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure
```
hr-rag-app/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   │   └── rag_chain.py       # Core RAG logic, prompt templates, retrievers
│   │   └── main.py                # FastAPI application, API endpoints
│   ├── scripts/
│   │   └── ingest.py              # PDF ingestion and FAISS index builder
│   ├── data/                      # General HR policy PDFs
│   ├── faiss_index/               # Pre-processed FAISS vector index
│   ├── requirements.txt
│   └── .env                       # API keys (excluded from Git)
└── frontend/
    ├── public/
    ├── src/
    │   └── App.js                 # Main React component with all UI logic
    └── package.json
```

---

