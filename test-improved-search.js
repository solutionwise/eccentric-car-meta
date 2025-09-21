const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3001/api';

async function testImprovedSearch() {
  console.log('🧪 Testing Improved Search System...\n');

  const testQueries = [
    'red sports car',
    'luxury black sedan',
    'BMW convertible',
    'family SUV with sunroof',
    'fast blue car',
    'white Toyota',
    'electric vehicle',
    'sporty hatchback',
    'classic car',
    'modern luxury vehicle'
  ];

  try {
    for (const query of testQueries) {
      console.log(`\n🔍 Testing query: "${query}"`);
      console.log('─'.repeat(50));
      
      const response = await fetch(`${API_BASE}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          limit: 5,
          minSimilarity: 0.1,
          useHybridSearch: true,
          semanticWeight: 0.7,
          keywordWeight: 0.3
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        console.log(`✅ Query processed successfully`);
        console.log(`📊 Enhanced query: "${data.enhancedQuery}"`);
        console.log(`🔀 Search method: ${data.searchMethod}`);
        console.log(`📈 Results found: ${data.totalResults}/${data.totalFound}`);
        
        if (data.results && data.results.length > 0) {
          console.log('\n🏆 Top results:');
          data.results.forEach((result, index) => {
            const similarity = Math.round(result.similarity * 100);
            const keywordScore = result.keywordScore ? Math.round(result.keywordScore * 100) : 'N/A';
            const hybridScore = result.hybridScore ? Math.round(result.hybridScore * 100) : 'N/A';
            
            console.log(`  ${index + 1}. ${result.originalName || result.filename}`);
            console.log(`     Similarity: ${similarity}% | Keyword: ${keywordScore}% | Hybrid: ${hybridScore}%`);
            console.log(`     Tags: ${(result.tags || []).join(', ') || 'None'}`);
          });
        } else {
          console.log('❌ No results found');
        }
      } else {
        const error = await response.json();
        console.log(`❌ Search failed: ${error.error}`);
      }
      
      // Wait a bit between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Test search suggestions
    console.log('\n\n💡 Testing search suggestions...');
    console.log('─'.repeat(50));
    
    const suggestionsResponse = await fetch(`${API_BASE}/search/suggestions?q=red`);
    if (suggestionsResponse.ok) {
      const suggestionsData = await suggestionsResponse.json();
      console.log('✅ Suggestions:', suggestionsData.suggestions);
    }

    // Test intent analysis
    console.log('\n\n🧠 Testing intent analysis...');
    console.log('─'.repeat(50));
    
    const intentResponse = await fetch(`${API_BASE}/search/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: 'fast red BMW convertible with leather seats'
      })
    });

    if (intentResponse.ok) {
      const intentData = await intentResponse.json();
      console.log('✅ Intent analysis:');
      console.log('   Original:', intentData.originalQuery);
      console.log('   Enhanced:', intentData.enhancedQuery);
      console.log('   Intent:', JSON.stringify(intentData.intent, null, 2));
    }

  } catch (error) {
    console.log('❌ Test failed with error:', error.message);
  }

  console.log('\n🏁 Improved search test completed!');
}

// Run the test
testImprovedSearch();
