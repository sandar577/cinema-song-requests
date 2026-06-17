<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import { fetchTodaysRequests } from "@/lib/api";
import { extractYoutubeId } from "@/composables/useYoutubeId";
import MessageCard from "@/components/MessageCard.vue";
import VideoPlayer from "@/components/VideoPlayer.vue";

// --- State Machine ---
const state = ref("loading");
const queue = ref([]);
const currentIndex = ref(0);
const countdown = ref(15);
const error = ref(null);

let countdownTimer = null;
let pollTimer = null;
let isMounted = false;

const currentRequest = computed(() => {
  if (queue.value.length === 0) return null;
  return queue.value[currentIndex.value] || null;
});

const currentVideoId = computed(() => {
  if (!currentRequest.value) return null;
  return extractYoutubeId(currentRequest.value.youtube_url);
});

const MESSAGE_DURATION = 5; // seconds the message card is shown before video starts

async function loadRequests() {
  console.log("[Projector] loadRequests() called");
  try {
    const result = await fetchTodaysRequests();
    if (!isMounted) return;
    if (result.success) {
      // Show ALL requests — we loop them continuously, not remove played ones
      queue.value = result.data;
      error.value = null;
      console.log(
        `[Projector] loadRequests() OK — ${queue.value.length} requests in queue`
      );
    } else {
      error.value = result.error;
      console.log("[Projector] loadRequests() FAIL:", result.error);
    }
  } catch (e) {
    if (!isMounted) return;
    console.error("[Projector] loadRequests() ERROR:", e);
    error.value = "Could not reach the server. Retrying...";
    state.value = "error";
  }
}

async function startCycle() {
  if (queue.value.length === 0) {
    state.value = "idle";
    return;
  }
  currentIndex.value = 0;
  showMessage(0);
}

function showMessage(index) {
  console.log(
    `[Projector] showMessage(${index}) — request#${queue.value[index]?.id}, state → message`
  );
  currentIndex.value = index;
  state.value = "message";
  startCountdown();
}

function startCountdown() {
  clearInterval(countdownTimer);
  countdown.value = MESSAGE_DURATION;
  console.log(`[Projector] Countdown started: ${MESSAGE_DURATION}s`);
  countdownTimer = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(countdownTimer);
      console.log(
        `[Projector] Countdown done, currentVideoId=${currentVideoId.value}`
      );
      if (currentVideoId.value) {
        console.log("[Projector] → state = playing");
        state.value = "playing";
      } else {
        console.log("[Projector] No video ID — skipping to next");
        advanceToNext();
      }
    }
  }, 1000);
}

function onVideoEnded() {
  console.log("[Projector] onVideoEnded() called");
  advanceToNext();
}

async function advanceToNext() {
  console.log(
    `[Projector] advanceToNext() — currentIndex=${currentIndex.value}, queue.length=${queue.value.length}`
  );
  clearInterval(countdownTimer);

  if (queue.value.length === 0) {
    // Queue became empty — reload and check for new requests
    state.value = "loading";
    await loadRequests();
    if (!isMounted) return;
    if (queue.value.length > 0) {
      showMessage(0);
    } else {
      console.log("[Projector] → idle (queue empty)");
      state.value = "idle";
    }
    return;
  }

  // When wrapping around to start, reload from server to pick up new requests
  if (currentIndex.value === queue.value.length - 1) {
    console.log("[Projector] End of queue — reloading for new requests...");
    await loadRequests();
    if (!isMounted) return;
    if (queue.value.length === 0) {
      console.log("[Projector] → idle (queue empty after reload)");
      state.value = "idle";
      return;
    }
  }

  // Loop: advance to next index, wrapping around to 0 at the end
  const nextIndex = (currentIndex.value + 1) % queue.value.length;
  console.log(
    `[Projector] → looping to index ${nextIndex} (request#${queue.value[nextIndex].id})`
  );
  showMessage(nextIndex);
}

function handleYouTubeMessage(event) {
  // Only accept messages from YouTube — reject all other origins
  if (event.origin !== "https://www.youtube.com") return;
  // Validate we have string data to parse
  if (!event.data || typeof event.data !== "string") return;

  try {
    const data = JSON.parse(event.data);

    // Log ALL postMessage events unconditionally so we can see what YouTube sends
    console.log(
      `[Projector] postMessage origin=${event.origin} event=${data.event}`,
      data.info
    );

    if (data.event === "onStateChange") {
      // YouTube IFrame API sends info in TWO possible formats:
      //   Format A: {"event":"onStateChange","info":{"playerState":0}}  (object)
      //   Format B: {"event":"onStateChange","info":0}                  (number)
      const playerState =
        typeof data.info === "number" ? data.info : data.info?.playerState;

      console.log(
        `[Projector] playerState=${playerState} (state=${state.value})`
      );

      // playerState 0 = ended
      if (playerState === 0 && state.value === "playing") {
        console.log("[Projector] ✓ Video ended — advancing to next");
        onVideoEnded();
      }
    }
  } catch (e) {
    /* ignore non-JSON messages from extensions, etc. */
  }
}

function startIdlePolling() {
  stopIdlePolling();
  let polling = false;
  pollTimer = setInterval(async () => {
    if (polling) return; // skip if previous poll still in flight
    polling = true;
    try {
      await loadRequests();
      if (!isMounted) return;
      if (queue.value.length > 0) {
        stopIdlePolling();
        startCycle();
      }
    } finally {
      polling = false;
    }
  }, 15000);
}

function stopIdlePolling() {
  clearInterval(pollTimer);
  pollTimer = null;
}

watch(state, (newState) => {
  if (newState === "idle") startIdlePolling();
  else stopIdlePolling();
});

onMounted(async () => {
  isMounted = true;
  window.addEventListener("message", handleYouTubeMessage);
  state.value = "loading";
  await loadRequests();
  if (!isMounted) return;
  startCycle();
});

onBeforeUnmount(() => {
  isMounted = false;
  clearInterval(countdownTimer);
  stopIdlePolling();
  window.removeEventListener("message", handleYouTubeMessage);
});
</script>

<template>
  <!--
    ============================================================
    PERSPECTIVE: Watching from the last row of the cinema
    - Cinema photo as atmospheric background
    - Video screen is distant, at the front of the theater
    - Seat silhouettes in the foreground (we're sitting in them)
    - Projector beam overhead from behind us toward the screen
    ============================================================
  -->
  <div
    class="h-[calc(100vh-4rem)] bg-cinema-void relative overflow-hidden flex flex-col no-scrollbar"
  >
    <!-- CINEMA PHOTO BACKGROUND (full coverage) -->
    <div
      class="absolute inset-0 bg-cover bg-center bg-no-repeat"
      style="
        background-image: url('./images/cinema-bg.jpg');
        background-position: center 60%;
      "
    >
      <!-- Heavy dark gradient overlay: pitch black at top, reveals photo in lower portion -->
      <div
        class="absolute inset-0"
        style="
          background: linear-gradient(
            to bottom,
            rgba(6, 4, 10, 1) 0%,
            rgba(6, 4, 10, 0.93) 15%,
            rgba(6, 4, 10, 0.78) 35%,
            rgba(6, 4, 10, 0.55) 55%,
            rgba(6, 4, 10, 0.65) 72%,
            rgba(6, 4, 10, 0.88) 100%
          );
        "
      ></div>
    </div>

    <!-- SUBTLE STARFIELD (top portion only, above the photo) -->
    <div
      class="absolute inset-0 stars-layer opacity-15 pointer-events-none"
    ></div>

    <!-- PROJECTOR BEAM — warm light cone from behind us toward the screen -->
    <div
      class="absolute top-2 left-1/2 -translate-x-1/2 pointer-events-none z-10"
      style="
        width: min(55vw, 700px);
        height: 40vh;
        background: radial-gradient(
          ellipse at 50% 0%,
          rgba(245, 240, 232, 0.045) 0%,
          rgba(245, 240, 232, 0.015) 50%,
          transparent 75%
        );
      "
    ></div>

    <!-- Projector lens glow (behind us, subtle) -->
    <div
      class="absolute top-4 left-1/2 -translate-x-1/2 w-2 h-2 bg-cinema-beam rounded-full blur-sm opacity-40 pointer-events-none animate-pulse-glow z-10"
    ></div>

    <!-- ============================================================
         SCREEN AREA — centered on the projector screen in the photo
         ============================================================ -->
    <div
      class="flex-1 flex items-center justify-center relative z-20 px-2"
      style="padding-top: min(8vh, 48px); padding-bottom: min(6vh, 32px)"
    >
      <!-- LOADING -->
      <div v-if="state === 'loading'" class="text-center animate-fade-in mt-16">
        <div
          class="inline-block w-10 h-10 border-2 border-cinema-gold-dim/30 border-t-cinema-gold rounded-full animate-spin mb-4"
        ></div>
        <p class="font-body text-cinema-text-dim text-sm">
          Loading today's requests...
        </p>
      </div>

      <!-- IDLE -->
      <div
        v-else-if="state === 'idle'"
        class="text-center px-4 animate-float mt-16"
      >
        <div class="text-5xl sm:text-6xl mb-6 animate-pulse-glow">🎬</div>
        <h2
          class="font-display text-xl sm:text-2xl md:text-3xl text-cinema-gold mb-3"
        >
          Waiting for Requests
        </h2>
        <p
          class="font-body text-cinema-text-dim/70 text-sm md:text-base max-w-md mx-auto leading-relaxed"
        >
          Once someone dedicates a song, it will appear on the big screen.
        </p>
        <p class="font-body text-cinema-text-dim/40 text-xs mt-5">
          Today's queue is empty — be the first to request!
        </p>
      </div>

      <!-- ERROR -->
      <div v-else-if="state === 'error'" class="text-center px-4 mt-16">
        <p class="text-cinema-neon font-body mb-4">
          {{ error || "Something went wrong" }}
        </p>
        <button
          class="px-6 py-2 rounded-lg font-body text-sm bg-cinema-gold/20 border border-cinema-gold/30 text-cinema-gold hover:bg-cinema-gold/30 transition-colors"
          @click="
            state = 'loading';
            loadRequests().then(() => {
              if (state === 'loading') startCycle();
            });
          "
        >
          Try Again
        </button>
      </div>

      <!-- MESSAGE — on the distant screen -->
      <div
        v-else-if="state === 'message' && currentRequest"
        class="w-full flex items-center justify-center"
      >
        <MessageCard
          :key="currentRequest.id"
          :from-name="currentRequest.from_name"
          :to-name="currentRequest.to_name"
          :message="currentRequest.message"
          :countdown="countdown"
        />
      </div>

      <!-- PLAYING — video playing on the distant projector screen -->
      <div
        v-else-if="state === 'playing' && currentVideoId"
        class="w-full flex items-start justify-center"
      >
        <VideoPlayer
          :key="'video-' + currentRequest.id"
          :video-id="currentVideoId"
          @ended="onVideoEnded"
        />
      </div>
    </div>

    <!-- ============================================================
         FOREGROUND SEATS — we're sitting in the last row
         Simple CSS seat silhouettes right at the bottom
         ============================================================ -->
    <div
      class="relative z-30 w-full pointer-events-none flex-shrink-0"
      style="height: min(14vh, 140px); margin-bottom: 2px"
    >
      <!-- Back-of-head / seat-back silhouettes — what you'd see sitting behind someone -->
      <div
        class="absolute inset-x-0 bottom-0 w-full flex justify-center items-end"
        style="height: 100%"
      >
        <!-- Row of seat backs — simple rounded rectangles fading down -->
        <svg
          viewBox="0 0 1200 140"
          preserveAspectRatio="none"
          class="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <!-- Seat back silhouettes — row of curved shapes -->
          <defs>
            <radialGradient id="seatGlow" cx="50%" cy="30%" r="60%">
              <stop offset="0%" stop-color="#14102e" stop-opacity="0.6" />
              <stop offset="100%" stop-color="#06040a" stop-opacity="0.95" />
            </radialGradient>
            <linearGradient id="fadeDown" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#14102e" stop-opacity="0.55" />
              <stop offset="100%" stop-color="#06040a" stop-opacity="1" />
            </linearGradient>
          </defs>

          <!-- Seat tops (the curved headrests, like you see from behind in the row ahead) -->
          <g
            fill="url(#seatGlow)"
            stroke="rgba(26,22,64,0.3)"
            stroke-width="0.5"
          >
            <!-- 14 seat backs spread across the width -->
            <path d="M85,20 Q115,5 145,20 L140,70 Q115,95 90,70 Z" />
            <path d="M170,20 Q200,5 230,20 L225,70 Q200,95 175,70 Z" />
            <path d="M255,15 Q285,0 315,15 L310,65 Q285,90 260,65 Z" />
            <path d="M340,15 Q370,0 400,15 L395,65 Q370,90 345,65 Z" />
            <path d="M425,12 Q455,-3 485,12 L480,62 Q455,87 430,62 Z" />
            <path d="M510,12 Q540,-3 570,12 L565,62 Q540,87 515,62 Z" />
            <path d="M595,12 Q625,-3 655,12 L650,62 Q625,87 600,62 Z" />
            <path d="M680,12 Q710,-3 740,12 L735,62 Q710,87 685,62 Z" />
            <path d="M765,15 Q795,0 825,15 L820,65 Q795,90 770,65 Z" />
            <path d="M850,15 Q880,0 910,15 L905,65 Q880,90 855,65 Z" />
            <path d="M935,15 Q965,0 995,15 L990,65 Q965,90 940,65 Z" />
            <path d="M1020,20 Q1050,5 1080,20 L1075,70 Q1050,95 1025,70 Z" />
            <path d="M1105,20 Q1135,5 1165,20 L1160,70 Q1135,95 1110,70 Z" />
          </g>

          <!-- Row number / subtle light strip (aisle light) -->
          <rect
            x="0"
            y="0"
            width="1200"
            height="1.5"
            fill="rgba(212,168,83,0.08)"
          />

          <!-- Floor fade -->
          <rect x="0" y="70" width="1200" height="70" fill="url(#fadeDown)" />
        </svg>
      </div>
    </div>

    <!-- PROGRESS INDICATOR -->
    <Transition name="toast-slide">
      <div
        v-if="queue.length > 0 && (state === 'message' || state === 'playing')"
        class="relative z-40 flex justify-center pb-3 pointer-events-none"
      >
        <div
          class="flex items-center gap-2 bg-cinema-night/60 backdrop-blur-md rounded-full px-4 py-1 border border-cinema-cloud/15"
        >
          <span class="font-body text-xs text-cinema-text-dim/60">
            {{ currentIndex + 1 }} / {{ queue.length }}
          </span>
          <span
            v-if="state === 'message'"
            class="font-body text-xs text-cinema-gold-dim/70"
          >
            • Message: {{ countdown }}s
          </span>
          <span v-else class="font-body text-xs text-cinema-gold-dim/70">
            • Now Playing
          </span>
        </div>
      </div>
    </Transition>
  </div>
</template>
