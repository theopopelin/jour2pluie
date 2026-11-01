import { ref, onBeforeUnmount } from "vue";

export function useImageLoader() {
  const imagePreview = ref("");
  const image = ref(null);
  const error = ref("");

  let objectUrl = null;

  function loadImage(file) {
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
    imagePreview.value = "";
    error.value = "";

    objectUrl = URL.createObjectURL(file);
    const currentObjectUrl = objectUrl;

    imagePreview.value = currentObjectUrl;

    const img = new Image();

    img.onload = () => {
      if (objectUrl !== currentObjectUrl) return;

      image.value = img;
    };

    img.onerror = () => {
      if (objectUrl !== currentObjectUrl) return;

      error.value = "Unable to load this image.";
      imagePreview.value = "";

      URL.revokeObjectURL(currentObjectUrl);
      objectUrl = null;
    };

    img.src = currentObjectUrl;
  }

  onBeforeUnmount(() => {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
    }
  });

  return {
    imagePreview,
    image,
    error,
    loadImage,
  };
}
