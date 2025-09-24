const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

async function getAuthToken() {
  try {
    console.log('🔐 Getting authentication token...');
    
    // Try to login with default credentials
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });
    
    if (loginResponse.ok) {
      const loginResult = await loginResponse.json();
      console.log('✅ Authentication successful');
      return loginResult.token;
    } else {
      console.log('❌ Authentication failed, trying to register...');
      
      // Try to register first
      const registerResponse = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: 'admin',
          password: 'admin123'
        })
      });
      
      if (registerResponse.ok) {
        console.log('✅ Registration successful, trying login again...');
        return await getAuthToken(); // Retry login
      } else {
        console.log('❌ Registration failed:', await registerResponse.text());
        return null;
      }
    }
  } catch (error) {
    console.error('❌ Auth error:', error.message);
    return null;
  }
}

async function testCarDetectionUpload() {
  try {
    console.log('🧪 Testing car detection upload flow...');
    
    // Get authentication token
    const token = await getAuthToken();
    if (!token) {
      console.log('❌ Could not get authentication token');
      return;
    }
    
    // Test with a sample image (you can replace this with an actual car image)
    const testImagePath = path.join(__dirname, 'backend', 'test.png');
    
    if (!fs.existsSync(testImagePath)) {
      console.log('❌ Test image not found. Please ensure test.png exists in backend/ directory');
      return;
    }
    
    // Create form data
    const form = new FormData();
    form.append('file', fs.createReadStream(testImagePath));
    form.append('tags', JSON.stringify(['test-upload', 'car-detection']));
    
    console.log('📤 Uploading image with car detection...');
    
    // Upload to the backend with authentication
    const response = await fetch('http://localhost:3001/api/upload', {
      method: 'POST',
      body: form,
      headers: {
        ...form.getHeaders(),
        'Authorization': `Bearer ${token}`
      }
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Upload successful!');
      console.log('📊 Upload result:', {
        success: result.success,
        message: result.message,
        carDetection: result.carDetection || result.results?.[0]?.carDetection
      });
      
      if (result.carDetection) {
        console.log('🚗 Car detection details:', {
          detected: result.carDetection.carDetected,
          confidence: result.carDetection.confidence,
          label: result.carDetection.label,
          originalSize: result.carDetection.originalSize,
          croppedSize: result.carDetection.croppedSize
        });
      }
      
      if (result.image) {
        console.log('🖼️ Image details:', {
          id: result.image.id,
          filename: result.image.filename,
          tags: result.image.tags
        });
      }
    } else {
      console.log('❌ Upload failed:', result);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

// Run the test
testCarDetectionUpload();
