const sharp = require('sharp');
const { predefinedTags } = require('../data/predefinedTags');

class ClipService {
  constructor() {
    this.model = null;
    this.embeddingCache = new Map();
    this.initialized = false;
    this.modelName = 'Xenova/clip-vit-base-patch32';
    this.tokenizerPromise = null;
    this.textModelPromise = null;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      console.log('🔄 Initializing CLIP model with transformers.js...');

      // Dynamic import for ES module
      const { pipeline } = await import('@xenova/transformers');
      if (!this.tokenizer || !this.textModel) {
        const { AutoTokenizer, CLIPTextModelWithProjection } = await import('@xenova/transformers');
        this.tokenizerPromise = AutoTokenizer.from_pretrained('Xenova/clip-vit-base-patch32');
        this.textModelPromise = CLIPTextModelWithProjection.from_pretrained('Xenova/clip-vit-base-patch32');
      }

      // Initialize the CLIP pipeline for zero-shot image classification
      this.model = await pipeline('zero-shot-image-classification', this.modelName, {
        quantized: false, // Use full precision for better accuracy
        progress_callback: (progress) => {
          if (progress.status === 'downloading') {
            console.log(`📥 Downloading model: ${Math.round(progress.progress * 100)}%`);
          } else if (progress.status === 'loading') {
            console.log('🔄 Loading model...');
          }
        }
      });

      this.initialized = true;
      console.log('✅ CLIP model initialized successfully with transformers.js');
    } catch (error) {
      console.error('❌ Failed to initialize CLIP model:', error.message);
      throw error;
    }
  }

  getImageMimeType(buffer) {
    if (!buffer || buffer.length < 4) return null;

    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
      return 'image/jpeg';
    }
    if (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47
    ) {
      return 'image/png';
    }
    if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
      return 'image/gif';
    }
    if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46) {
      return 'image/webp';
    }
    return null;
  }

  bufferToBase64(buffer) {
    return buffer.toString('base64');
  }

  async preprocessImage(imageBuffer) {
    try {
      const mimeType = this.getImageMimeType(imageBuffer);
      if (!mimeType) {
        throw new Error('Unsupported image format');
      }

      // Use sharp to preprocess the image for better CLIP performance
      const processedBuffer = await sharp(imageBuffer)
        .resize(224, 224, { fit: 'cover' })
        .jpeg({ quality: 90 })
        .toBuffer();

      return processedBuffer;
    } catch (error) {
      console.error('Error preprocessing image:', error);
      throw error;
    }
  }

  async generateImageEmbedding(imageBuffer) {
    await this.initialize();

    try {
      console.log('🖼️ Generating image embedding with transformers.js...');

      // Preprocess the image for better CLIP performance
      const processedBuffer = await this.preprocessImage(imageBuffer);

      // Save the processed image to a temporary file for transformers.js
      const fs = require('fs');
      const path = require('path');
      const tempDir = path.join(__dirname, '../../temp');
      
      // Ensure temp directory exists
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      const tempFilePath = path.join(tempDir, `temp_${Date.now()}.jpg`);
      fs.writeFileSync(tempFilePath, processedBuffer);

      try {
        // Use zero-shot classification to get image features
        // We'll use a comprehensive set of automotive terms to extract meaningful features
        const automotiveTerms = [
          ...predefinedTags.brands,
          ...predefinedTags.colors,
          ...predefinedTags.types,
          ...predefinedTags.features
        ];

        const result = await this.model(tempFilePath, automotiveTerms);
        
        // Extract features from the classification result
        // Create a feature vector based on the classification scores
        const featureVector = new Array(512).fill(0);
        
        // Map classification results to feature vector
        result.forEach((classification, index) => {
          const score = classification.score;
          const startIdx = index * Math.floor(512 / result.length);
          const endIdx = Math.min(startIdx + Math.floor(512 / result.length), 512);
          
          for (let i = startIdx; i < endIdx; i++) {
            featureVector[i] = score;
          }
        });

        console.log(`✅ Generated image embedding with ${featureVector.length} dimensions`);
        return featureVector;
      } finally {
        // Clean up temporary file
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
      }
    } catch (error) {
      console.error('❌ Error generating image embedding:', error.message);
      throw error;
    }
  }
  
    // async generateTextEmbedding(text) {
    //   await this.initialize();
  
    //   try {
    //     console.log(`📝 Generating text embedding for: "${text}"`);
  
    //     // For text embeddings, we'll create a feature vector based on the text content
    //     // This is a simplified approach since transformers.js zero-shot classification
    //     // is primarily designed for image classification
        
    //     // Create a deterministic feature vector based on text characteristics
    //     const featureVector = new Array(512).fill(0);
        
    //     // Hash the text to create deterministic features
    //     let hash = 0;
    //     for (let i = 0; i < text.length; i++) {
    //       const char = text.charCodeAt(i);
    //       hash = ((hash << 5) - hash) + char;
    //       hash = hash & hash; // Convert to 32-bit integer
    //     }
        
    //     // Use the hash to seed the feature vector
    //     const seed = Math.abs(hash);
    //     for (let i = 0; i < 512; i++) {
    //       // Create deterministic but varied values based on text content
    //       const value = Math.sin(seed + i) * 0.5;
    //       featureVector[i] = value;
    //     }
  
    //     console.log(`✅ Generated text embedding with ${featureVector.length} dimensions`);
    //     return featureVector;
    //   } catch (error) {
    //     console.error('❌ Error generating text embedding:', error.message);
    //     throw error;
    //   }
    // }
  
    async generateTextEmbedding(text) {
      try {
        await this.initialize();
        const tokenizer = await this.tokenizerPromise;
        const textModel = await this.textModelPromise;
        
        const textInputs = tokenizer(text, { padding: true, truncation: true });
        const { text_embeds } = await textModel(textInputs);
        return Array.from(text_embeds.data);
    } catch (error) {
        console.error('Error generating text embedding:', error);
        throw error;
    }

    }

  async clearCache() {
    this.embeddingCache.clear();
    console.log('✅ CLIP embedding cache cleared');
  }

  // Legacy methods for backward compatibility
  async classificationToEmbedding(classification) {
    console.warn('⚠️ classificationToEmbedding is deprecated, use generateTextEmbedding instead');
    return this.generateTextEmbedding(classification);
  }

  createLabelMapping(labels) {
    console.warn('⚠️ createLabelMapping is deprecated, use predefined tags instead');
    return labels.map(label => ({ label, score: 0 }));
  }

  // Process search query and generate embedding
  // async processQuery(query) {
  //   try {
  //     await this.initialize();
      
  //     console.log(`🔍 Processing search query: "${query}"`);
      
  //     // Generate text embedding for the query
  //     const embedding = await this.generateTextEmbedding(query);
      
  //     // Enhance the query with related terms
  //     const enhancedQuery = this.enhanceQuery(query);
      
  //     return {
  //       originalQuery: query,
  //       enhancedQuery: enhancedQuery,
  //       embedding: embedding
  //     };
  //   } catch (error) {
  //     console.error('❌ Error processing query:', error);
  //     throw error;
  //   }
  // }

  // // Enhance search query with related automotive terms
  // enhanceQuery(query) {
  //   const queryLower = query.toLowerCase();
  //   const enhancements = [];
    
  //   // Add related terms based on the query
  //   if (queryLower.includes('car') || queryLower.includes('vehicle') || queryLower.includes('auto')) {
  //     enhancements.push('automobile', 'transportation');
  //   }
    
  //   if (queryLower.includes('red') || queryLower.includes('blue') || queryLower.includes('color')) {
  //     enhancements.push('colored vehicle', 'painted car');
  //   }
    
  //   if (queryLower.includes('sport') || queryLower.includes('fast')) {
  //     enhancements.push('performance car', 'racing vehicle');
  //   }
    
  //   if (queryLower.includes('luxury') || queryLower.includes('expensive')) {
  //     enhancements.push('premium car', 'high-end vehicle');
  //   }
    
  //   if (queryLower.includes('truck') || queryLower.includes('pickup')) {
  //     enhancements.push('commercial vehicle', 'utility truck');
  //   }
    
  //   if (queryLower.includes('suv') || queryLower.includes('crossover')) {
  //     enhancements.push('sport utility vehicle', 'family car');
  //   }
    
  //   // Combine original query with enhancements
  //   const allTerms = [query, ...enhancements];
  //   return allTerms.join(' ');
  // }


ontology = {
    colors: {
      red: ["crimson", "scarlet", "ruby"],
      blue: ["navy", "azure", "sky blue"],
      black: ["jet black", "onyx", "charcoal"],
      white: ["ivory", "pearl", "alabaster"]
    },
    types: {
      suv: ["sport utility vehicle", "crossover"],
      sedan: ["saloon", "executive car"],
      hatchback: ["compact car", "small car"],
      coupe: ["two-door car", "sport coupe"],
      truck: ["pickup", "utility vehicle"],
      car: ["automobile", "vehicle", "auto"]
    },
    attributes: {
      luxury: ["premium", "high-end", "upscale", "exclusive"],
      sporty: ["fast", "performance", "racing"],
      electric: ["EV", "battery car", "zero-emission"],
      cheap: ["budget", "affordable", "economy"]
    },
    brands: ["bmw", "audi", "mercedes", "tesla", "toyota", "honda"]
  };
  // Parse query into structured fields
  parseQuery(query) {
    const tokens = query.toLowerCase().split(/\s+/);
    const parsed = { colors: [], types: [], attributes: [], brands: [] };
    for (const token of tokens) {
      if (this.ontology.colors[token]) parsed.colors.push(token);
      else if (this.ontology.types[token]) parsed.types.push(token);
      else if (this.ontology.attributes[token]) parsed.attributes.push(token);
      else if (this.ontology.brands.includes(token)) parsed.brands.push(token);
    }
    return parsed;
  }

  // Expand query using ontology synonyms
  expandParsed(parsed) {
    const expansions = [];
    parsed.colors.forEach(c => expansions.push(...this.ontology.colors[c]));
    parsed.types.forEach(t => expansions.push(...this.ontology.types[t]));
    parsed.attributes.forEach(a => expansions.push(...this.ontology.attributes[a]));
    return expansions;
  }

  // Build enhanced query string
  enhanceQuery(query) {
    const parsed = this.parseQuery(query);
    const expansions = this.expandParsed(parsed);
    const enhancedQuery = [query, ...expansions, ...parsed.brands].join(" ");
    return { parsed, enhancedQuery };
  }

  // Process query → enhanced string + embedding
  async processQuery(query) {
    const { enhancedQuery } = this.enhanceQuery(query);
    const embedding = await this.generateTextEmbedding(enhancedQuery);
    return { originalQuery: query, enhancedQuery, embedding };
  }

  // Hybrid search combining semantic similarity with keyword matching
  async hybridSearch(query, results, options = {}) {
    const {
      semanticWeight = 0.7,
      keywordWeight = 0.3,
      boostExactMatches = true,
      boostRecentImages = true
    } = options;

    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/\s+/).filter(word => word.length > 2);

    return results.map(result => {
      let hybridScore = result.similarity * semanticWeight;
      
      // Keyword matching on tags
      if (result.tags && Array.isArray(result.tags)) {
        const tagMatches = result.tags.filter(tag => {
          const tagLower = tag.toLowerCase();
          return queryWords.some(word => tagLower.includes(word));
        });
        
        // Boost score for tag matches
        const tagScore = tagMatches.length / Math.max(queryWords.length, 1);
        hybridScore += tagScore * keywordWeight;
        
        // Extra boost for exact tag matches
        if (boostExactMatches) {
          const exactMatches = result.tags.filter(tag => 
            queryWords.some(word => tag.toLowerCase() === word)
          );
          hybridScore += exactMatches.length * 0.1;
        }
      }
      
      // Boost recent images (if metadata contains upload date)
      if (boostRecentImages && result.metadata && result.metadata.uploadDate) {
        const uploadDate = new Date(result.metadata.uploadDate);
        const daysSinceUpload = (Date.now() - uploadDate.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceUpload < 30) {
          hybridScore += 0.05; // Small boost for recent images
        }
      }
      
      return {
        ...result,
        similarity: Math.min(hybridScore, 1.0), // Cap at 1.0
        originalSimilarity: result.similarity
      };
    }).sort((a, b) => b.similarity - a.similarity);
  }
}

module.exports = new ClipService();