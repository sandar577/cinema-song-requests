<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { fetchTodaysRequests, markPlayed } from '@/lib/api'
import { extractYoutubeId } from '@/composables/useYoutubeId'
import MessageCard from '@/components/MessageCard.vue'
import VideoPlayer from '@/components/VideoPlayer.vue'
import CinemaSeats from '@/components/CinemaSeats.vue'

// --- State Machine ---
// States: 'loading' | 'idle' | 'message' | 'playing' | 'transition'
const state = ref('loading')
const queue = ref([])          // Today's unplayed requests
const currentIndex = ref(0)    // Which request we're showing
const countdown = ref(30)      // Message display countdown
const error = ref(null)

let countdownTimer = null
let pollTimer = null

// Current request
const currentRequest = computed(() => {
  if (queue.value.length === 0) return null
  return queue.value[currentIndex.value] || null
})

const currentVideoId = computed(() => {
  if (!currentRequest.value) return null
  return extractYoutubeId(currentRequest.value.youtube_url)
})

const MESSAGE_DURATION = 30 // seconds

// --- Data Fetching ---
async function loadRequests() {
  const result = await fetchTodaysRequests()
  if (result.success) {
    queue.value = result.data
    // Filter out already-played (edge function should handle, but belt and suspenders)
    queue.value = queue.value.filter(r => !r.played)
    error.value = null
  } else {
    error.value = result.error
  }
}

// --- State Transitions ---
async function startCycle() {
  if (queue.value.length === 0) {
    state.value = 'idle'
    return
  }

  currentIndex.value = 0
  showMessage(0)
}

function showMessage(index) {
  currentIndex.value = index
  state.value = 'message'
  startCountdown()
}

function startCountdown() {
  clearInterval(countdownTimer)
  countdown.value = MESSAGE_DURATION

  countdownTimer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(countdownTimer)
      // Transition to playing
      if (currentVideoId.value) {
        state.value = 'playing'
        // The video will handle its own lifecycle
      } else {
        // No video ID? Skip to next
        advanceToNext()
      }
    }
  }, 1000)
}

// Called when YouTube video ends (via YouTube IFrame API message)
function onVideoEnded() {
  advanceToNext()
}

async function advanceToNext() {
  clearInterval(countdownTimer)

  // Mark current as played
  if (currentRequest.value) {
    const result = await markPlayed(currentRequest.value.id)
    if (result.success) {
      currentRequest.value.played = true
    }
  }

  // Move to next unplayed
  const nextUnplayedIndex = queue.value.findIndex((r, i) => i > currentIndex.value && !r.played)

  if (nextUnplayedIndex !== -1) {
    showMessage(nextUnplayedIndex)
  } else {
    // No more unplayed — reload and see if there are new ones
    state.value = 'loading'
    await loadRequests()

    // Check for any unplayed
    const firstUnplayed = queue.value.findIndex(r => !r.played)
    if (firstUnplayed !== -1) {
      showMessage(firstUnplayed)
    } else {
      state.value = 'idle'
    }
  }
}

// --- YouTube IFrame API listener ---
function handleYouTubeMessage(event) {
  if (!event.data || typeof event.data !== 'string') return

  // Parse YouTube IFrame API messages: {"event":"infoDelivery","info":{...}}
  // or {"event":"onStateChange","info":{"playerState":0}} (0 = ended)
  try {
    const data = JSON.parse(event.data)
    if (data.event === 'onStateChange' && data.info?.playerState === 0) {
      // Video ended
      if (state.value === 'playing') {
        onVideoEnded()
      }
    }
  } catch (e) {
    // Not JSON, ignore
  }
}

// --- Poll for new requests when idle ---
function startIdlePolling() {
  stopIdlePolling()
  pollTimer = setInterval(async () => {
    await loadRequests()
    const unplayed = queue.value.filter(r => !r.played)
    if (unplayed.length > 0) {
      stopIdlePolling()
      startCycle()
    }
  }, 15000) // Poll every 15s when idle
}

function stopIdlePolling() {
  clearInterval(pollTimer)
  pollTimer = null
}

// --- Watch state for idle ---
watch(state, (newState) => {
  if (newState === 'idle') {
    startIdlePolling()
  } else {
    stopIdlePolling()
  }
})

// --- Lifecycle ---
onMounted(async () => {
  window.addEventListener('message', handleYouTubeMessage)
  state.value = 'loading'
  await loadRequests()
  startCycle()
})

onBeforeUnmount(() => {
  clearInterval(countdownTimer)
  stopIdlePolling()
  window.removeEventListener('message', handleYouTubeMessage)
})
</script>

<template>
  <div class="h-[calc(100vh-4rem)] bg-cinema-void relative overflow-hidden flex flex-col no-scrollbar">
    <!-- Starfield (dimmer on projector to keep focus on screen) -->
    <div class="absolute inset-0 stars-layer opacity-25 pointer-events-none"></div>

    <!-- Projector beam cone (top-center)
         This cone of warm light emulates the projector light path -->
    <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[85vw] h-[65vh] pointer-events-none"
         style="background: radial-gradient(ellipse at 50% 0%, rgba(245,240,232,0.07) 0%, rgba(245,240,232,0.02) 45%, transparent 70%);">
    </div>

    <!-- Projector lens glow (tiny pulsing dot at the top) -->
    <div class="absolute top-6 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-cinema-beam rounded-full blur-sm opacity-50 pointer-events-none animate-pulse-glow"></div>

    <!-- MAIN SCREEN AREA -->
    <div class="flex-1 flex items-center justify-center relative z-10">
      <!-- LOADING -->
      <div v-if="state === 'loading'" class="text-center animate-fade-in">
        <div class="inline-block w-10 h-10 border-2 border-cinema-gold-dim/30 border-t-cinema-gold rounded-full animate-spin mb-4"></div>
        <p class="font-body text-cinema-text-dim text-sm">Loading today's requests...</p>
      </div>

      <!-- IDLE — Waiting for requests -->
      <div v-else-if="state === 'idle'" class="text-center px-4 animate-float">
        <div class="text-6xl mb-6 animate-pulse-glow">🎬</div>
        <h2 class="font-display text-2xl md:text-3xl lg:text-4xl text-cinema-gold mb-4">
          Waiting for Requests
        </h2>
        <p class="font-body text-cinema-text-dim text-base md:text-lg max-w-md mx-auto leading-relaxed">
          Once someone dedicates a song, it will appear here on the big screen.
        </p>
        <p class="font-body text-cinema-text-dim/50 text-sm mt-6">
          Today's queue is empty — be the first to request!
        </p>
      </div>

      <!-- ERROR -->
      <div v-else-if="state === 'error'" class="text-center px-4">
        <p class="text-cinema-neon font-body">{{ error || 'Something went wrong' }}</p>
      </div>

      <!-- MESSAGE — Showing dedication before music -->
      <div v-else-if="state === 'message' && currentRequest" class="w-full flex items-center justify-center">
        <MessageCard
          :key="currentRequest.id"
          :from-name="currentRequest.from_name"
          :to-name="currentRequest.to_name"
          :message="currentRequest.message"
          :countdown="countdown"
        />
      </div>

      <!-- PLAYING — YouTube video on the projector screen -->
      <div v-else-if="state === 'playing' && currentVideoId" class="w-full h-full flex items-center justify-center">
        <VideoPlayer
          :key="'video-' + currentRequest.id"
          :video-id="currentVideoId"
        />
      </div>
    </div>

    <!-- PROGRESS INDICATOR (when requests exist) -->
    <Transition name="toast-slide">
      <div
        v-if="queue.length > 0 && (state === 'message' || state === 'playing')"
        class="relative z-10 flex justify-center pb-2 pointer-events-none"
      >
        <div class="flex items-center gap-2 bg-cinema-night/60 backdrop-blur-sm rounded-full px-4 py-1.5 border border-cinema-cloud/20">
          <span class="font-body text-xs text-cinema-text-dim">
            {{ currentIndex + 1 }} / {{ queue.length }}
          </span>
          <span v-if="state === 'message'" class="font-body text-xs text-cinema-gold-dim">
            • Message: {{ countdown }}s
          </span>
          <span v-else class="font-body text-xs text-cinema-gold-dim">
            • Now Playing
          </span>
        </div>
      </div>
    </Transition>

    <!-- Cinema seats at the bottom -->
    <CinemaSeats />
  </div>
</template>
