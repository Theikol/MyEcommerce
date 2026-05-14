<script setup>
import { ref, computed } from 'vue'
import { useRouter, RouterLink, RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Handshake } from 'lucide-vue-next';
const router = useRouter()
const auth = useAuthStore()
const sidebarOpen = ref(false)

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: 'dashboard', exact: true },
  { to: '/admin/products', label: 'Produk', icon: 'package' },
  { to: '/admin/orders', label: 'Pesanan', icon: 'shopping-bag' },
]

const userInitial = computed(() => {
  return auth.user?.name?.charAt(0)?.toUpperCase() || 'A'
})

function handleLogout() {
  auth.logout()
  window.$toast?.('Berhasil keluar', 'success')
  router.push('/login')
}

function closeSidebar() {
  sidebarOpen.value = false
}
</script>

<template>
  <div class="admin-layout">
    <!-- Sidebar -->
    <aside class="admin-sidebar" :class="{ open: sidebarOpen }">
      <div class="sidebar-brand">
        <div class="brand-logo">
          <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="10" fill="#0066ff"/>
            <path d="M12 14h10c4 0 7 2.5 7 6s-3 6-7 6H12V14z" fill="white"/>
            <circle cx="28" cy="20" r="3" fill="#ffd60a"/>
          </svg>
        </div>
        <div class="brand-text">
          <div class="brand-name">Dchal Store</div>
          <div class="brand-tag">Admin Panel</div>
        </div>
      </div>

      <nav class="sidebar-nav">
        <div class="nav-label">MENU UTAMA</div>
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          :exact-active-class="item.exact ? 'nav-active' : ''"
          :active-class="!item.exact ? 'nav-active' : ''"
          class="nav-item"
          @click="closeSidebar"
        >
          <span class="nav-icon">
            <!-- dashboard icon -->
            <svg v-if="item.icon === 'dashboard'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="7" height="9" rx="1"/>
              <rect x="14" y="3" width="7" height="5" rx="1"/>
              <rect x="14" y="12" width="7" height="9" rx="1"/>
              <rect x="3" y="16" width="7" height="5" rx="1"/>
            </svg>
            <!-- package icon -->
            <svg v-else-if="item.icon === 'package'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16.5 9.4 7.55 4.24"/>
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
              <line x1="12" x2="12" y1="22.08" y2="12"/>
            </svg>
            <!-- shopping bag icon -->
            <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
              <line x1="3" x2="21" y1="6" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
          </span>
          <span class="nav-text">{{ item.label }}</span>
        </RouterLink>

        <div class="nav-divider"></div>

        <RouterLink to="/" class="nav-item" @click="closeSidebar">
          <span class="nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
              <polyline points="10 17 15 12 10 7"/>
              <line x1="15" x2="3" y1="12" y2="12"/>
            </svg>
          </span>
          <span class="nav-text">Lihat Toko</span>
        </RouterLink>
      </nav>

      <div class="sidebar-footer">
        <div class="user-card">
          <div class="user-avatar">{{ userInitial }}</div>
          <div class="user-info">
            <div class="user-name">{{ auth.user?.name }}</div>
            <div class="user-role">Administrator</div>
          </div>
        </div>
        <button @click="handleLogout" class="logout-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" x2="9" y1="12" y2="12"/>
          </svg>
          Keluar
        </button>
      </div>
    </aside>

    <!-- Overlay untuk mobile -->
    <div v-if="sidebarOpen" class="sidebar-overlay" @click="closeSidebar"></div>

    <!-- Main content -->
    <div class="admin-main">
      <header class="admin-topbar">
        <button class="menu-toggle" @click="sidebarOpen = !sidebarOpen">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="3" x2="21" y1="6" y2="6"/>
            <line x1="3" x2="21" y1="12" y2="12"/>
            <line x1="3" x2="21" y1="18" y2="18"/>
          </svg>
        </button>
        <div class="topbar-content">
          <div class="topbar-greeting">
            Selamat datang, <strong>{{ auth.user?.name }}</strong> 
            <li>
<Handshake :size="65" />
            </li>
          </div>
          <div class="topbar-actions">
            <RouterLink to="/" class="btn-store-link">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                <polyline points="10 17 15 12 10 7"/>
                <line x1="15" x2="3" y1="12" y2="12"/>
              </svg>
              <span>Lihat Toko</span>
            </RouterLink>
          </div>
        </div>
      </header>

      <main class="admin-content">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: #f1f5f9;
}

/* Sidebar */
.admin-sidebar {
  width: 260px;
  background: #0f172a;
  color: #cbd5e1;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 50;
  transition: transform 0.3s;
}

.sidebar-brand {
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border-bottom: 1px solid #1e293b;
}

.brand-name {
  font-family: 'Sora', sans-serif;
  font-weight: 700;
  font-size: 1rem;
  color: white;
}

.brand-tag {
  font-size: 0.7rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-top: 0.1rem;
}

.sidebar-nav {
  flex: 1;
  padding: 1.25rem 1rem;
  overflow-y: auto;
}

.nav-label {
  font-size: 0.7rem;
  color: #64748b;
  font-weight: 600;
  letter-spacing: 0.08em;
  margin-bottom: 0.75rem;
  padding: 0 0.5rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.7rem 0.75rem;
  border-radius: 8px;
  text-decoration: none;
  color: #94a3b8;
  font-size: 0.92rem;
  font-weight: 500;
  margin-bottom: 0.2rem;
  transition: all 0.15s;
}

.nav-item:hover {
  background: #1e293b;
  color: white;
}

.nav-item.nav-active {
  background: #0066ff;
  color: white;
}

.nav-active .nav-icon {
  color: white;
}

.nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-divider {
  height: 1px;
  background: #1e293b;
  margin: 1rem 0.5rem;
}

/* Sidebar footer */
.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid #1e293b;
}

.user-card {
  display: flex;
  gap: 0.7rem;
  align-items: center;
  padding: 0.6rem;
  background: #1e293b;
  border-radius: 8px;
  margin-bottom: 0.7rem;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0066ff, #6366f1);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.95rem;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 0.7rem;
  color: #64748b;
}

.logout-btn {
  width: 100%;
  padding: 0.6rem;
  background: transparent;
  border: 1px solid #334155;
  color: #cbd5e1;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.15s;
}

.logout-btn:hover {
  background: #ef4444;
  border-color: #ef4444;
  color: white;
}

/* Main */
.admin-main {
  flex: 1;
  margin-left: 260px;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.admin-topbar {
  background: white;
  border-bottom: 1px solid #e2e8f0;
  padding: 0.85rem 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  position: sticky;
  top: 0;
  z-index: 30;
}

.menu-toggle {
  display: none;
  background: transparent;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.4rem;
  cursor: pointer;
  color: #475569;
}

.topbar-content {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.topbar-greeting {
  font-size: 0.95rem;
  color: #475569;
}

.topbar-greeting strong {
  color: #0f172a;
}

.btn-store-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f1f5f9;
  color: #475569;
  text-decoration: none;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.15s;
}

.btn-store-link:hover {
  background: #0066ff;
  color: white;
}

.admin-content {
  padding: 2rem;
  flex: 1;
}

.sidebar-overlay {
  display: none;
}

@media (max-width: 1024px) {
  .admin-sidebar {
    transform: translateX(-100%);
  }

  .admin-sidebar.open {
    transform: translateX(0);
  }

  .sidebar-overlay {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 40;
  }

  .admin-main {
    margin-left: 0;
  }

  .menu-toggle {
    display: flex;
  }
}

@media (max-width: 640px) {
  .admin-content {
    padding: 1rem;
  }

  .admin-topbar {
    padding: 0.85rem 1rem;
  }

  .topbar-greeting {
    font-size: 0.85rem;
  }

  .btn-store-link span {
    display: none;
  }
}
</style>
