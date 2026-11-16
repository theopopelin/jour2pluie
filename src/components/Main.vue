<script setup>
import { ref, watch, onBeforeUnmount } from "vue";

import { imageToAscii } from "@/utils/imageToAscii.js";
import { useImageLoader } from "@/composables/useImageLoader.js";
import { useClipboard } from "@/composables/useClipboard.js";
import { useAsciiExport } from "@/composables/useAsciiExport.js";
import { useGifConverter } from "@/composables/useGifConverter.js";
import { useGifExport } from "@/composables/useGifExport.js";

import AsciiLogo from "@/components/AsciiLogo.vue";
import AsciiPlayer from "@/components/AsciiPlayer.vue";

const {
  imagePreview,
  image,
  error,
  loadImage,
} = useImageLoader();

const {
  frames,
  isProcessing,
  error: gifError,
  convertGif,
  clearFrames,
} = useGifConverter();

const ascii = ref("");
const asciiContainer = ref(null);

const scale = ref(150);
const scaleMode = ref("width");
const invert = ref(false);

const isGif = ref(false);
const selectedGif = ref(null);

const currentFrame = ref(0);
const isPlaying = ref(false);
const playbackSpeed = ref(1);

let playbackTimer = null;

const {
  copied,
  copyAscii,
  downloadAscii,
  downloadPng,
} = useAsciiExport(ascii, asciiContainer, error);

const {
  isExporting,
  error: gifExportError,
  downloadGif,
} = useGifExport(frames);

function getConversionOptions() {
  return {
    scale: scale.value,
    scaleMode: scaleMode.value,
    invert: invert.value,
  };
}

function stopPlayback() {
  isPlaying.value = false;

  if (playbackTimer !== null) {
    clearTimeout(playbackTimer);
    playbackTimer = null;
  }
}

function updateCurrentFrame() {
  const frame = frames.value[currentFrame.value];

  ascii.value = frame?.ascii || "";
}

function scheduleNextFrame() {
  if (!isPlaying.value || !frames.value.length) return;

  if (playbackTimer !== null) {
    clearTimeout(playbackTimer);
    playbackTimer = null;
  }

  const frame = frames.value[currentFrame.value];

  if (!frame) return;

  const delay = Math.max(
    20,
    (frame.delay || 100) / playbackSpeed.value
  );

  playbackTimer = setTimeout(() => {
    currentFrame.value =
      (currentFrame.value + 1) % frames.value.length;

    updateCurrentFrame();
    scheduleNextFrame();
  }, delay);
}

function play() {
  if (!frames.value.length || isPlaying.value) return;

  isPlaying.value = true;
  scheduleNextFrame();
}

function pause() {
  stopPlayback();
}

function togglePlayback() {
  if (isPlaying.value) {
    pause();
  } else {
    play();
  }
}

function seekFrame(event) {
  pause();

  currentFrame.value = Number(event.target.value);
  updateCurrentFrame();
}

function handleSpeedChange() {
  if (isPlaying.value) {
    scheduleNextFrame();
  }
}

function generate() {
  if (isGif.value) return;

  if (!image.value) {
    ascii.value = "";
    return;
  }

  try {
    ascii.value = imageToAscii(
      image.value,
      getConversionOptions()
    );

    error.value = "";
  } catch (err) {
    ascii.value = "";
    error.value = err.message;
  }
}

function loadMedia(file) {
  if (!file) return;

  if (file.type === "image/gif") {
    stopPlayback();

    isGif.value = true;
    selectedGif.value = file;
    currentFrame.value = 0;
    ascii.value = "";

    clearFrames();
    loadImage(file);

    convertGif(file, getConversionOptions());

    return;
  }

  stopPlayback();

  isGif.value = false;
  selectedGif.value = null;
  currentFrame.value = 0;

  clearFrames();
  loadImage(file);
}

useClipboard(loadMedia);

watch(image, generate);

watch(
  [scale, scaleMode, invert],
  () => {
    if (selectedGif.value) {
      stopPlayback();
      currentFrame.value = 0;

      convertGif(
        selectedGif.value,
        getConversionOptions()
      );
    } else {
      generate();
    }
  }
);

watch(frames, (newFrames) => {
  stopPlayback();

  currentFrame.value = 0;
  ascii.value = newFrames[0]?.ascii || "";

  if (newFrames.length) {
    play();
  }
});

function handleFile(event) {
  const file = event.target.files?.[0];

  if (!file) return;

  loadMedia(file);

  event.target.value = "";
}

onBeforeUnmount(() => {
  stopPlayback();
});
</script>

<template>
  <main class="app">
    <AsciiLogo />

    <section class="workspace">
      <div class="controls">
        <h2>Source</h2>

        <label class="upload">
          <input
            type="file"
            accept="image/*"
            @change="handleFile"
          />
          <span>+</span>
          <strong>Choose an image or GIF</strong>
          <small>PNG, JPG, WebP, GIF · 10 MB max</small>
          <small>Or paste with Ctrl + V</small>
        </label>

        <div v-if="!isGif && imagePreview" class="preview">
          <img
            :src="imagePreview"
            alt="Original image"
          />
        </div>

        <div class="setting">
          <label for="scale">
            {{ scaleMode === "height" ? "Height" : "Width" }}

            <span>
              {{ scale }}
              {{ scaleMode === "height" ? "lines" : "characters" }}
            </span>
          </label>

          <input
            id="scale"
            v-model.number="scale"
            type="range"
            min="40"
            max="200"
            step="10"
          />
        </div>

        <label class="checkbox">
          <input
            v-model="scaleMode"
            type="checkbox"
            true-value="height"
            false-value="width"
          />
          Scale to height
        </label>

        <label class="checkbox">
          <input
            v-model="invert"
            type="checkbox"
          />
          Invert brightness
        </label>

        <div v-if="isGif" class="gif-controls">
          <h3>GIF Controls</h3>

          <div class="player-actions">
            <button
              :disabled="!frames.length || isProcessing"
              @click="togglePlayback"
            >
              {{ isPlaying ? "Pause" : "Play" }}
            </button>

            <span>
              {{ frames.length ? currentFrame + 1 : 0 }}
              /
              {{ frames.length }}
            </span>
          </div>

          <input
            type="range"
            min="0"
            :max="Math.max(0, frames.length - 1)"
            :value="currentFrame"
            :disabled="!frames.length || isProcessing"
            @input="seekFrame"
          />

          <div class="setting">
            <label for="playback-speed">
              Playback speed
              <span>{{ playbackSpeed }}x</span>
            </label>

            <input
              id="playback-speed"
              v-model.number="playbackSpeed"
              type="range"
              min="0.25"
              max="2"
              step="0.25"
              @input="handleSpeedChange"
            />
          </div>
        </div>

        <p v-if="error || gifError || gifExportError" class="error">
          {{ gifExportError || gifError || error }}
        </p>
      </div>

      <div class="output">
        <div class="output-header">
          <h2>
            ASCII - {{ ascii.length.toLocaleString("fr-FR") }} characters
          </h2>

          <span>
            {{
              isProcessing
                ? "PROCESSING"
                : isExporting
                  ? "EXPORTING"
                  : ascii
                    ? "GENERATED"
                    : "WAITING"
            }}
          </span>
        </div>

        <div
          ref="asciiContainer"
          class="ascii-container"
        >
          <div v-if="isProcessing" class="empty">
            <span>⌘</span>
            <p>Converting GIF frames...</p>
          </div>

          <AsciiPlayer
            v-else-if="isGif"
            :ascii="ascii"
          />

          <pre v-else-if="ascii">{{ ascii }}</pre>

          <div v-else class="empty">
            <span>⌘</span>
            <p>Your ASCII art will appear here.</p>
          </div>
        </div>

        <div class="actions">
          <button
            :disabled="!ascii"
            @click="copyAscii"
          >
            {{ copied ? "Copied!" : "Copy" }}
          </button>

          <button
            :disabled="!ascii"
            @click="downloadAscii"
          >
            Download .txt
          </button>

          <button
            :disabled="!ascii || isProcessing || isExporting || (isGif && !frames.length)"
            @click="isGif ? downloadGif() : downloadPng()"
          >
            {{ isExporting ? "Exporting..." : isGif ? "Download .gif" : "Download .png" }}
          </button>
        </div>
      </div>
    </section>

    <footer>
      <span>JOUR2PLUIE © 2026</span>
    </footer>
  </main>
</template>
