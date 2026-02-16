import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';

let wooClient: InstanceType<typeof WooCommerceRestApi> | null = null;

function getWooCommerce(): InstanceType<typeof WooCommerceRestApi> {
  if (!wooClient) {
    const url = process.env.WC_STORE_URL;
    const consumerKey = process.env.WC_CONSUMER_KEY;
    const consumerSecret = process.env.WC_CONSUMER_SECRET;
    if (!url || !consumerKey || !consumerSecret) {
      throw new Error(
        'WooCommerce is not configured: WC_STORE_URL, WC_CONSUMER_KEY and WC_CONSUMER_SECRET are required'
      );
    }
    wooClient = new WooCommerceRestApi({
      url,
      consumerKey,
      consumerSecret,
      version: 'wc/v3',
    });
  }
  return wooClient;
}

export interface CreateBookingProductParams {
  experienceName: string;
  experienceSlug: string;
  date: string;
  time: string;
  guests: number;
  pricePerPerson: number;
  slotId: number;
}

export async function createBookingProduct(params: CreateBookingProductParams) {
  const {
    experienceName,
    experienceSlug,
    date,
    time,
    guests,
    pricePerPerson,
    slotId,
  } = params;
  const totalPrice = pricePerPerson * guests;

  const formattedDate = new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const productName = `${experienceName} - ${formattedDate} at ${time} (${guests} ${guests === 1 ? 'guest' : 'guests'})`;

  try {
    const categoryId = await getBookingsCategoryId();
    const response = await getWooCommerce().post('products', {
      name: productName,
      type: 'simple',
      regular_price: totalPrice.toFixed(2),
      virtual: true,
      manage_stock: false,
      sold_individually: true,
      catalog_visibility: 'hidden',
      meta_data: [
        { key: '_booking_slot_id', value: slotId.toString() },
        { key: '_booking_experience_slug', value: experienceSlug },
        { key: '_booking_date', value: date },
        { key: '_booking_time', value: time },
        { key: '_booking_guests', value: guests.toString() },
        { key: '_booking_price_per_person', value: pricePerPerson.toString() },
      ],
      ...(categoryId > 0 && { categories: [{ id: categoryId }] }),
    });

    return response.data as { id: number };
  } catch (error: any) {
    console.error('Error creating WooCommerce product:', error);
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to create booking product in WooCommerce';
    throw new Error(`WooCommerce error: ${errorMessage}`);
  }
}

async function getBookingsCategoryId(): Promise<number> {
  try {
    const categories = await getWooCommerce().get('products/categories', {
      search: 'Bookings',
    });
    const data = categories.data as Array<{ id: number }>;
    if (data?.length > 0) {
      return data[0].id;
    }

    const newCategory = await getWooCommerce().post('products/categories', {
      name: 'Bookings',
      slug: 'bookings',
      description: 'Experience bookings - auto-generated',
    });
    return (newCategory.data as { id: number }).id;
  } catch (error) {
    console.error('Error getting/creating Bookings category:', error);
    return 0;
  }
}

export function getCheckoutUrl(productId: number): string {
  return `${process.env.WC_STORE_URL}/checkout/?add-to-cart=${productId}`;
}

export default getWooCommerce;
