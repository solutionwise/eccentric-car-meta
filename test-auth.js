const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3001/api';

async function testAuth() {
  console.log('🧪 Testing Authentication System...\n');

  try {
    // Test 1: Login with default credentials
    console.log('1. Testing login with default credentials...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });

    const loginData = await loginResponse.json();
    
    if (loginData.success) {
      console.log('✅ Login successful!');
      console.log(`   Token: ${loginData.token.substring(0, 20)}...`);
      
      const token = loginData.token;

      // Test 2: Verify token
      console.log('\n2. Testing token verification...');
      const verifyResponse = await fetch(`${API_BASE}/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const verifyData = await verifyResponse.json();
      
      if (verifyData.success) {
        console.log('✅ Token verification successful!');
        console.log(`   User: ${verifyData.user.username}`);
      } else {
        console.log('❌ Token verification failed!');
      }

      // Test 3: Access protected route
      console.log('\n3. Testing protected route access...');
      const protectedResponse = await fetch(`${API_BASE}/images/stats/overview`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (protectedResponse.ok) {
        console.log('✅ Protected route access successful!');
      } else {
        console.log('❌ Protected route access failed!');
      }

      // Test 4: Access without token
      console.log('\n4. Testing access without token...');
      const noTokenResponse = await fetch(`${API_BASE}/images/stats/overview');
      
      if (noTokenResponse.status === 401) {
        console.log('✅ Unauthorized access properly blocked!');
      } else {
        console.log('❌ Unauthorized access not blocked!');
      }

    } else {
      console.log('❌ Login failed!');
      console.log('   Error:', loginData.error);
    }

  } catch (error) {
    console.log('❌ Test failed with error:', error.message);
  }

  console.log('\n🏁 Authentication test completed!');
}

// Run the test
testAuth();
