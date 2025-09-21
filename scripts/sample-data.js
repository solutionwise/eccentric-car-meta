#!/usr/bin/env node

/**
 * Sample Data Script
 * 
 * This script creates sample automotive images and uploads them to the system
 * for testing purposes. It generates placeholder images with different colors
 * and adds appropriate tags.
 */

const fs = require('fs').promises;
const path = require('path');
const { createCanvas } = require('canvas');

// Sample automotive data
const sampleCars = [
  {
    name: 'red-sports-car.jpg',
    tags: ['red', 'sports car', 'coupe', 'fast', 'performance'],
    color: '#DC2626',
    type: 'sports'
  },
  {
    name: 'blue-suv.jpg',
    tags: ['blue', 'SUV', 'family', 'spacious', 'all-wheel drive'],
    color: '#2563EB',
    type: 'suv'
  },
  {
    name: 'black-luxury-sedan.jpg',
    tags: ['black', 'luxury', 'sedan', 'premium', 'leather'],
    color: '#000000',
    type: 'sedan'
  },
  {
    name: 'white-family-car.jpg',
    tags: ['white', 'family', 'hatchback', 'economical', 'practical'],
    color: '#FFFFFF',
    type: 'hatchback'
  },
  {
    name: 'silver-convertible.jpg',
    tags: ['silver', 'convertible', 'sports car', 'open-top', 'luxury'],
    color: '#6B7280',
    type: 'convertible'
  },
  {
    name: 'green-truck.jpg',
    tags: ['green', 'truck', 'pickup', 'utility', 'off-road'],
    color: '#059669',
    type: 'truck'
  },
  {
    name: 'yellow-supercar.jpg',
    tags: ['yellow', 'supercar', 'exotic', 'fast', 'racing'],
    color: '#EAB308',
    type: 'supercar'
  },
  {
    name: 'gray-crossover.jpg',
    tags: ['gray', 'crossover', 'SUV', 'modern', 'alloy wheels'],
    color: '#4B5563',
    type: 'crossover'
  },
  {
    name: 'red-muscle-car.jpg',
    tags: ['red', 'muscle car', 'V8', 'powerful', 'American'],
    color: '#DC2626',
    type: 'muscle'
  },
  {
    name: 'blue-electric-car.jpg',
    tags: ['blue', 'electric', 'eco-friendly', 'modern', 'technology'],
    color: '#2563EB',
    type: 'electric'
  }
];

// Create a simple car image
async function createCarImage(filename, color, type) {
  const width = 400;
  const height = 300;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#F3F4F6';
  ctx.fillRect(0, 0, width, height);

  // Car body
  ctx.fillStyle = color;
  ctx.fillRect(50, 150, 300, 80);
  
  // Car roof
  if (type === 'convertible') {
    // Open top
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.strokeRect(50, 150, 300, 80);
  } else {
    ctx.fillRect(80, 120, 240, 50);
  }

  // Windows
  ctx.fillStyle = '#1E40AF';
  ctx.fillRect(90, 130, 220, 30);

  // Wheels
  ctx.fillStyle = '#374151';
  ctx.beginPath();
  ctx.arc(100, 240, 25, 0, 2 * Math.PI);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(300, 240, 25, 0, 2 * Math.PI);
  ctx.fill();

  // Headlights
  ctx.fillStyle = '#FEF3C7';
  ctx.beginPath();
  ctx.arc(60, 180, 8, 0, 2 * Math.PI);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(340, 180, 8, 0, 2 * Math.PI);
  ctx.fill();

  // Add text
  ctx.fillStyle = '#374151';
  ctx.font = '16px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(filename.replace('.jpg', '').replace('-', ' ').toUpperCase(), width / 2, 50);

  // Save image
  const buffer = canvas.toBuffer('image/jpeg');
  return buffer;
}

// Upload image to the system
async function uploadImage(imageBuffer, filename, tags) {
  const FormData = require('form-data');
  const axios = require('axios');
  
  const formData = new FormData();
  formData.append('image', imageBuffer, {
    filename: filename,
    contentType: 'image/jpeg'
  });
  formData.append('tags', JSON.stringify(tags));

  try {
    const response = await axios.post('http://localhost:3001/api/upload/single', formData, {
      headers: {
        ...formData.getHeaders()
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error uploading ${filename}:`, error.message);
    return null;
  }
}

// Main function
async function main() {
  console.log('🚗 Creating sample automotive images...');

  // Check if backend is running
  try {
    const axios = require('axios');
    await axios.get('http://localhost:3001/api/health');
    console.log('✅ Backend is running');
  } catch (error) {
    console.error('❌ Backend is not running. Please start the backend first.');
    process.exit(1);
  }

  // Create uploads directory
  const uploadsDir = path.join(__dirname, '../backend/uploads');
  try {
    await fs.access(uploadsDir);
  } catch {
    await fs.mkdir(uploadsDir, { recursive: true });
    console.log('📁 Created uploads directory');
  }

  let successCount = 0;
  let errorCount = 0;

  // Create and upload sample images
  for (const car of sampleCars) {
    try {
      console.log(`🎨 Creating ${car.name}...`);
      const imageBuffer = await createCarImage(car.name, car.color, car.type);
      
      console.log(`📤 Uploading ${car.name}...`);
      const result = await uploadImage(imageBuffer, car.name, car.tags);
      
      if (result && result.success) {
        console.log(`✅ Successfully uploaded ${car.name}`);
        successCount++;
      } else {
        console.log(`❌ Failed to upload ${car.name}`);
        errorCount++;
      }
    } catch (error) {
      console.error(`❌ Error processing ${car.name}:`, error.message);
      errorCount++;
    }
  }

  console.log('\n📊 Summary:');
  console.log(`✅ Successfully uploaded: ${successCount} images`);
  console.log(`❌ Failed uploads: ${errorCount} images`);
  
  if (successCount > 0) {
    console.log('\n🎉 Sample data created successfully!');
    console.log('You can now test the search functionality at http://localhost:3000');
    console.log('\nTry these sample searches:');
    console.log('- "red sports car"');
    console.log('- "blue SUV"');
    console.log('- "luxury black sedan"');
    console.log('- "family car"');
    console.log('- "convertible"');
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { createCarImage, uploadImage, sampleCars };
