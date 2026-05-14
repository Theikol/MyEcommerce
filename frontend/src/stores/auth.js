import { defineStore } from 'pinia';
import api from '../services/api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    loading: false,
    error: null,
  }),

  getters: {
    isLoggedIn: (s) => !!s.token,
    isAdmin: (s) => s.user?.role === 'admin',
  },

  actions: {
    init() {
      const data = localStorage.getItem('dchal_user');
      if (data) {
        try {
          const parsed = JSON.parse(data);
          this.user = parsed;
          this.token = parsed.token;
        } catch {}
      }
    },

    async login(email, password) {
      this.loading = true;
      this.error = null;
      try {
        const { data } = await api.post('/auth/login', { email, password });
        this.user = data.data;
        this.token = data.data.token;
        localStorage.setItem('dchal_user', JSON.stringify(data.data));
        return data.data;
      } catch (err) {
        this.error = err.response?.data?.message || 'Login gagal';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async register({ name, email, password, phone }) {
      this.loading = true;
      this.error = null;
      try {
        const { data } = await api.post('/auth/register', { name, email, password, phone });
        this.user = data.data;
        this.token = data.data.token;
        localStorage.setItem('dchal_user', JSON.stringify(data.data));
        return true;
      } catch (err) {
        this.error = err.response?.data?.message || 'Registrasi gagal';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async fetchProfile() {
      try {
        const { data } = await api.get('/auth/profile');
        this.user = { ...this.user, ...data.data };
        localStorage.setItem('dchal_user', JSON.stringify({ ...this.user, token: this.token }));
      } catch (e) {
        console.error(e);
      }
    },

    async addAddress(address) {
      const { data } = await api.post('/auth/addresses', address);
      this.user.addresses = data.data;
      localStorage.setItem('dchal_user', JSON.stringify({ ...this.user, token: this.token }));
    },

    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem('dchal_user');
    },
  },
});
