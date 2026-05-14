<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../services/api';
import ProductCard from '../components/ProductCard.vue';
import { SearchAlert } from 'lucide-vue-next';
const route = useRoute();
const router = useRouter();

const products = ref([]);
const loading = ref(true);
const total = ref(0);
const currentPage = ref(1);
const totalPages = ref(1);

const filters = ref({
  category: route.query.category || '',
  search: route.query.search || '',
  sort: route.query.sort || '',
  page: Number(route.query.page) || 1,
});

const categories = ['Kabel', 'Casing HP', 'Earphone', 'Charger', 'Powerbank', 'Aksesoris Lainnya'];

async function fetchProducts() {
  loading.value = true;
  try {
    const params = {};
    if (filters.value.category) params.category = filters.value.category;
    if (filters.value.search) params.search = filters.value.search;
    if (filters.value.sort) params.sort = filters.value.sort;
    params.page = filters.value.page;
    params.limit = 12;

    const { data } = await api.get('/products', { params });
    products.value = data.data;
    total.value = data.pagination.total;
    totalPages.value = data.pagination.totalPages;
    currentPage.value = data.pagination.page;
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
}

function applyFilter(key, value) {
  filters.value[key] = value;
  filters.value.page = 1;
  updateRouteQuery();
}

function goToPage(p) {
  filters.value.page = p;
  updateRouteQuery();
}

function updateRouteQuery() {
  const query = {};
  if (filters.value.category) query.category = filters.value.category;
  if (filters.value.search) query.search = filters.value.search;
  if (filters.value.sort) query.sort = filters.value.sort;
  if (filters.value.page > 1) query.page = filters.value.page;
  router.push({ query });
}

watch(() => route.query, (q) => {
  filters.value = {
    category: q.category || '',
    search: q.search || '',
    sort: q.sort || '',
    page: Number(q.page) || 1,
  };
  fetchProducts();
});

onMounted(fetchProducts);
</script>

<template>
  <section class="section">
    <div class="container">
      <div class="page-header">
        <h1 class="section-title">
          {{ filters.category || (filters.search ? `Hasil: "${filters.search}"` : 'Semua Produk') }}
        </h1>
        <p class="section-subtitle">{{ total }} produk ditemukan</p>
      </div>

      <div class="layout">
        <!-- Filter Sidebar -->
        <aside class="sidebar">
          <div class="filter-block">
            <h4>Kategori</h4>
            <button
              class="filter-pill"
              :class="{ active: !filters.category }"
              @click="applyFilter('category', '')"
            >Semua</button>
            <button
              v-for="cat in categories"
              :key="cat"
              class="filter-pill"
              :class="{ active: filters.category === cat }"
              @click="applyFilter('category', cat)"
            >{{ cat }}</button>
          </div>

          <div class="filter-block">
            <h4>Urutkan</h4>
            <select class="form-select" :value="filters.sort" @change="applyFilter('sort', $event.target.value)">
              <option value="">Terbaru</option>
              <option value="price_asc">Harga Terendah</option>
              <option value="price_desc">Harga Tertinggi</option>
              <option value="best_seller">Terlaris</option>
              <option value="rating">Rating Tertinggi</option>
            </select>
          </div>
        </aside>

        <!-- Product Grid -->
        <div class="results">
          <div v-if="loading" class="grid-products">
            <div v-for="n in 8" :key="n" class="skeleton" style="height: 320px;"></div>
          </div>
          <div v-else-if="products.length === 0" class="empty">
            <div class="empty-icon"> <SearchAlert :size="75"/></div>
            <h3>Produk tidak ditemukan</h3>
            <p>Coba ubah kata kunci atau filter</p>
          </div>
          <div v-else class="grid-products fade-in">
            <ProductCard v-for="p in products" :key="p._id" :product="p" />
          </div>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="pagination">
            <button
              class="page-btn"
              :disabled="currentPage === 1"
              @click="goToPage(currentPage - 1)"
            >‹ Sebelumnya</button>
            <span class="page-info">Halaman {{ currentPage }} dari {{ totalPages }}</span>
            <button
              class="page-btn"
              :disabled="currentPage === totalPages"
              @click="goToPage(currentPage + 1)"
            >Selanjutnya ›</button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.page-header { margin-bottom: 2rem; }
.layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 2rem;
}
.sidebar {
  position: sticky;
  top: calc(var(--header-h) + 1rem);
  align-self: start;
  background: white;
  padding: 1.5rem;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
}
.filter-block + .filter-block { margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--color-border); }
.filter-block h4 {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.75rem;
  color: var(--color-text-muted);
}
.filter-pill {
  display: block;
  width: 100%;
  text-align: left;
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-md);
  font-size: 0.9rem;
  color: var(--color-text);
  margin-bottom: 0.25rem;
  transition: all 0.15s;
}
.filter-pill:hover { background: var(--color-surface-2); }
.filter-pill.active {
  background: var(--color-primary);
  color: white;
}

.empty {
  text-align: center;
  padding: 4rem 1rem;
  background: white;
  border-radius: var(--radius-lg);
}
.empty-icon { font-size: 4rem; margin-bottom: 1rem; }
.empty h3 { margin-bottom: 0.5rem; }
.empty p { color: var(--color-text-muted); }

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}
.page-btn {
  padding: 0.6rem 1.2rem;
  border-radius: var(--radius-md);
  border: 2px solid var(--color-border);
  font-weight: 500;
  background: white;
}
.page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.page-btn:hover:not(:disabled) { border-color: var(--color-primary); color: var(--color-primary); }
.page-info { font-size: 0.9rem; color: var(--color-text-muted); }

@media (max-width: 900px) {
  .layout { grid-template-columns: 1fr; }
  .sidebar { position: static; }
}
</style>
