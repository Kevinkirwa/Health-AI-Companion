import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from 'react-hot-toast';

export const WhatsAppTest: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTest = async () => {
    if (!phoneNumber) {
      toast.error('Please enter a phone number');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/hospitals/test-whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Test message sent! Please check your WhatsApp.');
      } else {
        toast.error(data.message || 'Failed to send test message');
      }
    } catch (error) {
      console.error('Error sending test message:', error);
      toast.error('Failed to send test message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Test WhatsApp Notifications</h2>
      <div className="flex gap-2">
        <Input
          type="tel"
          placeholder="Enter phone number (e.g., 0712345678)"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
        />
        <Button onClick={handleTest} disabled={loading}>
          {loading ? 'Sending...' : 'Send Test Message'}
        </Button>
      </div>
      <p className="text-sm text-gray-500">
        Enter a Kenyan phone number to test WhatsApp notifications. The number should be in the format: 0712345678 or +254712345678
      </p>
    </div>
  );
}; 