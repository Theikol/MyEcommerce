<script setup>
import { ref, onMounted, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { Package, Clock, Truck } from 'lucide-vue-next'
import api from '@/services/api'

const orders = ref([])
const loading = ref(true)
const activeFilter = ref('all')

const filters = [
  { value: 'all', label: 'Semua' },
  { value: 'pending_payment', label: 'Belum Bayar' },
  { value: 'paid', label: 'Diproses' },
  { value: 'processing', label: 'Disiapkan' },
  { value: 'shipped', label: 'Dikirim' },
  { value: 'delivered', label: 'Selesai' }
]

const filteredOrders = computed(() => {
  if (activeFilter.value === 'all') return orders.value
  if (activeFilter.value === 'paid') {
    return orders.value.filter(o => o.status === 'paid')
  }
  return orders.value.filter(o => o.status === activeFilter.value)
})

const statusConfig = {
  pending_payment: { label: 'Menunggu Pembayaran', color: 'warning' },
  paid: { label: 'Dibayar', color: 'info' },
  processing: { label: 'Sedang Disiapkan', color: 'info' },
  shipped: { label: 'Dikirim', color: 'primary' },
  delivered: { label: 'Selesai', color: 'success' },
  cancelled: { label: 'Dibatalkan', color: 'muted' },
  expired: { label: 'Kedaluwarsa', color: 'muted' },
  failed: { label: 'Gagal', color: 'danger' }
}

function getStatus(status) {
  return statusConfig[status] || { label: status, color: 'muted' }
}

function formatPrice(num) {
  return new Intl.NumberFormat('id-ID').format(num)
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

async function fetchOrders() {
  loading.value = true
  try {
    const { data } = await api.get('/orders/myorders')
    orders.value = data
  } catch (err) {
    window.$toast?.('Gagal memuat pesanan', 'error')
  } finally {
    loading.value = false
  }
}

onMounted(fetchOrders)
</script>

<template>
  <div class="orders-page">
    <div class="container">
      <div class="orders-header">
        <h1>Pesanan Saya</h1>
        <p>Pantau status pesanan dan pembayaran kamu</p>
      </div>

      <div class="orders-filters">
        <button
          v-for="filter in filters"
          :key="filter.value"
          class="filter-pill"
          :class="{ active: activeFilter === filter.value }"
          @click="activeFilter = filter.value"
        >
          {{ filter.label }}
        </button>
      </div>

      <div v-if="loading" class="orders-loading">
        <div v-for="i in 3" :key="i" class="order-skeleton skeleton"></div>
      </div>

      <div v-else-if="filteredOrders.length === 0" class="orders-empty">
        <div class="empty-icon"><Package :size="64" /></div>
        <h3>Belum ada pesanan</h3>
        <p>Yuk mulai belanja dan temukan gadget impianmu</p>
        <RouterLink to="/products" class="btn btn-primary">
          Belanja Sekarang
        </RouterLink>
      </div>

      <div v-else class="orders-list">
        <RouterLink
          v-for="order in filteredOrders"
          :key="order._id"
          :to="`/orders/${order.orderNumber}`"
          class="order-card"
        >
          <div class="order-card-header">
            <div>
              <div class="order-number">{{ order.orderNumber }}</div>
              <div class="order-date">{{ formatDate(order.createdAt) }}</div>
            </div>
            <span
              class="status-badge"
              :class="`status-${getStatus(order.status).color}`"
            >
              {{ getStatus(order.status).label }}
            </span>
          </div>

          <div class="order-card-body">
            <div class="order-items-preview">
              <div
                v-for="(item, idx) in order.items.slice(0, 3)"
                :key="idx"
                class="item-thumb"
              >
                <img :src="item.image" :alt="item.name" />
              </div>
              <div v-if="order.items.length > 3" class="item-more">
                +{{ order.items.length - 3 }}
              </div>
            </div>

            <div class="order-summary">
              <div class="order-items-text">
                {{ order.items.length }} produk
                <span class="text-muted">·</span>
                {{ order.shipping.courier }}
              </div>
              <div class="order-total">
                Rp {{ formatPrice(order.totalPrice) }}
              </div>
            </div>
          </div>

          <div class="order-card-footer">
            <span class="footer-action">
              Lihat detail →
            </span>
            <span
              v-if="order.status === 'pending_payment'"
              class="footer-warning"
              style="display:inline-flex;align-items:center;gap:0.35rem"
            >
              <Clock :size="14" /> Selesaikan pembayaran
            </span>
            <span
              v-else-if="order.status === 'shipped' && order.shipping.waybillId"
              class="footer-info"
              style="display:inline-flex;align-items:center;gap:0.35rem"
            >
              <Truck :size="14" /> Resi: {{ order.shipping.waybillId }}
            </span>
          </div>
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.orders-page {
  padding: 2rem 0 4rem;
  min-height: 60vh;
}

.orders-header {
  margin-bottom: 2rem;
}

.orders-header h1 {
  font-family: 'Sora', sans-serif;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.orders-header p {
  color: var(--color-text-muted);
}

.orders-filters {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.filter-pill {
  padding: 0.5rem 1.25rem;
  background: white;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  color: var(--color-text-muted);
}

.filter-pill:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.filter-pill.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.orders-loading {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.order-skeleton {
  height: 180px;
  border-radius: var(--radius-lg);
}

.orders-empty {
  text-align: center;
  padding: 4rem 1rem;
  background: white;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
}

.empty-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
  color: var(--color-text-muted);
}

.orders-empty h3 {
  font-family: 'Sora', sans-serif;
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.orders-empty p {
  color: var(--color-text-muted);
  margin-bottom: 1.5rem;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.order-card {
  background: white;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  text-decoration: none;
  color: var(--color-text);
  transition: all 0.2s;
  display: block;
}

.order-card:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.order-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: 1rem;
  border-bottom: 1px dashed var(--color-border);
  margin-bottom: 1rem;
}

.order-number {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 0.25rem;
}

.order-date {
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.status-badge {
  padding: 0.35rem 0.85rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.status-warning {
  background: #fff7ed;
  color: #c2410c;
}

.status-info {
  background: #eff6ff;
  color: #1d4ed8;
}

.status-primary {
  background: #ede9fe;
  color: #6d28d9;
}

.status-success {
  background: #ecfdf5;
  color: #047857;
}

.status-danger {
  background: #fef2f2;
  color: #b91c1c;
}

.status-muted {
  background: #f1f5f9;
  color: #64748b;
}

.order-card-body {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.order-items-preview {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.item-thumb {
  width: 56px;
  height: 56px;
  border-radius: var(--radius);
  overflow: hidden;
  border: 1px solid var(--color-border);
  background: #f8fafc;
}

.item-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-more {
  width: 56px;
  height: 56px;
  border-radius: var(--radius);
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text-muted);
}

.order-summary {
  text-align: right;
}

.order-items-text {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  margin-bottom: 0.25rem;
}

.text-muted {
  margin: 0 0.4rem;
}

.order-total {
  font-family: 'Sora', sans-serif;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--color-primary);
}

.order-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.75rem;
  border-top: 1px solid var(--color-border);
  font-size: 0.85rem;
}

.footer-action {
  color: var(--color-primary);
  font-weight: 600;
}

.footer-warning {
  color: #c2410c;
  font-weight: 500;
}

.footer-info {
  color: var(--color-text-muted);
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.8rem;
}

@media (max-width: 640px) {
  .order-card-body {
    flex-direction: column;
    align-items: flex-start;
  }

  .order-summary {
    text-align: left;
  }

  .order-card-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>
