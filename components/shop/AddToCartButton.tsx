'use client';

import { useCart } from '@/contexts/CartContext';

interface AddToCartButtonProps {
  product: {
    id: number;
    name: string;
    slug: string;
    price?: string;
    images?: { src: string }[];
  };
  variation?: { id: number; price: string } | null;
  quantity: number;
  disabled?: boolean;
}

export default function AddToCartButton({
  product,
  variation,
  quantity,
  disabled,
}: AddToCartButtonProps) {
  const { addItem } = useCart();

  const handleAddToCart = () => {
    const image = product.images?.[0];

    addItem({
      product_id: product.id,
      variation_id: variation?.id,
      quantity,
      name: product.name,
      price: parseFloat(variation?.price ?? product.price ?? '0'),
      image: image?.src,
      slug: product.slug,
    });

    alert('Added to cart!');
  };

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      disabled={disabled}
      className={`
        w-full text-white py-4 rounded text-lg font-medium
        transition-colors
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      style={{
        backgroundColor: 'var(--color-brand)',
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.backgroundColor = 'var(--color-brand-dark)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--color-brand)';
      }}
    >
      Add to Cart
    </button>
  );
}
