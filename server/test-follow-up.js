// Simple test script for the follow-up reminder system
const fetch = require('node-fetch');

// Replace with your actual phone number (include country code, e.g., +2547XXXXXXXX)
const phoneNumber = '+2547XXXXXXXX'; // 👈 UPDATE THIS WITH YOUR ACTUAL PHONE NUMBER

async function testFollowUpReminder() {
  try {
    console.log('Sending test follow-up reminder...');
    
    const response = await fetch('http://localhost:3000/api/notifications/test-follow-up', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber: phoneNumber
      }),
    });
    
    const data = await response.json();
    console.log('Response:', data);
    
    if (data.success) {
      console.log('✅ Follow-up reminder sent successfully!');
      console.log('Check your WhatsApp to see the follow-up message.');
    } else {
      console.log('❌ Failed to send follow-up reminder:', data.message);
    }
  } catch (error) {
    console.error('Error testing follow-up reminder:', error);
  }
}

// Run the test
testFollowUpReminder();
