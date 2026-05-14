<script setup>
import { computed } from 'vue';
import { useCartStore } from '../stores/cart';

const props = defineProps({
  product: { type: Object, required: true },
});

const cart = useCartStore();

const finalPrice = computed(() =>
  props.product.discountPrice > 0 ? props.product.discountPrice : props.product.price
);
const discountPercent = computed(() => {
  if (props.product.discountPrice > 0 && props.product.price > 0) {
    return Math.round(((props.product.price - props.product.discountPrice) / props.product.price) * 100);
  }
  return 0;
});

function formatRupiah(n) {
  return 'Rp ' + Number(n).toLocaleString('id-ID');
}

function addToCart() {
  cart.addItem(props.product, 1);
  window.$toast?.(`${props.product.name} ditambahkan ke keranjang`);
}
</script>

<template>
  <div class="product-card">
    <router-link :to="{ name: 'ProductDetail', params: { slug: product.slug } }" class="product-image">
      <img :src="product.mainImage || product.images?.[0]" :alt="product.name" loading="lazy" />
      <span v-if="discountPercent > 0" class="discount-badge">-{{ discountPercent }}%</span>
      <span v-if="product.stock < 10 && product.stock > 0" class="stock-badge">Sisa {{ product.stock }}</span>
      <span v-if="product.stock === 0" class="stock-badge out">Habis</span>
    </router-link>
    <div class="product-body">
      <div class="product-cat">{{ product.category }}</div>
      <router-link :to="{ name: 'ProductDetail', params: { slug: product.slug } }" class="product-name">
        {{ product.name }}
      </router-link>
      <div class="product-price">
        <span class="current">{{ formatRupiah(finalPrice) }}</span>
        <span v-if="discountPercent > 0" class="original">{{ formatRupiah(product.price) }}</span>
      </div>
      <div class="product-meta">
        <span class="sold">⚡ {{ product.soldCount || 0 }} terjual</span>
      </div>
      <button class="btn btn-primary btn-block btn-sm" @click="addToCart" :disabled="product.stock === 0">
        {{ product.stock === 0 ? 'Stok Habis' : '+ Keranjang' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.product-card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: all 0.25s ease;
  border: 1px solid var(--color-border);
}
.product-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
  border-color: var(--color-primary-light);
}
.product-image {
  position: relative;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  background: var(--color-surface-2);
}
.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}
.product-card:hover .product-image img { transform: scale(1.06); }

.discount-badge {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  background: var(--color-danger);
  color: white;
  font-weight: 700;
  font-size: 0.75rem;
  padding: 0.25rem 0.55rem;
  border-radius: var(--radius-sm);
}
.stock-badge {
  position: absolute;
  bottom: 0.75rem;
  left: 0.75rem;
  background: rgba(0,0,0,0.7);
  color: white;
  font-size: 0.7rem;
  padding: 0.2rem 0.5rem;
  border-radius: var(--radius-sm);
}
.stock-badge.out { background: var(--color-danger); }

.product-body {
  padding: 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  flex: 1;
}
.product-cat {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-primary);
}
.product-name {
  font-weight: 600;
  font-size: 0.95rem;
  line-height: 1.35;
  color: var(--color-text);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 2.5em;
}
.product-name:hover { color: var(--color-primary); }
.product-price {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin-top: auto;
}
.current {
  font-weight: 800;
  font-size: 1.05rem;
  color: var(--color-text);
  font-family: var(--font-display);
}
.original {
  font-size: 0.8rem;
  color: var(--color-text-light);
  text-decoration: line-through;
}
.product-meta {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  margin-bottom: 0.5rem;
}
</style>
