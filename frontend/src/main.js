import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { useAuthStore } from './stores/auth';
import { useCartStore } from './stores/cart';
import './assets/main.css';

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);
app.use(router);

// Init stores dari localStorage
const auth = useAuthStore();
auth.init();
const cart = useCartStore();
cart.init();

app.mount('#app');
