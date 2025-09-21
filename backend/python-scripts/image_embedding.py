#!/usr/bin/env python3
"""
Standalone script to generate image embeddings using CLIP
Usage: python3 image_embedding.py <base64_image_data>
"""
import sys
import json
from clip_utils import clip_utils

def main():
    if len(sys.argv) != 2:
        print(json.dumps({
            "status": "error",
            "message": "Usage: python3 image_embedding.py <base64_image_data>"
        }))
        sys.exit(1)
    
    try:
        # Get base64 image data from command line argument
        base64_image = sys.argv[1]
        
        # Generate image embedding
        embedding = clip_utils.generate_image_embedding(base64_image)
        
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
