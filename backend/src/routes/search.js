const express = require('express');
const router = express.Router();
const clipService = require('../services/clipService');
const weaviateService = require('../services/weaviateService');
const Image = require('../models/Image');

// Search endpoint
router.post('/', async (req, res) => {
  try {
    const { 
      query, 
      limit = 20, 
      minSimilarity = 0.4,
      useHybridSearch = true,
      semanticWeight = 0.7,
      keywordWeight = 0.3
    } = req.body;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Search query is required' 
      });
    }

    console.log(`🔍 Processing search query: "${query}"`);

    // Check if there are any images in the database first
    const totalImages = await weaviateService.getStats();
    if (totalImages === 0) {
      return res.json({
        query: query,
        enhancedQuery: clipService.enhanceQuery(query),
        results: [],
        totalResults: 0,
        totalFound: 0,
        minSimilarity: minSimilarity,
        searchMethod: 'none',
        message: 'No images found in database. Please upload some images first.',
        searchTime: Date.now()
      });
    }

    // Process the query and generate embedding
    const queryResult = await clipService.processQuery(query);
    
    // Search in Weaviate with semantic similarity
    const searchResults = await weaviateService.searchImages(
      queryResult.embedding, 
      limit * 2 // Get more results for hybrid search
    );

    // Also search by tags for better coverage
    const tagSearchResults = await Image.searchByTags(
      query.split(/\s+/).filter(word => word.length > 2), 
      limit
    );

    // Enrich semantic search results with database metadata
    const enrichedSemanticResults = await Promise.all(
      searchResults.map(async (result) => {
        try {
          const dbImage = await Image.findByWeaviateId(result._additional.id);
          const similarity = 1 - result._additional.distance; // Convert distance to similarity
          
          return {
            id: dbImage?.id,
            filename: result.filename,
            originalName: result.originalName,
            filePath: result.filePath,
            tags: result.tags || [],
            metadata: result.metadata,
            similarity: similarity,
            distance: result._additional.distance,
            weaviateId: result._additional.id,
            searchType: 'semantic'
          };
        } catch (error) {
          console.error('Error enriching result:', error);
          const similarity = 1 - result._additional.distance;
          
          return {
            filename: result.filename,
            originalName: result.originalName,
            filePath: result.filePath,
            tags: result.tags || [],
            metadata: result.metadata,
            similarity: similarity,
            distance: result._additional.distance,
            weaviateId: result._additional.id,
            searchType: 'semantic'
          };
        }
      })
    );

    // Enrich tag search results
    const enrichedTagResults = tagSearchResults.map(image => {
      let tags = [];
      let metadata = null;
      
      try {
        tags = image.tags ? JSON.parse(image.tags) : [];
      } catch (error) {
        console.warn('Failed to parse tags for image:', image.id, error.message);
        tags = [];
      }
      
      try {
        metadata = image.metadata ? JSON.parse(image.metadata) : null;
      } catch (error) {
        console.warn('Failed to parse metadata for image:', image.id, error.message);
        metadata = null;
      }
      
      return {
        id: image.id,
        filename: image.filename,
        originalName: image.original_name,
        filePath: image.file_path,
        tags: tags,
        metadata: metadata,
        similarity: 0.8, // High similarity for tag matches
        searchType: 'tag'
      };
    });

    // Combine and deduplicate results
    const allResults = [...enrichedSemanticResults, ...enrichedTagResults];
    const uniqueResults = new Map();
    
    allResults.forEach(result => {
      const key = result.id || result.filename;
      if (!uniqueResults.has(key) || result.similarity > uniqueResults.get(key).similarity) {
        uniqueResults.set(key, result);
      }
    });
    
    const enrichedResults = Array.from(uniqueResults.values());

    // Apply hybrid search if enabled
    let finalResults = enrichedResults;
    if (useHybridSearch) {
      finalResults = await clipService.hybridSearch(query, enrichedResults, {
        semanticWeight,
        keywordWeight,
        boostExactMatches: true,
        boostRecentImages: true
      });
    }

    // Filter by minimum similarity threshold
    const filteredResults = finalResults.filter(result => 
      result.similarity >= minSimilarity
    );

    // Limit results
    const limitedResults = filteredResults.slice(0, limit);

    res.json({
      query: queryResult.originalQuery,
      enhancedQuery: queryResult.enhancedQuery,
      results: limitedResults,
      totalResults: limitedResults.length,
      totalFound: filteredResults.length,
      minSimilarity: minSimilarity,
      searchMethod: useHybridSearch ? 'hybrid-semantic-tag' : 'semantic-tag',
      searchTime: Date.now()
    });

  } catch (error) {
    console.error('❌ Search error:', error);
    res.status(500).json({ 
      error: 'Search failed',
      message: error.message 
    });
  }
});

// Get search suggestions
router.get('/suggestions', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({ suggestions: [] });
    }

    // Basic suggestions based on common automotive terms
    const suggestions = [
      'red sports car',
      'blue SUV with sunroof',
      'black luxury sedan',
      'white family car',
      'silver convertible',
      'red truck',
      'blue hatchback',
      'black BMW',
      'white Toyota',
      'silver Mercedes',
      'fast red car',
      'luxury black car',
      'family SUV',
      'sporty blue car',
      'economical white car'
    ].filter(suggestion => 
      suggestion.toLowerCase().includes(q.toLowerCase())
    );

    res.json({ suggestions: suggestions.slice(0, 5) });
  } catch (error) {
    console.error('Suggestions error:', error);
    res.status(500).json({ 
      error: 'Failed to get suggestions' 
    });
  }
});

// Get search analytics
router.get('/analytics', async (req, res) => {
  try {
    const totalImages = await weaviateService.getStats();
    const dbStats = await Image.findAll(1, 0); // Get count from DB
    
    res.json({
      totalImages,
      databaseImages: dbStats.length,
      searchCapabilities: [
        'Natural language search',
        'Color-based search',
        'Vehicle type search',
        'Feature-based search',
        'Brand search',
        'Performance search'
      ],
      supportedQueries: [
        'Find red cars',
        'Show me luxury SUVs',
        'Fast sports cars',
        'Family vehicles',
        'Convertibles with sunroof',
        'BMW sedans',
        'Affordable hatchbacks'
      ]
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ 
      error: 'Failed to get analytics' 
    });
  }
});

// Intent analysis endpoint
router.post('/analyze', async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ 
        error: 'Query is required' 
      });
    }

    const intent = clipService.analyzeIntent(query);
    const enhancedQuery = clipService.enhanceQuery(query);

    res.json({
      originalQuery: query,
      enhancedQuery,
      intent,
      suggestions: {
        color: intent.color.length > 0 ? `Try searching for "${intent.color.join(' ')} vehicles"` : null,
        vehicleType: intent.vehicleType.length > 0 ? `Try searching for "${intent.vehicleType.join(' ')}"` : null,
        features: intent.features.length > 0 ? `Try searching for vehicles with "${intent.features.join(' ')}"` : null,
        brand: intent.brand.length > 0 ? `Try searching for "${intent.brand.join(' ')} vehicles"` : null
      }
    });
  } catch (error) {
    console.error('Intent analysis error:', error);
    res.status(500).json({ 
      error: 'Intent analysis failed' 
    });
  }
});

module.exports = router;
