<script setup>
import { ref, onMounted, computed } from 'vue'
import { RouterLink } from 'vue-router'
import api from '@/services/api'

const loading = ref(true)
const stats = ref(null)

const statusLabels = {
  pending_payment: { label: 'Belum Bayar', color: 'warning' },
  paid: { label: 'Dibayar', color: 'info' },
  processing: { label: 'Diproses', color: 'info' },
  shipped: { label: 'Dikirim', color: 'primary' },
  delivered: { label: 'Selesai', color: 'success' },
  cancelled: { label: 'Dibatalkan', color: 'muted' },
  expired: { label: 'Kedaluwarsa', color: 'muted' },
  failed: { label: 'Gagal', color: 'danger' },
}

function formatPrice(num) {
  return new Intl.NumberFormat('id-ID').format(num || 0)
}

function formatDate(d) {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}

// Hitung growth percentage
const monthGrowth = computed(() => {
  if (!stats.value) return 0
  const { thisMonth, lastMonth } = stats.value.revenue
  if (lastMonth === 0) return thisMonth > 0 ? 100 : 0
  return Math.round(((thisMonth - lastMonth) / lastMonth) * 100)
})

// Data untuk chart (sales 7 hari)
const chartData = computed(() => {
  if (!stats.value?.salesChart) return []

  // Bangun 7 hari terakhir
  const days = []
  const today = new Date()
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().split('T')[0]
    const existing = stats.value.salesChart.find((s) => s._id === key)
    days.push({
      date: d,
      revenue: existing?.revenue || 0,
      orders: existing?.orders || 0,
    })
  }
  return days
})

const maxRevenue = computed(() => {
  const max = Math.max(...chartData.value.map((d) => d.revenue))
  return max > 0 ? max : 1
})

async function fetchStats() {
  loading.value = true
  try {
    const { data } = await api.get('/orders/admin/dashboard')
    stats.value = data.data
  } catch (err) {
    window.$toast?.('Gagal memuat statistik', 'error')
  } finally {
    loading.value = false
  }
}

onMounted(fetchStats)
</script>

<template>
  <div class="dashboard">
    <div class="page-header">
      <div>
        <h1>Dashboard</h1>
        <p>Ringkasan performa toko kamu</p>
      </div>
      <button class="btn-refresh" @click="fetchStats" :disabled="loading">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
          <path d="M21 3v5h-5"/>
          <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
          <path d="M3 21v-5h5"/>
        </svg>
        Refresh
      </button>
    </div>

    <template v-if="loading">
      <div class="stats-grid">
        <div v-for="i in 4" :key="i" class="stat-skeleton"></div>
      </div>
    </template>

    <template v-else-if="stats">
      <!-- Stat Cards -->
      <div class="stats-grid">
        <div class="stat-card stat-card-primary">
          <div class="stat-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" x2="12" y1="2" y2="22"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <div class="stat-label">Pendapatan Bulan Ini</div>
          <div class="stat-value">Rp {{ formatPrice(stats.revenue.thisMonth) }}</div>
          <div class="stat-meta" :class="monthGrowth >= 0 ? 'positive' : 'negative'">
            <span>{{ monthGrowth >= 0 ? '▲' : '▼' }} {{ Math.abs(monthGrowth) }}%</span>
            <span class="stat-meta-detail">vs bulan lalu</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon stat-icon-success">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
              <rect width="20" height="14" x="2" y="7" rx="2"/>
            </svg>
          </div>
          <div class="stat-label">Total Pendapatan</div>
          <div class="stat-value">Rp {{ formatPrice(stats.revenue.allTime) }}</div>
          <div class="stat-meta">
            <span class="stat-meta-detail">Sepanjang masa</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon stat-icon-purple">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
              <line x1="3" x2="21" y1="6" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
          </div>
          <div class="stat-label">Total Pesanan</div>
          <div class="stat-value">{{ stats.counts.totalOrders }}</div>
          <div class="stat-meta">
            <span class="badge-mini badge-warning">{{ stats.counts.pendingPayment }} pending</span>
            <span class="badge-mini badge-info">{{ stats.counts.processing }} diproses</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon stat-icon-orange">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
              <line x1="12" x2="12" y1="22.08" y2="12"/>
            </svg>
          </div>
          <div class="stat-label">Total Produk</div>
          <div class="stat-value">{{ stats.counts.totalProducts }}</div>
          <div class="stat-meta">
            <span class="badge-mini badge-success">{{ stats.counts.activeProducts }} aktif</span>
            <span v-if="stats.counts.lowStockProducts > 0" class="badge-mini badge-warning">
              {{ stats.counts.lowStockProducts }} stok menipis
            </span>
          </div>
        </div>
      </div>

      <!-- Chart + Top Products -->
      <div class="content-grid">
        <div class="card chart-card">
          <div class="card-header">
            <div>
              <h2>Penjualan 7 Hari Terakhir</h2>
              <p class="card-subtitle">Total order yang sudah dibayar</p>
            </div>
          </div>
          <div class="chart-container">
            <div class="chart-bars">
              <div
                v-for="(day, idx) in chartData"
                :key="idx"
                class="chart-bar-wrapper"
              >
                <div class="chart-bar-value">
                  {{ day.revenue > 0 ? `Rp ${formatPrice(day.revenue / 1000)}k` : '-' }}
                </div>
                <div class="chart-bar-track">
                  <div
                    class="chart-bar-fill"
                    :style="{ height: `${(day.revenue / maxRevenue) * 100}%` }"
                  ></div>
                </div>
                <div class="chart-bar-label">{{ formatDate(day.date) }}</div>
                <div class="chart-bar-orders">{{ day.orders }} order</div>
              </div>
            </div>
          </div>
        </div>

        <div class="card top-products-card">
          <div class="card-header">
            <div>
              <h2>Produk Terlaris</h2>
              <p class="card-subtitle">Top 5 berdasarkan penjualan</p>
            </div>
          </div>
          <div class="top-list">
            <div
              v-for="(p, idx) in stats.topProducts"
              :key="p._id"
              class="top-item"
            >
              <div class="top-rank">#{{ idx + 1 }}</div>
              <img :src="p.mainImage" :alt="p.name" class="top-image" />
              <div class="top-info">
                <div class="top-name">{{ p.name }}</div>
                <div class="top-meta">
                  Rp {{ formatPrice(p.price) }}
                  <span class="dot">·</span>
                  <span class="top-sold">{{ p.soldCount }} terjual</span>
                </div>
              </div>
            </div>
            <div v-if="stats.topProducts.length === 0" class="empty-mini">
              Belum ada produk terjual
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Orders -->
      <div class="card">
        <div class="card-header">
          <div>
            <h2>Pesanan Terbaru</h2>
            <p class="card-subtitle">10 transaksi terakhir</p>
          </div>
          <RouterLink to="/admin/orders" class="card-link">Lihat semua →</RouterLink>
        </div>

        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>No. Pesanan</th>
                <th>Customer</th>
                <th>Tanggal</th>
                <th class="text-right">Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in stats.recentOrders" :key="order._id">
                <td>
                  <RouterLink :to="`/orders/${order.orderNumber}`" class="order-link">
                    {{ order.orderNumber }}
                  </RouterLink>
                </td>
                <td>
                  <div class="cust-name">{{ order.user?.name || 'Customer' }}</div>
                  <div class="cust-email">{{ order.user?.email }}</div>
                </td>
                <td class="text-muted">{{ formatDate(order.createdAt) }}</td>
                <td class="text-right font-bold">Rp {{ formatPrice(order.grandTotal) }}</td>
                <td>
                  <span
                    class="status-pill"
                    :class="`pill-${statusLabels[order.status]?.color || 'muted'}`"
                  >
                    {{ statusLabels[order.status]?.label || order.status }}
                  </span>
                </td>
              </tr>
              <tr v-if="stats.recentOrders.length === 0">
                <td colspan="5" class="empty-row">Belum ada pesanan</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.page-header h1 {
  font-family: 'Sora', sans-serif;
  font-size: 1.75rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 0.2rem;
}

.page-header p {
  color: #64748b;
  font-size: 0.95rem;
}

.btn-refresh {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.55rem 1rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #475569;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-refresh:hover {
  border-color: #0066ff;
  color: #0066ff;
}

.btn-refresh:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.stat-skeleton {
  height: 130px;
  background: #e2e8f0;
  border-radius: 12px;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.stat-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.25rem;
  position: relative;
}

.stat-card-primary {
  background: linear-gradient(135deg, #0066ff 0%, #003d99 100%);
  color: white;
  border-color: transparent;
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: #eff6ff;
  color: #0066ff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.85rem;
}

.stat-card-primary .stat-icon {
  background: rgba(255, 214, 10, 0.2);
  color: #ffd60a;
}

.stat-icon-success { background: #ecfdf5; color: #047857; }
.stat-icon-purple { background: #f5f3ff; color: #7c3aed; }
.stat-icon-orange { background: #fff7ed; color: #ea580c; }

.stat-label {
  font-size: 0.8rem;
  color: #64748b;
  margin-bottom: 0.3rem;
  font-weight: 500;
}

.stat-card-primary .stat-label {
  color: rgba(255, 255, 255, 0.85);
}

.stat-value {
  font-family: 'Sora', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 0.5rem;
  line-height: 1.2;
}

.stat-card-primary .stat-value {
  color: white;
}

.stat-meta {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
  font-size: 0.75rem;
  color: #64748b;
}

.stat-card-primary .stat-meta {
  color: rgba(255, 255, 255, 0.8);
}

.stat-meta.positive {
  color: #059669;
}

.stat-meta.negative {
  color: #dc2626;
}

.stat-card-primary .stat-meta.positive,
.stat-card-primary .stat-meta.negative {
  color: #ffd60a;
}

.stat-meta-detail {
  font-weight: 400;
  color: inherit;
  opacity: 0.7;
}

.badge-mini {
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 600;
}

.badge-success { background: #ecfdf5; color: #047857; }
.badge-info { background: #eff6ff; color: #1d4ed8; }
.badge-warning { background: #fff7ed; color: #c2410c; }

/* Content Grid */
.content-grid {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 1rem;
}

.card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.card-header h2 {
  font-family: 'Sora', sans-serif;
  font-size: 1.05rem;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 0.2rem;
}

.card-subtitle {
  font-size: 0.8rem;
  color: #64748b;
}

.card-link {
  color: #0066ff;
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 600;
}

.card-link:hover {
  text-decoration: underline;
}

/* Chart */
.chart-container {
  height: 240px;
}

.chart-bars {
  display: flex;
  gap: 0.5rem;
  height: 100%;
  align-items: flex-end;
}

.chart-bar-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  position: relative;
}

.chart-bar-value {
  font-size: 0.7rem;
  color: #475569;
  font-weight: 600;
  margin-bottom: 0.3rem;
  height: 1.2rem;
}

.chart-bar-track {
  flex: 1;
  width: 100%;
  background: #f1f5f9;
  border-radius: 8px 8px 0 0;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
  min-height: 4px;
}

.chart-bar-fill {
  width: 100%;
  background: linear-gradient(180deg, #0066ff 0%, #6366f1 100%);
  border-radius: 6px 6px 0 0;
  transition: height 0.6s ease;
  min-height: 4px;
}

.chart-bar-label {
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 0.5rem;
  font-weight: 500;
}

.chart-bar-orders {
  font-size: 0.65rem;
  color: #94a3b8;
}

/* Top products */
.top-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.top-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem;
  border-radius: 8px;
  background: #f8fafc;
}

.top-rank {
  font-family: 'Sora', sans-serif;
  font-size: 0.85rem;
  font-weight: 700;
  color: #64748b;
  width: 24px;
}

.top-image {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  object-fit: cover;
  border: 1px solid #e2e8f0;
}

.top-info {
  flex: 1;
  min-width: 0;
}

.top-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 0.1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.top-meta {
  font-size: 0.75rem;
  color: #64748b;
}

.dot {
  margin: 0 0.3rem;
}

.top-sold {
  color: #047857;
  font-weight: 600;
}

.empty-mini,
.empty-row {
  text-align: center;
  padding: 2rem;
  color: #94a3b8;
  font-size: 0.9rem;
}

/* Table */
.table-wrapper {
  overflow-x: auto;
  margin: 0 -0.5rem;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.data-table th {
  text-align: left;
  padding: 0.65rem 0.5rem;
  color: #64748b;
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-bottom: 1px solid #e2e8f0;
}

.data-table td {
  padding: 0.85rem 0.5rem;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.data-table tr:last-child td {
  border-bottom: 0;
}

.order-link {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.82rem;
  color: #0066ff;
  text-decoration: none;
  font-weight: 600;
}

.order-link:hover {
  text-decoration: underline;
}

.cust-name {
  font-weight: 500;
  color: #0f172a;
}

.cust-email {
  font-size: 0.75rem;
  color: #64748b;
}

.text-right { text-align: right; }
.text-muted { color: #64748b; font-size: 0.85rem; }
.font-bold { font-weight: 600; color: #0066ff; font-family: 'Sora', sans-serif; }

.status-pill {
  padding: 0.25rem 0.65rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  white-space: nowrap;
}

.pill-warning { background: #fff7ed; color: #c2410c; }
.pill-info { background: #eff6ff; color: #1d4ed8; }
.pill-primary { background: #ede9fe; color: #6d28d9; }
.pill-success { background: #ecfdf5; color: #047857; }
.pill-danger { background: #fef2f2; color: #b91c1c; }
.pill-muted { background: #f1f5f9; color: #64748b; }

@media (max-width: 1200px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .content-grid { grid-template-columns: 1fr; }
}

@media (max-width: 640px) {
  .stats-grid { grid-template-columns: 1fr; }
  .stat-card { padding: 1rem; }
  .stat-value { font-size: 1.25rem; }
  .chart-container { height: 180px; }
  .chart-bar-value { font-size: 0.6rem; }
  .chart-bar-label { font-size: 0.65rem; }
}
</style>
