<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import AppHeader from './components/AppHeader.vue';
import AppFooter from './components/AppFooter.vue';
import AppToast from './components/AppToast.vue';

const route = useRoute();
const isAdminRoute = computed(() => route.path.startsWith('/admin'));
</script>

<template>
  <div class="app-shell">
    <AppHeader v-if="!isAdminRoute" />
    <main class="app-main" :class="{ 'app-main-admin': isAdminRoute }">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <AppFooter v-if="!isAdminRoute" />
    <AppToast />
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.app-main {
  flex: 1;
  padding-top: var(--header-h);
}
.app-main-admin {
  padding-top: 0;
}
.page-enter-active, .page-leave-active {
  transition: opacity 0.25s ease;
}
.page-enter-from, .page-leave-to { opacity: 0; }
</style>
