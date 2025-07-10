import nodemailer from 'nodemailer';

// Generate random 4-digit code
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

// Generate random 4-digit code
export const generateVerificationCode = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

// Send verification email
export const sendVerificationEmail = async (email, firstName, verificationCode) => {
  try {
    const transporter = createTransporter();
    
    // Create simple HTML template
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification - PhotoBazaar</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">📸 PhotoBazaar</h1>
            <p style="color: #e0f2fe; margin: 10px 0 0 0; font-size: 16px;">Email Verification</p>
          </div>
          <div style="background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #1f2937; margin-bottom: 20px; font-size: 24px;">Hello ${firstName}!</h2>
            <p style="font-size: 16px; margin-bottom: 30px; color: #4b5563;">
              Welcome to PhotoBazaar! To complete your account verification, please use the following 4-digit code:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <div style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; font-size: 32px; font-weight: bold; padding: 20px 40px; border-radius: 12px; letter-spacing: 8px; font-family: monospace; border: 3px solid #1e40af; box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);">
                ${verificationCode}
              </div>
            </div>
            <p style="font-size: 14px; color: #6b7280; margin-bottom: 25px; text-align: center;">
              This code will expire in 10 minutes for security purposes.
            </p>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #374151; font-size: 16px; margin-bottom: 10px;">🔒 Security Tips:</h3>
              <ul style="color: #6b7280; font-size: 14px; padding-left: 20px;">
                <li>Never share this code with anyone</li>
                <li>PhotoBazaar will never ask for this code via phone or other channels</li>
                <li>If you didn't request this verification, please ignore this email</li>
              </ul>
            </div>
            <p style="font-size: 16px; color: #4b5563;">
              Once verified, you'll be able to explore and purchase amazing photos from talented photographers around the world!
            </p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="font-size: 12px; color: #9ca3af; text-align: center;">
              This email was sent by PhotoBazaar. If you have any questions, please contact our support team.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: email,
      subject: `🔐 Your PhotoBazaar Verification Code: ${verificationCode}`,
      html,
      // Text fallback
      text: `Hello ${firstName}!\n\nWelcome to PhotoBazaar! Your verification code is: ${verificationCode}\n\nThis code will expire in 30 seconds.\n\nIf you didn't request this verification, please ignore this email.\n\nBest regards,\nThe PhotoBazaar Team`,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

// Validate email format
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
