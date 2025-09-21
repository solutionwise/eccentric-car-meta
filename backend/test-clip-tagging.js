const ImageService = require('./src/services/imageService');
const path = require('path');

async function testClipTagging() {
  
  try {
    const imageService = ImageService; // It's already an instance
    const imagePath = '/Users/zaeemfarooqui/Dev/eccentric-car-meta/backend/uploads/1758121242537_a128b2fb40872fa7.jpeg';
    
    
    // Define predefined tags for automotive images
    const predefinedTags = {
      types: ['sedan', 'suv', 'coupe', 'hatchback', 'convertible', 'truck', 'van'],
      colors: ['red', 'blue', 'black', 'white', 'silver', 'gray', 'green', 'yellow', 'orange'],
      features: ['sporty', 'luxury', 'economical', 'hybrid', 'electric', 'manual', 'automatic'],
      brands: ['toyota', 'honda', 'ford', 'bmw', 'mercedes', 'audi', 'volkswagen', 'nissan']
    };
    
    const startTime = Date.now();
    
    // Test the CLIP tagging functionality
    const detectedTags = await imageService.generateClipTags(imagePath, predefinedTags);
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    
    // Test with different confidence thresholds
    
    // Test individual tag detection
    const testTags = ['car', 'vehicle', 'automobile', 'red', 'blue', 'sporty', 'luxury'];
    
    for (const tag of testTags) {
      try {
        const result = await imageService.generateClipTags(imagePath, {
          types: [tag],
          colors: [],
          features: [],
          brands: []
        });
      } catch (error) {
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
testClipTagging().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('💥 Test crashed:', error);
  process.exit(1);
});
