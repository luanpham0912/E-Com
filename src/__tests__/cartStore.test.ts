import { useCartStore } from '../store/cartStore';
import type { CartItem } from '@/lib/types';

jest.mock('@/apis/ordersApi', () => ({
  cartApi: {
    add: jest.fn().mockResolvedValue(undefined),
    remove: jest.fn().mockResolvedValue(undefined),
    update: jest.fn().mockResolvedValue(undefined),
    clear: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('../store/authStore', () => ({
  useAuthStore: {
    getState: jest.fn().mockReturnValue({ isAuthenticated: false }),
  },
}));

const makeItem = (overrides: Partial<CartItem> = {}): CartItem => ({
  productId: 'prod-1',
  quantity: 1,
  ...overrides,
});

describe('cartStore', () => {
  beforeEach(() => {
    useCartStore.getState().reset();
  });

  describe('addItem', () => {
    it('adds a new item to the cart', () => {
      const store = useCartStore.getState();
      store.addItem(makeItem({ productId: 'prod-1', quantity: 2 }));
      expect(useCartStore.getState().items).toHaveLength(1);
      expect(useCartStore.getState().items[0].quantity).toBe(2);
    });

    it('increments quantity for duplicate product', () => {
      const store = useCartStore.getState();
      store.addItem(makeItem({ productId: 'prod-1', quantity: 2 }));
      store.addItem(makeItem({ productId: 'prod-1', quantity: 3 }));
      expect(useCartStore.getState().items).toHaveLength(1);
      expect(useCartStore.getState().items[0].quantity).toBe(5);
    });

    it('caps quantity at 99', () => {
      const store = useCartStore.getState();
      store.addItem(makeItem({ productId: 'prod-1', quantity: 90 }));
      store.addItem(makeItem({ productId: 'prod-1', quantity: 20 }));
      expect(useCartStore.getState().items[0].quantity).toBe(99);
    });

    it('treats variants as separate items', () => {
      const store = useCartStore.getState();
      store.addItem(
        makeItem({ productId: 'prod-1', variant: { type: 'size', value: 'M' } })
      );
      store.addItem(
        makeItem({ productId: 'prod-1', variant: { type: 'size', value: 'L' } })
      );
      expect(useCartStore.getState().items).toHaveLength(2);
    });
  });

  describe('removeItem', () => {
    it('removes an item by productId', () => {
      const store = useCartStore.getState();
      store.addItem(makeItem({ productId: 'prod-1' }));
      store.addItem(makeItem({ productId: 'prod-2' }));
      store.removeItem('prod-1');
      expect(useCartStore.getState().items).toHaveLength(1);
      expect(useCartStore.getState().items[0].productId).toBe('prod-2');
    });
  });

  describe('updateQuantity', () => {
    it('updates the quantity of an existing item', () => {
      const store = useCartStore.getState();
      store.addItem(makeItem({ productId: 'prod-1', quantity: 1 }));
      store.updateQuantity('prod-1', 5);
      expect(useCartStore.getState().items[0].quantity).toBe(5);
    });

    it('caps quantity at 99', () => {
      const store = useCartStore.getState();
      store.addItem(makeItem({ productId: 'prod-1', quantity: 1 }));
      store.updateQuantity('prod-1', 150);
      expect(useCartStore.getState().items[0].quantity).toBe(99);
    });

    it('removes item when quantity is set to 0', () => {
      const store = useCartStore.getState();
      store.addItem(makeItem({ productId: 'prod-1', quantity: 5 }));
      store.updateQuantity('prod-1', 0);
      expect(useCartStore.getState().items).toHaveLength(0);
    });

    it('removes item when quantity is set to negative', () => {
      const store = useCartStore.getState();
      store.addItem(makeItem({ productId: 'prod-1', quantity: 5 }));
      store.updateQuantity('prod-1', -1);
      expect(useCartStore.getState().items).toHaveLength(0);
    });
  });

  describe('clearCart', () => {
    it('resets items and coupon', () => {
      const store = useCartStore.getState();
      store.addItem(makeItem({ productId: 'prod-1' }));
      store.applyCoupon('DISCOUNT10');
      store.clearCart();
      expect(useCartStore.getState().items).toHaveLength(0);
      expect(useCartStore.getState().coupon).toBeNull();
    });
  });

  describe('coupon', () => {
    it('applies and removes coupon', () => {
      const store = useCartStore.getState();
      store.applyCoupon('DISCOUNT20');
      expect(useCartStore.getState().coupon).toBe('DISCOUNT20');
      store.removeCoupon();
      expect(useCartStore.getState().coupon).toBeNull();
    });
  });
});
