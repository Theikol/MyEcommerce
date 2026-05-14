<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { Upload, ImageOff, Star, Trash2 } from 'lucide-vue-next'
import api from '@/services/api'

const route = useRoute()
const router = useRouter()

const isEdit = computed(() => !!route.params.id)

const loading = ref(false)
const saving = ref(false)

const categories = [
  'CPU', 'RAM', 'Motherboard', 'Power Supply','Kabel', 'Casing HP', 'Earphone', 'Charger', 'Powerbank', 'Aksesoris Lainnya'
]

const form = ref({
  name: '',
  description: '',
  price: 0,
  discountPrice: 0,
  category: 'Kabel',
  brand: '',
  stock: 0,
  weight: 100,
  dimensions: { length: 0, width: 0, height: 0 },
  mainImage: '',
  images: [],
  specifications: [],
  isActive: true,
  isFeatured: false,
})

const fileInput = ref(null)
const isDragging = ref(false)
const uploading = ref(false)
const uploadDone = ref(0)
const uploadCount = ref(0)

const newSpecKey = ref('')
const newSpecValue = ref('')
const errors = ref({})

const finalPrice = computed(() => {
  return form.value.discountPrice > 0 ? form.value.discountPrice : form.value.price
})

const discountPercent = computed(() => {
  if (form.value.discountPrice > 0 && form.value.price > 0) {
    return Math.round(((form.value.price - form.value.discountPrice) / form.value.price) * 100)
  }
  return 0
})

async function loadProduct() {
  if (!isEdit.value) return
  loading.value = true
  try {
    const { data } = await api.get(`/products/admin/${route.params.id}`)
    form.value = {
      ...data.data,
      dimensions: data.data.dimensions || { length: 0, width: 0, height: 0 },
      images: data.data.images || [],
      specifications: data.data.specifications || [],
    }
  } catch (err) {
    window.$toast?.('Produk tidak ditemukan', 'error')
    router.push('/admin/products')
  } finally {
    loading.value = false
  }
}

async function uploadFiles(fileList) {
  const files = Array.from(fileList).filter(f => f.type.startsWith('image/'))
  if (!files.length) return

  uploading.value = true
  uploadCount.value = files.length
  uploadDone.value = 0

  for (const file of files) {
    const fd = new FormData()
    fd.append('image', file)
    try {
      const { data } = await api.post('/upload/image', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      form.value.images.push(data.url)
      if (!form.value.mainImage) form.value.mainImage = data.url
    } catch (e) {
      window.$toast?.(`Gagal upload: ${file.name}`, 'error')
    }
    uploadDone.value++
  }

  uploading.value = false
  if (fileInput.value) fileInput.value.value = ''
}

function onFileChange(e) { uploadFiles(e.target.files) }

function onDrop(e) {
  isDragging.value = false
  uploadFiles(e.dataTransfer.files)
}

function removeImage(idx) {
  const removed = form.value.images.splice(idx, 1)[0]
  if (form.value.mainImage === removed) {
    form.value.mainImage = form.value.images[0] || ''
  }
}

function setAsMain(url) {
  form.value.mainImage = url
}

function addSpec() {
  if (!newSpecKey.value.trim() || !newSpecValue.value.trim()) return
  form.value.specifications.push({
    key: newSpecKey.value.trim(),
    value: newSpecValue.value.trim(),
  })
  newSpecKey.value = ''
  newSpecValue.value = ''
}

function removeSpec(idx) {
  form.value.specifications.splice(idx, 1)
}

function validate() {
  errors.value = {}
  if (!form.value.name.trim()) errors.value.name = 'Nama produk wajib diisi'
  if (!form.value.description.trim()) errors.value.description = 'Deskripsi wajib diisi'
  if (form.value.price <= 0) errors.value.price = 'Harga harus lebih dari 0'
  if (form.value.discountPrice > 0 && form.value.discountPrice >= form.value.price) {
    errors.value.discountPrice = 'Harga diskon harus lebih kecil dari harga normal'
  }
  if (form.value.stock < 0) errors.value.stock = 'Stok tidak boleh negatif'
  if (form.value.weight <= 0) errors.value.weight = 'Berat harus lebih dari 0'
  if (!form.value.mainImage) errors.value.mainImage = 'Foto utama wajib diisi'
  return Object.keys(errors.value).length === 0
}

async function handleSubmit() {
  if (!validate()) {
    window.$toast?.('Periksa kembali form yang error', 'error')
    return
  }

  saving.value = true
  try {
    // Pastikan images array berisi mainImage juga
    const payload = { ...form.value }
    if (payload.mainImage && !payload.images.includes(payload.mainImage)) {
      payload.images = [payload.mainImage, ...payload.images]
    }

    if (isEdit.value) {
      await api.put(`/products/${route.params.id}`, payload)
      window.$toast?.('Produk berhasil diupdate', 'success')
    } else {
      await api.post('/products', payload)
      window.$toast?.('Produk berhasil ditambahkan', 'success')
    }
    router.push('/admin/products')
  } catch (err) {
    window.$toast?.(
      err.response?.data?.message || 'Gagal menyimpan produk',
      'error'
    )
  } finally {
    saving.value = false
  }
}

onMounted(loadProduct)
</script>

<template>
  <div class="product-form-page">
    <div class="page-header">
      <div>
        <RouterLink to="/admin/products" class="back-link">
           Kembali ke daftar produk
        </RouterLink>
        <h1>{{ isEdit ? 'Edit Produk' : 'Tambah Produk Baru' }}</h1>
        <p>{{ isEdit ? 'Update informasi produk' : 'Isi detail produk yang akan dijual' }}</p>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner-lg"></div>
      <p>Memuat data produk...</p>
    </div>

    <form v-else @submit.prevent="handleSubmit" class="form-grid">
      <div class="form-main">
        <!-- Informasi Dasar -->
        <div class="card">
          <h2 class="card-title">Informasi Dasar</h2>

          <div class="form-group">
            <label class="form-label">Nama Produk <span class="required">*</span></label>
            <input
              v-model="form.name"
              type="text"
              class="form-input"
              :class="{ 'has-error': errors.name }"
              placeholder="Contoh: Kabel USB Type-C Fast Charging 3A"
            />
            <span v-if="errors.name" class="error-text">{{ errors.name }}</span>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Kategori <span class="required">*</span></label>
              <select v-model="form.category" class="form-input">
                <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Brand</label>
              <input
                v-model="form.brand"
                type="text"
                class="form-input"
                placeholder="Contoh: Anker, UGREEN, Generic"
              />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Deskripsi <span class="required">*</span></label>
            <textarea
              v-model="form.description"
              class="form-input form-textarea"
              :class="{ 'has-error': errors.description }"
              rows="5"
              placeholder="Jelaskan keunggulan, fitur, dan spesifikasi singkat produk..."
            ></textarea>
            <span v-if="errors.description" class="error-text">{{ errors.description }}</span>
          </div>
        </div>

        <!-- Harga & Stok -->
        <div class="card">
          <h2 class="card-title">Harga & Stok</h2>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Harga Normal <span class="required">*</span></label>
              <div class="input-prefix">
                <span class="prefix">Rp</span>
                <input
                  v-model.number="form.price"
                  type="number"
                  min="0"
                  class="form-input"
                  :class="{ 'has-error': errors.price }"
                  placeholder="0"
                />
              </div>
              <span v-if="errors.price" class="error-text">{{ errors.price }}</span>
            </div>

            <div class="form-group">
              <label class="form-label">
                Harga Diskon
                <span v-if="discountPercent > 0" class="hint-badge">-{{ discountPercent }}%</span>
              </label>
              <div class="input-prefix">
                <span class="prefix">Rp</span>
                <input
                  v-model.number="form.discountPrice"
                  type="number"
                  min="0"
                  class="form-input"
                  :class="{ 'has-error': errors.discountPrice }"
                  placeholder="Kosongkan jika tidak ada diskon"
                />
              </div>
              <span v-if="errors.discountPrice" class="error-text">{{ errors.discountPrice }}</span>
              <span v-else class="hint-text">Kosongkan / 0 jika tidak ada diskon</span>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Stok <span class="required">*</span></label>
              <input
                v-model.number="form.stock"
                type="number"
                min="0"
                class="form-input"
                :class="{ 'has-error': errors.stock }"
                placeholder="0"
              />
              <span v-if="errors.stock" class="error-text">{{ errors.stock }}</span>
            </div>

            <div class="form-group">
              <label class="form-label">Berat (gram) <span class="required">*</span></label>
              <input
                v-model.number="form.weight"
                type="number"
                min="1"
                class="form-input"
                :class="{ 'has-error': errors.weight }"
                placeholder="100"
              />
              <span v-if="errors.weight" class="error-text">{{ errors.weight }}</span>
              <span v-else class="hint-text">Untuk perhitungan ongkir</span>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Dimensi Paket (cm) - opsional</label>
            <div class="dimensions-row">
              <input
                v-model.number="form.dimensions.length"
                type="number"
                min="0"
                class="form-input"
                placeholder="Panjang"
              />
              <span class="dim-x">×</span>
              <input
                v-model.number="form.dimensions.width"
                type="number"
                min="0"
                class="form-input"
                placeholder="Lebar"
              />
              <span class="dim-x">×</span>
              <input
                v-model.number="form.dimensions.height"
                type="number"
                min="0"
                class="form-input"
                placeholder="Tinggi"
              />
            </div>
          </div>
        </div>

        <!-- Foto Produk -->
        <div class="card">
          <h2 class="card-title">Foto Produk</h2>
          <p class="card-subtitle">
            Pilih foto dari komputer. Bisa multi-pilih. Foto pertama dijadikan gambar utama.
          </p>

          <!-- Upload Zone -->
          <div
            class="upload-zone"
            :class="{ 'is-dragging': isDragging, 'is-uploading': uploading }"
            @click="!uploading && fileInput.click()"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="onDrop"
          >
            <input
              ref="fileInput"
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/gif"
              class="upload-hidden"
              @change="onFileChange"
            />
            <div v-if="uploading" class="upload-state">
              <div class="upload-spinner"></div>
              <p>Mengunggah {{ uploadDone }}/{{ uploadCount }} foto...</p>
            </div>
            <div v-else class="upload-state">
              <Upload :size="32" class="upload-icon" />
              <p><strong>Klik atau seret foto ke sini</strong></p>
              <small>JPG, PNG, WebP · Maks 5MB per file</small>
            </div>
          </div>

          <!-- Preview Grid -->
          <div v-if="form.images.length > 0" class="image-grid">
            <div
              v-for="(img, idx) in form.images"
              :key="idx"
              class="image-item"
              :class="{ 'is-main': img === form.mainImage }"
            >
              <img :src="img" :alt="`Foto ${idx + 1}`" />
              <div class="image-overlay">
                <button
                  v-if="img !== form.mainImage"
                  type="button"
                  class="image-action"
                  @click="setAsMain(img)"
                  title="Jadikan foto utama"
                >
                  <Star :size="14" />
                </button>
                <span v-else class="image-badge">Utama</span>
                <button
                  type="button"
                  class="image-action image-delete"
                  @click="removeImage(idx)"
                  title="Hapus"
                >
                  <Trash2 :size="14" />
                </button>
              </div>
            </div>
          </div>

          <div v-else class="image-empty">
            <ImageOff :size="32" />
            <p>Belum ada foto ditambahkan</p>
          </div>

          <span v-if="errors.mainImage" class="error-text">{{ errors.mainImage }}</span>
        </div>

        <!-- Spesifikasi -->
        <div class="card">
          <h2 class="card-title">Spesifikasi Teknis</h2>
          <p class="card-subtitle">
            Tambahkan spesifikasi produk seperti panjang kabel, kapasitas, output, dll.
          </p>

          <div class="spec-input-row">
            <input
              v-model="newSpecKey"
              type="text"
              class="form-input"
              placeholder="Nama spek (cth: Panjang)"
            />
            <input
              v-model="newSpecValue"
              type="text"
              class="form-input"
              placeholder="Nilai (cth: 1 meter)"
              @keyup.enter.prevent="addSpec"
            />
            <button type="button" class="btn-add" @click="addSpec">+ Tambah</button>
          </div>

          <div v-if="form.specifications.length > 0" class="spec-list">
            <div v-for="(spec, idx) in form.specifications" :key="idx" class="spec-item">
              <div class="spec-content">
                <strong>{{ spec.key }}:</strong>
                <span>{{ spec.value }}</span>
              </div>
              <button type="button" class="spec-remove" @click="removeSpec(idx)">
                ✕
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <aside class="form-sidebar">
        <div class="card sticky-card">
          <h2 class="card-title">Status & Visibilitas</h2>

          <label class="switch-label">
            <div>
              <strong>Produk Aktif</strong>
              <p class="hint-text">Tampilkan di katalog publik</p>
            </div>
            <input v-model="form.isActive" type="checkbox" class="switch-input" />
            <span class="switch"></span>
          </label>

          <label class="switch-label">
            <div>
              <strong>Produk Unggulan</strong>
              <p class="hint-text">Tampilkan di homepage</p>
            </div>
            <input v-model="form.isFeatured" type="checkbox" class="switch-input" />
            <span class="switch"></span>
          </label>

          <div class="divider"></div>

          <div class="preview-box">
            <div class="preview-label">PREVIEW HARGA</div>
            <div v-if="discountPercent > 0">
              <div class="preview-strike">
                Rp {{ new Intl.NumberFormat('id-ID').format(form.price) }}
              </div>
              <div class="preview-final">
                Rp {{ new Intl.NumberFormat('id-ID').format(finalPrice) }}
              </div>
              <span class="preview-badge">Hemat -{{ discountPercent }}%</span>
            </div>
            <div v-else class="preview-final">
              Rp {{ new Intl.NumberFormat('id-ID').format(form.price || 0) }}
            </div>
          </div>

          <div class="form-actions">
            <button
              type="submit"
              class="btn-primary btn-block"
              :disabled="saving"
            >
              {{ saving ? 'Menyimpan...' : (isEdit ? 'Simpan Perubahan' : 'Tambah Produk') }}
            </button>
            <RouterLink to="/admin/products" class="btn-secondary btn-block">
              Batal
            </RouterLink>
          </div>
        </div>
      </aside>
    </form>
  </div>
</template>

<style scoped>
.product-form-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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

.back-link {
  display: inline-block;
  font-size: 0.85rem;
  color: #64748b;
  text-decoration: none;
  margin-bottom: 0.5rem;
}

.back-link:hover {
  color: #0066ff;
}

.loading-state {
  text-align: center;
  padding: 4rem;
  color: #64748b;
}

.spinner-lg {
  display: inline-block;
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top-color: #0066ff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Layout */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 1.25rem;
  align-items: start;
}

.form-main {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-sidebar {
  position: sticky;
  top: 80px;
}

.card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
}

.card-title {
  font-family: 'Sora', sans-serif;
  font-size: 1.05rem;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 0.4rem;
}

.card-subtitle {
  font-size: 0.85rem;
  color: #64748b;
  margin-bottom: 1.25rem;
}

/* Form */
.form-group {
  margin-bottom: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: #334155;
  margin-bottom: 0.4rem;
}

.required {
  color: #dc2626;
}

.form-input {
  width: 100%;
  padding: 0.65rem 0.9rem;
  background: white;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #0f172a;
  transition: all 0.15s;
}

.form-input:focus {
  outline: none;
  border-color: #0066ff;
  box-shadow: 0 0 0 3px rgba(0, 102, 255, 0.1);
}

.form-input.has-error {
  border-color: #dc2626;
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
}

.error-text {
  display: block;
  margin-top: 0.3rem;
  font-size: 0.8rem;
  color: #dc2626;
}

.hint-text {
  display: block;
  margin-top: 0.3rem;
  font-size: 0.78rem;
  color: #94a3b8;
}

.hint-badge {
  background: #fef2f2;
  color: #dc2626;
  padding: 0.1rem 0.45rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 600;
}

/* Input with prefix */
.input-prefix {
  position: relative;
}

.prefix {
  position: absolute;
  left: 0.85rem;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
  font-size: 0.85rem;
  font-weight: 500;
}

.input-prefix .form-input {
  padding-left: 2.2rem;
}

.dimensions-row {
  display: grid;
  grid-template-columns: 1fr auto 1fr auto 1fr;
  gap: 0.5rem;
  align-items: center;
}

.dim-x {
  color: #94a3b8;
  font-weight: 500;
}

/* Upload Zone */
.upload-zone {
  position: relative;
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  padding: 2rem 1rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: #f8fafc;
  margin-bottom: 1rem;
  user-select: none;
}

.upload-zone:hover,
.upload-zone.is-dragging {
  border-color: #0066ff;
  background: rgba(0, 102, 255, 0.04);
}

.upload-zone.is-uploading {
  cursor: not-allowed;
  opacity: 0.8;
}

.upload-hidden {
  display: none;
}

.upload-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  color: #64748b;
}

.upload-icon {
  color: #0066ff;
  margin-bottom: 0.25rem;
}

.upload-state p {
  font-size: 0.95rem;
  color: #334155;
  margin: 0;
}

.upload-state p strong {
  color: #0066ff;
}

.upload-state small {
  font-size: 0.78rem;
  color: #94a3b8;
}

.upload-spinner {
  width: 28px;
  height: 28px;
  border: 3px solid #e2e8f0;
  border-top-color: #0066ff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 0.5rem;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 0.75rem;
}

.image-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 10px;
  overflow: hidden;
  border: 2px solid #e2e8f0;
}

.image-item.is-main {
  border-color: #0066ff;
  box-shadow: 0 0 0 3px rgba(0, 102, 255, 0.15);
}

.image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.6) 100%);
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 0.4rem;
  opacity: 0;
  transition: opacity 0.2s;
}

.image-item:hover .image-overlay {
  opacity: 1;
}

.image-item.is-main .image-overlay {
  opacity: 1;
}

.image-action {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: white;
  border: none;
  cursor: pointer;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s;
}

.image-action:hover {
  transform: scale(1.1);
}

.image-delete {
  background: #fef2f2;
}

.image-badge {
  background: #0066ff;
  color: white;
  padding: 0.2rem 0.55rem;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 600;
}

.image-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  padding: 1.25rem;
  color: #94a3b8;
  font-size: 0.85rem;
}

/* Spec list */
.spec-input-row {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.spec-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.spec-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.65rem 0.85rem;
  background: #f8fafc;
  border-radius: 8px;
}

.spec-content {
  font-size: 0.9rem;
  color: #334155;
}

.spec-content strong {
  margin-right: 0.5rem;
  color: #0f172a;
}

.spec-remove {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  font-size: 0.85rem;
}

.spec-remove:hover {
  background: #fef2f2;
  color: #dc2626;
}

/* Sidebar */
.sticky-card {
  position: sticky;
  top: 80px;
}

.switch-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.85rem 0;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
}

.switch-label:last-of-type {
  border-bottom: 0;
}

.switch-label strong {
  display: block;
  font-size: 0.9rem;
  color: #0f172a;
  margin-bottom: 0.15rem;
}

.switch-label .hint-text {
  margin: 0;
}

.switch-input {
  display: none;
}

.switch {
  width: 40px;
  height: 22px;
  background: #cbd5e1;
  border-radius: 999px;
  position: relative;
  transition: background 0.2s;
  flex-shrink: 0;
}

.switch::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  background: white;
  border-radius: 50%;
  transition: transform 0.2s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

.switch-input:checked + .switch {
  background: #0066ff;
}

.switch-input:checked + .switch::after {
  transform: translateX(18px);
}

.divider {
  height: 1px;
  background: #e2e8f0;
  margin: 1.25rem 0;
}

.preview-box {
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-radius: 10px;
  padding: 1.1rem;
  margin-bottom: 1.25rem;
}

.preview-label {
  font-size: 0.7rem;
  color: #64748b;
  font-weight: 600;
  letter-spacing: 0.08em;
  margin-bottom: 0.5rem;
}

.preview-strike {
  font-size: 0.85rem;
  color: #94a3b8;
  text-decoration: line-through;
  margin-bottom: 0.2rem;
}

.preview-final {
  font-family: 'Sora', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: #0066ff;
}

.preview-badge {
  display: inline-block;
  background: #fef2f2;
  color: #dc2626;
  padding: 0.2rem 0.55rem;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 600;
  margin-top: 0.4rem;
}

.form-actions {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  text-align: center;
  text-decoration: none;
  display: block;
  transition: all 0.15s;
}

.btn-primary {
  background: #0066ff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #0052cc;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f1f5f9;
  color: #475569;
}

.btn-secondary:hover {
  background: #e2e8f0;
}

.btn-block {
  width: 100%;
}

@media (max-width: 1024px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .sticky-card {
    position: static;
  }
}

@media (max-width: 640px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .dimensions-row {
    grid-template-columns: 1fr;
  }

  .dim-x {
    display: none;
  }

  .spec-input-row {
    grid-template-columns: 1fr;
  }
}
</style>
