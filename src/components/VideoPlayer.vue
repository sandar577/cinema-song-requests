<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";

const props = defineProps({
  videoId: { type: String, required: true },
});

const emit = defineEmits(["ended", "error"]);

let player = null;
const playerId = computed(() => `yt-player-${props.videoId}`);

function destroyPlayer() {
  if (player) {
    try {
      player.destroy();
    } catch (e) {
      /* ignore */
    }
    player = null;
  }
}

function initPlayer() {
  destroyPlayer();

  if (!window.YT || !window.YT.Player) {
    console.error("[VideoPlayer] YT API not available");
    emit("error", "YT API not loaded");
    return;
  }

  try {
    player = new window.YT.Player(playerId.value, {
      videoId: props.videoId,
      playerVars: {
        autoplay: 1,
        mute: 1,
        // controls: 0,
        modestbranding: 1,
        rel: 0,
        fs: 0,
        playsinline: 1,
        enablejsapi: 1,
        origin: window.location.origin,
      },
      events: {
        onReady: (event) => {
          console.log("[VideoPlayer] ready:", props.videoId);
          // Try to unmute after muted autoplay starts — some browsers allow
          // unmuting once the video is already playing
          try {
            event.target.unMute();
            console.log("[VideoPlayer] unmuted after ready");
          } catch (e) {
            console.log("[VideoPlayer] unmute not allowed:", e);
          }
        },
        onStateChange: (event) => {
          console.log(
            `[VideoPlayer] state=${event.data} (video: ${props.videoId})`
          );
          // YT.PlayerState.PLAYING = 1 — try to unmute now that playback started
          if (event.data === 1) {
            try {
              event.target.unMute();
            } catch (e) {
              /* browser may block this */
            }
          }
          // YT.PlayerState.ENDED = 0
          if (event.data === 0) {
            console.log("[VideoPlayer] ✓ ended");
            emit("ended");
          }
        },
        onError: (event) => {
          console.error("[VideoPlayer] error:", event.data);
          emit("error", event.data);
        },
      },
    });
  } catch (e) {
    console.error("[VideoPlayer] Failed to create YT.Player:", e);
    emit("error", e);
  }
}

function loadApiAndInit() {
  if (window.YT && window.YT.Player) {
    initPlayer();
    return;
  }

  // Load the IFrame API script
  const tag = document.createElement("script");
  tag.src = "https://www.youtube.com/iframe_api";
  const firstScript = document.getElementsByTagName("script")[0];
  firstScript.parentNode.insertBefore(tag, firstScript);

  window.onYouTubeIframeAPIReady = () => {
    initPlayer();
  };
}

onMounted(() => {
  loadApiAndInit();
});

onBeforeUnmount(() => {
  destroyPlayer();
});
</script>

<template>
  <div class="w-full flex justify-center animate-fade-in">
    <div class="relative w-full max-w-[min(56vw,680px)]">
      <!-- Screen bezel -->
      <div
        class="relative rounded-sm overflow-hidden"
        style="
          border: 3px solid rgba(26, 22, 64, 0.5);
          box-shadow: 0 0 30px rgba(212, 168, 83, 0.06),
            0 0 80px rgba(0, 0, 0, 0.6), 0 0 4px rgba(212, 168, 83, 0.08),
            inset 0 0 0 1px rgba(255, 255, 255, 0.03);
        "
      >
        <!-- 16:9 container — YT.Player replaces this div with an iframe -->
        <div class="relative w-full" style="padding-bottom: 56.25%">
          <div :id="playerId" class="absolute inset-0 w-full h-full"></div>
        </div>
      </div>

      <!-- Aisle light glow below the screen -->
      <div
        class="absolute -bottom-3 left-1/2 -translate-x-1/2 w-2/3 h-6 bg-[radial-gradient(ellipse_at_center,rgba(212,168,83,0.04)_0%,transparent_70%)] pointer-events-none"
      ></div>
    </div>
  </div>
</template>
