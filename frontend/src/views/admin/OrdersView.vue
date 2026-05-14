<script setup>
import { ref, onMounted, computed } from 'vue'
import { RouterLink } from 'vue-router'
import api from '@/services/api'
import { Notebook } from 'lucide-vue-next'

const orders = ref([])
const loading = ref(true)
const filterStatus = ref('all')
const search = ref('')

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

const filters = [
  { value: 'all', label: 'Semua' },
  { value: 'pending_payment', label: 'Belum Bayar' },
  { value: 'paid', label: 'Dibayar' },
  { value: 'processing', label: 'Diproses' },
  { value: 'shipped', label: 'Dikirim' },
  { value: 'delivered', label: 'Selesai' },
]

const updateTarget = ref(null)
const updatingStatus = ref('')
const updating = ref(false)

const filteredOrders = computed(() => {
  let result = orders.value
  if (filterStatus.value !== 'all') {
    result = result.filter((o) => o.status === filterStatus.value)
  }
  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    result = result.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.user?.name?.toLowerCase().includes(q) ||
        o.user?.email?.toLowerCase().includes(q)
    )
  }
  return result
})

const statusCounts = computed(() => {
  const counts = { all: orders.value.length }
  filters.forEach((f) => {
    if (f.value !== 'all') {
      counts[f.value] = orders.value.filter((o) => o.status === f.value).length
    }
  })
  return counts
})

function formatPrice(num) {
  return new Intl.NumberFormat('id-ID').format(num || 0)
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

async function fetchOrders() {
  loading.value = true
  try {
    const { data } = await api.get('/orders/admin/all')
    orders.value = data.data
  } catch (err) {
    window.$toast?.('Gagal memuat pesanan', 'error')
  } finally {
    loading.value = false
  }
}

function openStatusModal(order) {
  updateTarget.value = order
  updatingStatus.value = order.status
}

async function saveStatus() {
  if (!updateTarget.value) return
  updating.value = true
  try {
    await api.put(`/orders/admin/${updateTarget.value._id}/status`, {
      status: updatingStatus.value,
    })
    window.$toast?.('Status berhasil diperbarui', 'success')
    updateTarget.value = null
    fetchOrders()
  } catch (err) {
    window.$toast?.(err.response?.data?.message || 'Gagal update status', 'error')
  } finally {
    updating.value = false
  }
}

onMounted(fetchOrders)
</script>

<template>
  <div class="orders-admin">
    <div class="page-header">
      <div>
        <h1>Kelola Pesanan</h1>
        <p>Pantau dan update status semua pesanan</p>
      </div>
    </div>

    <!-- Filter pills -->
    <div class="filters-row">
      <div class="filter-pills">
        <button
          v-for="filter in filters"
          :key="filter.value"
          class="filter-pill"
          :class="{ active: filterStatus === filter.value }"
          @click="filterStatus = filter.value"
        >
          {{ filter.label }}
          <span class="pill-count">{{ statusCounts[filter.value] || 0 }}</span>
        </button>
      </div>

      <div class="search-box">
        <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.3-4.3"/>
        </svg>
        <input
          v-model="search"
          type="text"
          placeholder="Cari nomor order, nama, atau email..."
          class="search-input"
        />
      </div>
    </div>

    <!-- Table -->
    <div class="card">
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>No. Pesanan</th>
              <th>Customer</th>
              <th>Kurir</th>
              <th class="text-right">Total</th>
              <th>Tanggal</th>
              <th class="text-center">Status</th>
              <th class="text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="7" class="loading-cell">
                <div class="spinner"></div>
                Memuat pesanan...
              </td>
            </tr>
            <tr v-else-if="filteredOrders.length === 0">
              <td colspan="7" class="empty-cell">
                <div class="empty-icon">
  <Notebook :size="60" />
</div>
                <div>Tidak ada pesanan</div>
              </td>
            </tr>
            <tr v-for="order in filteredOrders" v-else :key="order._id">
              <td>
                <RouterLink :to="`/orders/${order.orderNumber}`" class="order-link">
                  {{ order.orderNumber }}
                </RouterLink>
                <div class="order-items">{{ order.items.length }} produk</div>
              </td>
              <td>
                <div class="cust-name">{{ order.user?.name || 'Customer' }}</div>
                <div class="cust-email">{{ order.user?.email }}</div>
              </td>
              <td>
                <div class="courier-name">{{ order.shipping.courier }}</div>
                <div class="courier-svc">{{ order.shipping.courierService }}</div>
                <div v-if="order.shipping.waybillId" class="waybill">
                  Resi: {{ order.shipping.waybillId }}
                </div>
              </td>
              <td class="text-right font-bold">Rp {{ formatPrice(order.grandTotal) }}</td>
              <td class="text-muted text-sm">{{ formatDate(order.createdAt) }}</td>
              <td class="text-center">
                <span
                  class="status-pill"
                  :class="`pill-${statusLabels[order.status]?.color || 'muted'}`"
                >
                  {{ statusLabels[order.status]?.label || order.status }}
                </span>
              </td>
              <td class="text-right">
                <div class="action-buttons">
                  <button
                    class="btn-action"
                    @click="openStatusModal(order)"
                    title="Update status"
                  >
                    Update
                  </button>
                  <RouterLink
                    :to="`/orders/${order.orderNumber}`"
                    class="btn-icon"
                    title="Lihat detail"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  </RouterLink>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Update Status Modal -->
    <div v-if="updateTarget" class="modal-overlay" @click.self="updateTarget = null">
      <div class="modal">
        <h3>Update Status Pesanan</h3>
        <div class="modal-info">
          <div class="order-mono">{{ updateTarget.orderNumber }}</div>
          <div class="order-cust">{{ updateTarget.user?.name }}</div>
        </div>

        <div class="form-group">
          <label class="form-label">Status Baru</label>
          <select v-model="updatingStatus" class="form-input">
            <option value="pending_payment">Belum Bayar</option>
            <option value="paid">Dibayar</option>
            <option value="processing">Diproses</option>
            <option value="shipped">Dikirim</option>
            <option value="delivered">Selesai</option>
            <option value="cancelled">Dibatalkan</option>
          </select>
        </div>

        <div class="modal-actions">
          <button
            class="btn-secondary"
            @click="updateTarget = null"
            :disabled="updating"
          >
            Batal
          </button>
          <button
            class="btn-primary"
            @click="saveStatus"
            :disabled="updating"
          >
            {{ updating ? 'Menyimpan...' : 'Simpan' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.orders-admin {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
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

/* Filter pills */
.filters-row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-pills {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-pill {
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  color: #475569;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  transition: all 0.15s;
}

.filter-pill:hover {
  border-color: #0066ff;
  color: #0066ff;
}

.filter-pill.active {
  background: #0066ff;
  border-color: #0066ff;
  color: white;
}

.pill-count {
  background: rgba(255, 255, 255, 0.25);
  color: inherit;
  padding: 0.05rem 0.45rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 700;
}

.filter-pill:not(.active) .pill-count {
  background: #f1f5f9;
  color: #64748b;
}

.search-box {
  position: relative;
  min-width: 280px;
}

.search-icon {
  position: absolute;
  left: 0.85rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}

.search-input {
  width: 100%;
  padding: 0.55rem 1rem 0.55rem 2.4rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.85rem;
}

.search-input:focus {
  outline: none;
  border-color: #0066ff;
}

/* Card & Table */
.card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
}

.table-wrapper {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.data-table th {
  text-align: left;
  padding: 0.85rem 1rem;
  color: #64748b;
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  white-space: nowrap;
}

.data-table td {
  padding: 0.85rem 1rem;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: top;
}

.data-table tbody tr:last-child td {
  border-bottom: 0;
}

.data-table tbody tr:hover {
  background: #f8fafc;
}

.loading-cell,
.empty-cell {
  text-align: center;
  padding: 4rem 1rem;
  color: #94a3b8;
}

.empty-icon {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.spinner {
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 2px solid #e2e8f0;
  border-top-color: #0066ff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-right: 0.5rem;
  vertical-align: middle;
}

@keyframes spin {
  to { transform: rotate(360deg); }
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

.order-items {
  font-size: 0.75rem;
  color: #94a3b8;
  margin-top: 0.15rem;
}

.cust-name {
  font-weight: 600;
  color: #0f172a;
  font-size: 0.88rem;
}

.cust-email {
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 0.15rem;
}

.courier-name {
  font-weight: 600;
  font-size: 0.85rem;
  color: #0f172a;
}

.courier-svc {
  font-size: 0.75rem;
  color: #64748b;
}

.waybill {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.7rem;
  color: #0066ff;
  margin-top: 0.15rem;
}

.text-right { text-align: right; }
.text-center { text-align: center; }
.text-muted { color: #64748b; }
.text-sm { font-size: 0.8rem; white-space: nowrap; }
.font-bold {
  font-weight: 600;
  color: #0066ff;
  font-family: 'Sora', sans-serif;
}

.status-pill {
  display: inline-block;
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

.action-buttons {
  display: flex;
  gap: 0.4rem;
  justify-content: flex-end;
}

.btn-action {
  padding: 0.4rem 0.85rem;
  background: #f1f5f9;
  color: #475569;
  border: none;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-action:hover {
  background: #0066ff;
  color: white;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #f1f5f9;
  color: #475569;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  transition: all 0.15s;
}

.btn-icon:hover {
  background: #0066ff;
  color: white;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 1rem;
}

.modal {
  background: white;
  border-radius: 14px;
  padding: 2rem;
  max-width: 420px;
  width: 100%;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.modal h3 {
  font-family: 'Sora', sans-serif;
  font-size: 1.15rem;
  margin-bottom: 1rem;
}

.modal-info {
  padding: 0.85rem;
  background: #f8fafc;
  border-radius: 8px;
  margin-bottom: 1.25rem;
}

.order-mono {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 0.2rem;
}

.order-cust {
  font-size: 0.85rem;
  color: #64748b;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: #334155;
  margin-bottom: 0.4rem;
}

.form-input {
  width: 100%;
  padding: 0.65rem 0.9rem;
  background: white;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.9rem;
}

.form-input:focus {
  outline: none;
  border-color: #0066ff;
  box-shadow: 0 0 0 3px rgba(0, 102, 255, 0.1);
}

.modal-actions {
  display: flex;
  gap: 0.6rem;
  justify-content: flex-end;
}

.btn-primary,
.btn-secondary {
  padding: 0.6rem 1.4rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.15s;
}

.btn-primary {
  background: #0066ff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #0052cc;
}

.btn-secondary {
  background: #f1f5f9;
  color: #475569;
}

.btn-secondary:hover:not(:disabled) {
  background: #e2e8f0;
}

.btn-primary:disabled,
.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .filters-row {
    flex-direction: column;
  }

  .search-box {
    min-width: 0;
  }
}
</style>
