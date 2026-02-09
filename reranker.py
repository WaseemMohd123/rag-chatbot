"""
Cross-Encoder Reranking Module
Uses a cross-encoder model to rerank retrieved documents for better relevance
"""

from sentence_transformers import CrossEncoder
from typing import List, Dict, Tuple
import numpy as np


class Reranker:
    """Cross-encoder reranker for improving retrieval quality"""
    
    def __init__(self, model_name: str = "cross-encoder/ms-marco-MiniLM-L-6-v2"):
        """
        Initialize the reranker with a cross-encoder model
        
        Args:
            model_name: HuggingFace model name for cross-encoder
        """
        print(f"Loading reranker model: {model_name}...")
        self.model = CrossEncoder(model_name)
        print("Reranker model loaded successfully!")
    
    def rerank(
        self,
        query: str,
        documents: List[str],
        top_k: int = 3
    ) -> List[int]:
        """
        Rerank documents based on relevance to query
        
        Args:
            query: Search query
            documents: List of document texts
            top_k: Number of top documents to return
        
        Returns:
            List of indices of top-k documents, sorted by relevance
        """
        if not documents:
            return []
        
        # Create query-document pairs
        pairs = [[query, doc] for doc in documents]
        
        # Score all pairs
        scores = self.model.predict(pairs)
        
        # Get top-k indices
        top_indices = np.argsort(scores)[::-1][:top_k]
        
        return top_indices.tolist()
    
    def rerank_results(
        self,
        query: str,
        results: Dict,
        top_k: int = 3
    ) -> Dict:
        """
        Rerank ChromaDB results using cross-encoder
        
        Args:
            query: Search query
            results: Results from ChromaDB/hybrid search
            top_k: Number of results to keep after reranking
        
        Returns:
            Reranked results in same format
        """
        documents = results.get('documents', [[]])[0]
        metadatas = results.get('metadatas', [[]])[0]
        
        if not documents:
            return results
        
        # Get reranked indices
        top_indices = self.rerank(query, documents, top_k=top_k)
        
        # Reorder results
        reranked_docs = [documents[i] for i in top_indices]
        reranked_metadatas = [metadatas[i] for i in top_indices]
        
        return {
            'documents': [reranked_docs],
            'metadatas': [reranked_metadatas],
            'ids': results.get('ids', [[]]),
        }


# Global reranker instance (lazy loaded)
_reranker_instance = None


def get_reranker() -> Reranker:
    """Get or create global reranker instance"""
    global _reranker_instance
    if _reranker_instance is None:
        _reranker_instance = Reranker()
    return _reranker_instance
