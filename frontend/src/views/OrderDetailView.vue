<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Clock, Check, Package, Truck, CheckCircle2, X, Timer, AlertTriangle, CreditCard, Copy } from 'lucide-vue-next'
import api from '@/services/api'

const route = useRoute()
const router = useRouter()

const order = ref(null)
const loading = ref(true)
const tracking = ref(null)
const trackingLoading = ref(false)

const statusConfig = {
  pending_payment: { label: 'Menunggu Pembayaran', color: 'warning', icon: Clock },
  paid: { label: 'Dibayar', color: 'info', icon: Check },
  processing: { label: 'Sedang Disiapkan', color: 'info', icon: Package },
  shipped: { label: 'Dikirim', color: 'primary', icon: Truck },
  delivered: { label: 'Selesai', color: 'success', icon: CheckCircle2 },
  cancelled: { label: 'Dibatalkan', color: 'muted', icon: X },
  expired: { label: 'Kedaluwarsa', color: 'muted', icon: Timer },
  failed: { label: 'Gagal', color: 'danger', icon: AlertTriangle }
}

const currentStatus = computed(() => {
  if (!order.value) return null
  return statusConfig[order.value.status] || { label: order.value.status, color: 'muted', icon: null }
})

const steps = computed(() => {
  if (!order.value) return []
  const flow = ['pending_payment', 'paid', 'processing', 'shipped', 'delivered']
  const currentIdx = flow.indexOf(order.value.status)
  return flow.map((s, idx) => ({
    key: s,
    label: statusConfig[s].label,
    icon: statusConfig[s].icon,
    completed: idx <= currentIdx && currentIdx >= 0,
    active: idx === currentIdx
  }))
})

const isTerminated = computed(() => {
  return order.value && ['cancelled', 'expired', 'failed'].includes(order.value.status)
})

function formatPrice(num) {
  return new Intl.NumberFormat('id-ID').format(num || 0)
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

async function fetchOrder() {
  loading.value = true
  try {
    const { data } = await api.get(`/orders/${route.params.orderNumber}`)
    order.value = data
    if (data.status === 'shipped' && data.shipping.biteshipOrderId) {
      fetchTracking()
    }
  } catch (err) {
    window.$toast?.('Pesanan tidak ditemukan', 'error')
    router.push('/orders')
  } finally {
    loading.value = false
  }
}

async function fetchTracking() {
  if (!order.value?.shipping?.biteshipOrderId) return
  trackingLoading.value = true
  try {
    const { data } = await api.get(`/shipping/track/${order.value.shipping.biteshipOrderId}`)
    tracking.value = data
  } catch (err) {
    // tracking failure shouldn't break the page
  } finally {
    trackingLoading.value = false
  }
}

function retryPayment() {
  if (!order.value?.payment?.snapToken) {
    window.$toast?.('Token pembayaran tidak tersedia', 'error')
    return
  }

  if (window.snap) {
    window.snap.pay(order.value.payment.snapToken, {
      onSuccess: () => {
        window.$toast?.('Pembayaran berhasil!', 'success')
        setTimeout(fetchOrder, 2000)
      },
      onPending: () => {
        window.$toast?.('Pembayaran sedang diproses', 'info')
      },
      onError: () => {
        window.$toast?.('Pembayaran gagal', 'error')
      },
      onClose: () => {
        // user closed popup
      }
    })
  } else if (order.value.payment.snapRedirectUrl) {
    window.open(order.value.payment.snapRedirectUrl, '_blank')
  }
}

function copyTracking() {
  if (!order.value?.shipping?.waybillId) return
  navigator.clipboard.writeText(order.value.shipping.waybillId)
  window.$toast?.('Nomor resi disalin', 'success')
}

onMounted(fetchOrder)
</script>

<template>
  <div class="order-detail-page">
    <div class="container">
      <div v-if="loading" class="loading-state">
        <div class="skeleton skeleton-block"></div>
      </div>

      <template v-else-if="order">
        <div class="page-back">
          <RouterLink to="/orders" class="back-link">
             Kembali ke daftar pesanan
          </RouterLink>
        </div>

        <div class="order-header-card">
          <div class="header-top">
            <div>
              <div class="header-label">NOMOR PESANAN</div>
              <h1 class="order-number">{{ order.orderNumber }}</h1>
              <div class="header-date">Dipesan pada {{ formatDate(order.createdAt) }}</div>
            </div>
            <span
              class="status-pill"
              :class="`pill-${currentStatus.color}`"
            >
              <span class="pill-icon"><component :is="currentStatus.icon" :size="16" /></span>
              {{ currentStatus.label }}
            </span>
          </div>

          <div v-if="!isTerminated" class="progress-tracker">
            <div
              v-for="(step, idx) in steps"
              :key="step.key"
              class="progress-step"
              :class="{ completed: step.completed, active: step.active }"
            >
              <div class="step-dot">
                <Check v-if="step.completed" :size="16" />
                <span v-else>{{ idx + 1 }}</span>
              </div>
              <div class="step-label">{{ step.label }}</div>
            </div>
          </div>
        </div>

        <div v-if="order.status === 'pending_payment'" class="payment-cta">
          <div class="cta-info">
            <div class="cta-icon"><CreditCard :size="40" /></div>
            <div>
              <h3>Selesaikan pembayaran kamu</h3>
              <p>Pesanan akan otomatis dibatalkan jika tidak dibayar dalam 24 jam.</p>
            </div>
          </div>
          <button @click="retryPayment" class="btn btn-primary btn-lg">
            Bayar Sekarang
          </button>
        </div>

        <div class="detail-grid">
          <div class="detail-main">
            <section class="detail-section">
              <h2>Produk Dipesan</h2>
              <div class="items-list">
                <div v-for="(item, idx) in order.items" :key="idx" class="order-item">
                  <img :src="item.image" :alt="item.name" class="item-image" />
                  <div class="item-info">
                    <div class="item-name">{{ item.name }}</div>
                    <div class="item-meta">
                      Rp {{ formatPrice(item.price) }} × {{ item.quantity }}
                    </div>
                  </div>
                  <div class="item-total">
                    Rp {{ formatPrice(item.price * item.quantity) }}
                  </div>
                </div>
              </div>
            </section>

            <section class="detail-section">
              <h2>Alamat Pengiriman</h2>
              <div class="address-block">
                <div class="address-name">
                  {{ order.shippingAddress.recipientName }}
                  <span class="address-phone">· {{ order.shippingAddress.phone }}</span>
                </div>
                <div class="address-line">{{ order.shippingAddress.fullAddress }}</div>
                <div class="address-region">
                  {{ order.shippingAddress.subDistrict }},
                  {{ order.shippingAddress.district }},
                  {{ order.shippingAddress.city }},
                  {{ order.shippingAddress.province }}
                  {{ order.shippingAddress.postalCode }}
                </div>
                <div v-if="order.shippingAddress.note" class="address-note">
                  Catatan: {{ order.shippingAddress.note }}
                </div>
              </div>
            </section>

            <section class="detail-section">
              <h2>Pengiriman</h2>
              <div class="shipping-block">
                <div class="shipping-row">
                  <span>Kurir</span>
                  <strong>{{ order.shipping.courier }} · {{ order.shipping.courierService }}</strong>
                </div>
                <div class="shipping-row">
                  <span>Estimasi</span>
                  <strong>{{ order.shipping.etd || '2-3 hari kerja' }}</strong>
                </div>
                <div v-if="order.shipping.waybillId" class="shipping-row">
                  <span>Nomor Resi</span>
                  <button @click="copyTracking" class="waybill-btn">
                    {{ order.shipping.waybillId }}
                    <Copy :size="14" />
                  </button>
                </div>
              </div>

              <div v-if="tracking?.history?.length" class="tracking-history">
                <h3>Riwayat Pengiriman</h3>
                <div class="timeline">
                  <div
                    v-for="(event, idx) in tracking.history"
                    :key="idx"
                    class="timeline-item"
                  >
                    <div class="timeline-dot"></div>
                    <div class="timeline-content">
                      <div class="timeline-status">{{ event.note }}</div>
                      <div class="timeline-time">{{ formatDate(event.updated_at) }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <aside class="detail-sidebar">
            <section class="detail-section summary-card">
              <h2>Ringkasan Pembayaran</h2>
              <div class="summary-row">
                <span>Subtotal Produk</span>
                <span>Rp {{ formatPrice(order.itemsPrice) }}</span>
              </div>
              <div class="summary-row">
                <span>Ongkos Kirim</span>
                <span>Rp {{ formatPrice(order.shippingPrice) }}</span>
              </div>
              <div class="summary-divider"></div>
              <div class="summary-row summary-total">
                <span>Total</span>
                <span>Rp {{ formatPrice(order.totalPrice) }}</span>
              </div>

              <div class="payment-info">
                <div class="payment-method">
                  <span class="method-label">Metode</span>
                  <span>Midtrans Snap</span>
                </div>
                <div v-if="order.payment.paidAt" class="payment-method">
                  <span class="method-label">Dibayar</span>
                  <span>{{ formatDate(order.payment.paidAt) }}</span>
                </div>
              </div>
            </section>

            <section v-if="order.status === 'shipped'" class="detail-section info-card">
              <div class="info-icon"><Package :size="40" /></div>
              <h3>Pesanan sedang dikirim</h3>
              <p>Pantau lokasi paket via aplikasi kurir menggunakan nomor resi.</p>
            </section>
          </aside>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.order-detail-page {
  padding: 2rem 0 4rem;
}

.loading-state {
  padding: 2rem 0;
}

.skeleton-block {
  height: 400px;
  border-radius: var(--radius-lg);
}

.page-back {
  margin-bottom: 1.5rem;
}

.back-link {
  color: var(--color-text-muted);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
}

.back-link:hover {
  color: var(--color-primary);
}

.order-header-card {
  background: white;
  border-radius: var(--radius-xl);
  padding: 2rem;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--color-border);
  margin-bottom: 1.5rem;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 2rem;
}

.header-label {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
  margin-bottom: 0.25rem;
}

.order-number {
  font-family: 'JetBrains Mono', monospace;
  font-size: 1.4rem;
  font-weight: 700;
  margin-bottom: 0.4rem;
}

.header-date {
  font-size: 0.9rem;
  color: var(--color-text-muted);
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.25rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
  white-space: nowrap;
}

.pill-icon {
  font-size: 1rem;
}

.pill-warning { background: #fff7ed; color: #c2410c; }
.pill-info { background: #eff6ff; color: #1d4ed8; }
.pill-primary { background: #ede9fe; color: #6d28d9; }
.pill-success { background: #ecfdf5; color: #047857; }
.pill-danger { background: #fef2f2; color: #b91c1c; }
.pill-muted { background: #f1f5f9; color: #64748b; }

.progress-tracker {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  position: relative;
  padding: 0 0.5rem;
}

.progress-tracker::before {
  content: '';
  position: absolute;
  top: 18px;
  left: 10%;
  right: 10%;
  height: 2px;
  background: var(--color-border);
  z-index: 0;
}

.progress-step {
  text-align: center;
  position: relative;
  z-index: 1;
}

.step-dot {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: white;
  border: 2px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 0.5rem;
  font-weight: 600;
  font-size: 0.85rem;
  color: var(--color-text-muted);
  transition: all 0.3s;
}

.progress-step.completed .step-dot {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.progress-step.active .step-dot {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
  box-shadow: 0 0 0 6px rgba(0, 102, 255, 0.15);
  transform: scale(1.1);
}

.step-label {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  font-weight: 500;
}

.progress-step.completed .step-label,
.progress-step.active .step-label {
  color: var(--color-text);
  font-weight: 600;
}

.payment-cta {
  background: linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%);
  border: 1px solid #fdba74;
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.cta-info {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.cta-icon {
  display: flex;
  color: #c2410c;
}

.cta-info h3 {
  font-family: 'Sora', sans-serif;
  font-size: 1.1rem;
  margin-bottom: 0.25rem;
  color: #7c2d12;
}

.cta-info p {
  font-size: 0.9rem;
  color: #9a3412;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 1.5rem;
}

.detail-main {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.detail-section {
  background: white;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
}

.detail-section h2 {
  font-family: 'Sora', sans-serif;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--color-border);
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.order-item {
  display: grid;
  grid-template-columns: 64px 1fr auto;
  gap: 1rem;
  align-items: center;
}

.item-image {
  width: 64px;
  height: 64px;
  border-radius: var(--radius);
  object-fit: cover;
  border: 1px solid var(--color-border);
}

.item-name {
  font-weight: 600;
  margin-bottom: 0.25rem;
  font-size: 0.95rem;
}

.item-meta {
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.item-total {
  font-weight: 600;
  color: var(--color-primary);
  font-family: 'Sora', sans-serif;
}

.address-block,
.shipping-block {
  font-size: 0.95rem;
  line-height: 1.6;
}

.address-name {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.address-phone {
  color: var(--color-text-muted);
  font-weight: 400;
}

.address-line,
.address-region {
  color: var(--color-text-muted);
}

.address-note {
  margin-top: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: #f8fafc;
  border-radius: var(--radius);
  font-size: 0.85rem;
  color: var(--color-text-muted);
  border-left: 3px solid var(--color-accent);
}

.shipping-row {
  display: flex;
  justify-content: space-between;
  padding: 0.6rem 0;
  border-bottom: 1px dashed var(--color-border);
  font-size: 0.95rem;
}

.shipping-row:last-child {
  border-bottom: 0;
}

.shipping-row span:first-child {
  color: var(--color-text-muted);
}

.waybill-btn {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 0.35rem 0.75rem;
  border-radius: var(--radius);
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.85rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  transition: all 0.2s;
}

.waybill-btn:hover {
  background: #0052cc;
}

.tracking-history {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-border);
}

.tracking-history h3 {
  font-family: 'Sora', sans-serif;
  font-size: 0.95rem;
  margin-bottom: 1rem;
}

.timeline {
  position: relative;
  padding-left: 1.25rem;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 4px;
  top: 0.5rem;
  bottom: 0.5rem;
  width: 2px;
  background: var(--color-border);
}

.timeline-item {
  position: relative;
  padding-bottom: 1rem;
}

.timeline-dot {
  position: absolute;
  left: -1.25rem;
  top: 0.4rem;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--color-primary);
  border: 2px solid white;
  box-shadow: 0 0 0 2px var(--color-primary);
}

.timeline-status {
  font-size: 0.9rem;
  font-weight: 500;
}

.timeline-time {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  margin-top: 0.15rem;
}

.summary-card {
  position: sticky;
  top: 100px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  font-size: 0.95rem;
}

.summary-row span:first-child {
  color: var(--color-text-muted);
}

.summary-divider {
  height: 1px;
  background: var(--color-border);
  margin: 0.75rem 0;
}

.summary-total {
  font-size: 1.1rem;
  font-weight: 700;
  font-family: 'Sora', sans-serif;
}

.summary-total span:first-child {
  color: var(--color-text);
}

.summary-total span:last-child {
  color: var(--color-primary);
}

.payment-info {
  margin-top: 1.25rem;
  padding-top: 1rem;
  border-top: 1px dashed var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.payment-method {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
}

.method-label {
  color: var(--color-text-muted);
}

.info-card {
  text-align: center;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-color: #93c5fd;
}

.info-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 0.5rem;
  color: #1d4ed8;
}

.info-card h3 {
  font-family: 'Sora', sans-serif;
  font-size: 1rem;
  margin-bottom: 0.4rem;
  color: #1e40af;
}

.info-card p {
  font-size: 0.85rem;
  color: #1e3a8a;
}

@media (max-width: 900px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }

  .summary-card {
    position: static;
  }
}

@media (max-width: 640px) {
  .header-top {
    flex-direction: column;
  }

  .progress-tracker {
    grid-template-columns: repeat(5, 1fr);
  }

  .step-label {
    font-size: 0.65rem;
  }

  .payment-cta {
    flex-direction: column;
    align-items: stretch;
    text-align: center;
  }

  .cta-info {
    flex-direction: column;
    text-align: center;
  }
}
</style>
