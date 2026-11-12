import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { calculateOrder } from '../utils/calculatorUtils.js';

const STORAGE_KEY = 'namuna_cart_v1';

const CartContext = createContext(null);

function loadInitialCart() {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadInitialCart);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch {}
    }
  }, [items]);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const toggleCart = useCallback(() => setIsCartOpen(prev => !prev), []);

  /**
   * Generates a stable unique ID for an item based on product, size, and mode
   */
  const getItemId = useCallback((product, size, mode) => {
    const sizeKey = size
      ? `${size.lengthCm || 0}x${size.widthCm || 0}x${size.thicknessMm || 0}`
      : 'standard';
    return `${product.id}__${sizeKey}__${mode || 'direct'}`;
  }, []);

  /**
   * Add or increment an item in the cart
   */
  const addItem = useCallback((product, { size = null, quantity = 1, mode = null } = {}) => {
    const effectiveMode = mode || (product.priceUnit === 'piece' ? 'pieces' : 'direct');
    const itemId = getItemId(product, size, effectiveMode);

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex(i => i.id === itemId);
      const addQty = Number(quantity) || 1;

      if (existingIndex > -1) {
        const existing = prevItems[existingIndex];
        const nextQty = existing.quantity + addQty;
        const calculation = calculateOrder(product, {
          size,
          quantity: nextQty,
          mode: effectiveMode,
        });

        const updated = [...prevItems];
        updated[existingIndex] = {
          ...existing,
          quantity: nextQty,
          calculation,
        };
        return updated;
      } else {
        const calculation = calculateOrder(product, {
          size,
          quantity: addQty,
          mode: effectiveMode,
        });

        return [
          ...prevItems,
          {
            id: itemId,
            product,
            size,
            quantity: addQty,
            mode: effectiveMode,
            calculation,
            addedAt: Date.now(),
          },
        ];
      }
    });
  }, [getItemId]);

  /**
   * Update quantity of an existing item (removes if <= 0)
   */
  const updateQuantity = useCallback((itemId, newQuantity) => {
    const qty = Number(newQuantity);
    setItems((prevItems) => {
      if (qty <= 0 || isNaN(qty)) {
        return prevItems.filter(i => i.id !== itemId);
      }
      return prevItems.map(item => {
        if (item.id !== itemId) return item;
        const calculation = calculateOrder(item.product, {
          size: item.size,
          quantity: qty,
          mode: item.mode,
        });
        return {
          ...item,
          quantity: qty,
          calculation,
        };
      });
    });
  }, []);

  /**
   * Remove item by ID
   */
  const removeItem = useCallback((itemId) => {
    setItems(prev => prev.filter(i => i.id !== itemId));
  }, []);

  /**
   * Clear all items
   */
  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  // Aggregated metrics
  const totalItems = useMemo(() => {
    return items.reduce((acc, item) => acc + (item.quantity > 0 ? 1 : 0), 0);
  }, [items]);

  const totalQuantity = useMemo(() => {
    return items.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);
  }, [items]);

  const subtotalSum = useMemo(() => {
    return items.reduce((acc, item) => {
      const sub = item.calculation?.subtotal;
      return acc + (typeof sub === 'number' ? sub : 0);
    }, 0);
  }, [items]);

  const totalSum = useMemo(() => {
    return items.reduce((acc, item) => {
      const tot = item.calculation?.total ?? item.calculation?.subtotal;
      return acc + (typeof tot === 'number' ? tot : 0);
    }, 0);
  }, [items]);

  const discountSum = useMemo(() => {
    return items.reduce((acc, item) => {
      const disc = item.calculation?.discountAmount;
      return acc + (typeof disc === 'number' ? disc : 0);
    }, 0);
  }, [items]);

  const value = useMemo(() => ({
    items,
    totalItems,
    totalQuantity,
    subtotalSum,
    totalSum,
    discountSum,
    isCartOpen,
    openCart,
    closeCart,
    toggleCart,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
  }), [
    items,
    totalItems,
    totalQuantity,
    subtotalSum,
    totalSum,
    discountSum,
    isCartOpen,
    openCart,
    closeCart,
    toggleCart,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
  ]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

const fallbackContext = {
  items: [],
  totalItems: 0,
  totalQuantity: 0,
  subtotalSum: 0,
  totalSum: 0,
  discountSum: 0,
  isCartOpen: false,
  openCart: () => {},
  closeCart: () => {},
  toggleCart: () => {},
  addItem: () => {},
  updateQuantity: () => {},
  removeItem: () => {},
  clearCart: () => {},
};

export function useCart() {
  const context = useContext(CartContext);
  return context || fallbackContext;
}

export default CartContext;

