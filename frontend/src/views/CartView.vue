<script setup>
import { ShoppingCart, Trash2 } from 'lucide-vue-next';
import { useCartStore } from '../stores/cart';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const cart = useCartStore();
const auth = useAuthStore();
const router = useRouter();

function formatRupiah(n) { return 'Rp ' + Number(n).toLocaleString('id-ID'); }

function goToCheckout() {
  if (!auth.isLoggedIn) {
    router.push({ name: 'Login', query: { redirect: '/checkout' } });
  } else {
    router.push('/checkout');
  }
}
</script>

<template>
  <section class="section">
    <div class="container">
      <h1 class="section-title">Keranjang Belanja</h1>

      <div v-if="cart.isEmpty" class="empty">
        <div class="empty-icon"><ShoppingCart :size="64" /></div>
        <h3>Keranjang masih kosong</h3>
        <p class="text-muted">Yuk pilih produk dulu</p>
        <router-link to="/products" class="btn btn-primary mt-4">Mulai Belanja</router-link>
      </div>

      <div v-else class="cart-layout">
        <div class="cart-items">
          <div v-for="item in cart.items" :key="item.productId" class="cart-item">
            <img :src="item.image" :alt="item.name" />
            <div class="item-info">
              <router-link :to="{ name: 'ProductDetail', params: { slug: item.slug } }" class="item-name">
                {{ item.name }}
              </router-link>
              <div class="item-price">{{ formatRupiah(item.price) }}</div>
              <div class="item-actions">
                <div class="qty-input">
                  <button @click="cart.updateQuantity(item.productId, item.quantity - 1)">−</button>
                  <input type="number" :value="item.quantity"
                    @change="cart.updateQuantity(item.productId, Number($event.target.value))" />
                  <button @click="cart.updateQuantity(item.productId, item.quantity + 1)">+</button>
                </div>
                <button class="remove-btn" @click="cart.removeItem(item.productId)" style="display:inline-flex;align-items:center;gap:0.35rem"><Trash2 :size="14" /> Hapus</button>
              </div>
            </div>
            <div class="item-subtotal">
              <div class="subtotal-label">Subtotal</div>
              <div class="subtotal-value">{{ formatRupiah(item.price * item.quantity) }}</div>
            </div>
          </div>
        </div>

        <aside class="summary">
          <h3>Ringkasan Pesanan</h3>
          <div class="summary-row">
            <span>{{ cart.totalItems }} barang</span>
            <span>{{ formatRupiah(cart.subtotal) }}</span>
          </div>
          <div class="summary-row text-muted" style="font-size: 0.85rem;">
            <span>Total berat</span>
            <span>{{ cart.totalWeight }}g</span>
          </div>
          <div class="summary-divider"></div>
          <div class="summary-row total-row">
            <span>Total Sementara</span>
            <span>{{ formatRupiah(cart.subtotal) }}</span>
          </div>
          <p class="ship-note">Ongkir dihitung di halaman checkout</p>
          <button class="btn btn-primary btn-block btn-lg" @click="goToCheckout">
            Lanjut Checkout →
          </button>
          <router-link to="/products" class="btn btn-ghost btn-block mt-2">
            Lanjut Belanja
          </router-link>
        </aside>
      </div>
    </div>
  </section>
</template>

<style scoped>
.empty {
  text-align: center;
  padding: 4rem 1rem;
  background: white;
  border-radius: var(--radius-lg);
}
.empty-icon { display: flex; justify-content: center; margin-bottom: 1rem; color: var(--color-text-muted); }

.cart-layout {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 2rem;
}

.cart-items { display: flex; flex-direction: column; gap: 0.75rem; }
.cart-item {
  display: grid;
  grid-template-columns: 100px 1fr auto;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
}
.cart-item img {
  width: 100px; height: 100px;
  object-fit: cover;
  border-radius: var(--radius-md);
  background: var(--color-surface-2);
}
.item-info { display: flex; flex-direction: column; gap: 0.4rem; }
.item-name { font-weight: 600; }
.item-name:hover { color: var(--color-primary); }
.item-price { color: var(--color-primary); font-weight: 600; }
.item-actions { display: flex; align-items: center; gap: 1rem; margin-top: auto; }

.qty-input {
  display: inline-flex;
  align-items: center;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
}
.qty-input button {
  width: 32px; height: 32px;
  font-size: 1rem;
  font-weight: 600;
}
.qty-input button:hover { background: var(--color-surface-2); }
.qty-input input {
  width: 44px;
  text-align: center;
  border: none;
  border-left: 1.5px solid var(--color-border);
  border-right: 1.5px solid var(--color-border);
  height: 32px;
  font-weight: 600;
  -moz-appearance: textfield;
}
.qty-input input::-webkit-outer-spin-button,
.qty-input input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }

.remove-btn {
  font-size: 0.85rem;
  color: var(--color-danger);
  padding: 0.3rem 0.5rem;
  border-radius: var(--radius-sm);
}
.remove-btn:hover { background: rgba(239,68,68,0.1); }

.item-subtotal { text-align: right; }
.subtotal-label { font-size: 0.75rem; color: var(--color-text-muted); }
.subtotal-value { font-weight: 700; font-family: var(--font-display); color: var(--color-text); }

.summary {
  background: white;
  padding: 1.5rem;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  height: fit-content;
  position: sticky;
  top: calc(var(--header-h) + 1rem);
}
.summary h3 { margin-bottom: 1rem; }
.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}
.summary-divider {
  height: 1px;
  background: var(--color-border);
  margin: 1rem 0;
}
.total-row {
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--color-text);
}
.ship-note {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  margin: 0.5rem 0 1rem;
}

@media (max-width: 768px) {
  .cart-layout { grid-template-columns: 1fr; }
  .summary { position: static; }
  .cart-item {
    grid-template-columns: 80px 1fr;
  }
  .cart-item img { width: 80px; height: 80px; }
  .item-subtotal {
    grid-column: 1 / -1;
    text-align: left;
    border-top: 1px solid var(--color-border);
    padding-top: 0.5rem;
  }
}
</style>
