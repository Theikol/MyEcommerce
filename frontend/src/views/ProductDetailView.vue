<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Star, Zap, Check, AlertTriangle } from 'lucide-vue-next';
import api from '../services/api';
import { useCartStore } from '../stores/cart';

const route = useRoute();
const router = useRouter();
const cart = useCartStore();

const product = ref(null);
const loading = ref(true);
const quantity = ref(1);
const activeImg = ref(0);

const finalPrice = computed(() =>
  product.value?.discountPrice > 0 ? product.value.discountPrice : product.value?.price || 0
);
const discountPercent = computed(() => {
  if (!product.value) return 0;
  if (product.value.discountPrice > 0 && product.value.price > 0) {
    return Math.round(((product.value.price - product.value.discountPrice) / product.value.price) * 100);
  }
  return 0;
});

function formatRupiah(n) { return 'Rp ' + Number(n).toLocaleString('id-ID'); }

async function fetchProduct() {
  loading.value = true;
  try {
    const { data } = await api.get(`/products/${route.params.slug}`);
    product.value = data.data;
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
}

function addToCart() {
  cart.addItem(product.value, quantity.value);
  window.$toast?.(`Berhasil ditambahkan ke keranjang (${quantity.value}x)`);
}

function buyNow() {
  cart.addItem(product.value, quantity.value);
  router.push('/cart');
}

watch(() => route.params.slug, fetchProduct);
onMounted(fetchProduct);
</script>

<template>
  <section class="section">
    <div class="container">
      <div v-if="loading" class="layout">
        <div class="skeleton" style="height: 480px;"></div>
        <div>
          <div class="skeleton" style="height: 40px; margin-bottom: 1rem;"></div>
          <div class="skeleton" style="height: 60px; margin-bottom: 1rem;"></div>
          <div class="skeleton" style="height: 200px;"></div>
        </div>
      </div>

      <div v-else-if="product" class="layout fade-in">
        <!-- Galeri -->
        <div class="gallery">
          <div class="main-image">
            <img :src="product.images[activeImg] || product.mainImage" :alt="product.name" />
            <span v-if="discountPercent > 0" class="discount-tag">-{{ discountPercent }}%</span>
          </div>
          <div v-if="product.images.length > 1" class="thumbs">
            <button
              v-for="(img, i) in product.images"
              :key="i"
              :class="['thumb', { active: activeImg === i }]"
              @click="activeImg = i"
            >
              <img :src="img" :alt="`${product.name} ${i+1}`" />
            </button>
          </div>
        </div>

        <!-- Info -->
        <div class="info">
          <div class="info-cat">{{ product.category }}{{ product.brand ? ` · ${product.brand}` : '' }}</div>
          <h1 class="info-title">{{ product.name }}</h1>

          <div class="info-meta">
            <span style="display:inline-flex;align-items:center;gap:0.3rem"><Star :size="14" :fill="'#f59e0b'" color="#f59e0b" /> {{ product.rating.toFixed(1) }} ({{ product.numReviews }} ulasan)</span>
            <span>·</span>
            <span style="display:inline-flex;align-items:center;gap:0.3rem"><Zap :size="14" /> {{ product.soldCount }} terjual</span>
          </div>

          <div class="info-price">
            <span class="price-now">{{ formatRupiah(finalPrice) }}</span>
            <span v-if="discountPercent > 0" class="price-old">{{ formatRupiah(product.price) }}</span>
            <span v-if="discountPercent > 0" class="badge badge-danger">Hemat {{ discountPercent }}%</span>
          </div>

          <div class="info-stock">
            <span v-if="product.stock > 10" class="badge badge-success" style="display:inline-flex;align-items:center;gap:0.3rem"><Check :size="13" /> Stok Tersedia</span>
            <span v-else-if="product.stock > 0" class="badge badge-warning" style="display:inline-flex;align-items:center;gap:0.3rem"><AlertTriangle :size="13" /> Sisa {{ product.stock }}</span>
            <span v-else class="badge badge-danger">Stok Habis</span>
            <span class="text-muted" style="margin-left: 0.5rem;">Berat: {{ product.weight }}g</span>
          </div>

          <!-- Spek -->
          <div v-if="product.specifications?.length" class="specs">
            <h4>Spesifikasi</h4>
            <table>
              <tr v-for="spec in product.specifications" :key="spec.key">
                <td class="spec-key">{{ spec.key }}</td>
                <td>{{ spec.value }}</td>
              </tr>
            </table>
          </div>

          <!-- Aksi -->
          <div class="action-box">
            <div class="qty-wrap">
              <span class="qty-label">Jumlah</span>
              <div class="qty-input">
                <button @click="quantity = Math.max(1, quantity - 1)">−</button>
                <input type="number" v-model.number="quantity" :min="1" :max="product.stock" />
                <button @click="quantity = Math.min(product.stock, quantity + 1)">+</button>
              </div>
              <span class="qty-stock">Sisa {{ product.stock }} pcs</span>
            </div>

            <div class="action-buttons">
              <button class="btn btn-outline btn-lg" @click="addToCart" :disabled="product.stock === 0">
                + Keranjang
              </button>
              <button class="btn btn-primary btn-lg" @click="buyNow" :disabled="product.stock === 0">
                Beli Sekarang
              </button>
            </div>
          </div>
        </div>

        <!-- Deskripsi -->
        <div class="desc-block">
          <h3>Deskripsi Produk</h3>
          <p style="white-space: pre-line;">{{ product.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2.5rem;
}
.gallery { position: sticky; top: calc(var(--header-h) + 1rem); align-self: start; }
.main-image {
  position: relative;
  aspect-ratio: 1 / 1;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--color-border);
}
.main-image img { width: 100%; height: 100%; object-fit: cover; }
.discount-tag {
  position: absolute;
  top: 1rem; left: 1rem;
  background: var(--color-danger);
  color: white;
  font-weight: 700;
  padding: 0.4rem 0.85rem;
  border-radius: var(--radius-md);
}
.thumbs {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
  overflow-x: auto;
}
.thumb {
  width: 70px; height: 70px;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 2px solid transparent;
  flex-shrink: 0;
}
.thumb.active { border-color: var(--color-primary); }
.thumb img { width: 100%; height: 100%; object-fit: cover; }

.info-cat {
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  color: var(--color-primary);
  text-transform: uppercase;
  margin-bottom: 0.5rem;
}
.info-title {
  font-size: 1.85rem;
  margin-bottom: 0.75rem;
}
.info-meta {
  display: flex;
  gap: 0.5rem;
  color: var(--color-text-muted);
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}
.info-price {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}
.price-now {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 2rem;
  color: var(--color-text);
}
.price-old {
  font-size: 1.05rem;
  color: var(--color-text-light);
  text-decoration: line-through;
}
.info-stock {
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
}

.specs {
  background: var(--color-surface);
  padding: 1.25rem;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  margin-bottom: 1.5rem;
}
.specs h4 { margin-bottom: 0.75rem; font-size: 1rem; }
.specs table { width: 100%; border-collapse: collapse; }
.specs td {
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--color-border);
  font-size: 0.9rem;
}
.specs tr:last-child td { border-bottom: none; }
.spec-key { color: var(--color-text-muted); width: 40%; }

.action-box {
  background: var(--color-surface);
  padding: 1.5rem;
  border-radius: var(--radius-lg);
  border: 2px solid var(--color-border);
}
.qty-wrap {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}
.qty-label { font-weight: 600; }
.qty-input {
  display: flex;
  align-items: center;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
}
.qty-input button {
  width: 40px; height: 40px;
  font-size: 1.25rem;
  font-weight: 600;
}
.qty-input button:hover { background: var(--color-surface-2); }
.qty-input input {
  width: 60px;
  text-align: center;
  border: none;
  border-left: 2px solid var(--color-border);
  border-right: 2px solid var(--color-border);
  height: 40px;
  font-weight: 600;
  -moz-appearance: textfield;
}
.qty-input input::-webkit-outer-spin-button,
.qty-input input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
.qty-stock { font-size: 0.85rem; color: var(--color-text-muted); }
.action-buttons { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }

.desc-block {
  grid-column: 1 / -1;
  background: white;
  padding: 2rem;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  margin-top: 1rem;
}
.desc-block h3 { margin-bottom: 1rem; }
.desc-block p { color: var(--color-text-muted); line-height: 1.7; }

@media (max-width: 900px) {
  .layout { grid-template-columns: 1fr; }
  .gallery { position: static; }
}
</style>
