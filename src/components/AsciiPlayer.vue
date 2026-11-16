<script setup>
defineProps({
  ascii: {
    type: String,
    default: "",
  },
});
</script>

<template>
  <div class="ascii-player">
    <pre v-if="ascii">{{ ascii }}</pre>

    <div v-else class="empty">
      <span>⌘</span>
      <p>Your ASCII animation will appear here.</p>
    </div>
  </div>
</template>
