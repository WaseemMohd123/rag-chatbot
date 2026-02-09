from typing import List
from langchain_core.documents import Document
from langchain_huggingface import HuggingFaceEmbeddings

def embed_chunks(chunks: List[Document]):
    """
    Embed text chunks using Hugging Face embeddings.
    Returns separate lists: embeddings, texts, metadatas.
    """
    model_name = "BAAI/bge-large-en-v1.5"

    embedding_model = HuggingFaceEmbeddings(
        model_name=model_name,
        model_kwargs={"device": "cpu"},  # change to "cuda" for GPU
        encode_kwargs={"normalize_embeddings": True}
    )

    vectors = embedding_model.embed_documents([chunk.page_content for chunk in chunks])
    texts = [chunk.page_content for chunk in chunks]

    # Filter metadata values to only allowed types for Chroma
    metadatas = []
    for chunk in chunks:
        md = getattr(chunk, "metadata", {}) or {}
        filtered = {}
        for k, v in md.items():
            if isinstance(v, (str, int, float, bool)) or v is None:
                filtered[k] = v
        metadatas.append(filtered)

    return vectors, texts, metadatas
