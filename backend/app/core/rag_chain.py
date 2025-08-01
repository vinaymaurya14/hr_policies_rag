import os
import tempfile
from fastapi import UploadFile
from typing import List

# --- LangChain Imports ---
from langchain_community.document_loaders import PyPDFLoader
from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.schema.retriever import BaseRetriever
from langchain.callbacks.manager import CallbackManagerForRetrieverRun

# --- Configuration ---
INDEX_PATH = "faiss_index"

# --- Custom Retriever for Adding Scores ---
class ScoreAttachingRetriever(BaseRetriever):
    vectorstore: FAISS

    def _get_relevant_documents(
        self, query: str, *, run_manager: CallbackManagerForRetrieverRun
    ) -> List[Document]:
        docs_and_scores = self.vectorstore.similarity_search_with_relevance_scores(
            query, k=5
        )
        for doc, score in docs_and_scores:
            doc.metadata["relevance_score"] = score
        return [doc for doc, score in docs_and_scores]

# --- RAG Chain Construction ---
def create_rag_chain(retriever):
    llm = ChatOpenAI(model_name="gpt-4o-mini", temperature=0.1)
    prompt_template = """
    You are an expert HR assistant. Your task is to provide clear, well-structured answers to employee questions based *only* on the context provided.
    
    CONTEXT: {context}
    
    INSTRUCTIONS:
    1. Analyze the user's question: {question}
    2. Review the provided context thoroughly to find the most relevant information.
    3. Synthesize a helpful and direct answer.
    4. Formatting: Use bullet points for each key point or step. 
    5. Do not use numbering. 
    6. Each bullet point should start with a round bullets (•)  followed by the key information.
    
    Example:
    - **Topic Name**: Details about the topic.
    - **Topic Name**: Details about the topic.
    
    ANSWER:
    """
    prompt = PromptTemplate(template=prompt_template, input_variables=["context", "question"])

    def format_docs(docs):
        return "\n\n".join(
            f"Source: {os.path.basename(doc.metadata.get('source', 'Unknown'))}\n"
            f"Content: {doc.page_content}" for doc in docs
        )

    rag_chain = (
        {"context": retriever | format_docs, "question": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )
    return rag_chain

def create_faq_chain():
    """Creates a LangChain chain to generate FAQs from a given text."""
    llm = ChatOpenAI(model_name="gpt-4o-mini", temperature=0.3)
    
    prompt_template = """
    Based on the following content from a document, generate exactly 4 concise and relevant questions that a user is likely to ask.
    Your response MUST be a valid JSON array of strings. Do not include any other text or formatting.

    For example:
    ["What is the policy on remote work?", "How do I apply for maternity leave?"]

    DOCUMENT CONTENT:
    {context}

    JSON ARRAY OF QUESTIONS:
    """
    
    prompt = PromptTemplate(template=prompt_template, input_variables=["context"])
    
    faq_chain = (
        prompt
        | llm
        | StrOutputParser()
    )
    
    return faq_chain


# --- File & Index Helpers ---
async def create_retriever_from_file(file: UploadFile, return_context: bool = False):
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_file:
            content = await file.read()
            tmp_file.write(content)
            loader = PyPDFLoader(tmp_file.name)
            documents = loader.load()
        os.remove(tmp_file.name)
        
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1200, chunk_overlap=150)
        chunked_docs = text_splitter.split_documents(documents)
        
        embeddings = OpenAIEmbeddings()
        db = FAISS.from_documents(chunked_docs, embeddings)
        retriever = ScoreAttachingRetriever(vectorstore=db)

        if not return_context:
            return retriever
        
        # Combine text from the first few documents for FAQ context
        context_text = " ".join([doc.page_content for doc in documents[:3]])
        return retriever, context_text

    except Exception as e:
        print(f"Error processing uploaded file: {e}")
        return (None, None) if return_context else None

def get_preloaded_retriever():
    if not os.path.exists(INDEX_PATH):
        raise FileNotFoundError(f"FAISS index not found at '{INDEX_PATH}'.")
    embeddings = OpenAIEmbeddings()
    db = FAISS.load_local(INDEX_PATH, embeddings, allow_dangerous_deserialization=True)
    return ScoreAttachingRetriever(vectorstore=db)
