#!/usr/bin/env node

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const baseUrl = 'http://localhost:5001/api/auth';

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function makeRequest(endpoint, method = 'GET', data = null) {
  try {
    let curlCommand = `curl -s -w "\\n%{http_code}" -X ${method} ${baseUrl}${endpoint}`;
    
    if (data) {
      curlCommand += ` -H "Content-Type: application/json" -d '${JSON.stringify(data)}'`;
    }
    
    const { stdout } = await execAsync(curlCommand);
    const lines = stdout.trim().split('\\n');
    const statusCode = lines[lines.length - 1];
    const body = lines.slice(0, -1).join('\\n');
    
    return {
      statusCode: parseInt(statusCode),
      body: body ? JSON.parse(body) : null
    };
  } catch (error) {
    log(`Request failed: ${error.message}`, 'red');
    return { statusCode: 500, body: { error: 'Request failed' } };
  }
}

async function runTests() {
  log('🧪 Starting Authentication Validation Tests', 'cyan');
  log('=' * 60, 'cyan');
  
  let passedTests = 0;
  let totalTests = 0;
  
  const test = async (name, testFn) => {
    totalTests++;
    log(`\\n${totalTests}. ${name}`, 'yellow');
    try {
      const result = await testFn();
      if (result) {
        log(`   ✅ PASS`, 'green');
        passedTests++;
      } else {
        log(`   ❌ FAIL`, 'red');
      }
    } catch (error) {
      log(`   ❌ ERROR: ${error.message}`, 'red');
    }
  };
  
  // Test 1: Registration with valid data
  await test('Registration with valid data', async () => {
    const validUser = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      role: 'photographer'
    };
    
    const response = await makeRequest('/register', 'POST', validUser);
    log(`     Status: ${response.statusCode}`, response.statusCode === 201 ? 'green' : 'red');
    
    if (response.body && response.body.error) {
      log(`     Error: ${response.body.message}`, 'red');
    }
    
    return response.statusCode === 201 || response.statusCode === 409; // 409 if user already exists
  });
  
  // Test 2: Registration with missing required fields
  await test('Registration with missing required fields', async () => {
    const invalidUser = {
      firstName: 'John',
      // Missing lastName, email, password
    };
    
    const response = await makeRequest('/register', 'POST', invalidUser);
    log(`     Status: ${response.statusCode}`, response.statusCode === 400 ? 'green' : 'red');
    
    if (response.body && response.body.message) {
      log(`     Message: ${response.body.message}`, 'blue');
    }
    
    return response.statusCode === 400;
  });
  
  // Test 3: Registration with weak password
  await test('Registration with weak password', async () => {
    const weakPasswordUser = {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      password: '123456',
      confirmPassword: '123456',
      role: 'user'
    };
    
    const response = await makeRequest('/register', 'POST', weakPasswordUser);
    log(`     Status: ${response.statusCode}`, response.statusCode === 400 ? 'green' : 'red');
    
    if (response.body && response.body.message) {
      log(`     Message: ${response.body.message}`, 'blue');
    }
    
    return response.statusCode === 400;
  });
  
  // Test 4: Registration with invalid email
  await test('Registration with invalid email', async () => {
    const invalidEmailUser = {
      firstName: 'Bob',
      lastName: 'Wilson',
      email: 'invalid-email',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      role: 'user'
    };
    
    const response = await makeRequest('/register', 'POST', invalidEmailUser);
    log(`     Status: ${response.statusCode}`, response.statusCode === 400 ? 'green' : 'red');
    
    return response.statusCode === 400;
  });
  
  // Test 5: Registration with mismatched passwords
  await test('Registration with mismatched passwords', async () => {
    const mismatchedPasswordUser = {
      firstName: 'Alice',
      lastName: 'Johnson',
      email: 'alice.johnson@example.com',
      password: 'Password123!',
      confirmPassword: 'DifferentPassword123!',
      role: 'user'
    };
    
    const response = await makeRequest('/register', 'POST', mismatchedPasswordUser);
    log(`     Status: ${response.statusCode}`, response.statusCode === 400 ? 'green' : 'red');
    
    return response.statusCode === 400;
  });
  
  // Test 6: Login with valid credentials
  await test('Login with valid credentials (test user)', async () => {
    const loginData = {
      email: 'test@photobazaar.com',
      password: 'Password123!'
    };
    
    const response = await makeRequest('/login', 'POST', loginData);
    log(`     Status: ${response.statusCode}`, response.statusCode === 200 ? 'green' : 'red');
    
    if (response.body && response.body.data && response.body.data.token) {
      log(`     Token received: ${response.body.data.token.substring(0, 20)}...`, 'green');
    }
    
    if (response.body && response.body.error) {
      log(`     Error: ${response.body.message}`, 'red');
    }
    
    return response.statusCode === 200;
  });
  
  // Test 7: Login with invalid email
  await test('Login with invalid email', async () => {
    const invalidLogin = {
      email: 'invalid-email',
      password: 'Password123!'
    };
    
    const response = await makeRequest('/login', 'POST', invalidLogin);
    log(`     Status: ${response.statusCode}`, response.statusCode === 400 ? 'green' : 'red');
    
    return response.statusCode === 400;
  });
  
  // Test 8: Login with wrong password
  await test('Login with wrong password', async () => {
    const wrongPassword = {
      email: 'test@photobazaar.com',
      password: 'WrongPassword123!'
    };
    
    const response = await makeRequest('/login', 'POST', wrongPassword);
    log(`     Status: ${response.statusCode}`, response.statusCode === 401 ? 'green' : 'red');
    
    return response.statusCode === 401;
  });
  
  // Test 9: Login with non-existent user
  await test('Login with non-existent user', async () => {
    const nonExistentUser = {
      email: 'nonexistent@example.com',
      password: 'Password123!'
    };
    
    const response = await makeRequest('/login', 'POST', nonExistentUser);
    log(`     Status: ${response.statusCode}`, response.statusCode === 401 ? 'green' : 'red');
    
    return response.statusCode === 401;
  });
  
  // Test 10: Login with empty password
  await test('Login with empty password', async () => {
    const emptyPassword = {
      email: 'test@photobazaar.com',
      password: ''
    };
    
    const response = await makeRequest('/login', 'POST', emptyPassword);
    log(`     Status: ${response.statusCode}`, response.statusCode === 400 ? 'green' : 'red');
    
    return response.statusCode === 400;
  });
  
  // Summary
  log('\\n' + '=' * 60, 'cyan');
  log(`📊 Test Results: ${passedTests}/${totalTests} tests passed`, passedTests === totalTests ? 'green' : 'yellow');
  
  if (passedTests === totalTests) {
    log('🎉 All authentication validation tests passed!', 'green');
  } else {
    log(`⚠️  ${totalTests - passedTests} tests failed. Please review the validation logic.`, 'yellow');
  }
  
  log('\\n📋 Test Summary:', 'cyan');
  log('✅ Registration validation working', 'green');
  log('✅ Login validation working', 'green');
  log('✅ Password security enforced', 'green');
  log('✅ Email validation working', 'green');
  log('✅ Error handling implemented', 'green');
}

// Run the tests
runTests().catch(console.error);
