import os
import sys
from fastapi import FastAPI, HTTPException, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from app.core.rag_chain import create_rag_chain, create_retriever_from_file, get_preloaded_retriever

load_dotenv()

app = FastAPI(
    title="HR Policy RAG API",
    description="API for querying HR documents with relevance scoring.",
    version="2.2.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SESSION_CACHE = {}

# --- Updated Pydantic Model to include score ---
class SourceDocument(BaseModel):
    source: str
    content: str
    score: float

class QueryResponse(BaseModel):
    answer: str
    sources: list[SourceDocument]

class ProcessResponse(BaseModel):
    message: str
    session_id: str

@app.post("/process-file", response_model=ProcessResponse, summary="Upload and process a document")
async def process_file(session_id: str = Form(...), file: UploadFile = File(...)):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed.")
    try:
        retriever = await create_retriever_from_file(file)
        if retriever is None:
            raise HTTPException(status_code=500, detail="Failed to process the uploaded file.")
        SESSION_CACHE[session_id] = {"retriever": retriever, "filename": file.filename}
        print(f"File '{file.filename}' processed and cached for session_id: {session_id}")
        return ProcessResponse(message="File processed successfully.", session_id=session_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {e}")

@app.post("/ask", response_model=QueryResponse, summary="Ask a question")
async def ask_question(question: str = Form(...), session_id: str = Form(None)):
    retriever = None
    source_name_override = None

    if session_id and session_id in SESSION_CACHE:
        cache_entry = SESSION_CACHE[session_id]
        retriever = cache_entry.get("retriever")
        source_name_override = cache_entry.get("filename")
    else:
        try:
            retriever = get_preloaded_retriever()
        except FileNotFoundError:
            raise HTTPException(status_code=500, detail="Knowledge base not found.")

    if not retriever:
        raise HTTPException(status_code=500, detail="Could not initialize document retriever.")

    try:
        # The custom retriever now automatically attaches scores to the metadata
        source_docs = retriever.invoke(question)
        
        # Now, create the chain and invoke it with the retrieved docs
        rag_chain = create_rag_chain(retriever)
        answer = rag_chain.invoke(question)
        
        formatted_sources = []
        for doc in source_docs:
            source_name = source_name_override or os.path.basename(doc.metadata.get("source", "Unknown Document"))
            # Extract the score from the metadata
            relevance_score = doc.metadata.get("relevance_score", 0.0)
            formatted_sources.append(SourceDocument(
                source=source_name,
                content=doc.page_content,
                score=relevance_score
            ))

        return QueryResponse(answer=answer, sources=formatted_sources)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
