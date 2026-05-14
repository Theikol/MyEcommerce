<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const form = ref({
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: ''
})
const loading = ref(false)
const error = ref('')

async function handleSubmit() {
  error.value = ''

  if (form.value.password !== form.value.confirmPassword) {
    error.value = 'Konfirmasi password tidak cocok'
    return
  }

  if (form.value.password.length < 6) {
    error.value = 'Password minimal 6 karakter'
    return
  }

  loading.value = true
  try {
    await auth.register({
      name: form.value.name,
      email: form.value.email,
      phone: form.value.phone,
      password: form.value.password
    })
    window.$toast?.('Pendaftaran berhasil. Selamat datang!', 'success')
    router.push('/')
  } catch (err) {
    error.value = err.response?.data?.message || 'Gagal mendaftar. Coba lagi.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <div class="auth-logo">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="10" fill="var(--color-primary)"/>
              <path d="M12 14h10c4 0 7 2.5 7 6s-3 6-7 6H12V14z" fill="white"/>
              <circle cx="28" cy="20" r="3" fill="var(--color-accent)"/>
            </svg>
          </div>
          <h1>Buat akun baru</h1>
          <p>Gabung ke Dchal Store, gratis selamanya</p>
        </div>

        <form @submit.prevent="handleSubmit" class="auth-form">
          <div v-if="error" class="auth-error">
            {{ error }}
          </div>

          <div class="form-group">
            <label class="form-label">Nama Lengkap</label>
            <input
              v-model="form.name"
              type="text"
              required
              class="form-input"
              placeholder="Nama lengkap kamu"
              autocomplete="name"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Email</label>
            <input
              v-model="form.email"
              type="email"
              required
              class="form-input"
              placeholder="kamu@email.com"
              autocomplete="email"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Nomor HP</label>
            <input
              v-model="form.phone"
              type="tel"
              required
              class="form-input"
              placeholder="08xxxxxxxxxx"
              autocomplete="tel"
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Password</label>
              <input
                v-model="form.password"
                type="password"
                required
                minlength="6"
                class="form-input"
                placeholder="Min. 6 karakter"
                autocomplete="new-password"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Konfirmasi</label>
              <input
                v-model="form.confirmPassword"
                type="password"
                required
                class="form-input"
                placeholder="Ulangi password"
                autocomplete="new-password"
              />
            </div>
          </div>

          <button
            type="submit"
            class="btn btn-primary btn-block btn-lg"
            :disabled="loading"
          >
            {{ loading ? 'Memproses...' : 'Daftar Sekarang' }}
          </button>

          <p class="auth-switch">
            Sudah punya akun?
            <RouterLink to="/login">Masuk di sini</RouterLink>
          </p>
        </form>
      </div>

      <div class="auth-side">
        <div class="auth-side-content">
          <h2>Belanja makin praktis</h2>
          <ul>
            <li>✓ Checkout super cepat</li>
            <li>✓ Simpan alamat pengiriman</li>
            <li>✓ Lacak pesanan real-time</li>
            <li>✓ Notifikasi promo eksklusif</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: calc(100vh - 200px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  background: linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%);
}

.auth-container {
  width: 100%;
  max-width: 1000px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  background: white;
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-xl);
}

.auth-card {
  padding: 2.5rem;
}

.auth-header {
  margin-bottom: 2rem;
}

.auth-logo {
  margin-bottom: 1.25rem;
}

.auth-header h1 {
  font-family: 'Sora', sans-serif;
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.auth-header p {
  color: var(--color-text-muted);
  font-size: 0.95rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.auth-error {
  background: #fef2f2;
  color: #991b1b;
  padding: 0.75rem 1rem;
  border-radius: var(--radius);
  font-size: 0.9rem;
  border-left: 3px solid #dc2626;
}

.auth-switch {
  text-align: center;
  color: var(--color-text-muted);
  font-size: 0.95rem;
  margin-top: 0.5rem;
}

.auth-switch a {
  color: var(--color-primary);
  font-weight: 600;
  text-decoration: none;
}

.auth-switch a:hover {
  text-decoration: underline;
}

.auth-side {
  background: linear-gradient(135deg, var(--color-primary) 0%, #003d99 100%);
  color: white;
  padding: 3rem 2.5rem;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.auth-side::before {
  content: '';
  position: absolute;
  bottom: -50%;
  left: -30%;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, var(--color-accent) 0%, transparent 70%);
  opacity: 0.2;
  border-radius: 50%;
}

.auth-side-content {
  position: relative;
  z-index: 1;
}

.auth-side-content h2 {
  font-family: 'Sora', sans-serif;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
}

.auth-side-content ul {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.auth-side-content li {
  font-size: 1rem;
  opacity: 0.95;
}

@media (max-width: 768px) {
  .auth-container {
    grid-template-columns: 1fr;
  }

  .auth-side {
    display: none;
  }

  .auth-card {
    padding: 2rem 1.5rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
