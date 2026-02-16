import { sql } from '@vercel/postgres';

async function checkDatabase() {
  try {
    const result = await sql.query('SELECT COUNT(*) as count FROM slots');
    return { success: true, slotCount: result.rows[0]?.count || 0 };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function testWooCommerce() {
  const url = process.env.WC_STORE_URL;
  const consumerKey = process.env.WC_CONSUMER_KEY;
  const consumerSecret = process.env.WC_CONSUMER_SECRET;

  if (!url || !consumerKey || !consumerSecret) {
    return {
      success: false,
      error: 'Missing WooCommerce credentials',
      missing: {
        url: !url,
        consumerKey: !consumerKey,
        consumerSecret: !consumerSecret,
      },
    };
  }

  try {
    const WooCommerceRestApi = (await import('@woocommerce/woocommerce-rest-api'))
      .default;
    const client = new WooCommerceRestApi({
      url,
      consumerKey,
      consumerSecret,
      version: 'wc/v3',
    });

    const response = await client.get('products', { per_page: 1 });
    return {
      success: true,
      message: 'WooCommerce connection successful',
      productCount: response.headers?.['x-wp-total'] || 'unknown',
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.response?.data?.message || error?.message || 'Unknown error',
      status: error?.response?.status,
    };
  }
}

export default async function DebugConfigPage() {
  const dbCheck = await checkDatabase();
  const wcCheck = await testWooCommerce();

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Configuration Debug</h1>

      {/* WooCommerce */}
      <div className="mb-6 p-4 border rounded">
        <h2 className="font-semibold mb-3">WooCommerce Configuration</h2>
        <div className="space-y-2 text-sm">
          <p>
            <strong>WC_STORE_URL:</strong>{' '}
            {process.env.WC_STORE_URL ? (
              <span className="text-green-600">✓ Set</span>
            ) : (
              <span className="text-red-600">✗ Not set</span>
            )}
            {process.env.WC_STORE_URL && (
              <span className="ml-2 text-gray-600">
                ({process.env.WC_STORE_URL})
              </span>
            )}
          </p>
          <p>
            <strong>WC_CONSUMER_KEY:</strong>{' '}
            {process.env.WC_CONSUMER_KEY ? (
              <span className="text-green-600">✓ Set</span>
            ) : (
              <span className="text-red-600">✗ Not set</span>
            )}
          </p>
          <p>
            <strong>WC_CONSUMER_SECRET:</strong>{' '}
            {process.env.WC_CONSUMER_SECRET ? (
              <span className="text-green-600">✓ Set</span>
            ) : (
              <span className="text-red-600">✗ Not set</span>
            )}
          </p>
        </div>
        <div className="mt-3 p-3 bg-gray-50 rounded">
          <h3 className="font-semibold mb-2">Connection Test:</h3>
          {wcCheck.success ? (
            <div className="text-green-700">
              ✓ {wcCheck.message}
              {wcCheck.productCount && (
                <span className="ml-2">
                  (Found {wcCheck.productCount} products)
                </span>
              )}
            </div>
          ) : (
            <div className="text-red-700">
              ✗ Error: {wcCheck.error}
              {wcCheck.status && (
                <span className="ml-2">(HTTP {wcCheck.status})</span>
              )}
              {wcCheck.missing && (
                <div className="mt-2 text-xs">
                  Missing:{' '}
                  {Object.entries(wcCheck.missing)
                    .filter(([, v]) => v)
                    .map(([k]) => k)
                    .join(', ')}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Database */}
      <div className="mb-6 p-4 border rounded">
        <h2 className="font-semibold mb-3">Database Configuration</h2>
        <p className="text-sm mb-2">
          <strong>POSTGRES_URL:</strong>{' '}
          {process.env.POSTGRES_URL ? (
            <span className="text-green-600">✓ Set</span>
          ) : (
            <span className="text-red-600">✗ Not set</span>
          )}
        </p>
        <div className="mt-3 p-3 bg-gray-50 rounded">
          <h3 className="font-semibold mb-2">Connection Test:</h3>
          {dbCheck.success ? (
            <div className="text-green-700">
              ✓ Database connected ({dbCheck.slotCount} slots found)
            </div>
          ) : (
            <div className="text-red-700">✗ Error: {dbCheck.error}</div>
          )}
        </div>
      </div>

      {/* Square */}
      <div className="mb-6 p-4 border rounded">
        <h2 className="font-semibold mb-3">Square Configuration</h2>
        <div className="space-y-2 text-sm">
          <p>
            <strong>NEXT_PUBLIC_SQUARE_APPLICATION_ID:</strong>{' '}
            {process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID ? (
              <span className="text-green-600">✓ Set</span>
            ) : (
              <span className="text-red-600">✗ Not set</span>
            )}
          </p>
          <p>
            <strong>NEXT_PUBLIC_SQUARE_LOCATION_ID:</strong>{' '}
            {process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID ? (
              <span className="text-green-600">✓ Set</span>
            ) : (
              <span className="text-red-600">✗ Not set</span>
            )}
          </p>
          <p>
            <strong>SQUARE_ACCESS_TOKEN:</strong>{' '}
            {process.env.SQUARE_ACCESS_TOKEN ? (
              <span className="text-green-600">✓ Set</span>
            ) : (
              <span className="text-red-600">✗ Not set</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
