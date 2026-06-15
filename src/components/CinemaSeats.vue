<script setup>
// Decorative cinema seats silhouette for the bottom of the projector page
</script>

<template>
  <div class="relative w-full pointer-events-none flex-shrink-0" style="height: min(15vh, 160px);">
    <svg
      viewBox="0 0 1200 160"
      class="w-full h-full"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="seatFade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#1a1640" stop-opacity="0.2" />
          <stop offset="100%" stop-color="#1a1640" stop-opacity="0.7" />
        </linearGradient>
        <linearGradient id="floorFade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#0d0b1a" stop-opacity="0.5" />
          <stop offset="100%" stop-color="#06040a" stop-opacity="0.9" />
        </linearGradient>
      </defs>

      <!-- Floor -->
      <rect x="0" y="100" width="1200" height="60" fill="url(#floorFade)" />

      <!-- Row 3 — Back row, smaller, dimmer -->
      <g fill="#1a1640" opacity="0.35">
        <path v-for="i in 20" :key="'r3-'+i"
          :d="`M${i*60-40},50 Q${i*60-20},40 ${i*60},50 L${i*60-4},70 Q${i*60-20},80 ${i*60-36},70 Z`"
        />
      </g>

      <!-- Row 2 — Middle row -->
      <g fill="#1a1640" opacity="0.45">
        <path v-for="i in 20" :key="'r2-'+i"
          :d="`M${i*60-42},75 Q${i*60-20},63 ${i*60+2},75 L${i*60-3},100 Q${i*60-20},112 ${i*60-38},100 Z`"
        />
      </g>

      <!-- Row 1 — Front row, largest, darkest -->
      <g fill="#14102e" opacity="0.55">
        <path v-for="i in 20" :key="'r1-'+i"
          :d="`M${i*60-45},105 Q${i*60-20},90 ${i*60+5},105 L${i*60-1},140 Q${i*60-20},155 ${i*60-41},140 Z`"
        />
      </g>

      <!-- Seat tops (elliptical highlights) -->
      <g fill="#1a1640" opacity="0.2">
        <ellipse v-for="i in 20" :key="'et-'+i" :cx="i*60 - 18" cy="75" rx="18" ry="3" />
      </g>
    </svg>
  </div>
</template>
