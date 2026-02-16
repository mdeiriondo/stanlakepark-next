import { NextResponse } from 'next/server';
import getWooCommerce from '@/lib/woocommerce';

async function processSquarePayment(
  paymentToken: string,
  amount: number,
  currency: string = 'GBP'
) {
  const accessToken = process.env.SQUARE_ACCESS_TOKEN;
  // Usar SQUARE_LOCATION_ID del servidor (sin NEXT_PUBLIC_)
  const locationId = process.env.SQUARE_LOCATION_ID || process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID;

  if (!accessToken) {
    throw new Error('SQUARE_ACCESS_TOKEN not configured');
  }
  if (!locationId) {
    throw new Error('SQUARE_LOCATION_ID not configured');
  }

  console.log('Processing Square payment:', {
    hasAccessToken: !!accessToken,
    locationId,
    amount,
    currency,
  });

  const response = await fetch('https://connect.squareup.com/v2/payments', {
    method: 'POST',
    headers: {
      'Square-Version': '2024-01-18',
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      source_id: paymentToken,
      amount_money: {
        amount: Math.round(amount * 100), // Convert to cents
        currency,
      },
      idempotency_key: `booking-${Date.now()}-${Math.random()}`,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.errors?.[0]?.detail || errorData.errors?.[0]?.code || 'Square payment failed';
    console.error('Square payment API error:', {
      status: response.status,
      statusText: response.statusText,
      error: errorData,
    });
    throw new Error(errorMessage);
  }

  const data = await response.json();
  return data.payment;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      productId,
      slotId,
      paymentToken,
      firstName,
      lastName,
      email,
      phone,
      address1,
      address2,
      city,
      postcode,
      country,
    } = body;

    if (
      !productId ||
      !slotId ||
      !paymentToken ||
      !email ||
      !firstName ||
      !lastName
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const WooCommerce = getWooCommerce();

    // Obtener el precio del producto
    const productResponse = await WooCommerce.get(`products/${productId}`);
    const product = productResponse.data as { price?: string };
    const totalAmount = parseFloat(product.price || '0');

    // Procesar pago con Square
    let squarePayment;
    try {
      squarePayment = await processSquarePayment(paymentToken, totalAmount);
      console.log('Square payment successful:', { paymentId: squarePayment?.id });
    } catch (paymentError) {
      console.error('Square payment error:', paymentError);
      const errorMessage = paymentError instanceof Error ? paymentError.message : 'Unknown error';
      return NextResponse.json(
        {
          success: false,
          error: 'Payment processing failed',
          details: errorMessage,
        },
        { status: 402 }
      );
    }

    // Crear orden en WooCommerce marcada como pagada
    const orderData = {
      payment_method: 'square',
      payment_method_title: 'Square',
      set_paid: true,
      transaction_id: squarePayment.id,
      billing: {
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone: phone,
        address_1: address1,
        address_2: address2 || '',
        city: city,
        postcode: postcode,
        country: country || 'GB',
      },
      shipping: {
        first_name: firstName,
        last_name: lastName,
        address_1: address1,
        address_2: address2 || '',
        city: city,
        postcode: postcode,
        country: country || 'GB',
      },
      line_items: [
        {
          product_id: productId,
          quantity: 1,
        },
      ],
      meta_data: [
        {
          key: '_booking_slot_id',
          value: slotId.toString(),
        },
        {
          key: '_square_payment_id',
          value: squarePayment.id,
        },
      ],
    };

    const order = await WooCommerce.post('orders', orderData);

    return NextResponse.json({
      success: true,
      orderId: order.data.id,
      orderNumber: order.data.number,
      paymentId: squarePayment.id,
      message: 'Order created and payment processed successfully',
    });
  } catch (error) {
    console.error('Checkout error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process checkout',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
