require('dotenv').config();
const { testEmailConfiguration, sendPasswordResetEmail } = require('./utils/emailService');

const testEmail = async () => {
  console.log('🧪 Testing Email Configuration...\n');
  
  // Check environment variables
  console.log('📧 Email User:', process.env.EMAIL_USER ? '✅ Set' : '❌ Not set');
  console.log('🔑 Email Password:', process.env.EMAIL_PASSWORD ? '✅ Set' : '❌ Not set');
  console.log('🌐 Frontend URL:', process.env.FRONTEND_URL || 'http://localhost:5173');
  console.log('');
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.error('❌ Email credentials not configured in .env file');
    console.log('\nPlease add to your .env file:');
    console.log('EMAIL_USER=your-email@gmail.com');
    console.log('EMAIL_PASSWORD=your-app-password');
    process.exit(1);
  }
  
  // Test connection
  console.log('🔍 Testing email server connection...');
  const isValid = await testEmailConfiguration();
  
  if (!isValid) {
    console.error('\n❌ Email configuration failed!');
    console.log('\nTroubleshooting:');
    console.log('1. Make sure you are using an App Password (not your regular password)');
    console.log('2. Enable "Less secure app access" if using Gmail');
    console.log('3. Check your email and password are correct');
    process.exit(1);
  }
  
  console.log('✅ Email server connection successful!\n');
  
  // Ask if user wants to send a test email
  console.log('Would you like to send a test password reset email? (y/n)');
  console.log('If yes, enter the email address to send to:');
  console.log('(Press Ctrl+C to skip)\n');
  
  process.stdin.once('data', async (data) => {
    const input = data.toString().trim();
    
    if (input.includes('@')) {
      console.log(`\n📨 Sending test email to ${input}...`);
      
      try {
        await sendPasswordResetEmail(input, 'test-token-12345');
        console.log('\n✅ Test email sent successfully!');
        console.log('Check your inbox (and spam folder)');
      } catch (error) {
        console.error('\n❌ Failed to send test email:', error.message);
      }
    } else {
      console.log('\n✅ Test complete! Email is configured and ready to use.');
    }
    
    process.exit(0);
  });
};

testEmail();