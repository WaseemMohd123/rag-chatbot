import chromadb
def save_vectors_to_chroma(vectors, documents, metadatas=None, ids=None, persist_dir="chroma_db"):
    """
    Store precomputed vectors into ChromaDB.
    """
    client = chromadb.PersistentClient(path=persist_dir)

    # Create or load a collection
    collection = client.get_or_create_collection(name="my_vectors")

    # If no IDs provided, generate them
    if ids is None:
        ids = [f"id_{i}" for i in range(len(vectors))]

    # If no metadata, create placeholder values
    if metadatas is None:
        metadatas = [{"info": f"vector_{i}"} for i in range(len(vectors))]

    # Add vectors to the collection
    collection.add(
        embeddings=vectors,
        documents=documents,
        metadatas=metadatas,
        ids=ids
    )

    return collection
