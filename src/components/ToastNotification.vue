<script setup>
import { ref, computed, onBeforeUnmount } from "vue";

const visible = ref(false);
const message = ref("");
const type = ref("success"); // 'success' | 'error' | 'info'
let timer = null;

function show(msg, toastType = "success", duration = 5000) {
  clearTimeout(timer);
  message.value = msg;
  type.value = toastType;
  visible.value = true;
  timer = setTimeout(() => {
    visible.value = false;
  }, duration);
}

// Expose to other components via provide/inject
defineExpose({ show });

onBeforeUnmount(() => {
  clearTimeout(timer);
});
</script>

<template>
  <Transition name="toast-slide">
    <div
      v-if="visible"
      :class="[
        'fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl font-body text-sm shadow-2xl backdrop-blur-md border max-w-sm text-center',
        type === 'success'
          ? 'bg-green-900/80 border-green-600/40 text-green-100'
          : type === 'error'
            ? 'bg-cinema-red/80 border-cinema-red-bright/40 text-white'
            : 'bg-cinema-night/90 border-cinema-gold-dim/30 text-cinema-text',
      ]"
    >
      <p>{{ message }}</p>
    </div>
  </Transition>
</template>
