import os
import sys
import json
from fastapi import FastAPI, HTTPException, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from dotenv import load_dotenv

# Make sure the RAG chain import includes the new function
from app.core.rag_chain import create_rag_chain, create_retriever_from_file, get_preloaded_retriever, create_faq_chain

load_dotenv()

app = FastAPI(
    title="HR Policy RAG API",
    description="API for querying HR documents with dynamic FAQs.",
    version="4.0.0" # Updated Version
)

app.mount("/static", StaticFiles(directory="data"), name="static")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SESSION_CACHE = {}

# --- ✅ UPDATED: Add 'page' to the SourceDocument model ---
class SourceDocument(BaseModel):
    source: str
    content: str
    score: float
    page: int

class QueryResponse(BaseModel):
    answer: str
    sources: list[SourceDocument]

class ProcessResponse(BaseModel):
    message: str
    session_id: str

class FaqResponse(BaseModel):
    faqs: list[str]

@app.post("/process-file", response_model=ProcessResponse, summary="Upload and process a document")
async def process_file(session_id: str = Form(...), file: UploadFile = File(...)):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed.")
    try:
        # The create_retriever_from_file now needs to return the retriever AND some text for FAQs
        retriever, faq_context_text = await create_retriever_from_file(file, return_context=True)

        if retriever is None:
            raise HTTPException(status_code=500, detail="Failed to process the uploaded file.")
        
        # Cache the retriever and the context text
        SESSION_CACHE[session_id] = {
            "retriever": retriever, 
            "filename": file.filename,
            "faq_context": faq_context_text
        }
        
        print(f"File '{file.filename}' processed and cached for session_id: {session_id}")
        return ProcessResponse(message="File processed successfully.", session_id=session_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {e}")

# ✅ NEW ENDPOINT
@app.post("/generate-faqs", response_model=FaqResponse, summary="Generate FAQs from a processed document")
async def generate_faqs(session_id: str = Form(...)):
    if session_id not in SESSION_CACHE:
        raise HTTPException(status_code=404, detail="Session not found.")
    
    try:
        context = SESSION_CACHE[session_id].get("faq_context", "")
        if not context:
            return FaqResponse(faqs=[])

        faq_chain = create_faq_chain()
        response_text = faq_chain.invoke({"context": context})
        
        # Sanitize and parse the JSON response from the LLM
        cleaned_response = response_text.strip().replace("```json", "").replace("```", "")
        faq_list = json.loads(cleaned_response)

        return FaqResponse(faqs=faq_list)
    except Exception as e:
        # Return empty list on failure to avoid breaking the frontend
        print(f"Error generating FAQs: {e}")
        return FaqResponse(faqs=[])

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
        source_docs = retriever.invoke(question)
        rag_chain = create_rag_chain(retriever)
        answer = rag_chain.invoke(question)
        
        formatted_sources = []
        for doc in source_docs:
            source_name = source_name_override or os.path.basename(doc.metadata.get("source", "Unknown Document"))
            relevance_score = doc.metadata.get("relevance_score", 0.0)
            
            # --- ✅ UPDATED: Extract page number and add it to the response ---
            # PyPDFLoader adds a 0-indexed 'page' metadata field.
            page_number = doc.metadata.get("page", 0) 
            
            formatted_sources.append(SourceDocument(
                source=source_name,
                content=doc.page_content,
                score=relevance_score,
                page=page_number + 1  # Convert to 1-indexed for the UI
            ))

        return QueryResponse(answer=answer, sources=formatted_sources)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))