<script setup>
import { ref, computed, watch, onBeforeUnmount } from "vue";

const props = defineProps({
  frames: {
    type: Array,
    default: () => [],
  },
  autoplay: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["frame-change"]);

const currentFrame = ref(0);
const isPlaying = ref(false);

let timer = null;

const totalFrames = computed(() => props.frames.length);

const activeFrame = computed(() => {
  return props.frames[currentFrame.value] || null;
});

const progress = computed(() => {
  if (!totalFrames.value) return 0;

  return ((currentFrame.value + 1) / totalFrames.value) * 100;
});

function stopTimer() {
  if (timer !== null) {
    clearTimeout(timer);
    timer = null;
  }
}

function pause() {
  isPlaying.value = false;
  stopTimer();
}

function scheduleNextFrame() {
  stopTimer();

  if (!isPlaying.value || !activeFrame.value) return;

  const delay = Math.max(20, activeFrame.value.delay || 100);

  timer = setTimeout(() => {
    currentFrame.value =
      (currentFrame.value + 1) % totalFrames.value;
  }, delay);
}

function play() {
  if (!totalFrames.value || isPlaying.value) return;

  isPlaying.value = true;
  scheduleNextFrame();
}

function togglePlayback() {
  if (isPlaying.value) {
    pause();
  } else {
    play();
  }
}

function seek(event) {
  pause();
  currentFrame.value = Number(event.target.value);
}

watch(currentFrame, () => {
  emit("frame-change", activeFrame.value?.ascii || "");

  if (isPlaying.value) {
    scheduleNextFrame();
  }
});

watch(
  () => props.frames,
  () => {
    pause();
    currentFrame.value = 0;

    emit("frame-change", props.frames[0]?.ascii || "");

    if (props.autoplay && props.frames.length) {
      play();
    }
  }
);

onBeforeUnmount(() => {
  stopTimer();
});
</script>

<template>
  <div class="ascii-player">
    <div class="ascii-player-output">
      <pre v-if="activeFrame">{{ activeFrame.ascii }}</pre>

      <div v-else class="empty">
        <span>⌘</span>
        <p>Your ASCII animation will appear here.</p>
      </div>
    </div>

    <div v-if="totalFrames" class="player-controls">
      <div class="player-actions">
        <button @click="togglePlayback">
          {{ isPlaying ? "Pause" : "Play" }}
        </button>

        <span>
          {{ currentFrame + 1 }} / {{ totalFrames }}
        </span>
      </div>

      <input
        type="range"
        min="0"
        :max="totalFrames - 1"
        :value="currentFrame"
        @input="seek"
      />

      <div class="player-progress">
        <div :style="{ width: `${progress}%` }"></div>
      </div>
    </div>
  </div>
</template>
