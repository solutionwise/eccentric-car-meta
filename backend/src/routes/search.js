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
      limit = 10, 
      minSimilarity = 0.75, // Higher threshold for better precision
      useHybridSearch = false,
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

    // Process the query and generate embedding (automatically detect if color histogram is needed)
    const queryResult = await clipService.processQuery(query, false); // Let it auto-detect color usage
    console.log(`📊 Query embedding length: ${queryResult.embedding.length}, Used color histogram: ${queryResult.usedColorHistogram}`);
    
    // Analyze search intent for better understanding (keeping for response)
    const intent = clipService.analyzeIntent(query);
    
    // Extract relevant tags from the query for filtering
    const queryTags = [];
    const queryLower = query.toLowerCase();
    
    // Define tag categories for filtering
    const tagCategories = {
      colors: ['red', 'blue', 'white', 'black', 'silver', 'gray', 'grey', 'green', 'yellow', 'orange', 'purple', 'brown', 'gold', 'bronze', 'maroon', 'navy', 'beige', 'cream', 'pink', 'turquoise'],
      types: ['sedan', 'suv', 'truck', 'convertible', 'hatchback', 'coupe', 'wagon', 'minivan', 'pickup', 'crossover', 'sports car', 'luxury car', 'supercar', 'muscle car', 'electric car', 'hybrid', 'roadster', 'cabriolet'],
      features: ['sunroof', 'leather', 'alloy wheels', 'spoiler', 'navigation', 'bluetooth', 'automatic', 'manual', 'all-wheel drive', 'four-wheel drive', 'turbo', 'v8', 'v6', 'diesel', 'electric', 'hybrid', 'premium sound', 'heated seats', 'cooled seats', 'backup camera', 'parking sensors', 'adaptive cruise', 'lane assist', 'blind spot monitoring', 'premium interior', 'sport package', 'front spoiler'],
      brands: ['toyota', 'honda', 'bmw', 'ford', 'chevrolet', 'audi', 'mercedes', 'volkswagen', 'nissan', 'hyundai', 'kia', 'mazda', 'subaru', 'lexus', 'acura', 'infiniti', 'cadillac', 'lincoln', 'jeep', 'ram', 'dodge', 'chrysler', 'porsche', 'ferrari', 'lamborghini', 'mclaren', 'bentley', 'rolls royce', 'maserati', 'alfa romeo', 'jaguar', 'land rover', 'volvo', 'saab', 'mini', 'smart', 'tesla', 'genesis', 'buick', 'gmc', 'maruti suzuki']
    };
    
    // Extract tags from query
    Object.values(tagCategories).flat().forEach(tag => {
      if (queryLower.includes(tag.toLowerCase())) {
        queryTags.push(tag.toLowerCase());
      }
    });
    
    console.log(`🔍 Extracted tags from query: ${queryTags.join(', ')}`);
    
    // Use dimension-matched search to handle embedding size differences
    const searchResults = await weaviateService.searchImagesWithDimensionMatching(
      queryResult.embedding, 
      queryResult.embedding.length,
      limit * 3 // Get more results for better filtering
    );
    
    // Check if we got results - if not, the embeddings in Weaviate might be empty
    if (searchResults.length === 0) {
      console.log('⚠️ No results from Weaviate vector search - checking if embeddings are empty...');
      
      // Try to get any objects from Weaviate to check if embeddings exist
      const testResult = await weaviateService.client.graphql
        .get()
        .withClassName('AutomotiveImage')
        .withFields('_additional { id vector }')
        .withLimit(1)
        .do();
      
      const testObjects = testResult.data.Get['AutomotiveImage'] || [];
      if (testObjects.length > 0 && testObjects[0]._additional.vector.length === 0) {
        return res.json({
          query: queryResult.originalQuery,
          enhancedQuery: queryResult.enhancedQuery,
          intent: intent,
          results: [],
          totalResults: 0,
          totalFound: 0,
          minSimilarity: minSimilarity,
          searchMethod: 'hybrid-embeddings-only',
          message: 'Images found in database but embeddings are empty. Please re-upload images to generate proper embeddings.',
          searchTime: Date.now()
        });
      }
    }

    // Process results directly from Weaviate with intelligent scoring
    const enrichedResults = searchResults.map((result) => {
      const similarity = result._additional.distance ? 1 - result._additional.distance : 0.9; // Convert distance to similarity
      
      // Calculate tag match bonus/penalty
      let tagMatchBonus = 0;
      const resultTags = result.tags || [];
      
      if (queryTags.length > 0) {
        const matchingTags = queryTags.filter(tag => 
          resultTags.some(resultTag => resultTag.toLowerCase().includes(tag.toLowerCase()))
        );
        
        // Check for color mismatches (penalty system)
        const colorTags = ['red', 'blue', 'white', 'black', 'silver', 'gray', 'grey', 'green', 'yellow', 'orange', 'purple', 'brown', 'gold', 'bronze', 'maroon', 'navy', 'beige', 'cream', 'pink', 'turquoise'];
        const queryColors = queryTags.filter(tag => colorTags.includes(tag));
        const resultColors = resultTags.filter(tag => colorTags.includes(tag));
        
        // Apply penalty for color mismatches
        if (queryColors.length > 0 && resultColors.length > 0) {
          const hasColorMatch = queryColors.some(queryColor => 
            resultColors.some(resultColor => resultColor.toLowerCase() === queryColor.toLowerCase())
          );
          
          if (!hasColorMatch) {
            // Apply penalty for color mismatch
            tagMatchBonus = -0.15; // 15% penalty
            console.log(`🚫 Color mismatch penalty applied: query colors [${queryColors.join(', ')}] vs result colors [${resultColors.join(', ')}]`);
          }
        }
        
        // Apply penalty for brand mismatches
        const brandTags = ['toyota', 'honda', 'bmw', 'ford', 'chevrolet', 'audi', 'mercedes', 'volkswagen', 'nissan', 'hyundai', 'kia', 'mazda', 'subaru', 'lexus', 'acura', 'infiniti', 'cadillac', 'lincoln', 'jeep', 'ram', 'dodge', 'chrysler', 'porsche', 'ferrari', 'lamborghini', 'mclaren', 'bentley', 'rolls royce', 'maserati', 'alfa romeo', 'jaguar', 'land rover', 'volvo', 'saab', 'mini', 'smart', 'tesla', 'genesis', 'buick', 'gmc', 'maruti suzuki'];
        const queryBrands = queryTags.filter(tag => brandTags.includes(tag));
        const resultBrands = resultTags.filter(tag => brandTags.includes(tag));
        
        if (queryBrands.length > 0 && resultBrands.length > 0) {
          const hasBrandMatch = queryBrands.some(queryBrand => 
            resultBrands.some(resultBrand => resultBrand.toLowerCase() === queryBrand.toLowerCase())
          );
          
          if (!hasBrandMatch) {
            // Apply penalty for brand mismatch
            tagMatchBonus = -0.25; // 25% penalty for brand mismatch
            console.log(`🚫 Brand mismatch penalty applied: query brands [${queryBrands.join(', ')}] vs result brands [${resultBrands.join(', ')}]`);
          }
        }
        
        // Additional penalty for images with no tags when color is queried
        // Apply penalty regardless of whether other tagged results exist
        if (queryColors.length > 0 && resultTags.length === 0 && tagMatchBonus >= 0) {
          tagMatchBonus = -0.1; // 10% penalty
          console.log(`⚠️ Untagged image penalty applied for color query: [${queryColors.join(', ')}]`);
        }
        
        // Apply positive bonus if no color penalty
        if (tagMatchBonus >= 0) {
          // Give bonus for more tag matches, up to 20% bonus
          tagMatchBonus = (matchingTags.length / queryTags.length) * 0.2;
          
          // Special bonus for exact tag matches
          const exactMatches = queryTags.filter(tag => 
            resultTags.some(resultTag => resultTag.toLowerCase() === tag.toLowerCase())
          );
          tagMatchBonus += exactMatches.length * 0.03; // Additional 3% per exact match
        }
      }
      
      // Calculate final similarity score
      const finalSimilarity = Math.min(1.0, similarity + tagMatchBonus);
      
      return {
        id: result._additional.id, // Use Weaviate ID as the primary identifier
        filename: result.filename || `image-${result._additional.id.slice(0, 8)}`, // Fallback for missing filename
        originalName: result.originalName || 'Unknown',
        filePath: result.filePath || 'Unknown',
        tags: result.tags || [],
        metadata: result.metadata,
        similarity: finalSimilarity,
        originalSimilarity: similarity,
        tagMatchBonus: tagMatchBonus,
        distance: result._additional.distance,
        weaviateId: result._additional.id,
        searchType: queryTags.length > 0 ? 'semantic-tag-filtered' : 'embeddings-only'
      };
    });

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

    // Sort by final similarity score (highest first)
    const sortedResults = finalResults.sort((a, b) => b.similarity - a.similarity);

    // Apply dynamic threshold based on results
    let effectiveThreshold = minSimilarity;
    
    // If we have tag-based queries, be more selective
    if (queryTags.length > 0) {
      // Find the highest similarity score among tagged results only
      const taggedResults = sortedResults.filter(result => (result.tags || []).length > 0);
      const maxSimilarity = taggedResults.length > 0 ? taggedResults[0].similarity : 0;
      
      // Check if this is a color-only query
      const colorTags = ['red', 'blue', 'white', 'black', 'silver', 'gray', 'grey', 'green', 'yellow', 'orange', 'purple', 'brown', 'gold', 'bronze', 'maroon', 'navy', 'beige', 'cream', 'pink', 'turquoise'];
      const isColorQuery = queryTags.some(tag => colorTags.includes(tag));
      
      if (isColorQuery) {
        // For color queries, check if we have any tagged results with matching colors
        const hasMatchingColorResults = taggedResults.some(result => {
          const resultTags = result.tags || [];
          const resultColors = resultTags.filter(tag => colorTags.includes(tag));
          return queryTags.some(queryColor => 
            resultColors.some(resultColor => resultColor.toLowerCase() === queryColor.toLowerCase())
          );
        });
        
        if (hasMatchingColorResults) {
          // If we have matching colors, be lenient to show them
          effectiveThreshold = Math.max(0.8, maxSimilarity * 0.85);
          console.log(`🎯 Color query with matches threshold: ${effectiveThreshold.toFixed(3)} (max similarity: ${maxSimilarity.toFixed(3)})`);
        } else {
          // If no matching colors, be strict to avoid showing irrelevant results
          effectiveThreshold = Math.max(0.85, maxSimilarity * 0.95);
          console.log(`🎯 Color query no matches threshold: ${effectiveThreshold.toFixed(3)} (max similarity: ${maxSimilarity.toFixed(3)})`);
        }
      } else {
        // For brand and other tag queries, be more lenient
        // Check if this is a brand query
        const brandTags = ['toyota', 'honda', 'bmw', 'ford', 'chevrolet', 'audi', 'mercedes', 'volkswagen', 'nissan', 'hyundai', 'kia', 'mazda', 'subaru', 'lexus', 'acura', 'infiniti', 'cadillac', 'lincoln', 'jeep', 'ram', 'dodge', 'chrysler', 'porsche', 'ferrari', 'lamborghini', 'mclaren', 'bentley', 'rolls royce', 'maserati', 'alfa romeo', 'jaguar', 'land rover', 'volvo', 'saab', 'mini', 'smart', 'tesla', 'genesis', 'buick', 'gmc', 'maruti suzuki'];
        const isBrandQuery = queryTags.some(tag => brandTags.includes(tag));
        
        if (isBrandQuery) {
          // For brand queries, use a stricter threshold to avoid showing wrong brands
          effectiveThreshold = Math.max(0.75, maxSimilarity * 0.9);
          console.log(`🎯 Brand query threshold: ${effectiveThreshold.toFixed(3)} (max similarity: ${maxSimilarity.toFixed(3)})`);
        } else {
          // For other tag queries, be more lenient
          effectiveThreshold = Math.max(0.8, maxSimilarity * 0.85);
          console.log(`🎯 Tag query threshold: ${effectiveThreshold.toFixed(3)} (max similarity: ${maxSimilarity.toFixed(3)})`);
        }
      }
    }

    // Filter by effective similarity threshold
    // Apply the same threshold to all images for brand queries to avoid showing irrelevant results
    const filteredResults = sortedResults.filter(result => {
      const hasTags = (result.tags || []).length > 0;
      const isBrandQuery = queryTags.some(tag => ['toyota', 'honda', 'bmw', 'ford', 'chevrolet', 'audi', 'mercedes', 'volkswagen', 'nissan', 'hyundai', 'kia', 'mazda', 'subaru', 'lexus', 'acura', 'infiniti', 'cadillac', 'lincoln', 'jeep', 'ram', 'dodge', 'chrysler', 'porsche', 'ferrari', 'lamborghini', 'mclaren', 'bentley', 'rolls royce', 'maserati', 'alfa romeo', 'jaguar', 'land rover', 'volvo', 'saab', 'mini', 'smart', 'tesla', 'genesis', 'buick', 'gmc', 'maruti suzuki'].includes(tag));
      
      // For brand queries, apply the same strict threshold to all images
      // For other queries, untagged images use the base threshold
      const threshold = (isBrandQuery || hasTags) ? effectiveThreshold : minSimilarity;
      
      
      return result.similarity >= threshold;
    });

    // Limit results
    const limitedResults = filteredResults.slice(0, limit);

    res.json({
      query: queryResult.originalQuery,
      enhancedQuery: queryResult.enhancedQuery,
      intent: intent,
      results: limitedResults,
      totalResults: limitedResults.length,
      totalFound: filteredResults.length,
      minSimilarity: minSimilarity,
      searchMethod: useHybridSearch ? 'hybrid-embeddings-only' : 'embeddings-only',
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
    
    res.json({
      totalImages,
      searchMethod: 'Hybrid search with NLP intent analysis',
      searchCapabilities: [
        'Natural language search with CLIP embeddings',
        'Intent analysis for color, vehicle type, features, brand, style, and performance',
        'Hybrid search combining semantic and keyword matching',
        'Enhanced query processing with automotive domain knowledge',
        'Smart query expansion with related terms',
        'Exact match boosting and recent image prioritization'
      ],
      supportedQueries: [
        'Find red sports cars',
        'Show me luxury SUVs with sunroof',
        'Fast BMW sedans',
        'Family vehicles that are economical',
        'Convertibles with leather seats',
        'Black trucks with all-wheel drive',
        'Affordable hatchbacks with good fuel efficiency'
      ],
      embeddingFeatures: [
        'Proper CLIP vision embeddings',
        'Tag information integrated into embeddings',
        '70% visual + 30% semantic weighting',
        'Enhanced search accuracy with hybrid scoring'
      ],
      nlpFeatures: [
        'Intent analysis for 6 categories (color, vehicle type, features, brand, style, performance)',
        'Query enhancement with automotive domain knowledge',
        'Hybrid search with configurable weights',
        'Smart keyword matching with exact match boosting',
        'Recent image prioritization'
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
        // vehicleType: intent.vehicleType.length > 0 ? `Try searching for "${intent.vehicleType.join(' ')}"` : null,
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
