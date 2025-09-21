"""
Flask API for CLIP image and text embedding generation
Optimized for performance with persistent model loading
"""
import os
import json
import base64
import logging
from io import BytesIO
from PIL import Image
import torch
from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import CLIPModel, CLIPProcessor
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

class CLIPService:
    def __init__(self):
        self.model = None
        self.processor = None
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.initialized = False
    
    def initialize(self):
        """Initialize the CLIP model and processor"""
        if self.initialized:
            return
            
        try:
            logger.info("🔄 Initializing CLIP model with Hugging Face Transformers...")
            
            # Use OpenAI's CLIP model from Hugging Face
            model_name = "openai/clip-vit-base-patch32"
            
            # Get Hugging Face token from environment
            hf_token = os.getenv('HUGGINGFACE_API_KEY')
            
            if not hf_token:
                logger.warning("⚠️ No HUGGINGFACE_API_KEY found, trying without authentication...")
                # Load model and processor without token
                self.model = CLIPModel.from_pretrained(model_name)
                self.processor = CLIPProcessor.from_pretrained(model_name)
            else:
                logger.info("🔑 Using Hugging Face token for model access...")
                # Load model and processor with token
                self.model = CLIPModel.from_pretrained(model_name, use_auth_token=hf_token)
                self.processor = CLIPProcessor.from_pretrained(model_name, use_auth_token=hf_token)
            
            # Move model to device
            self.model.to(self.device)
            self.model.eval()
            
            self.initialized = True
            logger.info(f"✅ CLIP model initialized successfully on {self.device}")
            
        except Exception as error:
            logger.error(f"❌ Failed to initialize CLIP model: {error}")
            raise error
    
    def preprocess_image(self, image_data):
        """Preprocess image data for CLIP"""
        try:
            # Decode base64 image data
            if isinstance(image_data, str):
                image_bytes = base64.b64decode(image_data)
            else:
                image_bytes = image_data
            
            # Convert to PIL Image
            image = Image.open(BytesIO(image_bytes))
            
            # Convert to RGB if necessary
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Resize image for better CLIP performance (224x224 is optimal)
            image = image.resize((224, 224), Image.Resampling.LANCZOS)
            
            return image
            
        except Exception as error:
            logger.error(f"❌ Error preprocessing image: {error}")
            raise error
    
    def generate_image_embedding(self, image_data):
        """Generate embedding for an image"""
        try:
            self.initialize()
            
            # Preprocess image
            image = self.preprocess_image(image_data)
            
            # Process image with CLIP
            inputs = self.processor(images=image, return_tensors="pt")
            inputs = {k: v.to(self.device) for k, v in inputs.items()}
            
            # Generate embedding
            with torch.no_grad():
                image_features = self.model.get_image_features(**inputs)
                # Normalize the features
                image_features = image_features / image_features.norm(dim=-1, keepdim=True)
            
            # Convert to list for JSON serialization
            embedding = image_features.cpu().numpy().flatten().tolist()
            
            logger.info(f"✅ Generated image embedding with {len(embedding)} dimensions")
            return embedding
            
        except Exception as error:
            logger.error(f"❌ Error generating image embedding: {error}")
            raise error
    
    def generate_text_embedding(self, text):
        """Generate embedding for text"""
        try:
            self.initialize()
            
            # Process text with CLIP
            inputs = self.processor(text=[text], return_tensors="pt", padding=True, truncation=True)
            inputs = {k: v.to(self.device) for k, v in inputs.items()}
            
            # Generate embedding
            with torch.no_grad():
                text_features = self.model.get_text_features(**inputs)
                # Normalize the features
                text_features = text_features / text_features.norm(dim=-1, keepdim=True)
            
            # Convert to list for JSON serialization
            embedding = text_features.cpu().numpy().flatten().tolist()
            
            logger.info(f"✅ Generated text embedding for '{text}' with {len(embedding)} dimensions")
            return embedding
            
        except Exception as error:
            logger.error(f"❌ Error generating text embedding: {error}")
            raise error
    
    def compute_similarity(self, image_embedding, text_embedding):
        """Compute cosine similarity between image and text embeddings"""
        try:
            import numpy as np
            
            # Convert to numpy arrays
            img_emb = np.array(image_embedding)
            txt_emb = np.array(text_embedding)
            
            # Compute cosine similarity
            similarity = np.dot(img_emb, txt_emb) / (np.linalg.norm(img_emb) * np.linalg.norm(txt_emb))
            
            logger.info(f"✅ Computed similarity: {similarity:.4f}")
            return float(similarity)
            
        except Exception as error:
            logger.error(f"❌ Error computing similarity: {error}")
            raise error

# Global CLIP service instance
clip_service = CLIPService()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'CLIP API',
        'initialized': clip_service.initialized
    })

@app.route('/initialize', methods=['POST'])
def initialize():
    """Initialize the CLIP model"""
    try:
        clip_service.initialize()
        return jsonify({
            'status': 'success',
            'message': 'CLIP model initialized successfully'
        })
    except Exception as error:
        return jsonify({
            'status': 'error',
            'message': str(error)
        }), 500

@app.route('/image-embedding', methods=['POST'])
def image_embedding():
    """Generate image embedding"""
    try:
        data = request.get_json()
        
        if not data or 'image' not in data:
            return jsonify({
                'status': 'error',
                'message': 'Image data is required'
            }), 400
        
        # Generate embedding
        embedding = clip_service.generate_image_embedding(data['image'])
        
        return jsonify({
            'status': 'success',
            'embedding': embedding
        })
        
    except Exception as error:
        logger.error(f"Error in image embedding endpoint: {error}")
        return jsonify({
            'status': 'error',
            'message': str(error)
        }), 500

@app.route('/text-embedding', methods=['POST'])
def text_embedding():
    """Generate text embedding"""
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({
                'status': 'error',
                'message': 'Text is required'
            }), 400
        
        # Generate embedding
        embedding = clip_service.generate_text_embedding(data['text'])
        
        return jsonify({
            'status': 'success',
            'embedding': embedding
        })
        
    except Exception as error:
        logger.error(f"Error in text embedding endpoint: {error}")
        return jsonify({
            'status': 'error',
            'message': str(error)
        }), 500

@app.route('/similarity', methods=['POST'])
def similarity():
    """Compute similarity between image and text embeddings"""
    try:
        data = request.get_json()
        
        if not data or 'image_embedding' not in data or 'text_embedding' not in data:
            return jsonify({
                'status': 'error',
                'message': 'Both image_embedding and text_embedding are required'
            }), 400
        
        # Compute similarity
        similarity_score = clip_service.compute_similarity(
            data['image_embedding'],
            data['text_embedding']
        )
        
        return jsonify({
            'status': 'success',
            'similarity': similarity_score
        })
        
    except Exception as error:
        logger.error(f"Error in similarity endpoint: {error}")
        return jsonify({
            'status': 'error',
            'message': str(error)
        }), 500

@app.route('/clear-cache', methods=['POST'])
def clear_cache():
    """Clear any cached data"""
    try:
        # For now, just return success as we don't have caching implemented
        return jsonify({
            'status': 'success',
            'message': 'Cache cleared'
        })
    except Exception as error:
        return jsonify({
            'status': 'error',
            'message': str(error)
        }), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5001))
    debug = os.getenv('DEBUG', 'false').lower() == 'true'
    
    logger.info(f"🚀 Starting CLIP API server on port {port}")
    app.run(host='0.0.0.0', port=port, debug=debug)
