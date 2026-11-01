<script setup>
import { ref, watch } from "vue";
import { imageToAscii } from "@/utils/imageToAscii.js";
import { useImageLoader } from "@/composables/useImageLoader.js";
import { useClipboard } from "@/composables/useClipboard.js";
import { useAsciiExport } from "@/composables/useAsciiExport.js";
import AsciiLogo from "@/components/AsciiLogo.vue";

const {
  imagePreview,
  image,
  error,
  loadImage,
} = useImageLoader();

useClipboard(loadImage);

const ascii = ref("");
const asciiContainer = ref(null);

const scale = ref(150);
const scaleMode = ref("width");
const invert = ref(false);

const {
  copied,
  copyAscii,
  downloadAscii,
  downloadPng,
} = useAsciiExport(ascii, asciiContainer, error);

function generate() {
  if (!image.value) return;

  try {
    ascii.value = imageToAscii(image.value, {
      scale: scale.value,
      scaleMode: scaleMode.value,
      invert: invert.value,
    });

    error.value = "";
  } catch (err) {
    ascii.value = "";
    error.value = err.message;
  }
}

watch([image, scale, scaleMode, invert], generate);

function handleFile(event) {
  const file = event.target.files?.[0];

  if (!file) return;

  loadImage(file);

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
          <strong>Choose an image</strong>
          <small>PNG, JPG, WebP · 10 MB max</small>
          <small>Or paste with Ctrl + V</small>
        </label>

        <div v-if="imagePreview" class="preview">
          <img :src="imagePreview" alt="Original image" />
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
          <input v-model="invert" type="checkbox" />
          Invert brightness
        </label>

        <p v-if="error" class="error">{{ error }}</p>
      </div>

      <div class="output">
        <div class="output-header">
          <h2>ASCII</h2>
          <span>{{ ascii ? "GENERATED" : "WAITING" }}</span>
        </div>

        <div ref="asciiContainer" class="ascii-container">
          <pre v-if="ascii">{{ ascii }}</pre>

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
