<script setup>
import { ref, computed, onMounted } from 'vue'
import { validateYoutubeUrl } from '@/composables/useYoutubeId'
import { submitRequest, getRemainingSlots } from '@/lib/api'
import { inject } from 'vue'

const toast = inject('toast')

const fromName = ref('')
const toName = ref('')
const youtubeUrl = ref('')
const message = ref('')
const honeypot = ref('')
const submitting = ref(false)
const remainingSlots = ref(null)
const submitted = ref(false)

const messageMax = 300
const messageRemaining = computed(() => messageMax - message.value.length)

const formValid = computed(() => {
  if (!fromName.value.trim()) return false
  if (!toName.value.trim()) return false
  if (!youtubeUrl.value.trim()) return false
  if (!message.value.trim()) return false

  const result = validateYoutubeUrl(youtubeUrl.value)
  return result.valid
})

const youtubeError = computed(() => {
  if (!youtubeUrl.value.trim()) return null
  const result = validateYoutubeUrl(youtubeUrl.value)
  return result.valid ? null : result.error
})

async function fetchSlots() {
  const result = await getRemainingSlots()
  if (result.success) {
    remainingSlots.value = result.data.remaining
  }
}

async function handleSubmit() {
  if (!formValid.value || submitting.value) return

  submitting.value = true

  try {
    const result = await submitRequest({
      fromName: fromName.value.trim(),
      toName: toName.value.trim(),
      youtubeUrl: youtubeUrl.value.trim(),
      message: message.value.trim(),
      honeypot: honeypot.value,
    })

    if (result.success) {
      submitted.value = true
      fromName.value = ''
      toName.value = ''
      youtubeUrl.value = ''
      message.value = ''
      honeypot.value = ''
      await fetchSlots()
      toast?.value?.show('Song request submitted! 🎵 Your dedication will appear on the projector.', 'success')
    } else {
      toast?.value?.show(result.error || 'Sorry, something went wrong.', 'error')
    }
  } catch (e) {
    toast?.value?.show('Network error. Please check your connection and try again.', 'error')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchSlots()
})
</script>

<template>
  <div class="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-8 md:py-12">
    <div class="w-full max-w-lg">
      <!-- Card -->
      <div class="bg-cinema-night/60 backdrop-blur-sm border border-cinema-cloud/30 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/50 animate-fade-in-up">
        <!-- Heading -->
        <h1 class="font-display text-2xl sm:text-3xl md:text-4xl text-center text-cinema-gold mb-2">
          Request a Song
        </h1>
        <p class="text-cinema-text-dim text-center text-sm mb-8 font-body">
          Dedicate a song to someone special
        </p>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-5">
          <!-- From Name -->
          <div>
            <label for="from-name" class="block text-sm font-body uppercase tracking-wider text-cinema-text-dim mb-1.5">
              Your Name
            </label>
            <input
              id="from-name"
              v-model.trim="fromName"
              required
              maxlength="100"
              class="w-full bg-cinema-midnight border border-cinema-cloud/40 rounded-lg px-4 py-3 text-cinema-text font-body placeholder:text-cinema-text-dim/50 focus:border-cinema-gold focus:ring-1 focus:ring-cinema-gold/30 outline-none transition-all duration-300"
              placeholder="Enter your name"
            />
          </div>

          <!-- To Name -->
          <div>
            <label for="to-name" class="block text-sm font-body uppercase tracking-wider text-cinema-text-dim mb-1.5">
              For Whom
            </label>
            <input
              id="to-name"
              v-model.trim="toName"
              required
              maxlength="100"
              class="w-full bg-cinema-midnight border border-cinema-cloud/40 rounded-lg px-4 py-3 text-cinema-text font-body placeholder:text-cinema-text-dim/50 focus:border-cinema-gold focus:ring-1 focus:ring-cinema-gold/30 outline-none transition-all duration-300"
              placeholder="Your beloved one's name"
            />
          </div>

          <!-- YouTube URL -->
          <div>
            <label for="youtube-url" class="block text-sm font-body uppercase tracking-wider text-cinema-text-dim mb-1.5">
              YouTube URL
            </label>
            <input
              id="youtube-url"
              v-model.trim="youtubeUrl"
              required
              type="url"
              class="w-full bg-cinema-midnight border rounded-lg px-4 py-3 text-cinema-text font-body placeholder:text-cinema-text-dim/50 focus:ring-1 outline-none transition-all duration-300"
              :class="youtubeError
                ? 'border-cinema-neon focus:border-cinema-neon focus:ring-cinema-neon/30'
                : 'border-cinema-cloud/40 focus:border-cinema-gold focus:ring-cinema-gold/30'"
              placeholder="https://youtube.com/watch?v=..."
            />
            <p v-if="youtubeError" class="text-cinema-neon text-xs mt-1 font-body">
              {{ youtubeError }}
            </p>
          </div>

          <!-- Message -->
          <div>
            <label for="message" class="block text-sm font-body uppercase tracking-wider text-cinema-text-dim mb-1.5">
              Your Message
            </label>
            <textarea
              id="message"
              v-model="message"
              required
              rows="3"
              :maxlength="messageMax"
              class="w-full bg-cinema-midnight border border-cinema-cloud/40 rounded-lg px-4 py-3 text-cinema-text font-body placeholder:text-cinema-text-dim/50 focus:border-cinema-gold focus:ring-1 focus:ring-cinema-gold/30 outline-none transition-all duration-300 resize-none"
              placeholder="Why this song? What do you want to say?"
            ></textarea>
            <div class="flex justify-between mt-1">
              <span class="text-xs text-cinema-text-dim/50 font-body">
                {{ messageRemaining }} characters left
              </span>
            </div>
          </div>

          <!-- Honeypot (hidden from humans, filled by bots) -->
          <input
            v-model="honeypot"
            name="website"
            type="text"
            style="opacity:0;position:absolute;left:-9999px"
            tabindex="-1"
            autocomplete="off"
          />

          <!-- Submit -->
          <button
            type="submit"
            :disabled="!formValid || submitting"
            class="w-full font-body font-semibold py-3.5 rounded-lg transition-all duration-300 uppercase tracking-widest text-sm disabled:opacity-30 disabled:cursor-not-allowed"
            :class="formValid && !submitting
              ? 'bg-cinema-red hover:bg-cinema-red-bright text-white hover:shadow-lg hover:shadow-cinema-red/20 active:scale-[0.98]'
              : 'bg-cinema-cloud/40 text-cinema-text-dim'"
          >
            <span v-if="submitting" class="flex items-center justify-center gap-2">
              <span class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              Submitting...
            </span>
            <span v-else>🎵 Dedicate This Song</span>
          </button>
        </form>
      </div>

      <!-- Daily counter -->
      <Transition name="toast-slide">
        <p v-if="remainingSlots !== null" class="text-center text-cinema-text-dim/50 text-xs mt-6 font-body">
          {{ remainingSlots }} of 10 song requests remaining today
        </p>
      </Transition>
    </div>
  </div>
</template>
