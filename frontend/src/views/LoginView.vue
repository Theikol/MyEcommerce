<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const form = ref({ email: '', password: '' })
const loading = ref(false)
const error = ref('')

async function handleSubmit() {
  error.value = ''
  loading.value = true
  try {
    const user = await auth.login(form.value.email, form.value.password)
    window.$toast?.('Login berhasil. Selamat datang kembali!', 'success')
    // Redirect: admin -> /admin, lainnya -> redirect query atau home
    if (user?.role === 'admin') {
      router.push('/admin')
    } else {
      const redirect = route.query.redirect || '/'
      router.push(redirect)
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Email atau password salah'
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
          <h1>Masuk ke Dchal Store</h1>
          <p>Belanja gadget & aksesoris lebih cepat dengan akun kamu</p>
        </div>

        <form @submit.prevent="handleSubmit" class="auth-form">
          <div v-if="error" class="auth-error">
            {{ error }}
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
            <label class="form-label">Password</label>
            <input
              v-model="form.password"
              type="password"
              required
              class="form-input"
              placeholder="••••••••"
              autocomplete="current-password"
            />
          </div>

          <button
            type="submit"
            class="btn btn-primary btn-block btn-lg"
            :disabled="loading"
          >
            {{ loading ? 'Memproses...' : 'Masuk' }}
          </button>

          <div class="auth-divider">
            <span>atau</span>
          </div>

          <p class="auth-switch">
            Belum punya akun?
            <RouterLink to="/register">Daftar sekarang</RouterLink>
          </p>
        </form>

       <!-- <div class="auth-demo">
          <p class="auth-demo-title">Akun demo (untuk testing)</p>
          <div class="auth-demo-creds">
            <div><strong>Customer:</strong> customer@example.com / customer123</div>
            <div><strong>Admin:</strong> admin@dchalstore.com / admin123</div>
          </div>
        </div> -->
      </div>

      <div class="auth-side">
        <div class="auth-side-content">
          <h2>Belanja elektronik tanpa ribet</h2>
          <ul>
            <li>✓ Produk original 100%</li>
            <li>✓ Pembayaran aman via Midtrans</li>
            <li>✓ Pengiriman cepat ke seluruh Indonesia</li>
            <li>✓ Garansi penggantian 7 hari</li>
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
  padding: 3rem 2.5rem;
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
  color: var(--color-text);
}

.auth-header p {
  color: var(--color-text-muted);
  font-size: 0.95rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.auth-error {
  background: #fef2f2;
  color: #991b1b;
  padding: 0.75rem 1rem;
  border-radius: var(--radius);
  font-size: 0.9rem;
  border-left: 3px solid #dc2626;
}

.auth-divider {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: var(--color-text-muted);
  font-size: 0.85rem;
  margin: 0.5rem 0;
}

.auth-divider::before,
.auth-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--color-border);
}

.auth-switch {
  text-align: center;
  color: var(--color-text-muted);
  font-size: 0.95rem;
}

.auth-switch a {
  color: var(--color-primary);
  font-weight: 600;
  text-decoration: none;
}

.auth-switch a:hover {
  text-decoration: underline;
}

.auth-demo {
  margin-top: 1.5rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: var(--radius);
  border: 1px dashed var(--color-border);
}

.auth-demo-title {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-text-muted);
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.auth-demo-creds {
  font-size: 0.85rem;
  color: var(--color-text);
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-family: 'JetBrains Mono', monospace;
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
  top: -50%;
  right: -30%;
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
  line-height: 1.2;
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
}
</style>
