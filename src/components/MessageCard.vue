<script setup>
defineProps({
  fromName: { type: String, required: true },
  toName: { type: String, required: true },
  message: { type: String, required: true },
  countdown: { type: Number, default: 20 },
});
</script>

<template>
  <!--
    Dedication message displayed on the cinema screen.
    Sized smaller to match the "viewed from back row" perspective.
  -->
  <div
    class="w-full max-w-[min(56vw,680px)] mx-auto text-center animate-fade-in-up px-2 py-2"
  >
    <!-- From (credit style) -->
    <div class="mb-3 sm:mb-4 space-y-0.5">
      <p
        class="font-cinema text-lg sm:text-xl md:text-2xl text-cinema-gold-dim italic"
      >
        From
      </p>
      <p
        class="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-cinema-beam font-bold tracking-wide"
      >
        {{ fromName }}
      </p>
    </div>

    <!-- Gold divider -->
    <div class="w-12 sm:w-16 h-px bg-cinema-gold/30 mx-auto my-3 sm:my-4"></div>

    <!-- To -->
    <div class="mb-4 sm:mb-6 space-y-0.5">
      <p
        class="font-cinema text-lg sm:text-xl md:text-2xl text-cinema-gold-dim italic"
      >
        To
      </p>
      <p
        class="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-cinema-beam font-bold tracking-wide"
      >
        {{ toName }}
      </p>
    </div>

    <!-- Message (subtitle style) -->
    <div
      class="bg-cinema-night/30 backdrop-blur-sm border border-cinema-cloud/15 rounded-lg px-4 sm:px-6 py-3 sm:py-4 max-w-lg mx-auto"
    >
      <p
        class="font-subtitle text-base sm:text-lg md:text-xl lg:text-2xl text-cinema-subtitle leading-relaxed"
      >
        "{{ message }}"
      </p>
    </div>

    <!-- Countdown -->
    <p class="mt-4 sm:mt-6 text-xs sm:text-sm font-body animate-pulse-glow">
      Music begins in {{ countdown }}s...
    </p>
  </div>
</template>
