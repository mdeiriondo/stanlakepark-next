import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';

const WooCommerce = new WooCommerceRestApi({
  url: process.env.WC_STORE_URL!,
  consumerKey: process.env.WC_CONSUMER_KEY!,
  consumerSecret: process.env.WC_CONSUMER_SECRET!,
  version: 'wc/v3',
});

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
    const response = await WooCommerce.post('products', {
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
  } catch (error) {
    console.error('Error creating WooCommerce product:', error);
    throw new Error('Failed to create booking product');
  }
}

async function getBookingsCategoryId(): Promise<number> {
  try {
    const categories = await WooCommerce.get('products/categories', {
      search: 'Bookings',
    });
    const data = categories.data as Array<{ id: number }>;
    if (data?.length > 0) {
      return data[0].id;
    }

    const newCategory = await WooCommerce.post('products/categories', {
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

export default WooCommerce;
