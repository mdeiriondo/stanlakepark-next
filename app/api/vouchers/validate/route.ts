import { NextResponse } from 'next/server';
import getWooCommerce from '@/lib/woocommerce';

interface CouponMeta {
  key: string;
  value: string;
}

interface Coupon {
  code: string;
  amount: string;
  usage_count: number;
  usage_limit: number;
  date_expires: string | null;
  meta_data?: CouponMeta[];
}

export async function POST(request: Request) {
  try {
    const { code } = (await request.json()) as { code: string };

    const WooCommerce = getWooCommerce();
    const response = await WooCommerce.get('coupons', { code });

    if (!response.data || (response.data as unknown[]).length === 0) {
      return NextResponse.json(
        { error: 'Invalid voucher code' },
        { status: 404 }
      );
    }

    const coupon = (response.data as Coupon[])[0];

    if (
      coupon.usage_limit > 0 &&
      coupon.usage_count >= coupon.usage_limit
    ) {
      return NextResponse.json(
        { error: 'Voucher already used' },
        { status: 400 }
      );
    }

    if (coupon.date_expires) {
      const expiryDate = new Date(coupon.date_expires);
      if (expiryDate < new Date()) {
        return NextResponse.json(
          { error: 'Voucher expired' },
          { status: 400 }
        );
      }
    }

    const experienceSlug = coupon.meta_data?.find(
      (m: CouponMeta) => m.key === '_voucher_experience_slug'
    )?.value;

    return NextResponse.json({
      success: true,
      voucher: {
        code: coupon.code,
        amount: parseFloat(coupon.amount),
        experience_slug: experienceSlug,
        valid: true,
      },
    });
  } catch (error) {
    console.error('Error validating voucher:', error);
    return NextResponse.json(
      { error: 'Failed to validate voucher' },
      { status: 500 }
    );
  }
}
