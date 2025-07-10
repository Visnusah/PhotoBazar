import fetch from 'node-fetch';

const testPasswordReset = async () => {
  try {
    console.log('📧 Testing password reset email functionality...');
    
    const apiUrl = 'http://localhost:5001/api/auth/forgot-password';
    
    const userData = {
      email: 'sahk5858@gmail.com' // Using the provided email for testing
    };
    
    console.log(`🔄 Attempting to send password reset email to: ${userData.email}`);
    
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
      console.log('✅ Password reset email sent successfully! Check your inbox.');
    } else {
      console.log('❌ Failed to send password reset email:', result.message);
    }
    
  } catch (error) {
    console.error('❌ Error during test:', error);
  }
};

// Run the test
testPasswordReset();
