'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';

export interface CartItem {
  product_id: number;
  variation_id?: number;
  quantity: number;
  name: string;
  price: number;
  image?: string;
  slug: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: number, variationId?: number) => void;
  updateQuantity: (
    productId: number,
    quantity: number,
    variationId?: number
  ) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const saved = localStorage.getItem('stanlake_cart');
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load cart', e);
      }
    }
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('stanlake_cart', JSON.stringify(items));
  }, [mounted, items]);

  const addItem = (item: CartItem) => {
    setItems((current) => {
      const existing = current.find(
        (i) =>
          i.product_id === item.product_id && i.variation_id === item.variation_id
      );

      if (existing) {
        return current.map((i) =>
          i.product_id === item.product_id && i.variation_id === item.variation_id
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }

      return [...current, item];
    });
  };

  const removeItem = (productId: number, variationId?: number) => {
    setItems((current) =>
      current.filter(
        (i) =>
          !(i.product_id === productId && i.variation_id === variationId)
      )
    );
  };

  const updateQuantity = (
    productId: number,
    quantity: number,
    variationId?: number
  ) => {
    if (quantity <= 0) {
      removeItem(productId, variationId);
      return;
    }

    setItems((current) =>
      current.map((i) =>
        i.product_id === productId && i.variation_id === variationId
          ? { ...i, quantity }
          : i
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        total,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
