#!/bin/bash

# Test Script for PhotoBazaar Email Functionality
echo "📧 PhotoBazaar Email Testing Script"
echo "=================================="

# Check if we're in the backend directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the backend directory"
    echo "   cd /path/to/photobazaar/backend"
    exit 1
fi

# Make sure server is running
echo "🔍 Checking if the server is running..."
if ! curl -s http://localhost:5001/health > /dev/null; then
    echo "⚠️ Server not responding. Starting backend server..."
    echo "⚠️ Please open a new terminal and run: 'cd /Users/sanju/Downloads/photobazaar/backend && node server.js'"
    echo "⚠️ Then run this script again."
    exit 1
else
    echo "✅ Server is running!"
fi

# Test Registration
echo ""
echo "🧪 Test 1: User Registration"
echo "-------------------------"
echo "This will test the registration API and email sending."
read -p "Press Enter to continue or Ctrl+C to cancel..." 

node test-email-sending.js

# Test Resend Verification
echo ""
echo "🧪 Test 2: Resend Verification Email"
echo "--------------------------------"
echo "This will test the resend verification email feature."
read -p "Press Enter to continue or Ctrl+C to cancel..." 

node test-resend-verification.js

# Test Password Reset
echo ""
echo "🧪 Test 3: Password Reset Email"
echo "---------------------------"
echo "This will test the password reset email feature."
read -p "Press Enter to continue or Ctrl+C to cancel..." 

node test-password-reset.js

echo ""
echo "🎉 Testing Complete!"
echo "===================="
echo "Check your inbox (sahk5858@gmail.com) for emails from the tests."
