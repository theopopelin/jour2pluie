import { onMounted, onBeforeUnmount } from "vue";

export function useClipboard(onImagePaste) {
  function handlePaste(event) {
    const items = event.clipboardData?.items;

    if (!items) return;

    for (const item of items) {
      if (!item.type.startsWith("image/")) continue;

      const file = item.getAsFile();

      if (!file) continue;

      event.preventDefault();
      onImagePaste(file);
      return;
    }
  }

  onMounted(() => {
    window.addEventListener("paste", handlePaste);
  });

  onBeforeUnmount(() => {
    window.removeEventListener("paste", handlePaste);
  });
}
