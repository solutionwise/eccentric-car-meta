const sharp = require('sharp');
const { predefinedTags } = require('../data/predefinedTags');
const carDetectionService = require('./carDetectionService');

class ClipService {
  constructor() {
    this.modelName = 'Xenova/clip-vit-base-patch32'; // Reverting to working model
    this.embeddingCache = new Map();
    this.initialized = false;

    this.model = null; // zero-shot image classification pipeline
    this.usePipeline = false; // fallback mode
    this.visionProcessorPromise = null;
    this.visionModelPromise = null;
    this.tokenizerPromise = null;
    this.textModelPromise = null;
    this.featureExtractorPipeline = null;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      console.log('🔄 Initializing CLIP service…');
      const transformers = await import('@xenova/transformers');
      const {
        AutoTokenizer,
        CLIPTextModelWithProjection,
        CLIPVisionModelWithProjection,
        CLIPProcessor,
        pipeline,
      } = transformers;

      // Text support
      this.tokenizerPromise = AutoTokenizer
        ? AutoTokenizer.from_pretrained(this.modelName)
        : null;
      this.textModelPromise = CLIPTextModelWithProjection
        ? CLIPTextModelWithProjection.from_pretrained(this.modelName)
        : null;

      // Vision support
      if (CLIPProcessor && CLIPVisionModelWithProjection) {
        this.visionProcessorPromise = CLIPProcessor.from_pretrained(this.modelName);
        this.visionModelPromise = CLIPVisionModelWithProjection.from_pretrained(this.modelName);
        this.usePipeline = false;
        console.log('✅ Using direct CLIP vision model');
      } else {
        // Fallback: image-feature-extraction pipeline
        this.featureExtractorPipeline = await pipeline(
          'image-feature-extraction',
          this.modelName,
          { quantized: false }
        );
        this.usePipeline = true;
        console.log('⚠️ Using fallback pipeline("image-feature-extraction")');
      }

      // Zero-shot image classification pipeline (optional)
      if (!this.model) {
        this.model = await pipeline('zero-shot-image-classification', this.modelName, {
          quantized: false,
          progress_callback: (progress) => {
            if (progress.status === 'downloading') {
              console.log(`📥 Downloading model: ${Math.round(progress.progress * 100)}%`);
            } else if (progress.status === 'loading') {
              console.log('🔄 Loading model...');
            }
          }
        });
      }

      this.initialized = true;
    } catch (err) {
      console.error('❌ Initialization error:', err.message);
      throw err;
    }
  }

  async preprocessImage(imageBuffer) {
    return sharp(imageBuffer)
      .resize(224, 224, { fit: 'cover' })
      .removeAlpha()           // remove alpha if present
      .toFormat('png')         // force PNG
      .raw()                   // output raw RGB pixels
      .toBuffer({ resolveWithObject: true })
      .then(({ data, info }) => {
        if (info.channels !== 3) {
          throw new Error(`Unexpected number of channels: ${info.channels}`);
        }
        return { data, width: info.width, height: info.height };
      });
  }

  normalizeEmbedding(vector, targetLength = 704) { // 512 (CLIP) + 192 (color histogram)
    const result = new Array(targetLength).fill(0);
    for (let i = 0; i < Math.min(vector.length, targetLength); i++) {
      result[i] = vector[i];
    }
    return result;
  }

  async generateTextEmbedding(text, useColorHistogram = false) {
    await this.initialize();
    const key = `text:${text}:${useColorHistogram}`;
    if (this.embeddingCache.has(key)) return this.embeddingCache.get(key);

    const tokenizer = await this.tokenizerPromise;
    const model = await this.textModelPromise;
    if (!tokenizer || !model) {
      throw new Error('Text model/tokenizer not available');
    }

    const inputs = await tokenizer(text, { padding: true, truncation: true });
    const { text_embeds } = await model(inputs, {
      pooling: "mean",
      normalize: true,
    });
    const clipEmbedding = Array.from(text_embeds.data);

    if (useColorHistogram) {
      // For color queries, add color histogram information
      const colorHistogram = this.generateColorHistogramForText(text);
      
      // Fuse CLIP embedding with color histogram
      const fusedEmbedding = [...clipEmbedding, ...colorHistogram];
      const embedding = this.normalizeEmbedding(fusedEmbedding, 704);

      this.embeddingCache.set(key, embedding);
      return embedding;
    } else {
      // Return original CLIP embedding for backward compatibility
      const embedding = this.normalizeEmbedding(clipEmbedding, 512);

      this.embeddingCache.set(key, embedding);
      return embedding;
    }
  }

  generateColorHistogramForText(text) {
    const textLower = text.toLowerCase();
    const histogram = new Array(192).fill(0); // 64 bins * 3 channels
    
    // Define color ranges for each color
    const colorRanges = {
      'red': { r: [0.6, 1.0], g: [0.0, 0.4], b: [0.0, 0.4] },
      'blue': { r: [0.0, 0.4], g: [0.0, 0.4], b: [0.6, 1.0] },
      'green': { r: [0.0, 0.4], g: [0.6, 1.0], b: [0.0, 0.4] },
      'yellow': { r: [0.6, 1.0], g: [0.6, 1.0], b: [0.0, 0.4] },
      'white': { r: [0.8, 1.0], g: [0.8, 1.0], b: [0.8, 1.0] },
      'black': { r: [0.0, 0.2], g: [0.0, 0.2], b: [0.0, 0.2] },
      'gray': { r: [0.3, 0.7], g: [0.3, 0.7], b: [0.3, 0.7] },
      'grey': { r: [0.3, 0.7], g: [0.3, 0.7], b: [0.3, 0.7] },
      'silver': { r: [0.6, 0.8], g: [0.6, 0.8], b: [0.6, 0.8] },
      'brown': { r: [0.4, 0.7], g: [0.2, 0.5], b: [0.0, 0.3] },
      'orange': { r: [0.8, 1.0], g: [0.4, 0.6], b: [0.0, 0.2] },
      'purple': { r: [0.4, 0.7], g: [0.0, 0.3], b: [0.4, 0.7] }
    };

    // Check for color terms and create histogram
    for (const [color, ranges] of Object.entries(colorRanges)) {
      if (textLower.includes(color)) {
        // Set histogram values for this color
        for (let i = 0; i < 64; i++) {
          const normalizedValue = i / 63; // 0 to 1
          
          // Red channel
          if (normalizedValue >= ranges.r[0] && normalizedValue <= ranges.r[1]) {
            histogram[i] = 1.0;
          }
          
          // Green channel
          if (normalizedValue >= ranges.g[0] && normalizedValue <= ranges.g[1]) {
            histogram[64 + i] = 1.0;
          }
          
          // Blue channel
          if (normalizedValue >= ranges.b[0] && normalizedValue <= ranges.b[1]) {
            histogram[128 + i] = 1.0;
          }
        }
        break; // Only process the first color found
      }
    }

    return histogram;
  }

  async computeColorHistogram(imageBuffer, options = {}) {
    const { bins = 64, useCarDetection = true } = options;
    
    try {
      // If car detection is enabled, try to focus on car regions
      if (useCarDetection) {
        try {
          const carRegion = await carDetectionService.getBestCarRegion(imageBuffer);
          if (carRegion) {
            console.log('🎯 Computing color histogram for detected car region');
            return await carDetectionService.computeCarColorHistogram(imageBuffer, carRegion, { bins });
          }
        } catch (error) {
          console.warn('⚠️ Car detection failed, falling back to full image histogram:', error.message);
        }
      }

      // Fallback to full image histogram
      const { data, info } = await sharp(imageBuffer)
        .resize(224, 224, { fit: 'cover' })
        .removeAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

      const histogram = new Array(bins * 3).fill(0); // RGB channels
      const pixelCount = data.length / 3;
      
      // Compute histogram for each RGB channel
      for (let i = 0; i < data.length; i += 3) {
        const r = Math.floor((data[i] / 255) * bins);
        const g = Math.floor((data[i + 1] / 255) * bins);
        const b = Math.floor((data[i + 2] / 255) * bins);
        
        histogram[r]++;
        histogram[bins + g]++;
        histogram[bins * 2 + b]++;
      }
      
      // Normalize histogram
      for (let i = 0; i < histogram.length; i++) {
        histogram[i] = histogram[i] / pixelCount;
      }
      
      return histogram;
    } catch (error) {
      console.error('Error computing color histogram:', error);
      return new Array(bins * 3).fill(0);
    }
  }

  async generateImageEmbedding(imageBuffer, useColorHistogram = false, useCarDetection = true, preProcessedForCarDetection = false) {
    await this.initialize();
    const key = `image:${imageBuffer.toString('base64').slice(0, 50)}:${useColorHistogram}:${useCarDetection}:${preProcessedForCarDetection}`;
    if (this.embeddingCache.has(key)) return this.embeddingCache.get(key);

    let targetImageBuffer = imageBuffer;
    let carDetectionInfo = null;

    // If car detection is enabled and image hasn't been pre-processed, try to focus on car regions
    if (useCarDetection && !preProcessedForCarDetection) {
      try {
        const carRegion = await carDetectionService.getBestCarRegion(imageBuffer);
        if (carRegion) {
          console.log('🎯 Using car-focused image for embedding generation');
          targetImageBuffer = await carDetectionService.createFocusedImage(imageBuffer, carRegion);
          carDetectionInfo = {
            detected: true,
            confidence: carRegion.score,
            label: carRegion.label
          };
        } else {
          console.log('⚠️ No car detected, using full image');
          carDetectionInfo = { detected: false };
        }
      } catch (error) {
        console.warn('⚠️ Car detection failed, using full image:', error.message);
        carDetectionInfo = { detected: false, error: error.message };
      }
    } else if (preProcessedForCarDetection) {
      console.log('🎯 Using pre-processed car-focused image for embedding generation');
      carDetectionInfo = { detected: true, preProcessed: true };
    }

    const { data, width, height } = await this.preprocessImage(targetImageBuffer);
    let clipEmbedding;

    const { RawImage } = await import('@xenova/transformers');

    if (this.usePipeline) {
      console.log('🧪 Using fallback pipeline for image-feature-extraction');
      const rawImage = new RawImage(data, width, height, 3); // width, height, channels
      const output = await this.featureExtractorPipeline(rawImage);
      clipEmbedding = Array.isArray(output[0]) ? output[0] : output;
    } else {
      console.log('🖼️ Using direct CLIP vision model');
      const visionProcessor = await this.visionProcessorPromise;
      const visionModel = await this.visionModelPromise;
      const rawImage = new RawImage(data, width, height, 3);
      const inputs = await visionProcessor(rawImage);
      const { image_embeds } = await visionModel(inputs, {
        pooling: "mean",
        normalize: true,
      });
      clipEmbedding = Array.from(image_embeds.data);
    }

    if (useColorHistogram) {
      // Generate color histogram for better color discrimination
      const colorHistogram = await this.computeColorHistogram(imageBuffer, { 
        bins: 64, 
        useCarDetection: useCarDetection 
      });
      
      // Fuse CLIP embedding with color histogram
      const fusedEmbedding = [...clipEmbedding, ...colorHistogram];
      
      // Normalize the fused embedding
      const normalizedEmbedding = this.normalizeEmbedding(fusedEmbedding, 704);
      
      this.embeddingCache.set(key, normalizedEmbedding);
      return normalizedEmbedding;
    } else {
      // Return original CLIP embedding for backward compatibility
      const normalizedEmbedding = this.normalizeEmbedding(clipEmbedding, 512);
      
      this.embeddingCache.set(key, normalizedEmbedding);
      return normalizedEmbedding;
    }
  }

  async generateEnhancedImageEmbedding(imageBuffer, tags = [], useColorHistogram = false, useCarDetection = true, preProcessedForCarDetection = false) {
    let imageEmbedding = await this.generateImageEmbedding(imageBuffer, useColorHistogram, useCarDetection, preProcessedForCarDetection);
    if (!tags || tags.length === 0) return imageEmbedding;

    let tagEmbedding = await this.generateTextEmbedding(tags.join(' '), useColorHistogram);

    const combined = [];
    const imageWeight = 0.7;
    const tagWeight = 0.3;
    const embeddingSize = useColorHistogram ? 704 : 512;

    for (let i = 0; i < embeddingSize; i++) {
      combined.push((imageEmbedding[i] || 0) * imageWeight + (tagEmbedding[i] || 0) * tagWeight);
    }

    return combined;
  }

  async clearCache() {
    this.embeddingCache.clear();
    console.log('✅ CLIP embedding cache cleared');
  }

  // Method to clear cache and force regeneration of embeddings with new format
  async clearCacheAndRegenerate() {
    console.log('🔄 Clearing cache and regenerating embeddings with color histogram enhancement...');
    this.embeddingCache.clear();
    console.log('✅ Cache cleared - embeddings will be regenerated with color histogram data');
  }

  // Process query → enhanced string + embedding
  async processQuery(query, useColorHistogram = false) {
    const enhancedQuery = this.enhanceQuery(query);
    
    // Check if query contains color information
    const hasColor = this.queryContainsColor(query);
    
    // Only use color histogram if query contains colors OR explicitly requested
    const shouldUseColorHistogram = useColorHistogram || hasColor;
    
    // For color queries, generate multiple variations to improve discrimination
    const queryVariations = this.generateQueryVariations(query);
    
    // Generate embeddings for all variations
    const embeddings = await Promise.all(
      queryVariations.map(variation => this.generateTextEmbedding(variation, shouldUseColorHistogram))
    );
    
    // Combine embeddings using weighted average (original query gets higher weight)
    const combinedEmbedding = this.combineEmbeddings(embeddings, [0.4, 0.2, 0.2, 0.2]);
    
    return { 
      originalQuery: query, 
      enhancedQuery, 
      queryVariations,
      embedding: combinedEmbedding,
      usedColorHistogram: shouldUseColorHistogram
    };
  }

  generateQueryVariations(query) {
    const queryLower = query.toLowerCase();
    const variations = [];
    
    // Remove common vehicle words to focus on color/attributes
    const cleanedQuery = queryLower
      .replace(/\b(car|vehicle|automobile|auto)\b/g, '')
      .trim();
    
    // Start with cleaned query (without car/vehicle words)
    if (cleanedQuery) {
      variations.push(cleanedQuery);
    }
    
    // Color-specific variations (without car/vehicle words)
    const colorVariations = {
      'black': ['dark black', 'black colored', 'black paint'],
      'white': ['bright white', 'white colored', 'white paint'],
      'red': ['bright red', 'red colored', 'red paint'],
      'blue': ['deep blue', 'blue colored', 'blue paint'],
      'green': ['vibrant green', 'green colored', 'green paint'],
      'yellow': ['bright yellow', 'yellow colored', 'yellow paint'],
      'silver': ['metallic silver', 'silver colored', 'silver paint'],
      'gray': ['gray colored', 'gray paint', 'gray'],
      'grey': ['grey colored', 'grey paint', 'grey'],
      'brown': ['brown colored', 'brown paint', 'brown'],
      'orange': ['orange colored', 'orange paint', 'orange'],
      'purple': ['purple colored', 'purple paint', 'purple']
    };
    
    // Add color-specific variations
    for (const [color, colorVars] of Object.entries(colorVariations)) {
      if (queryLower.includes(color)) {
        variations.push(...colorVars.slice(0, 3)); // Add up to 3 variations
        break;
      }
    }
    
    // If no variations were added, use the original query
    if (variations.length === 0) {
      variations.push(query);
    }
    
    return variations.slice(0, 4); // Return up to 4 variations
  }

  combineEmbeddings(embeddings, weights) {
    if (embeddings.length === 0) return [];
    if (embeddings.length === 1) return embeddings[0];
    
    const combined = new Array(embeddings[0].length).fill(0);
    
    for (let i = 0; i < embeddings.length; i++) {
      const weight = weights[i] || (1 / embeddings.length);
      for (let j = 0; j < combined.length; j++) {
        combined[j] += embeddings[i][j] * weight;
      }
    }
    
    return this.normalizeEmbedding(combined);
  }

  // Check if query contains color information
  queryContainsColor(query) {
    const queryLower = query.toLowerCase();
    const colors = ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown', 'black', 'white', 'gray', 'grey', 'silver', 'gold', 'bronze', 'maroon', 'navy', 'beige', 'cream', 'turquoise'];
    
    return colors.some(color => queryLower.includes(color));
  }
  enhanceQuery(query) {
    const queryLower = query.toLowerCase();
    const enhancements = [];
    
    // Remove only generic vehicle words, keep specific types like suv, sedan, etc.
    const cleanedQuery = queryLower
      .replace(/\b(car|vehicle|automobile|auto)\b/g, '')
      .trim();
    
    // // Enhanced color processing - make colors more specific without vehicle words
    // const colorEnhancements = {
    //   'black': 'dark black colored',
    //   'white': 'bright white colored', 
    //   'red': 'bright red colored',
    //   'blue': 'deep blue colored',
    //   'green': 'vibrant green colored',
    //   'yellow': 'bright yellow colored',
    //   'silver': 'metallic silver colored',
    //   'gray': 'gray colored',
    //   'grey': 'grey colored',
    //   'brown': 'brown colored',
    //   'orange': 'orange colored',
    //   'purple': 'purple colored'
    // };

    // // Check for color terms and enhance them with more specific descriptions
    // let hasColor = false;
    // for (const [color, enhancement] of Object.entries(colorEnhancements)) {
    //   if (queryLower.includes(color)) {
    //     enhancements.push(enhancement);
    //     hasColor = true;
    //     break; // Only enhance the first color found
    //   }
    // }
    
    // // For color queries, add more specific color-related terms (without vehicle words)
    // if (hasColor) {
    //   enhancements.push('painted', 'colored');
    // }
    
    // // Add attribute-specific enhancements (without vehicle words)
    // if (queryLower.includes('sport') || queryLower.includes('fast')) {
    //   enhancements.push('performance', 'racing');
    // }
    
    // if (queryLower.includes('luxury') || queryLower.includes('expensive')) {
    //   enhancements.push('premium', 'high-end');
    // }
    
    // if (queryLower.includes('truck') || queryLower.includes('pickup')) {
    //   enhancements.push('commercial', 'utility');
    // }
    
    // if (queryLower.includes('suv') || queryLower.includes('crossover')) {
    //   enhancements.push('sport utility', 'family');
    // }
    
    // Use cleaned query as base, add enhancements
    const baseQuery = cleanedQuery || query;
    const allTerms = [baseQuery, ...enhancements];
    return allTerms.join(' ');
  }

  // Hybrid search combining semantic and keyword matching
  async hybridSearch(query, semanticResults, options = {}) {
    const {
      semanticWeight = 0.7,
      keywordWeight = 0.3,
      boostExactMatches = true,
      boostRecentImages = true
    } = options;

    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/\s+/).filter(word => word.length > 2);

    return semanticResults.map(result => {
      let hybridScore = result.similarity * semanticWeight;
      
      // Keyword matching boost
      const filename = (result.filename || '').toLowerCase();
      const originalName = (result.originalName || '').toLowerCase();
      const tags = (result.tags || []).map(tag => tag.toLowerCase());
      const allText = [filename, originalName, ...tags].join(' ');
      
      let keywordScore = 0;
      queryWords.forEach(word => {
        if (allText.includes(word)) {
          keywordScore += 1;
        }
      });
      
      // Normalize keyword score
      keywordScore = Math.min(keywordScore / queryWords.length, 1);
      hybridScore += keywordScore * keywordWeight;
      
      // Boost exact matches
      if (boostExactMatches) {
        if (filename.includes(queryLower) || originalName.includes(queryLower)) {
          hybridScore += 0.1;
        }
      }
      
      // Boost recent images (if metadata has upload date)
      if (boostRecentImages && result.metadata && result.metadata.uploadDate) {
        const uploadDate = new Date(result.metadata.uploadDate);
        const daysSinceUpload = (Date.now() - uploadDate.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceUpload < 7) {
          hybridScore += 0.05; // Small boost for recent uploads
        }
      }
      
      return {
        ...result,
        similarity: Math.min(hybridScore, 1), // Cap at 1.0
        keywordScore,
        searchType: 'hybrid'
      };
    }).sort((a, b) => b.similarity - a.similarity);
  }

  // Analyze search intent for better NLP understanding
  analyzeIntent(query) {
    const queryLower = query.toLowerCase();
    const intent = {
      color: [],
      // vehicleType: [],
      features: [],
      brand: [],
      style: [],
      performance: []
    };

    // Color detection
    const colors = ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown', 'black', 'white', 'gray', 'grey', 'silver', 'gold', 'bronze'];
    colors.forEach(color => {
      if (queryLower.includes(color)) {
        intent.color.push(color);
      }
    });

    // Vehicle type detection
    // const vehicleTypes = ['car', 'truck', 'suv', 'sedan', 'hatchback', 'convertible', 'coupe', 'wagon', 'pickup', 'van', 'minivan', 'crossover', 'sports car', 'luxury car', 'family car'];
    // vehicleTypes.forEach(type => {
    //   if (queryLower.includes(type)) {
    //     intent.vehicleType.push(type);
    //   }
    // });

    // Feature detection
    const features = ['sunroof', 'leather', 'automatic', 'manual', 'all-wheel drive', 'awd', '4wd', 'hybrid', 'electric', 'turbo', 'v8', 'v6', 'diesel', 'gas', 'fuel efficient', 'spacious', 'compact', 'large', 'small'];
    features.forEach(feature => {
      if (queryLower.includes(feature)) {
        intent.features.push(feature);
      }
    });

    // Brand detection
    const brands = ['bmw', 'mercedes', 'audi', 'lexus', 'toyota', 'honda', 'ford', 'chevrolet', 'nissan', 'hyundai', 'kia', 'volkswagen', 'porsche', 'ferrari', 'lamborghini', 'mazda', 'subaru', 'infiniti', 'acura', 'cadillac', 'lincoln', 'buick', 'chrysler', 'dodge', 'jeep', 'ram', 'gmc'];
    brands.forEach(brand => {
      if (queryLower.includes(brand)) {
        intent.brand.push(brand);
      }
    });

    // Style detection
    const styles = ['sporty', 'luxury', 'economical', 'affordable', 'expensive', 'premium', 'budget', 'classic', 'modern', 'vintage', 'retro', 'futuristic'];
    styles.forEach(style => {
      if (queryLower.includes(style)) {
        intent.style.push(style);
      }
    });

    // Performance detection
    const performance = ['fast', 'slow', 'powerful', 'efficient', 'quick', 'speedy', 'performance', 'racing', 'sport', 'turbocharged', 'high-performance'];
    performance.forEach(perf => {
      if (queryLower.includes(perf)) {
        intent.performance.push(perf);
      }
    });

    return intent;
  }
}

module.exports = new ClipService();
