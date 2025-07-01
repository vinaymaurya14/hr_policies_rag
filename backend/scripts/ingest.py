import os
import sys
from dotenv import load_dotenv

# Add the project root to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import FAISS

# --- Configuration ---
load_dotenv("/Users/vinay-mauya/projects/hr_policies_rag/hr_policies_rag/backend/.env") # Load environment variables from the backend's .env file

DATA_PATH = "data/"
INDEX_PATH = "faiss_index"

def create_vector_store():
    """
    Loads PDF documents, splits them into chunks, creates embeddings,
    and saves them to a local FAISS vector store.
    """
    if not os.path.exists(DATA_PATH):
        print(f"Data directory '{DATA_PATH}' not found.")
        return

    pdf_files = [f for f in os.listdir(DATA_PATH) if f.endswith(".pdf")]
    if not pdf_files:
        print(f"No PDF files found in '{DATA_PATH}'.")
        return

    print(f"Found {len(pdf_files)} PDF files. Loading documents...")
    
    all_docs = []
    for pdf_file in pdf_files:
        loader = PyPDFLoader(os.path.join(DATA_PATH, pdf_file))
        documents = loader.load()
        all_docs.extend(documents)

    print(f"Loaded a total of {len(all_docs)} pages from all PDFs.")

    # Split documents into smaller, manageable chunks
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1200, chunk_overlap=150)
    chunked_docs = text_splitter.split_documents(all_docs)
    print(f"Split documents into {len(chunked_docs)} chunks.")

    # Initialize OpenAI embeddings model
    print("Initializing OpenAI embeddings model...")
    embeddings = OpenAIEmbeddings()

    # Create the FAISS vector store from the documents and embeddings
    print("Creating FAISS vector store...")
    db = FAISS.from_documents(chunked_docs, embeddings)

    # Save the vector store locally
    db.save_local(INDEX_PATH)
    print(f"Vector store created and saved at '{INDEX_PATH}'.")


if __name__ == "__main__":
    create_vector_store()