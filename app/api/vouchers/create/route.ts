import { NextResponse } from 'next/server';
import getWooCommerce from '@/lib/woocommerce';

async function getVoucherCategoryId(): Promise<number> {
  try {
    const WooCommerce = getWooCommerce();
    const categories = await WooCommerce.get('products/categories', {
      search: 'Vouchers & Gift Cards',
    });
    const data = categories.data as Array<{ id: number }>;
    if (data?.length > 0) {
      return data[0].id;
    }
    return 0;
  } catch {
    return 0;
  }
}

export async function POST(request: Request) {
  try {
    const { experience_slug, experience_name, price } = (await request.json()) as {
      experience_slug: string;
      experience_name: string;
      price: number;
    };

    const categoryId = await getVoucherCategoryId();

    const productData = {
      name: `Gift Voucher - ${experience_name}`,
      type: 'simple',
      virtual: true,
      downloadable: false,
      regular_price: String(price),
      manage_stock: false,
      stock_status: 'instock',
      catalog_visibility: 'hidden',
      meta_data: [
        { key: '_is_gift_voucher', value: 'yes' },
        { key: '_voucher_experience_slug', value: experience_slug },
        { key: '_voucher_type', value: 'experience' },
      ],
      ...(categoryId > 0 && { categories: [{ id: categoryId }] }),
    };

    const WooCommerce = getWooCommerce();
    const response = await WooCommerce.post('products', productData);
    const product = response.data as { id: number };

    const checkoutUrl = `${process.env.WC_STORE_URL}/checkout/?add-to-cart=${product.id}`;

    return NextResponse.json({
      success: true,
      product_id: product.id,
      checkoutUrl,
    });
  } catch (error) {
    console.error('Error creating voucher product:', error);
    return NextResponse.json(
      { error: 'Failed to create voucher' },
      { status: 500 }
    );
  }
}
