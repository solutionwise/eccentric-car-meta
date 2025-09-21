#!/usr/bin/env node

/**
 * System Test Script
 * 
 * This script tests the complete system functionality including:
 * - Backend health check
 * - Weaviate connection
 * - Search functionality
 * - Image management
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';
const WEAVIATE_URL = 'http://localhost:8080';

// Test functions
async function testBackendHealth() {
  console.log('🔍 Testing backend health...');
  try {
    const response = await axios.get(`${API_BASE}/health`);
    if (response.data.status === 'OK') {
      console.log('✅ Backend is healthy');
      return true;
    } else {
      console.log('❌ Backend health check failed');
      return false;
    }
  } catch (error) {
    console.log('❌ Backend is not responding:', error.message);
    return false;
  }
}

async function testWeaviateConnection() {
  console.log('🔍 Testing Weaviate connection...');
  try {
    const response = await axios.get(`${WEAVIATE_URL}/v1/meta`);
    if (response.data) {
      console.log('✅ Weaviate is connected');
      return true;
    } else {
      console.log('❌ Weaviate connection failed');
      return false;
    }
  } catch (error) {
    console.log('❌ Weaviate is not responding:', error.message);
    return false;
  }
}

async function testSearchFunctionality() {
  console.log('🔍 Testing search functionality...');
  try {
    const response = await axios.post(`${API_BASE}/search`, {
      query: 'red car',
      limit: 5
    });
    
    if (response.data && Array.isArray(response.data.results)) {
      console.log(`✅ Search returned ${response.data.results.length} results`);
      return true;
    } else {
      console.log('❌ Search returned invalid response');
      return false;
    }
  } catch (error) {
    console.log('❌ Search test failed:', error.message);
    return false;
  }
}

async function testImageManagement() {
  console.log('🔍 Testing image management...');
  try {
    const response = await axios.get(`${API_BASE}/images?limit=5`);
    
    if (response.data && Array.isArray(response.data.images)) {
      console.log(`✅ Image management returned ${response.data.images.length} images`);
      return true;
    } else {
      console.log('❌ Image management returned invalid response');
      return false;
    }
  } catch (error) {
    console.log('❌ Image management test failed:', error.message);
    return false;
  }
}

async function testSearchSuggestions() {
  console.log('🔍 Testing search suggestions...');
  try {
    const response = await axios.get(`${API_BASE}/search/suggestions?q=red`);
    
    if (response.data && Array.isArray(response.data.suggestions)) {
      console.log(`✅ Search suggestions returned ${response.data.suggestions.length} suggestions`);
      return true;
    } else {
      console.log('❌ Search suggestions returned invalid response');
      return false;
    }
  } catch (error) {
    console.log('❌ Search suggestions test failed:', error.message);
    return false;
  }
}

async function testSystemStats() {
  console.log('🔍 Testing system statistics...');
  try {
    const response = await axios.get(`${API_BASE}/images/stats/overview`);
    
    if (response.data && typeof response.data.totalImages === 'number') {
      console.log(`✅ System stats: ${response.data.totalImages} images, ${response.data.totalSizeMB} MB`);
      return true;
    } else {
      console.log('❌ System stats returned invalid response');
      return false;
    }
  } catch (error) {
    console.log('❌ System stats test failed:', error.message);
    return false;
  }
}

// Main test function
async function runTests() {
  console.log('🧪 Running system tests...\n');
  
  const tests = [
    { name: 'Backend Health', fn: testBackendHealth },
    { name: 'Weaviate Connection', fn: testWeaviateConnection },
    { name: 'Search Functionality', fn: testSearchFunctionality },
    { name: 'Image Management', fn: testImageManagement },
    { name: 'Search Suggestions', fn: testSearchSuggestions },
    { name: 'System Statistics', fn: testSystemStats }
  ];

  let passedTests = 0;
  let totalTests = tests.length;

  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passedTests++;
      }
    } catch (error) {
      console.log(`❌ ${test.name} test crashed:`, error.message);
    }
    console.log(''); // Empty line for readability
  }

  // Summary
  console.log('📊 Test Summary:');
  console.log(`✅ Passed: ${passedTests}/${totalTests} tests`);
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests} tests`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 All tests passed! The system is working correctly.');
    console.log('\nYou can now:');
    console.log('1. Visit http://localhost:3000 to use the search interface');
    console.log('2. Visit http://localhost:3000/admin to manage images');
    console.log('3. Try searching for: "red car", "blue SUV", "luxury sedan"');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the system setup.');
    console.log('\nTroubleshooting:');
    console.log('1. Make sure the backend is running: npm run backend:dev');
    console.log('2. Make sure Weaviate is running: docker-compose up -d');
    console.log('3. Check that all dependencies are installed');
    console.log('4. Verify your .env file has the correct API keys');
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testBackendHealth,
  testWeaviateConnection,
  testSearchFunctionality,
  testImageManagement,
  testSearchSuggestions,
  testSystemStats,
  runTests
};
