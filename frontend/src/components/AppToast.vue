<script setup>
import { ref, onMounted } from 'vue';

const toast = ref({ show: false, message: '', type: 'success' });

function showToast(message, type = 'success') {
  toast.value = { show: true, message, type };
  setTimeout(() => { toast.value.show = false; }, 3000);
}

onMounted(() => {
  // expose global
  window.$toast = showToast;
});
</script>

<template>
  <transition name="toast">
    <div v-if="toast.show" :class="['toast', `toast-${toast.type}`]">
      {{ toast.message }}
    </div>
  </transition>
</template>

<style scoped>
.toast-enter-active, .toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from, .toast-leave-to {
  transform: translateX(120%);
  opacity: 0;
}
</style>
