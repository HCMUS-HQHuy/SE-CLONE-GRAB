
import { createContext, useContext } from 'react';
import { createStore, useStore } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
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

// Sử dụng persist middleware để tự động lưu vào localStorage
const store = createStore<CartState & CartActions>()(
  persist(
    (set, get) => ({
      items: [],
      restaurant: null,
      pendingItem: null,

      addItem: (item, quantity, restaurant, isBuyNow = false) => {
        const currentRestaurant = get().restaurant;
        // Nếu đã có hàng từ nhà hàng khác, hiển thị modal xác nhận (pendingItem)
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
        set({ pendingItem: null }); // Xóa item chờ

        if (item && quantity && pending) {
          const { isBuyNow } = pending;
          set({
            items: [{ ...item, quantity }],
            restaurant: item.restaurant || null,
          });
          if (isBuyNow) {
            setTimeout(() => window.location.href = '/user/checkout', 0);
          }
        } else if (pending?.item && pending?.quantity) {
          const { item: pendingItem, quantity: pendingQuantity, isBuyNow } = pending;
          set({
            items: [{ ...pendingItem, quantity: pendingQuantity }],
            restaurant: pendingItem.restaurant || null,
          });
          if (isBuyNow) {
            setTimeout(() => window.location.href = '/user/checkout', 0);
          }
        }
      },

      updateQuantity: (itemId, quantity) => {
        set(state => {
          const newItems = state.items
            .map(item => (item.id === itemId ? { ...item, quantity } : item))
            .filter(item => item.quantity > 0);
          
          return {
            items: newItems,
            restaurant: newItems.length === 0 ? null : state.restaurant
          };
        });
      },

      removeItem: (itemId) => {
        set(state => {
          const newItems = state.items.filter(item => item.id !== itemId);
          return {
            items: newItems,
            restaurant: newItems.length === 0 ? null : state.restaurant
          };
        });
      },

      clearCart: () => {
        set({ items: [], restaurant: null });
      },
    }),
    {
      name: 'food-delivery-cart', // Tên key trong localStorage
      storage: createJSONStorage(() => localStorage),
      // Chỉ lưu trữ items và restaurant, không lưu trạng thái UI tạm thời (pendingItem)
      partialize: (state) => ({
        items: state.items,
        restaurant: state.restaurant,
      }),
    }
  )
);

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

// Truy cập trực tiếp state cho các trường hợp ngoài React components
useCart.getState = store.getState;
