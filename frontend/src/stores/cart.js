import { defineStore } from 'pinia';

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
  }),

  getters: {
    totalItems: (s) => s.items.reduce((sum, i) => sum + i.quantity, 0),
    subtotal: (s) => s.items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    isEmpty: (s) => s.items.length === 0,
    totalWeight: (s) => s.items.reduce((sum, i) => sum + i.weight * i.quantity, 0),
  },

  actions: {
    init() {
      const data = localStorage.getItem('dchal_cart');
      if (data) {
        try {
          this.items = JSON.parse(data);
        } catch {}
      }
    },

    save() {
      localStorage.setItem('dchal_cart', JSON.stringify(this.items));
    },

    addItem(product, quantity = 1) {
      const existing = this.items.find((i) => i.productId === product._id);
      const price = product.discountPrice > 0 ? product.discountPrice : product.price;

      if (existing) {
        existing.quantity = Math.min(existing.quantity + quantity, product.stock);
      } else {
        this.items.push({
          productId: product._id,
          name: product.name,
          slug: product.slug,
          image: product.mainImage || product.images?.[0] || '',
          price,
          quantity: Math.min(quantity, product.stock),
          weight: product.weight,
          maxStock: product.stock,
        });
      }
      this.save();
    },

    updateQuantity(productId, quantity) {
      const item = this.items.find((i) => i.productId === productId);
      if (item) {
        item.quantity = Math.max(1, Math.min(quantity, item.maxStock));
        this.save();
      }
    },

    removeItem(productId) {
      this.items = this.items.filter((i) => i.productId !== productId);
      this.save();
    },

    clear() {
      this.items = [];
      this.save();
    },
  },
});
