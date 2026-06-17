<script setup>
import { ref, provide } from "vue";
import { RouterView } from "vue-router";
import NavBar from "@/components/NavBar.vue";
import ToastNotification from "@/components/ToastNotification.vue";

const toastRef = ref(null);
provide("toast", toastRef);
</script>

<template>
  <!-- Root: Starry cinema background -->
  <div class="min-h-screen bg-cinema-void relative overflow-hidden">
    <!-- Starfield layer -->
    <div
      class="absolute inset-0 stars-layer opacity-40 pointer-events-none"
    ></div>

    <!-- Subtle projector ambient glow from top -->
    <div
      class="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-30%,rgba(212,168,83,0.06)_0%,transparent_60%)] pointer-events-none"
    ></div>

    <!-- Nav + Content -->
    <div class="relative z-10 flex flex-col min-h-screen">
      <NavBar />
      <main class="flex-1 flex flex-col">
        <RouterView v-slot="{ Component }">
          <!-- <Transition name="page" mode="out-in"> -->
          <component :is="Component" />
          <!-- </Transition> -->
        </RouterView>
      </main>
    </div>

    <!-- Global Toast -->
    <ToastNotification ref="toastRef" />
  </div>
</template>

<style scoped>
.page-enter-active,
.page-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
