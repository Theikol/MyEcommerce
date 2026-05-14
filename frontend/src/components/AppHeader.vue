<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useCartStore } from '../stores/cart';

const router = useRouter();
const auth = useAuthStore();
const cart = useCartStore();
const search = ref('');
const showUserMenu = ref(false);

const cartCount = computed(() => cart.totalItems);

function doSearch() {
  if (search.value.trim()) {
    router.push({ name: 'Products', query: { search: search.value } });
  }
}

function logout() {
  auth.logout();
  showUserMenu.value = false;
  router.push('/');
}
</script>

<template>
  <header class="header">
    <div class="container header-inner">
      <!-- Logo -->
      <router-link to="/" class="logo">
        <div class="logo-mark">
          <svg viewBox="0 0 32 32" fill="none">
            <path d="M6 4h14a8 8 0 0 1 8 8v8a8 8 0 0 1-8 8H6V4z" fill="currentColor"/>
            <circle cx="22" cy="16" r="3" fill="var(--color-accent)"/>
          </svg>
        </div>
        <div class="logo-text">
          <span class="logo-brand">Dchal</span>
          <span class="logo-tag">STORE</span>
        </div>
      </router-link>

      <!-- Search -->
      <form class="search" @submit.prevent="doSearch">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
        <input v-model="search" placeholder="Cari kabel, casing, earphone..." />
        <button type="submit" class="btn btn-primary btn-sm">Cari</button>
      </form>

      <!-- Actions -->
      <nav class="header-nav">
        <router-link to="/products" class="nav-link">Produk</router-link>

        <router-link to="/cart" class="cart-link" aria-label="Cart">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
            <path d="M3 6h18"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
          <span v-if="cartCount > 0" class="cart-badge">{{ cartCount }}</span>
        </router-link>

        <div v-if="auth.isLoggedIn" class="user-menu">
          <button @click="showUserMenu = !showUserMenu" class="user-trigger">
            <div class="avatar">{{ auth.user?.name?.charAt(0).toUpperCase() }}</div>
            <span class="user-name">{{ auth.user?.name?.split(' ')[0] }}</span>
          </button>
          <div v-if="showUserMenu" class="dropdown">
            <router-link v-if="auth.isAdmin" to="/admin" @click="showUserMenu = false" class="dropdown-admin">
              <span class="admin-icon">⚡</span> Admin Dashboard
            </router-link>
            <router-link to="/orders" @click="showUserMenu = false">Pesanan Saya</router-link>
            <button @click="logout">Logout</button>
          </div>
        </div>
        <template v-else>
          <router-link to="/login" class="btn btn-ghost btn-sm">Login</router-link>
          <router-link to="/register" class="btn btn-primary btn-sm">Daftar</router-link>
        </template>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.header {
  position: fixed;
  top: 0; left: 0; right: 0;
  height: var(--header-h);
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: saturate(140%) blur(16px);
  border-bottom: 1px solid var(--color-border);
  z-index: 100;
}
.header-inner {
  height: 100%;
  display: flex;
  align-items: center;
  gap: 1.5rem;
}
.logo {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-shrink: 0;
}
.logo-mark {
  width: 38px; height: 38px;
  color: var(--color-primary);
}
.logo-text { display: flex; flex-direction: column; line-height: 1; }
.logo-brand {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 1.35rem;
  color: var(--color-text);
}
.logo-tag {
  font-size: 0.65rem;
  letter-spacing: 0.25em;
  color: var(--color-primary);
  font-weight: 600;
  margin-top: 2px;
}

.search {
  flex: 1;
  max-width: 520px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--color-surface-2);
  border: 2px solid transparent;
  padding: 0.35rem 0.5rem 0.35rem 1rem;
  border-radius: var(--radius-full);
  transition: border-color 0.2s;
}
.search:focus-within { border-color: var(--color-primary); background: white; }
.search svg { color: var(--color-text-muted); flex-shrink: 0; }
.search input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 0.95rem;
  padding: 0.4rem 0.5rem;
}

.header-nav {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.nav-link {
  font-weight: 500;
  color: var(--color-text);
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-sm);
}
.nav-link:hover { color: var(--color-primary); }

.cart-link {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px; height: 42px;
  border-radius: var(--radius-full);
  background: var(--color-surface-2);
  color: var(--color-text);
}
.cart-link:hover { background: var(--color-border); }
.cart-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  background: var(--color-accent);
  color: var(--color-text);
  min-width: 20px;
  height: 20px;
  border-radius: var(--radius-full);
  font-size: 0.7rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
}

.user-menu { position: relative; }
.user-trigger {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.3rem 0.85rem 0.3rem 0.3rem;
  border-radius: var(--radius-full);
  background: var(--color-surface-2);
}
.user-trigger:hover { background: var(--color-border); }
.avatar {
  width: 32px; height: 32px;
  border-radius: var(--radius-full);
  background: var(--color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.85rem;
}
.user-name { font-size: 0.9rem; font-weight: 500; }

.dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: white;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  min-width: 180px;
  overflow: hidden;
}
.dropdown a, .dropdown button {
  display: block;
  width: 100%;
  text-align: left;
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  color: var(--color-text);
  background: white;
}
.dropdown a:hover, .dropdown button:hover { background: var(--color-surface-2); }
.dropdown-admin {
  background: linear-gradient(135deg, #0066ff 0%, #003d99 100%) !important;
  color: white !important;
  font-weight: 600;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
}
.dropdown-admin:hover {
  background: linear-gradient(135deg, #0052cc 0%, #002766 100%) !important;
}
.admin-icon { margin-right: 0.35rem; }

@media (max-width: 900px) {
  .search { display: none; }
  .nav-link { display: none; }
  .user-name { display: none; }
}
</style>
