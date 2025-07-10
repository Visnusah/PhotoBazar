import fetch from 'node-fetch';

const testResendVerification = async () => {
  try {
    console.log('📧 Testing resend verification email functionality...');
    
    const apiUrl = 'http://localhost:5001/api/auth/resend-verification';
    
    const userData = {
      email: 'sahk5858@gmail.com' // Using the provided email for testing
    };
    
    console.log(`🔄 Attempting to resend verification email to: ${userData.email}`);
    
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
      console.log('✅ Verification email resent successfully! Check your inbox.');
    } else {
      console.log('❌ Failed to resend verification email:', result.message);
    }
    
  } catch (error) {
    console.error('❌ Error during test:', error);
  }
};

// Run the test
testResendVerification();
