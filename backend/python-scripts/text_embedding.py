#!/usr/bin/env python3
"""
Standalone script to generate text embeddings using CLIP
Usage: python3 text_embedding.py <text>
"""
import sys
import json
from clip_utils import clip_utils

def main():
    if len(sys.argv) != 2:
        print(json.dumps({
            "status": "error",
            "message": "Usage: python3 text_embedding.py <text>"
        }))
        sys.exit(1)
    
    try:
        # Get text from command line argument
        text = sys.argv[1]
        
        # Generate text embedding
        embedding = clip_utils.generate_text_embedding(text)
        
        # Return result as JSON
        result = {
            "status": "success",
            "embedding": embedding
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
