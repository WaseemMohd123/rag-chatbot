from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from typing import List

def chunk_documents(documents: List[Document], chunk_size: int = 500, chunk_overlap: int = 50):
    """
    Split documents into smaller chunks for embeddings.
    """
    if not documents:
        return []
    
    avg_len = sum(len(d.page_content) for d in documents)/len(documents)

    if avg_len < chunk_size:
        return documents
    else:
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            length_function=len,
            add_start_index=True
        )
    return splitter.split_documents(documents)
