import { NextResponse } from 'next/server';

const PAYMONGO_SECRET_KEY = process.env.PAYMONGO_SECRET_KEY;

export async function POST(req: Request) {
  try {
    // Check if API key exists
    if (!PAYMONGO_SECRET_KEY) {
      console.error('PayMongo secret key is not configured');
      return NextResponse.json(
        { error: 'Payment system not configured. Please contact support.' },
        { status: 500 }
      );
    }

    const { amount, description, type } = await req.json();

    // Validate inputs
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // PayMongo valid source types (based on their API documentation)
    const paymongoSourceTypes: Record<string, string> = {
      'gcash': 'gcash',
      'paymaya': 'paymaya', 
      'grab_pay': 'grab_pay',
      'qrph': 'gcash', // QR Ph uses gcash source type
    };

    if (!type || !paymongoSourceTypes[type]) {
      return NextResponse.json(
        { error: `Invalid payment method: ${type}. Accepted: gcash, paymaya, grab_pay, qrph` },
        { status: 400 }
      );
    }

    // PayMongo requires amount in cents (₱100 = 10000 cents)
    const amountInCents = Math.round(amount * 100);

    // Map frontend type to PayMongo source type
    const paymongoType = paymongoSourceTypes[type];

    console.log('Creating PayMongo source:', {
      originalType: type,
      paymongoType: paymongoType,
      amount: amountInCents,
      description
    });

    // Create payment source
    const response = await fetch('https://api.paymongo.com/v1/sources', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(PAYMONGO_SECRET_KEY + ':').toString('base64')}`,
      },
      body: JSON.stringify({
        data: {
          attributes: {
            amount: amountInCents,
            redirect: {
              success: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/cart/payment/success`,
              failed: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/cart/payment/failed`,
            },
            type: paymongoType, // Use the mapped PayMongo type
            currency: 'PHP',
            description: description || 'Order Payment',
          },
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('PayMongo API Error:', {
        status: response.status,
        statusText: response.statusText,
        data
      });

      // Extract error message from PayMongo response
      let errorMessage = 'Failed to create payment';
      
      if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
        const error = data.errors[0];
        errorMessage = error.detail || error.code || errorMessage;
        
        // Provide user-friendly error messages
        if (errorMessage.includes('not allowed') || errorMessage.includes('Organization')) {
          errorMessage = 'This payment method requires business verification. Please use Cash on Delivery instead.';
        } else if (errorMessage.includes('invalid') && errorMessage.includes('source_type')) {
          errorMessage = 'Payment method temporarily unavailable. Please try Cash on Delivery.';
        } else if (errorMessage.includes('amount')) {
          errorMessage = 'Invalid payment amount. Please check your cart total.';
        }
      } else if (data.error) {
        errorMessage = data.error;
      }

      return NextResponse.json(
        { 
          error: errorMessage,
          details: data 
        },
        { status: response.status }
      );
    }

    console.log('✅ PayMongo source created successfully:', {
      id: data.data.id,
      type: data.data.attributes.type,
      status: data.data.attributes.status
    });
    
    return NextResponse.json(data);

  } catch (error) {
    console.error('❌ Payment creation error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}