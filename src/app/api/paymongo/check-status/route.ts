import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const PAYMONGO_SECRET_KEY = process.env.PAYMONGO_SECRET_KEY;
    
    // Check if PayMongo key is configured
    if (!PAYMONGO_SECRET_KEY) {
      console.log('PayMongo not configured - only COD and GCash available');
      return NextResponse.json({ 
        enabled: false,
        message: 'PayMongo not configured'
      });
    }

    // Test the PayMongo connection by fetching account info
    try {
      const response = await fetch('https://api.paymongo.com/v1/payment_methods', {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${Buffer.from(PAYMONGO_SECRET_KEY + ':').toString('base64')}`,
        },
      });

      if (response.ok) {
        console.log('✅ PayMongo connection successful - all payment methods enabled');
        return NextResponse.json({ 
          enabled: true,
          message: 'PayMongo connected and verified'
        });
      } else {
        console.log('⚠️ PayMongo key invalid or not verified - limited payment methods');
        return NextResponse.json({ 
          enabled: false,
          message: 'PayMongo key not verified'
        });
      }
    } catch (error) {
      console.log('⚠️ PayMongo connection failed:', error);
      return NextResponse.json({ 
        enabled: false,
        message: 'PayMongo connection failed'
      });
    }

  } catch (error) {
    console.error('Error checking PayMongo status:', error);
    return NextResponse.json({ 
      enabled: false,
      message: 'Error checking status'
    });
  }
}