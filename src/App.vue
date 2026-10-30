<script setup>
import { ref, watch, onBeforeUnmount } from "vue";
import { imageToAscii } from "./utils/imageToAscii.js";

const imagePreview = ref("");
const image = ref(null);
const ascii = ref("");
const width = ref(100);
const invert = ref(false);
const error = ref("");
const copied = ref(false);

let objectUrl = null;

function generate() {
  if (!image.value) return;

  try {
    ascii.value = imageToAscii(image.value, {
      width: width.value,
      invert: invert.value,
    });

    error.value = "";
  } catch (err) {
    ascii.value = "";
    error.value = err.message;
  }
}

watch([width, invert], generate);

function handleFile(event) {
  const file = event.target.files?.[0];

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    error.value = "Please select a valid image.";
    return;
  }

  if (file.size > 10 * 1024 * 1024) {
    error.value = "Maximum file size is 10 MB.";
    return;
  }

  if (objectUrl) {
    URL.revokeObjectURL(objectUrl);
  }

  image.value = null;
  ascii.value = "";
  error.value = "";

  objectUrl = URL.createObjectURL(file);
  imagePreview.value = objectUrl;

  const img = new Image();

  img.onload = () => {
    image.value = img;
    generate();
  };

  img.onerror = () => {
    error.value = "Unable to load this image.";
    imagePreview.value = "";
  };

  img.src = objectUrl;
}

async function copyAscii() {
  try {
    await navigator.clipboard.writeText(ascii.value);
    copied.value = true;

    setTimeout(() => {
      copied.value = false;
    }, 1500);
  } catch {
    error.value = "Unable to copy the ASCII output.";
  }
}

function downloadAscii() {
  if (!ascii.value) return;

  const blob = new Blob([ascii.value], {
    type: "text/plain;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "jour2pluie.txt";
  link.click();

  URL.revokeObjectURL(url);
}

onBeforeUnmount(() => {
  if (objectUrl) {
    URL.revokeObjectURL(objectUrl);
  }
});
</script>

<template>
  <main class="app">
<header>
  <pre class="ascii-logo"><span>
                .=##*-.                                                .-+##%%#*+-..                    :***=.                  :+##*-                                              
                -%%@%#:                                              .+#%@@%%%@@@%#+.                   -%@%*.                  =%@@%*.                                             
                .=##*-.                                             :+%@%%=:  .=#%@%*:                  -%@%*.                  :=##+:                                              
                .-===:.   :-=+***+==:   .:===-.    .-===-..====--===+*%%#+.    .=%@%#::===-:-+***+=-.   -%@%*. :===-     .-===- :-===:   .-=+***+=-:                                
                :#%@%+: .+%%@@@@@@@@%+. :=%@%*.    :*%@%*:-#%@%%%@@@+.         :*%@%#:=%@@%%%@@@@@@%#=  -%@%*..-%@%*     :+@@%*.-#@@#+..-#%@@@@@@@%%*:                              
                :#%@%+::#%@%#+-:-+*%@%#-:=%@%*.    :*%@%*:-#%@%%*+==:     .:--*#@@%#-.=%@@%#+-::=*%%%#-.-%@%*..-%@%*     :+@@%*.-#@@#+.=#@@#+-::=*%@%+:                             
                :#%@%+-=%@%#:     :*%@%+==%@%*.    :*%@%*:-#%@%+.      :+##%%@@@%#=.  =%@%*.     :+%@%*--%@%*..-%@%*     :+@@%*.-#@@#+-*%@@%#####%%@@#=                             
                :#%@%+-+@@%*.     .*%@%*==%@%*.    :*%@%*:-#%@#=.    :*%@%%##*+-.     =%@%*.     :+%@%#--%@%*..-%@%*     :+@@%*.-#@@#+-*@@%%%%%%%%%%%#+                             
                :#%@%+:-%@%#-.    :#%@%+-=%@%#:    -#%@%*:-#%@#=.   :+%@%#-.          =%@%#-.    :*%@%*:-%@%*..-%@%*.    =#@@%*.-#@@#+:+%@%*-::::-++-:. -+*+-.                      
                :#%@%+::*%@@%#+=+*%@@%*: :#%@%#+==*%@@@%*:-#%@#=.   -*@@%%##########*:=%@@@%*+==*%@@%#:.-%@%*. -#%@%#+==*%@@@%*.-#@@#+.-*%@%%+==+#%@%+=+%@@@%=                      
                :#%@%+:  -+%%@@@@@%%*-.   :+#%@@@@%#*%@%*:-#%@#=.   -*@@@@@@@@@@@@@%#:=%@%%*%%@@@@%#+:  -%@%*. .:+#%@@@%%**@@%*.-#@@#+. :=#%@@@@@@%*=..=#%@@#=                      
                :#%@%+:     .:=+=-.           :-:.                                    =%@%*. :-+=:                 .:-:.                   .:-==-:.     .-=-.                       
              --+%%@%+.                                                               =%@%*.                                                                                        
             .*%@@@%*:                                                                =%@%*.                                                                                        
              --==-:                                                                  :===:                         
  </span></pre>
</header>

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
        </label>

        <div v-if="imagePreview" class="preview">
          <img :src="imagePreview" alt="Original image" />
        </div>

        <div class="setting">
          <label for="width">
            Width
            <span>{{ width }} characters</span>
          </label>

          <input
            id="width"
            v-model.number="width"
            type="range"
            min="40"
            max="180"
            step="10"
          />
        </div>

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

        <div class="ascii-container">
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
        </div>
      </div>
    </section>

    <footer>
      <span>JOUR2PLUIE © 2026</span>
    </footer>
  </main>
</template>
