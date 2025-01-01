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


    async def get_embedding(self, text: str) -> List[float]:
        """
        Get embedding for a text using Sentence Transformers
        """
        try:
            # Preprocess text
            text = text.replace("\n", " ").strip()
            
            # Generate embedding
            embedding = self.model.encode(text)
            
            # Convert to list of floats
            return embedding.tolist()

        except Exception as e:
            print(f"Error getting embedding: {str(e)}")
            # Return zero vector as fallback
            return [0.0] * self.dimension



# Convenience function for getting embeddings
async def get_embedding(text: str) -> List[float]:
    
    return await EmbeddingService().get_embedding(text)
