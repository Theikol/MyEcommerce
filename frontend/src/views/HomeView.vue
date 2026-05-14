<script setup>
import { ref, onMounted } from 'vue';
import { Cable, Smartphone, Headphones, Zap, Battery, Sparkles, Flame, Star, Truck, CreditCard, ShieldCheck, MessageCircle } from 'lucide-vue-next';
import api from '../services/api';
import ProductCard from '../components/ProductCard.vue';

const featured = ref([]);
const loading = ref(true);

const categories = [
  { name: 'Kabel', icon: Cable, color: '#0066ff' },
  { name: 'Casing HP', icon: Smartphone, color: '#10b981' },
  { name: 'Earphone', icon: Headphones, color: '#8b5cf6' },
  { name: 'Charger', icon: Zap, color: '#f59e0b' },
  { name: 'Powerbank', icon: Battery, color: '#06b6d4' },
  { name: 'Aksesoris Lainnya', icon: Sparkles, color: '#ec4899' },
];

onMounted(async () => {
  try {
    const { data } = await api.get('/products/featured/list');
    featured.value = data.data;
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <!-- HERO -->
  <section class="hero">
    <div class="hero-bg">
      <div class="grid-pattern"></div>
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
    </div>
    <div class="container hero-inner">
      <div class="hero-text">
        <div class="hero-tag">
          <span class="dot"></span>
          Reseller Resmi · Garansi 100%
        </div>
        <h1 class="hero-title">
          Aksesoris Elektronik <br>
          <span class="hero-highlight">Berkualitas, Harga Bersaing</span>
        </h1>
        <p class="hero-desc">
          Kabel, casing, earphone, charger & powerbank. Pengiriman cepat ke seluruh Indonesia via JNE, J&amp;T, SiCepat. Bayar mudah lewat GoPay, QRIS, atau VA.
        </p>
        <div class="hero-actions">
          <router-link to="/products" class="btn btn-primary btn-lg">
            Belanja Sekarang
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M5 12h14M13 5l7 7-7 7"/>
            </svg>
          </router-link>
          <router-link to="/products?sort=best_seller" class="btn btn-outline btn-lg" style="display:inline-flex;align-items:center;gap:0.4rem">
            <Flame :size="16" /> Terlaris
          </router-link>
        </div>
        <div class="hero-stats">
          <div><strong>500+</strong><span>Produk</span></div>
          <div><strong>1.2k+</strong><span>Pelanggan</span></div>
          <div><strong>4.9★</strong><span>Rating</span></div>
        </div>
      </div>

      <div class="hero-visual">
        <div class="float-card card-1">
          <span class="badge badge-accent">-40%</span>
          <div class="visual-icon"><Headphones :size="40" /></div>
          <div>Earphone TWS</div>
          <strong>Rp 129.000</strong>
        </div>
        <div class="float-card card-2">
          <span class="badge badge-success">Free Ongkir</span>
          <div class="visual-icon"><Zap :size="40" /></div>
          <div>Fast Charger 20W</div>
          <strong>Rp 59.000</strong>
        </div>
        <div class="float-card card-3">
          <span class="badge badge-primary">Best Seller</span>
          <div class="visual-icon"><Battery :size="40" /></div>
          <div>Powerbank 10000mAh</div>
          <strong>Rp 149.000</strong>
        </div>
      </div>
    </div>
  </section>

  <!-- KATEGORI -->
  <section class="section">
    <div class="container">
      <h2 class="section-title">Kategori Pilihan</h2>
      <p class="section-subtitle">Temukan aksesoris yang kamu butuhkan</p>
      <div class="cat-grid">
        <router-link
          v-for="cat in categories"
          :key="cat.name"
          :to="{ name: 'Products', query: { category: cat.name } }"
          class="cat-card"
          :style="{ '--cat-color': cat.color }"
        >
          <div class="cat-icon"><component :is="cat.icon" :size="32" :color="cat.color" /></div>
          <div class="cat-name">{{ cat.name }}</div>
        </router-link>
      </div>
    </div>
  </section>

  <!-- PRODUK UNGGULAN -->
  <section class="section">
    <div class="container">
      <div class="section-header">
        <div>
          <h2 class="section-title" style="display:flex;align-items:center;gap:0.5rem"><Star :size="22" :fill="'#f59e0b'" :color="'#f59e0b'" /> Produk Unggulan</h2>
          <p class="section-subtitle">Yang paling dicari pelanggan</p>
        </div>
        <router-link to="/products" class="btn btn-outline">Lihat Semua →</router-link>
      </div>

      <div v-if="loading" class="grid-products">
        <div v-for="n in 8" :key="n" class="skeleton" style="height: 320px;"></div>
      </div>
      <div v-else class="grid-products">
        <ProductCard v-for="p in featured" :key="p._id" :product="p" />
      </div>
    </div>
  </section>

  <!-- TRUST BANNER -->
  <section class="section trust">
    <div class="container">
      <div class="trust-grid">
        <div class="trust-item">
          <div class="trust-icon"><Truck :size="40" /></div>
          <h4>Pengiriman Cepat</h4>
          <p>Via JNE, J&amp;T, SiCepat, AnterAja seluruh Indonesia</p>
        </div>
        <div class="trust-item">
          <div class="trust-icon"><CreditCard :size="40" /></div>
          <h4>Pembayaran Aman</h4>
          <p>Dilindungi Midtrans — GoPay, QRIS, VA semua bank</p>
        </div>
        <div class="trust-item">
          <div class="trust-icon"><ShieldCheck :size="40" /></div>
          <h4>Garansi Asli</h4>
          <p>Reseller resmi, semua produk original 100%</p>
        </div>
        <div class="trust-item">
          <div class="trust-icon"><MessageCircle :size="40" /></div>
          <h4>Customer Support</h4>
          <p>Tim siap bantu via WhatsApp setiap hari</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* HERO */
.hero {
  position: relative;
  padding: 4rem 0 5rem;
  overflow: hidden;
  background: linear-gradient(180deg, #f7f8fb 0%, #eef2fb 100%);
}
.hero-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}
.grid-pattern {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(0,102,255,0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,102,255,0.05) 1px, transparent 1px);
  background-size: 40px 40px;
  mask-image: radial-gradient(circle at center, black 30%, transparent 70%);
}
.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.5;
}
.orb-1 {
  width: 400px; height: 400px;
  background: var(--color-primary);
  top: -100px; right: -50px;
}
.orb-2 {
  width: 300px; height: 300px;
  background: var(--color-accent);
  bottom: -100px; left: 20%;
}

.hero-inner {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 3rem;
  align-items: center;
}

.hero-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: white;
  padding: 0.4rem 0.9rem;
  border-radius: var(--radius-full);
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-primary);
  box-shadow: var(--shadow-sm);
  margin-bottom: 1.25rem;
}
.hero-tag .dot {
  width: 8px; height: 8px;
  background: var(--color-success);
  border-radius: 50%;
  animation: pulse 1.5s infinite;
}

.hero-title {
  font-size: clamp(2rem, 4vw, 3.5rem);
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 1.25rem;
}
.hero-highlight {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.hero-desc {
  font-size: 1.05rem;
  color: var(--color-text-muted);
  max-width: 520px;
  margin-bottom: 2rem;
}
.hero-actions {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 2.5rem;
  flex-wrap: wrap;
}
.hero-stats {
  display: flex;
  gap: 2rem;
}
.hero-stats > div { display: flex; flex-direction: column; }
.hero-stats strong {
  font-family: var(--font-display);
  font-size: 1.5rem;
  color: var(--color-text);
}
.hero-stats span {
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.hero-visual {
  position: relative;
  min-height: 420px;
}
.float-card {
  position: absolute;
  background: white;
  padding: 1.25rem;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  min-width: 180px;
  animation: float 6s ease-in-out infinite;
}
.float-card .visual-icon { display: flex; justify-content: center; margin: 0.25rem 0; }
.float-card strong { font-family: var(--font-display); color: var(--color-primary); font-size: 1.1rem; }
.card-1 { top: 0; right: 20%; animation-delay: 0s; }
.card-2 { top: 30%; left: 0; animation-delay: 2s; }
.card-3 { bottom: 0; right: 5%; animation-delay: 4s; }

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12px); }
}
@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.4); opacity: 0.5; }
}

/* KATEGORI */
.cat-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 0.75rem;
}
.cat-card {
  background: white;
  padding: 1.5rem 1rem;
  border-radius: var(--radius-lg);
  text-align: center;
  border: 2px solid var(--color-border);
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}
.cat-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 4px;
  background: var(--cat-color);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s ease;
}
.cat-card:hover {
  transform: translateY(-4px);
  border-color: var(--cat-color);
  box-shadow: var(--shadow-md);
}
.cat-card:hover::before { transform: scaleX(1); }
.cat-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 0.5rem;
}
.cat-name {
  font-weight: 600;
  font-size: 0.85rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 2rem;
}

/* TRUST */
.trust { background: var(--color-surface); }
.trust-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
}
.trust-item {
  text-align: center;
  padding: 1.5rem 1rem;
}
.trust-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 0.75rem;
  color: var(--color-primary);
}
.trust-item h4 {
  font-size: 1.05rem;
  margin-bottom: 0.4rem;
}
.trust-item p {
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

@media (max-width: 900px) {
  .hero-inner { grid-template-columns: 1fr; gap: 2rem; }
  .hero-visual { min-height: 320px; }
  .cat-grid { grid-template-columns: repeat(3, 1fr); }
  .trust-grid { grid-template-columns: repeat(2, 1fr); }
  .section-header { flex-direction: column; align-items: flex-start; gap: 1rem; }
}
@media (max-width: 500px) {
  .cat-grid { grid-template-columns: repeat(2, 1fr); }
  .hero-stats { gap: 1.25rem; }
}
</style>
