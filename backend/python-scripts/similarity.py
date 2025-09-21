#!/usr/bin/env python3
"""
Standalone script to compute similarity between image and text embeddings
Usage: python3 similarity.py <image_embedding_json> <text_embedding_json>
"""
import sys
import json
from clip_utils import clip_utils

def main():
    if len(sys.argv) != 3:
        print(json.dumps({
            "status": "error",
            "message": "Usage: python3 similarity.py <image_embedding_json> <text_embedding_json>"
        }))
        sys.exit(1)
    
    try:
        # Parse embeddings from command line arguments
        image_embedding = json.loads(sys.argv[1])
        text_embedding = json.loads(sys.argv[2])
        
        # Compute similarity
        similarity = clip_utils.compute_similarity(image_embedding, text_embedding)
        
        # Return result as JSON
        result = {
            "status": "success",
            "similarity": similarity
        }
        
        print(json.dumps(result))
        
    except Exception as error:
        error_result = {
            "status": "error",
            "message": str(error)
        }
        print(json.dumps(error_result))
        sys.exit(1)

if __name__ == "__main__":
    main()
