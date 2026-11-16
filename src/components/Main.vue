<script setup>
import { ref, watch } from "vue";

import { imageToAscii } from "@/utils/imageToAscii.js";
import { useImageLoader } from "@/composables/useImageLoader.js";
import { useClipboard } from "@/composables/useClipboard.js";
import { useAsciiExport } from "@/composables/useAsciiExport.js";
import { useGifConverter } from "@/composables/useGifConverter.js";

import AsciiLogo from "@/components/AsciiLogo.vue";
import GifPreview from "@/components/GifPreview.vue";
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

const {
  copied,
  copyAscii,
  downloadAscii,
  downloadPng,
} = useAsciiExport(ascii, asciiContainer, error);

function getConversionOptions() {
  return {
    scale: scale.value,
    scaleMode: scaleMode.value,
    invert: invert.value,
  };
}

// Handle static images.
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

// Handle the current GIF frame.
function handleGifFrameChange(value) {
  ascii.value = value;
  error.value = "";
}

// Handle image and GIF uploads.
function loadMedia(file) {
  if (!file) return;

  if (file.type === "image/gif") {
    isGif.value = true;
    selectedGif.value = file;

    ascii.value = "";

    clearFrames();
    loadImage(file);

    convertGif(file, getConversionOptions());

    return;
  }

  isGif.value = false;
  selectedGif.value = null;

  clearFrames();

  loadImage(file);
}

// Reuse the same handler for clipboard images.
useClipboard(loadMedia);

// Static image conversion.
watch(image, generate);

// Regenerate whenever conversion settings change.
watch(
  [scale, scaleMode, invert],
  () => {
    if (selectedGif.value) {
      convertGif(
        selectedGif.value,
        getConversionOptions()
      );
    } else {
      generate();
    }
  }
);

function handleFile(event) {
  const file = event.target.files?.[0];

  if (!file) return;

  loadMedia(file);

  event.target.value = "";
}
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

        <GifPreview
          v-if="isGif && imagePreview"
          :src="imagePreview"
        />

        <div v-else-if="imagePreview" class="preview">
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

        <p v-if="error || gifError" class="error">
          {{ gifError || error }}
        </p>
      </div>

      <div class="output">
        <div class="output-header">
          <h2>
            ASCII - {{ ascii.length.toLocaleString("fr-FR") }} characters
          </h2>

          <span>
            {{ isProcessing ? "PROCESSING" : ascii ? "GENERATED" : "WAITING" }}
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
            :frames="frames"
            :autoplay="true"
            @frame-change="handleGifFrameChange"
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
            :disabled="!ascii"
            @click="downloadPng"
          >
            Download .png
          </button>
        </div>
      </div>
    </section>

    <footer>
      <span>JOUR2PLUIE © 2026</span>
    </footer>
  </main>
</template>
