import React, { useState } from 'react';

// Define types inline
enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

interface PaymentProps {
  bookingId: string;
  amount?: number; // Make amount optional
  onPaymentComplete: () => void;
}

interface PaymentResponse {
  status: PaymentStatus;
  message?: string;
}

const DEFAULT_AMOUNT = 50; // Default payment amount in USD

const Payment: React.FC<PaymentProps> = ({ 
  bookingId, 
  amount = DEFAULT_AMOUNT, // Provide default value
  onPaymentComplete 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  // Validate amount
  if (amount <= 0) {
    console.error('Invalid amount provided:', amount);
    amount = DEFAULT_AMOUNT;
  }

  const handlePayment = async () => {
    if (!bookingId) {
      setError('Invalid booking ID');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookingId,
          amount,
          currency: 'USD'
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Payment request failed');
      }

      const data: PaymentResponse = await response.json();

      if (data.status === PaymentStatus.PAID) {
        onPaymentComplete();
      } else {
        setError(data.message || 'Payment processing failed. Please try again.');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err instanceof Error ? err.message : 'Payment failed. Please try again later.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-white">
      <h3 className="text-lg font-medium mb-4">Payment Details</h3>
      
      <div className="mb-4">
        <p className="text-gray-600">Amount to pay:</p>
        <p className="text-2xl font-bold">${amount.toFixed(2)} USD</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700">
          {error}
        </div>
      )}

      <button
        onClick={handlePayment}
        disabled={isProcessing}
        className="w-full py-2 px-4 rounded text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
      >
        {isProcessing ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
                fill="none"
              />
              <path 
                className="opacity-75" 
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Processing...
          </span>
        ) : (
          'Pay Now'
        )}
      </button>

      <p className="mt-2 text-sm text-gray-500 text-center">
        Secure payment processing
      </p>
    </div>
  );
};

export default Payment;