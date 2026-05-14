<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import api from '@/services/api'

const router = useRouter()

const products = ref([])
const stats = ref(null)
const pagination = ref({ page: 1, totalPages: 1, total: 0, limit: 20 })
const loading = ref(true)

// Filters
const search = ref('')
const filterCategory = ref('')
const filterStatus = ref('')
const sortBy = ref('')

const categories = [
  'CPU', 'RAM', 'Motherboard', 'Power Supply','Kabel', 'Casing HP', 'Earphone', 'Charger', 'Powerbank', 'Aksesoris Lainnya'
]

const deleteTarget = ref(null)
const deleting = ref(false)

let searchTimer = null

function formatPrice(num) {
  return new Intl.NumberFormat('id-ID').format(num || 0)
}

function stockStatus(stock) {
  if (stock === 0) return { label: 'Habis', class: 'pill-danger' }
  if (stock <= 5) return { label: `${stock} (menipis)`, class: 'pill-warning' }
  return { label: stock, class: 'pill-success' }
}

async function fetchProducts(page = 1) {
  loading.value = true
  try {
    const params = new URLSearchParams({ page, limit: pagination.value.limit })
    if (search.value) params.append('search', search.value)
    if (filterCategory.value) params.append('category', filterCategory.value)
    if (filterStatus.value) params.append('status', filterStatus.value)
    if (sortBy.value) params.append('sort', sortBy.value)

    const { data } = await api.get(`/products/admin/all?${params}`)
    products.value = data.data
    pagination.value = { ...pagination.value, ...data.pagination }
    stats.value = data.stats
  } catch (err) {
    window.$toast?.('Gagal memuat produk', 'error')
  } finally {
    loading.value = false
  }
}

// Debounced search
watch(search, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => fetchProducts(1), 400)
})

watch([filterCategory, filterStatus, sortBy], () => fetchProducts(1))

function goToPage(p) {
  if (p < 1 || p > pagination.value.totalPages) return
  fetchProducts(p)
}

function confirmDelete(product) {
  deleteTarget.value = product
}

async function executeDelete() {
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    await api.delete(`/products/${deleteTarget.value._id}`)
    window.$toast?.('Produk berhasil dihapus', 'success')
    deleteTarget.value = null
    fetchProducts(pagination.value.page)
  } catch (err) {
    window.$toast?.(err.response?.data?.message || 'Gagal menghapus produk', 'error')
  } finally {
    deleting.value = false
  }
}

async function toggleActive(product) {
  try {
    await api.put(`/products/${product._id}`, { isActive: !product.isActive })
    product.isActive = !product.isActive
    window.$toast?.(
      product.isActive ? 'Produk diaktifkan' : 'Produk dinonaktifkan',
      'success'
    )
  } catch (err) {
    window.$toast?.('Gagal mengubah status produk', 'error')
  }
}

onMounted(() => fetchProducts(1))
</script>

<template>
  <div class="products-admin">
    <div class="page-header">
      <div>
        <h1>Kelola Produk</h1>
        <p>Tambah, edit, dan kelola katalog produk</p>
      </div>
      <RouterLink to="/admin/products/new" class="btn-primary">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" x2="12" y1="5" y2="19"/>
          <line x1="5" x2="19" y1="12" y2="12"/>
        </svg>
        Tambah Produk
      </RouterLink>
    </div>

    <!-- Quick Stats -->
    <div v-if="stats" class="quick-stats">
      <div class="quick-stat">
        <div class="qs-label">Total Produk</div>
        <div class="qs-value">{{ stats.totalProducts }}</div>
      </div>
      <div class="quick-stat">
        <div class="qs-label">Aktif</div>
        <div class="qs-value text-green">{{ stats.activeProducts }}</div>
      </div>
      <div class="quick-stat">
        <div class="qs-label">Stok Menipis</div>
        <div class="qs-value text-orange">{{ stats.lowStock }}</div>
      </div>
      <div class="quick-stat">
        <div class="qs-label">Stok Habis</div>
        <div class="qs-value text-red">{{ stats.outOfStock }}</div>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-bar">
      <div class="search-box">
        <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.3-4.3"/>
        </svg>
        <input
          v-model="search"
          type="text"
          placeholder="Cari produk berdasarkan nama atau brand..."
          class="search-input"
        />
      </div>

      <select v-model="filterCategory" class="filter-select">
        <option value="">Semua Kategori</option>
        <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
      </select>

      <select v-model="filterStatus" class="filter-select">
        <option value="">Semua Status</option>
        <option value="active">Aktif</option>
        <option value="inactive">Nonaktif</option>
      </select>

      <select v-model="sortBy" class="filter-select">
        <option value="">Terbaru</option>
        <option value="name_asc">Nama A-Z</option>
        <option value="stock_asc">Stok Terkecil</option>
        <option value="price_desc">Harga Tertinggi</option>
      </select>
    </div>

    <!-- Table -->
    <div class="card">
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Produk</th>
              <th>Kategori</th>
              <th class="text-right">Harga</th>
              <th class="text-center">Stok</th>
              <th class="text-center">Terjual</th>
              <th class="text-center">Status</th>
              <th class="text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="7" class="loading-cell">
                <div class="spinner"></div>
                Memuat produk...
              </td>
            </tr>
            <tr v-else-if="products.length === 0">
              <td colspan="7" class="empty-cell">
                <div class="empty-icon">📦</div>
                <div>Belum ada produk yang cocok</div>
                <div class="empty-sub">Coba ubah filter atau tambah produk baru</div>
              </td>
            </tr>
            <tr v-for="product in products" v-else :key="product._id">
              <td>
                <div class="product-cell">
                  <img :src="product.mainImage" :alt="product.name" class="product-image" />
                  <div class="product-info">
                    <div class="product-name">{{ product.name }}</div>
                    <div class="product-brand">{{ product.brand }}</div>
                  </div>
                </div>
              </td>
              <td>
                <span class="category-tag">{{ product.category }}</span>
              </td>
              <td class="text-right">
                <div class="price-cell">
                  <div v-if="product.discountPrice > 0" class="price-discount">
                    Rp {{ formatPrice(product.discountPrice) }}
                  </div>
                  <div :class="{ 'price-strike': product.discountPrice > 0 }">
                    Rp {{ formatPrice(product.price) }}
                  </div>
                </div>
              </td>
              <td class="text-center">
                <span class="status-pill" :class="stockStatus(product.stock).class">
                  {{ stockStatus(product.stock).label }}
                </span>
              </td>
              <td class="text-center">{{ product.soldCount || 0 }}</td>
              <td class="text-center">
                <button
                  class="toggle-active"
                  :class="{ active: product.isActive }"
                  @click="toggleActive(product)"
                  :title="product.isActive ? 'Klik untuk nonaktifkan' : 'Klik untuk aktifkan'"
                >
                  <span class="toggle-knob"></span>
                </button>
              </td>
              <td class="text-right">
                <div class="action-buttons">
                  <RouterLink
                    :to="`/admin/products/${product._id}/edit`"
                    class="btn-icon"
                    title="Edit"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                    </svg>
                  </RouterLink>
                  <button
                    class="btn-icon btn-icon-danger"
                    @click="confirmDelete(product)"
                    title="Hapus"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M3 6h18"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.totalPages > 1" class="pagination">
        <div class="pagination-info">
          Menampilkan {{ (pagination.page - 1) * pagination.limit + 1 }} -
          {{ Math.min(pagination.page * pagination.limit, pagination.total) }}
          dari {{ pagination.total }} produk
        </div>
        <div class="pagination-controls">
          <button
            class="page-btn"
            :disabled="pagination.page === 1"
            @click="goToPage(pagination.page - 1)"
          >
            ← Prev
          </button>
          <span class="page-current">
            {{ pagination.page }} / {{ pagination.totalPages }}
          </span>
          <button
            class="page-btn"
            :disabled="pagination.page === pagination.totalPages"
            @click="goToPage(pagination.page + 1)"
          >
            Next →
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Modal -->
    <div v-if="deleteTarget" class="modal-overlay" @click.self="deleteTarget = null">
      <div class="modal">
        <div class="modal-icon">⚠️</div>
        <h3>Hapus Produk?</h3>
        <p>
          Anda akan menghapus <strong>{{ deleteTarget.name }}</strong>.
          Tindakan ini tidak bisa dibatalkan.
        </p>
        <div class="modal-actions">
          <button class="btn-secondary" @click="deleteTarget = null" :disabled="deleting">
            Batal
          </button>
          <button class="btn-danger" @click="executeDelete" :disabled="deleting">
            {{ deleting ? 'Menghapus...' : 'Ya, Hapus' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.products-admin {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
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

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1.25rem;
  background: #0066ff;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-primary:hover {
  background: #0052cc;
  transform: translateY(-1px);
}

.quick-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
}

.quick-stat {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 0.85rem 1rem;
}

.qs-label {
  font-size: 0.75rem;
  color: #64748b;
  margin-bottom: 0.25rem;
}

.qs-value {
  font-family: 'Sora', sans-serif;
  font-size: 1.3rem;
  font-weight: 700;
  color: #0f172a;
}

.text-green { color: #047857; }
.text-orange { color: #c2410c; }
.text-red { color: #b91c1c; }

/* Filters */
.filters-bar {
  display: grid;
  grid-template-columns: 1fr auto auto auto;
  gap: 0.65rem;
}

.search-box {
  position: relative;
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
  padding: 0.65rem 1rem 0.65rem 2.4rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #0f172a;
}

.search-input:focus {
  outline: none;
  border-color: #0066ff;
  box-shadow: 0 0 0 3px rgba(0, 102, 255, 0.1);
}

.filter-select {
  padding: 0.65rem 1rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #0f172a;
  cursor: pointer;
  min-width: 140px;
}

.filter-select:focus {
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
  vertical-align: middle;
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

.empty-sub {
  font-size: 0.85rem;
  margin-top: 0.3rem;
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

/* Product cell */
.product-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 240px;
}

.product-image {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  object-fit: cover;
  border: 1px solid #e2e8f0;
}

.product-name {
  font-weight: 600;
  color: #0f172a;
  font-size: 0.9rem;
  margin-bottom: 0.1rem;
}

.product-brand {
  font-size: 0.75rem;
  color: #64748b;
}

.category-tag {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  background: #f1f5f9;
  border-radius: 6px;
  font-size: 0.75rem;
  color: #475569;
  font-weight: 500;
  white-space: nowrap;
}

.text-right { text-align: right; }
.text-center { text-align: center; }

.price-cell {
  font-family: 'Sora', sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
}

.price-discount {
  color: #dc2626;
}

.price-strike {
  text-decoration: line-through;
  color: #94a3b8;
  font-size: 0.78rem;
  font-weight: 400;
}

.status-pill {
  display: inline-block;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 600;
}

.pill-success { background: #ecfdf5; color: #047857; }
.pill-warning { background: #fff7ed; color: #c2410c; }
.pill-danger { background: #fef2f2; color: #b91c1c; }

/* Toggle */
.toggle-active {
  width: 36px;
  height: 20px;
  background: #cbd5e1;
  border: none;
  border-radius: 999px;
  position: relative;
  cursor: pointer;
  transition: background 0.2s;
}

.toggle-active.active {
  background: #0066ff;
}

.toggle-knob {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  background: white;
  border-radius: 50%;
  transition: transform 0.2s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

.toggle-active.active .toggle-knob {
  transform: translateX(16px);
}

/* Action buttons */
.action-buttons {
  display: flex;
  gap: 0.4rem;
  justify-content: flex-end;
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

.btn-icon-danger:hover {
  background: #ef4444;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
}

.pagination-info {
  font-size: 0.85rem;
  color: #64748b;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.page-btn {
  padding: 0.45rem 0.9rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.85rem;
  color: #475569;
  cursor: pointer;
  transition: all 0.15s;
}

.page-btn:not(:disabled):hover {
  border-color: #0066ff;
  color: #0066ff;
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-current {
  font-size: 0.85rem;
  color: #475569;
  font-weight: 600;
  padding: 0 0.5rem;
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
  text-align: center;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.modal-icon {
  font-size: 3rem;
  margin-bottom: 0.75rem;
}

.modal h3 {
  font-family: 'Sora', sans-serif;
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
}

.modal p {
  color: #64748b;
  font-size: 0.92rem;
  margin-bottom: 1.5rem;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
}

.btn-secondary,
.btn-danger {
  padding: 0.65rem 1.5rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.15s;
}

.btn-secondary {
  background: #f1f5f9;
  color: #475569;
}

.btn-secondary:hover {
  background: #e2e8f0;
}

.btn-danger {
  background: #dc2626;
  color: white;
}

.btn-danger:hover {
  background: #b91c1c;
}

.btn-secondary:disabled,
.btn-danger:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 900px) {
  .quick-stats { grid-template-columns: repeat(2, 1fr); }
  .filters-bar { grid-template-columns: 1fr 1fr; }
}

@media (max-width: 640px) {
  .filters-bar { grid-template-columns: 1fr; }
  .pagination { flex-direction: column; gap: 0.75rem; }
}
</style>
