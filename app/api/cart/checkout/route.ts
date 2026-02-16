import { NextResponse } from 'next/server';
import getWooCommerce from '@/lib/woocommerce';

interface LineItem {
  product_id: number;
  variation_id?: number;
  quantity: number;
}

interface Customer {
  email?: string;
  first_name?: string;
  last_name?: string;
}

export async function POST(request: Request) {
  try {
    const { items, customer } = (await request.json()) as {
      items: LineItem[];
      customer?: Customer;
    };

    const lineItems = items.map((item: LineItem) => ({
      product_id: item.product_id,
      variation_id: item.variation_id || 0,
      quantity: item.quantity,
    }));

    const orderData: {
      status: string;
      line_items: { product_id: number; variation_id: number; quantity: number }[];
      set_paid: boolean;
      billing?: { email: string; first_name: string; last_name: string };
    } = {
      status: 'pending',
      line_items: lineItems,
      set_paid: false,
    };

    if (customer?.email) {
      orderData.billing = {
        email: customer.email,
        first_name: customer.first_name || '',
        last_name: customer.last_name || '',
      };
    }

    const WooCommerce = getWooCommerce();
    const response = await WooCommerce.post('orders', orderData);
    const order = response.data as { id: number; order_key: string };

    const checkoutUrl = `${process.env.WC_STORE_URL}/checkout/?order_id=${order.id}&key=${order.order_key}`;

    return NextResponse.json({
      success: true,
      checkoutUrl,
      orderId: order.id,
    });
  } catch (error) {
    console.error('Error creating checkout:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout' },
      { status: 500 }
    );
  }
}
