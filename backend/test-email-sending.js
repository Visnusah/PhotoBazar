import fetch from 'node-fetch';

const testRegistration = async () => {
  try {
    console.log('📧 Testing email sending functionality...');
    
    const apiUrl = 'http://localhost:5001/api/auth/register';
    
    const userData = {
      firstName: 'Test',
      lastName: 'User',
      email: 'sahk5858@gmail.com', // Using the provided email for testing
      password: 'TestPassword123!',
      role: 'user'
    };
    
    console.log(`🔄 Attempting to register user: ${userData.email}`);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    
    const result = await response.json();
    
    console.log('📝 API Response Status:', response.status);
    console.log('📝 API Response:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('✅ Registration successful! Check your email for the verification link.');
    } else {
      console.log('❌ Registration failed:', result.message);
    }
    
  } catch (error) {
    console.error('❌ Error during test:', error);
  }
};

// Run the test
testRegistration();
