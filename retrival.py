import chromadb
from langchain_huggingface import HuggingFaceEmbeddings

def retrieve_from_chroma(question: str, persist_dir="chroma_db", top_k=3):
    """
    Retrieve top_k relevant chunks from ChromaDB.
    Returns a dict with 'documents' and 'metadatas'.
    """
    embedding_model = HuggingFaceEmbeddings(
        model_name="BAAI/bge-large-en-v1.5",
        model_kwargs={"device": "cpu"},
        encode_kwargs={"normalize_embeddings": True}
    )

    query_vector = embedding_model.embed_query(question)
    client = chromadb.PersistentClient(path=persist_dir)
    collection = client.get_collection(name="my_vectors")

    results = collection.query(
        query_embeddings=[query_vector],
        n_results=top_k
    )

    return {
        "documents": results.get("documents", [[]]),
        "metadatas": results.get("metadatas", [[]])
    }

