from sentence_transformers import SentenceTransformer
from typing import List
from app.core.config import settings

class EmbeddingService:
    instance = None
    
    def __new__(cls):
        if not cls.instance:
            cls.instance = super(EmbeddingService, cls).__new__(cls)
            # Move initialization here
            cls.instance.dimension = 384
            
            # Check for available hardware acceleration
            import torch
            import platform
            
            cls.instance.device = 'cpu'
            if torch.cuda.is_available():
                cls.instance.device = 'cuda'
            elif platform.system() == 'Darwin' and platform.processor() == 'arm':
                # Check if MPS is available on Apple Silicon
                if torch.backends.mps.is_available():
                    cls.instance.device = 'mps'

            # Initialize model here instead of in __init__
            cache_dir = settings.EMBEDDING_MODEL_CACHE_DIR
            cls.instance.model = SentenceTransformer(
                'all-MiniLM-L6-v2',
                cache_folder=cache_dir,
                device=cls.instance.device
            )
        return cls.instance

    def _chunk_text(self, text: str, chunk_size: int = 500, overlap: float = 0.1) -> List[str]:
        """Split text into chunks with overlap"""
        if not text:
            return []
            
        # Calculate overlap size
        overlap_size = int(chunk_size * overlap)
        step_size = chunk_size - overlap_size
        
        chunks = []
        for i in range(0, len(text), step_size):
            chunk = text[i:i + chunk_size]
            if chunk.strip():
                chunks.append(chunk)
        
        return chunks

    async def get_embedding(self, text: str) -> List[float]:
        """
        Get embedding for a text using Sentence Transformers with chunking
        """
        try:
            # Preprocess text
            text = text.replace("\n", " ").strip()
            
            # Split into chunks
            chunks = self._chunk_text(text)
            
            if not chunks:
                return [0.0] * self.dimension
            
            # Generate embeddings for each chunk
            chunk_embeddings = []
            for chunk in chunks:
                embedding = self.model.encode(chunk)
                chunk_embeddings.append(embedding)
            
            # Average the embeddings if there are multiple chunks
            if chunk_embeddings:
                # Stack embeddings and calculate mean along axis 0
                import numpy as np
                final_embedding = np.mean(chunk_embeddings, axis=0)
                return final_embedding.tolist()
            
            return [0.0] * self.dimension

        except Exception as e:
            print(f"Error getting embedding: {str(e)}")
            # Return zero vector as fallback
            return [0.0] * self.dimension



# Convenience function for getting embeddings
async def get_embedding(text: str) -> List[float]:
    
    return await EmbeddingService().get_embedding(text)
