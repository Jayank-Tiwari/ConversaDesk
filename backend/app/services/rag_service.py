import os

from langchain_text_splitters import (
    RecursiveCharacterTextSplitter
)

from langchain_community.document_loaders import (
    PyPDFLoader,
    TextLoader
)

from langchain_community.vectorstores import (
    Chroma
)

from langchain_community.embeddings import (
    HuggingFaceEmbeddings
)


DB_PATH = "chroma_db"


embedding = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)


def build_rag():

    docs_path = "docs"

    documents = []

    for file in os.listdir(docs_path):
        file_path = os.path.join(docs_path, file)
        if file.endswith(".pdf"):
            loader = PyPDFLoader(file_path)
            documents.extend(loader.load())
        elif file.endswith(".md"):
            loader = TextLoader(file_path, encoding='utf-8')
            documents.extend(loader.load())

    splitter = RecursiveCharacterTextSplitter(

        chunk_size=500,

        chunk_overlap=50
    )

    chunks = splitter.split_documents(
        documents
    )

    vectordb = Chroma.from_documents(

        chunks,

        embedding,

        persist_directory=DB_PATH
    )

    vectordb.persist()

    print("RAG DATABASE CREATED")


def search_rag(query):

    vectordb = Chroma(

        persist_directory=DB_PATH,

        embedding_function=embedding
    )

    results = vectordb.similarity_search(
        query,
        k=3
    )
    return results

def get_embedding(text: str) -> list[float]:
    """Helper to get a single embedding vector for a string."""
    return embedding.embed_query(text)

def cosine_similarity(v1: list[float], v2: list[float]) -> float:
    """Compute cosine similarity between two vectors."""
    dot_product = sum(a * b for a, b in zip(v1, v2))
    norm_a = sum(a * a for a in v1) ** 0.5
    norm_b = sum(b * b for b in v2) ** 0.5
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot_product / (norm_a * norm_b)