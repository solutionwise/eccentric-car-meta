const sharp = require('sharp');
const { predefinedTags } = require('../data/predefinedTags');

class ClipService {
  constructor() {
    this.modelName = 'Xenova/clip-vit-base-patch32';
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

  normalizeEmbedding(vector, targetLength = 512) {
    const result = new Array(targetLength).fill(0);
    for (let i = 0; i < Math.min(vector.length, targetLength); i++) {
      result[i] = vector[i];
    }
    return result;
  }

  async generateTextEmbedding(text) {
    await this.initialize();
    const key = `text:${text}`;
    if (this.embeddingCache.has(key)) return this.embeddingCache.get(key);

    const tokenizer = await this.tokenizerPromise;
    const model = await this.textModelPromise;
    if (!tokenizer || !model) {
      throw new Error('Text model/tokenizer not available');
    }

    const inputs = await tokenizer(text, { padding: true, truncation: true });
    const { text_embeds } = await model(inputs);
    const embedding = this.normalizeEmbedding(Array.from(text_embeds.data));

    this.embeddingCache.set(key, embedding);
    return embedding;
  }

  async generateImageEmbedding(imageBuffer) {
    await this.initialize();
    const key = `image:${imageBuffer.toString('base64').slice(0, 50)}`;
    if (this.embeddingCache.has(key)) return this.embeddingCache.get(key);

    const { data, width, height } = await this.preprocessImage(imageBuffer);
    let embedding;

    const { RawImage } = await import('@xenova/transformers');

    if (this.usePipeline) {
      console.log('🧪 Using fallback pipeline for image-feature-extraction');
      const rawImage = new RawImage(data, width, height, 3); // width, height, channels
      const output = await this.featureExtractorPipeline(rawImage);
      embedding = Array.isArray(output[0]) ? output[0] : output;
    } else {
      console.log('🖼️ Using direct CLIP vision model');
      const visionProcessor = await this.visionProcessorPromise;
      const visionModel = await this.visionModelPromise;
      const rawImage = new RawImage(data, width, height, 3);
      const inputs = await visionProcessor(rawImage);
      const { image_embeds } = await visionModel(inputs);
      embedding = Array.from(image_embeds.data);
    }

    embedding = this.normalizeEmbedding(embedding);
    this.embeddingCache.set(key, embedding);
    return embedding;
  }

  async generateEnhancedImageEmbedding(imageBuffer, tags = []) {
    let imageEmbedding = await this.generateImageEmbedding(imageBuffer);
    if (!tags || tags.length === 0) return imageEmbedding;

    let tagEmbedding = await this.generateTextEmbedding(tags.join(' '));

    const combined = [];
    const imageWeight = 0.7;
    const tagWeight = 0.3;

    for (let i = 0; i < 512; i++) {
      combined.push((imageEmbedding[i] || 0) * imageWeight + (tagEmbedding[i] || 0) * tagWeight);
    }

    return combined;
  }

  async clearCache() {
    this.embeddingCache.clear();
    console.log('✅ CLIP embedding cache cleared');
  }

  // Process query → enhanced string + embedding
  async processQuery(query) {
    const enhancedQuery  = this.enhanceQuery(query);
    const embedding = await this.generateTextEmbedding(enhancedQuery);
    return { originalQuery: query, enhancedQuery, embedding };
  }
  enhanceQuery(query) {
    const queryLower = query.toLowerCase();
    const enhancements = [];
    
    // Add related terms based on the query
    if (queryLower.includes('car') || queryLower.includes('vehicle') || queryLower.includes('auto')) {
      enhancements.push('automobile', 'transportation');
    }
    
    if (queryLower.includes('red') || queryLower.includes('blue') || queryLower.includes('color')) {
      enhancements.push('colored vehicle', 'painted car');
    }
    
    if (queryLower.includes('sport') || queryLower.includes('fast')) {
      enhancements.push('performance car', 'racing vehicle');
    }
    
    if (queryLower.includes('luxury') || queryLower.includes('expensive')) {
      enhancements.push('premium car', 'high-end vehicle');
    }
    
    if (queryLower.includes('truck') || queryLower.includes('pickup')) {
      enhancements.push('commercial vehicle', 'utility truck');
    }
    
    if (queryLower.includes('suv') || queryLower.includes('crossover')) {
      enhancements.push('sport utility vehicle', 'family car');
    }
    
    // Combine original query with enhancements
    const allTerms = [query, ...enhancements];
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
