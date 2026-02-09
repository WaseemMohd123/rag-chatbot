"""
Hybrid Search Module
Combines BM25 (keyword search) with semantic search using reciprocal rank fusion
"""

from rank_bm25 import BM25Okapi
from typing import List, Dict, Tuple
import numpy as np


def reciprocal_rank_fusion(
    semantic_results: List[Tuple[int, float]],
    bm25_results: List[Tuple[int, float]],
    k: int = 60,
    alpha: float = 0.5
) -> List[int]:
    """
    Combine semantic and BM25 results using Reciprocal Rank Fusion (RRF)
    
    Args:
        semantic_results: List of (doc_id, score) from semantic search
        bm25_results: List of (doc_id, score) from BM25 search
        k: RRF constant (default 60)
        alpha: Weight for semantic vs BM25 (0=all BM25, 1=all semantic)
    
    Returns:
        List of document indices sorted by fused score
    """
    rrf_scores = {}
    
    # Add semantic scores
    for rank, (doc_id, score) in enumerate(semantic_results):
        rrf_scores[doc_id] = rrf_scores.get(doc_id, 0) + alpha * (1.0 / (k + rank + 1))
    
    # Add BM25 scores
    for rank, (doc_id, score) in enumerate(bm25_results):
        rrf_scores[doc_id] = rrf_scores.get(doc_id, 0) + (1 - alpha) * (1.0 / (k + rank + 1))
    
    # Sort by fused score
    sorted_docs = sorted(rrf_scores.items(), key=lambda x: x[1], reverse=True)
    return [doc_id for doc_id, score in sorted_docs]


def bm25_search(
    query: str,
    documents: List[str],
    top_k: int = 10
) -> List[Tuple[int, float]]:
    """
    Perform BM25 keyword search
    
    Args:
        query: Search query
        documents: List of document texts
        top_k: Number of results to return
    
    Returns:
        List of (doc_index, score) tuples, sorted by score
    """
    # Tokenize documents (simple whitespace tokenization)
    tokenized_docs = [doc.lower().split() for doc in documents]
    
    # Create BM25 instance
    bm25 = BM25Okapi(tokenized_docs)
    
    # Tokenize query
    tokenized_query = query.lower().split()
    
    # Get scores
    scores = bm25.get_scores(tokenized_query)
    
    # Get top-k indices and scores
    top_indices = np.argsort(scores)[::-1][:top_k]
    results = [(int(idx), float(scores[idx])) for idx in top_indices]
    
    return results


def hybrid_search(
    query: str,
    chroma_results: Dict,
    alpha: float = 0.5,
    top_k: int = 10
) -> Dict:
    """
    Perform hybrid search combining semantic (ChromaDB) and BM25 results
    
    Args:
        query: Search query
        chroma_results: Results from ChromaDB query (dict with 'documents', 'metadatas', 'distances')
        alpha: Weight for semantic vs BM25 (0=all BM25, 1=all semantic, 0.5=equal)
        top_k: Final number of results to return
    
    Returns:
        Reranked results in same format as ChromaDB results
    """
    # Extract documents from ChromaDB results
    semantic_docs = chroma_results.get('documents', [[]])[0]
    semantic_metadatas = chroma_results.get('metadatas', [[]])[0]
    semantic_distances = chroma_results.get('distances', [[]])[0]
    
    if not semantic_docs:
        return chroma_results
    
    # Create semantic results (doc_id, score) - convert distance to similarity
    semantic_results = [(i, 1.0 - dist) for i, dist in enumerate(semantic_distances)]
    
    # Perform BM25 search on the same documents
    bm25_results = bm25_search(query, semantic_docs, top_k=len(semantic_docs))
    
    # Fuse results using RRF
    fused_indices = reciprocal_rank_fusion(
        semantic_results,
        bm25_results,
        alpha=alpha
    )[:top_k]
    
    # Reorder results based on fused ranking
    reranked_docs = [semantic_docs[i] for i in fused_indices]
    reranked_metadatas = [semantic_metadatas[i] for i in fused_indices]
    reranked_distances = [semantic_distances[i] for i in fused_indices]
    
    return {
        'documents': [reranked_docs],
        'metadatas': [reranked_metadatas],
        'distances': [reranked_distances],
        'ids': chroma_results.get('ids', [[]]),
    }
