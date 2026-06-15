<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  fromName: { type: String, required: true },
  toName: { type: String, required: true },
  message: { type: String, required: true },
  countdown: { type: Number, default: 30 },
})

const emit = defineEmits(['done'])
</script>

<template>
  <div class="w-full max-w-3xl mx-auto text-center animate-fade-in-up px-4">
    <!-- From (opening credits style) -->
    <div class="mb-6 space-y-1">
      <p class="font-cinema text-xl md:text-2xl text-cinema-gold-dim italic">From</p>
      <p class="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-cinema-beam font-bold tracking-wide">
        {{ fromName }}
      </p>
    </div>

    <!-- Divider -->
    <div class="w-16 sm:w-24 h-px bg-cinema-gold/40 mx-auto my-6"></div>

    <!-- To -->
    <div class="mb-8 space-y-1">
      <p class="font-cinema text-xl md:text-2xl text-cinema-gold-dim italic">To</p>
      <p class="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-cinema-beam font-bold tracking-wide">
        {{ toName }}
      </p>
    </div>

    <!-- Message (subtitle / film credit style) -->
    <div class="bg-cinema-night/40 backdrop-blur-sm border border-cinema-cloud/20 rounded-xl px-6 sm:px-8 py-5 max-w-2xl mx-auto">
      <p class="font-subtitle text-lg sm:text-xl md:text-2xl lg:text-3xl text-cinema-subtitle leading-relaxed">
        "{{ message }}"
      </p>
    </div>

    <!-- Countdown -->
    <p class="mt-8 text-cinema-text-dim/50 text-sm font-body animate-pulse-glow">
      Music begins in {{ countdown }}s...
    </p>
  </div>
</template>
