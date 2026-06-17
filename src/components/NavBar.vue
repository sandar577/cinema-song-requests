<script setup>
import { computed } from "vue";
import { RouterLink, useRoute } from "vue-router";

const route = useRoute();
const isProjector = computed(() => route.path === "/projector");
</script>

<template>
  <nav
    :class="[
      'border-b backdrop-blur-md transition-all duration-500',
      isProjector
        ? 'bg-transparent border-transparent'
        : 'bg-cinema-night/80 border-cinema-gold-dim/30',
    ]"
  >
    <div
      class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between"
    >
      <!-- Logo -->
      <RouterLink
        to="/"
        class="font-display text-xl md:text-2xl text-cinema-gold tracking-wider hover:text-cinema-beam transition-colors duration-300"
      >
        🎬 Screen Dedications
      </RouterLink>

      <!-- Nav links -->
      <div
        class="flex gap-4 md:gap-6 font-body text-xs sm:text-sm uppercase tracking-widest"
      >
        <RouterLink
          to="/"
          class="transition-colors duration-300"
          :class="
            route.path === '/'
              ? 'text-cinema-gold'
              : 'text-cinema-text-dim hover:text-cinema-gold'
          "
        >
          Request
        </RouterLink>
        <RouterLink
          to="/projector"
          class="transition-colors duration-300"
          :class="
            route.path === '/projector'
              ? 'text-cinema-gold'
              : 'text-cinema-text-dim hover:text-cinema-gold'
          "
        >
          Projector
        </RouterLink>
      </div>
    </div>
  </nav>
</template>
