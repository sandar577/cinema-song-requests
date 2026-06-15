<script setup>
import { computed } from 'vue'
import { buildEmbedUrl } from '@/composables/useYoutubeId'

const props = defineProps({
  videoId: { type: String, required: true },
})

const embedUrl = computed(() => buildEmbedUrl(props.videoId))
</script>

<template>
  <div class="w-full h-full flex items-center justify-center px-2 animate-fade-in">
    <div class="relative w-full" style="max-width: min(90vw, calc(90vh * 16/9));">
      <!-- 16:9 aspect ratio container -->
      <div class="relative w-full" style="padding-bottom: 56.25%;">
        <iframe
          :src="embedUrl"
          class="absolute inset-0 w-full h-full rounded-lg shadow-2xl shadow-black/60 border border-cinema-cloud/20"
          allow="autoplay; encrypted-media"
          allowfullscreen
          frameborder="0"
        ></iframe>
      </div>
    </div>
  </div>
</template>
