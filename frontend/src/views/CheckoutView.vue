<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { MapPin, Truck, Clock, AlertTriangle, ClipboardList, CreditCard, Check } from 'lucide-vue-next';
import api from '../services/api';
import { useCartStore } from '../stores/cart';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const cart = useCartStore();
const auth = useAuthStore();

// Step: 1 = alamat, 2 = kurir, 3 = review & bayar
const step = ref(1);

// === Form Alamat ===
const address = reactive({
  recipientName: auth.user?.name || '',
  phone: auth.user?.phone || '',
  fullAddress: '',
  areaId: '',
  areaLabel: '', // display
  province: '',
  city: '',
  district: '',
  postalCode: '',
});

// Biteship area autocomplete
const areaSearch = ref('');
const areaResults = ref([]);
const areaLoading = ref(false);
let searchTimer = null;

watch(areaSearch, (val) => {
  if (searchTimer) clearTimeout(searchTimer);
  if (!val || val.length < 3) {
    areaResults.value = [];
    return;
  }
  searchTimer = setTimeout(async () => {
    areaLoading.value = true;
    try {
      const { data } = await api.get('/shipping/areas', { params: { input: val } });
      areaResults.value = data.data?.areas || [];
    } catch (e) {
      console.error(e);
    } finally {
      areaLoading.value = false;
    }
  }, 400);
});

function selectArea(area) {
  // Biteship area object: { id, name, country_name, administrative_division_level_1_name (provinsi), ...level_2 (kota), ...level_3 (kecamatan), ...level_4 (kelurahan), postal_code }
  address.areaId = area.id;
  address.areaLabel = `${area.administrative_division_level_3_name}, ${area.administrative_division_level_2_name}`;
  address.province = area.administrative_division_level_1_name;
  address.city = area.administrative_division_level_2_name;
  address.district = area.administrative_division_level_3_name;
  address.postalCode = String(area.postal_code || '');
  areaResults.value = [];
  areaSearch.value = `${area.administrative_division_level_4_name || area.administrative_division_level_3_name}, ${area.administrative_division_level_2_name} (${area.postal_code})`;
}

// === Kurir & Ongkir ===
const courierOptions = ref([]);
const selectedCourier = ref(null);
const courierLoading = ref(false);
const courierError = ref('');

async function fetchRates() {
  courierLoading.value = true;
  courierError.value = '';
  courierOptions.value = [];
  try {
    const { data } = await api.post('/shipping/rates', {
      destinationAreaId: address.areaId,
      items: cart.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
    });
    // Biteship response: { pricing: [{ courier_name, courier_service_name, courier_service_code, courier_code, price, duration, ...}] }
    courierOptions.value = data.data?.pricing || [];
    if (courierOptions.value.length === 0) {
      courierError.value = 'Tidak ada kurir tersedia untuk alamat ini';
    }
  } catch (e) {
    courierError.value = e.response?.data?.message || 'Gagal memuat ongkir';
  } finally {
    courierLoading.value = false;
  }
}

// === Total ===
const shippingCost = computed(() => selectedCourier.value?.price || 0);
const grandTotal = computed(() => cart.subtotal + shippingCost.value);

function formatRupiah(n) { return 'Rp ' + Number(n).toLocaleString('id-ID'); }

// === Step actions ===
function nextStep() {
  if (step.value === 1) {
    if (!address.recipientName || !address.phone || !address.fullAddress || !address.areaId) {
      window.$toast?.('Lengkapi semua data alamat', 'error');
      return;
    }
    step.value = 2;
    fetchRates();
  } else if (step.value === 2) {
    if (!selectedCourier.value) {
      window.$toast?.('Pilih kurir dulu', 'error');
      return;
    }
    step.value = 3;
  }
}

function prevStep() { if (step.value > 1) step.value -= 1; }

// === Bayar ===
const payLoading = ref(false);

async function placeOrder() {
  payLoading.value = true;
  try {
    const payload = {
      items: cart.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      shippingAddress: {
        recipientName: address.recipientName,
        phone: address.phone,
        fullAddress: address.fullAddress,
        province: address.province,
        city: address.city,
        district: address.district,
        postalCode: address.postalCode,
        areaId: address.areaId,
      },
      shipping: {
        courier: selectedCourier.value.courier_code,
        courierService: selectedCourier.value.courier_service_code,
        courierName: `${selectedCourier.value.courier_name} - ${selectedCourier.value.courier_service_name}`,
        cost: selectedCourier.value.price,
        etd: selectedCourier.value.duration,
      },
    };

    const { data } = await api.post('/orders', payload);
    const { snapToken, order } = data.data;

    // === Buka Midtrans Snap popup ===
    if (window.snap) {
      window.snap.pay(snapToken, {
        onSuccess: function (result) {
          cart.clear();
          window.$toast?.('Pembayaran berhasil! 🎉');
          router.push(`/orders/${order.orderNumber}`);
        },
        onPending: function (result) {
          cart.clear();
          window.$toast?.('Menunggu pembayaran...');
          router.push(`/orders/${order.orderNumber}`);
        },
        onError: function (result) {
          window.$toast?.('Pembayaran gagal', 'error');
        },
        onClose: function () {
          // Closed without finishing — order tetap ada, status pending_payment
          router.push(`/orders/${order.orderNumber}`);
        },
      });
    } else {
      // Fallback: redirect ke Snap URL
      window.location.href = data.data.snapRedirectUrl;
    }
  } catch (e) {
    window.$toast?.(e.response?.data?.message || 'Gagal membuat pesanan', 'error');
  } finally {
    payLoading.value = false;
  }
}

onMounted(() => {
  if (cart.isEmpty) {
    router.push('/cart');
  }
});
</script>

<template>
  <section class="section">
    <div class="container">
      <!-- Stepper -->
      <div class="stepper">
        <div :class="['step', { active: step >= 1, done: step > 1 }]">
          <span class="num">
            <Check v-if="step > 1" :size="16" />
            <span v-else>1</span>
          </span>
          <span>Alamat</span>
        </div>
        <div class="step-line"></div>
        <div :class="['step', { active: step >= 2, done: step > 2 }]">
          <span class="num">
            <Check v-if="step > 2" :size="16" />
            <span v-else>2</span>
          </span>
          <span>Kurir</span>
        </div>
        <div class="step-line"></div>
        <div :class="['step', { active: step >= 3 }]">
          <span class="num">3</span><span>Bayar</span>
        </div>
      </div>

      <div class="checkout-layout">
        <div class="checkout-main">
          <!-- STEP 1: Alamat -->
          <div v-if="step === 1" class="card-block fade-in">
            <h3 style="display:flex;align-items:center;gap:0.5rem"><MapPin :size="20" /> Alamat Pengiriman</h3>
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">Nama Penerima *</label>
                <input v-model="address.recipientName" class="form-input" placeholder="Nama lengkap" />
              </div>
              <div class="form-group">
                <label class="form-label">No. HP *</label>
                <input v-model="address.phone" class="form-input" placeholder="08123456789" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Area/Kelurahan *</label>
              <div class="area-search">
                <input
                  v-model="areaSearch"
                  class="form-input"
                  placeholder="Ketik nama kelurahan/kecamatan/kota (min 3 huruf)"
                />
                <div v-if="areaLoading" class="area-loading">Mencari...</div>
                <div v-if="areaResults.length > 0" class="area-dropdown">
                  <button
                    v-for="area in areaResults"
                    :key="area.id"
                    @click="selectArea(area)"
                    class="area-option"
                  >
                    <strong>{{ area.administrative_division_level_4_name || area.administrative_division_level_3_name }}</strong>
                    <small>{{ area.administrative_division_level_3_name }}, {{ area.administrative_division_level_2_name }}, {{ area.administrative_division_level_1_name }} · {{ area.postal_code }}</small>
                  </button>
                </div>
              </div>
              <small v-if="address.areaId" class="text-success" style="display:inline-flex;align-items:center;gap:0.25rem"><Check :size="12" /> Area terpilih · Kode pos: {{ address.postalCode }}</small>
            </div>

            <div class="form-group">
              <label class="form-label">Alamat Lengkap *</label>
              <textarea v-model="address.fullAddress" class="form-textarea" rows="3"
                placeholder="Jalan, nomor rumah, RT/RW, patokan..."></textarea>
            </div>

            <button @click="nextStep" class="btn btn-primary btn-block btn-lg">
              Lanjut Pilih Kurir →
            </button>
          </div>

          <!-- STEP 2: Kurir -->
          <div v-if="step === 2" class="card-block fade-in">
            <h3 style="display:flex;align-items:center;gap:0.5rem"><Truck :size="20" /> Pilih Kurir Pengiriman</h3>

            <div v-if="courierLoading" class="state">
              <div class="loader"></div>
              Memuat opsi pengiriman dari Biteship...
            </div>
            <div v-else-if="courierError" class="state error">
              <AlertTriangle :size="28" style="margin-bottom:0.5rem" />
              <div>{{ courierError }}</div>
              <button @click="fetchRates" class="btn btn-outline btn-sm mt-2">Coba Lagi</button>
            </div>
            <div v-else class="courier-list">
              <label
                v-for="(opt, i) in courierOptions"
                :key="i"
                :class="['courier-option', { selected: selectedCourier === opt }]"
              >
                <input type="radio" :value="opt" v-model="selectedCourier" />
                <div class="courier-info">
                  <div class="courier-name">
                    <strong>{{ opt.courier_name }}</strong>
                    <span class="badge badge-muted">{{ opt.courier_service_name }}</span>
                  </div>
                  <div class="courier-meta" style="display:flex;align-items:center;gap:0.25rem"><Clock :size="13" /> {{ opt.duration }}</div>
                </div>
                <div class="courier-price">{{ formatRupiah(opt.price) }}</div>
              </label>
            </div>

            <div class="step-actions">
              <button @click="prevStep" class="btn btn-outline">← Kembali</button>
              <button @click="nextStep" class="btn btn-primary" :disabled="!selectedCourier">
                Lanjut Pembayaran →
              </button>
            </div>
          </div>

          <!-- STEP 3: Review -->
          <div v-if="step === 3" class="card-block fade-in">
            <h3 style="display:flex;align-items:center;gap:0.5rem"><ClipboardList :size="20" /> Review Pesanan</h3>
            <div class="review-block">
              <h4>Penerima</h4>
              <p>{{ address.recipientName }}<br />
                {{ address.phone }}<br />
                {{ address.fullAddress }}<br />
                {{ address.district }}, {{ address.city }}, {{ address.province }} {{ address.postalCode }}
              </p>
            </div>
            <div class="review-block">
              <h4>Pengiriman</h4>
              <p>
                <strong>{{ selectedCourier.courier_name }}</strong> - {{ selectedCourier.courier_service_name }}<br />
                Estimasi: {{ selectedCourier.duration }}
              </p>
            </div>
            <div class="review-block">
              <h4>Barang ({{ cart.totalItems }} item)</h4>
              <div v-for="i in cart.items" :key="i.productId" class="review-item">
                <img :src="i.image" />
                <div style="flex: 1;">
                  <div style="font-weight: 600;">{{ i.name }}</div>
                  <div class="text-muted" style="font-size: 0.85rem;">{{ i.quantity }} × {{ formatRupiah(i.price) }}</div>
                </div>
                <strong>{{ formatRupiah(i.price * i.quantity) }}</strong>
              </div>
            </div>

            <div class="payment-note" style="display:flex;align-items:flex-start;gap:0.5rem">
              <CreditCard :size="18" style="flex-shrink:0;margin-top:0.1rem" />
              <span>Setelah klik <strong>Bayar Sekarang</strong>, akan muncul pop-up Midtrans untuk memilih metode pembayaran (GoPay, QRIS, BCA VA, dll).</span>
            </div>

            <div class="step-actions">
              <button @click="prevStep" class="btn btn-outline" :disabled="payLoading">← Kembali</button>
              <button @click="placeOrder" class="btn btn-primary btn-lg" :disabled="payLoading" style="display:inline-flex;align-items:center;gap:0.5rem">
                <span v-if="payLoading">Memproses...</span>
                <template v-else><CreditCard :size="18" /> Bayar Sekarang</template>
              </button>
            </div>
          </div>
        </div>

        <!-- Summary -->
        <aside class="summary">
          <h3>Ringkasan</h3>
          <div class="summary-items">
            <div v-for="i in cart.items" :key="i.productId" class="summary-item">
              <img :src="i.image" />
              <div style="flex: 1;">
                <div class="sum-name">{{ i.name }}</div>
                <div class="text-muted" style="font-size: 0.8rem;">{{ i.quantity }} × {{ formatRupiah(i.price) }}</div>
              </div>
            </div>
          </div>
          <div class="summary-divider"></div>
          <div class="summary-row">
            <span>Subtotal</span><span>{{ formatRupiah(cart.subtotal) }}</span>
          </div>
          <div class="summary-row">
            <span>Ongkir</span>
            <span v-if="selectedCourier">{{ formatRupiah(shippingCost) }}</span>
            <span v-else class="text-muted">Pilih kurir</span>
          </div>
          <div class="summary-divider"></div>
          <div class="summary-row total">
            <span>Total</span><span>{{ formatRupiah(grandTotal) }}</span>
          </div>
        </aside>
      </div>
    </div>
  </section>
</template>

<style scoped>
.stepper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 2.5rem;
}
.step {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-text-light);
  font-weight: 500;
}
.step .num {
  width: 32px; height: 32px;
  border-radius: 50%;
  background: var(--color-border);
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
}
.step.active { color: var(--color-primary); }
.step.active .num { background: var(--color-primary); color: white; }
.step.done .num { background: var(--color-success); color: white; display: flex; align-items: center; justify-content: center; }
.step-line {
  width: 60px;
  height: 2px;
  background: var(--color-border);
}

.checkout-layout {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 2rem;
}

.card-block {
  background: white;
  padding: 1.75rem;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
}
.card-block h3 { margin-bottom: 1.5rem; }
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.area-search { position: relative; }
.area-dropdown {
  position: absolute;
  top: 100%;
  left: 0; right: 0;
  background: white;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  z-index: 10;
  max-height: 280px;
  overflow-y: auto;
  margin-top: 4px;
}
.area-option {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  padding: 0.6rem 0.85rem;
  text-align: left;
  background: white;
  border-bottom: 1px solid var(--color-border);
  gap: 0.15rem;
}
.area-option:last-child { border-bottom: none; }
.area-option:hover { background: var(--color-surface-2); }
.area-option strong { font-size: 0.9rem; color: var(--color-text); }
.area-option small { font-size: 0.75rem; color: var(--color-text-muted); }
.area-loading {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.state {
  text-align: center;
  padding: 2rem;
  background: var(--color-surface-2);
  border-radius: var(--radius-md);
  color: var(--color-text-muted);
}
.state.error { color: var(--color-danger); background: rgba(239,68,68,0.05); }
.loader {
  display: inline-block;
  width: 32px; height: 32px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 0.75rem;
}
@keyframes spin { to { transform: rotate(360deg); } }

.courier-list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.courier-option {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.15s;
}
.courier-option:hover { border-color: var(--color-primary-light); background: var(--color-surface-2); }
.courier-option.selected { border-color: var(--color-primary); background: rgba(0,102,255,0.04); }
.courier-option input { accent-color: var(--color-primary); }
.courier-info { flex: 1; }
.courier-name {
  display: flex; align-items: center; gap: 0.5rem;
  font-size: 0.95rem;
}
.courier-meta { font-size: 0.8rem; color: var(--color-text-muted); }
.courier-price {
  font-weight: 700;
  font-family: var(--font-display);
  color: var(--color-text);
}

.step-actions {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.review-block { margin-bottom: 1.25rem; padding-bottom: 1.25rem; border-bottom: 1px solid var(--color-border); }
.review-block:last-of-type { border-bottom: none; }
.review-block h4 {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
  margin-bottom: 0.5rem;
}
.review-block p { line-height: 1.6; }
.review-item {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  padding: 0.5rem 0;
}
.review-item img {
  width: 50px; height: 50px;
  border-radius: var(--radius-sm);
  object-fit: cover;
}

.payment-note {
  background: rgba(0,102,255,0.06);
  border-left: 3px solid var(--color-primary);
  padding: 0.85rem 1rem;
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  margin: 1.25rem 0;
}

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
.summary-items {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-bottom: 1rem;
}
.summary-item { display: flex; gap: 0.6rem; align-items: center; }
.summary-item img {
  width: 44px; height: 44px;
  border-radius: var(--radius-sm);
  object-fit: cover;
  background: var(--color-surface-2);
}
.sum-name {
  font-size: 0.85rem;
  font-weight: 500;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.summary-divider {
  height: 1px;
  background: var(--color-border);
  margin: 0.75rem 0;
}
.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.4rem;
  font-size: 0.95rem;
}
.summary-row.total {
  font-weight: 700;
  font-size: 1.15rem;
  color: var(--color-text);
  font-family: var(--font-display);
}

@media (max-width: 900px) {
  .checkout-layout { grid-template-columns: 1fr; }
  .summary { position: static; }
  .form-grid { grid-template-columns: 1fr; }
}
</style>
