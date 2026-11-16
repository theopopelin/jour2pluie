<script setup>
defineProps({
  src: {
    type: String,
    required: true,
  },
});
</script>

<template>
  <div class="gif-preview">
    <img :src="src" alt="Original GIF animation" />
  </div>
</template>
