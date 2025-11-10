import React, { createContext, useContext } from 'react';
import { createStore, useStore } from 'zustand';
import { FoodItem, Restaurant } from '../pages/HomePage';

export type CartItem = FoodItem & { quantity: number };

type CartState = {
  items: CartItem[];
  restaurant: Restaurant | null;
  pendingItem: { item: FoodItem; quantity: number, isBuyNow?: boolean } | null;
};

type CartActions = {
  addItem: (item: FoodItem, quantity: number, restaurant: Restaurant, isBuyNow?: boolean) => void;
  updateQuantity: (itemId: number, quantity: number) => void;
  removeItem: (itemId: number) => void;
  clearCart: () => void;
  clearCartAndAddItem: (item: FoodItem | null, quantity?: number) => void;
};

const store = createStore<CartState & CartActions>((set, get) => ({
  items: [],
  restaurant: null,
  pendingItem: null,

  addItem: (item, quantity, restaurant, isBuyNow = false) => {
    const currentRestaurant = get().restaurant;
    if (currentRestaurant && currentRestaurant.id !== restaurant.id) {
      set({ pendingItem: { item, quantity, isBuyNow } });
      return;
    }

    set(state => {
      const existingItemIndex = state.items.findIndex(i => i.id === item.id);
      let newItems = [...state.items];

      if (existingItemIndex > -1) {
        const existingItem = newItems[existingItemIndex];
        newItems[existingItemIndex] = { ...existingItem, quantity: existingItem.quantity + quantity };
      } else {
        newItems.push({ ...item, quantity });
      }

      return { items: newItems, restaurant: restaurant };
    });
  },

  clearCartAndAddItem: (item, quantity) => {
    const pending = get().pendingItem;
    set({ pendingItem: null }); // Always clear pending item

    if (item && quantity && pending) {
       const { isBuyNow } = pending;
       set({
         items: [{ ...item, quantity }],
         restaurant: item.restaurant || null,
       });
       // If it was a "buy now" action, the component will handle navigation.
       // This is a simplified way to signal success.
       if (isBuyNow) {
            setTimeout(() => window.location.href = '/user/checkout', 0);
       }

    } else if (pending?.item && pending?.quantity){
        // Case where user confirms from modal, but we use the pending item data
        const { item: pendingItem, quantity: pendingQuantity, isBuyNow } = pending;
        set({
            items: [{...pendingItem, quantity: pendingQuantity}],
            restaurant: pendingItem.restaurant || null,
        });
        if (isBuyNow) {
            setTimeout(() => window.location.href = '/user/checkout', 0);
        }
    }
  },

  updateQuantity: (itemId, quantity) => {
    set(state => ({
      items: state.items
        .map(item => (item.id === itemId ? { ...item, quantity } : item))
        .filter(item => item.quantity > 0),
    }));
    // If last item is removed, clear restaurant
    if (get().items.length === 0) {
        set({ restaurant: null });
    }
  },

  removeItem: (itemId) => {
    set(state => ({
      items: state.items.filter(item => item.id !== itemId),
    }));
     if (get().items.length === 0) {
        set({ restaurant: null });
    }
  },

  clearCart: () => {
    set({ items: [], restaurant: null });
  },
}));


const CartContext = createContext<typeof store | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <CartContext.Provider value={store}>{children}</CartContext.Provider>;
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return useStore(context);
};

// Add a static getter to the hook for rare cases where you need state outside of React components.
useCart.getState = store.getState;
