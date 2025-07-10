import crypto from 'crypto';

// Generate token for password reset (keeping for compatibility)
export function generateVerificationToken() {
  return crypto.randomBytes(32).toString('hex');
}

// No email verification - just log registration
export async function sendVerificationEmail(user, token) {
  console.log(`✅ User registered: ${user.email} - Ready to use immediately`);
  return { messageId: 'dummy-' + Date.now() };
}

// Simple password reset - just log the reset link
export async function sendPasswordResetEmail(user, token) {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${token}`;
  console.log(`🔒 Password reset requested for ${user.email}`);
  console.log(`🔗 Reset link: ${resetUrl}`);
  return { messageId: 'dummy-' + Date.now() };
}

// (Removed duplicate sendVerificationEmail and sendPasswordResetEmail functions)
