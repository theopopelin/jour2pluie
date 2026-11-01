import { ref, onBeforeUnmount } from "vue";

export function useAsciiExport(ascii, asciiContainer, error) {
  const copied = ref(false);

  let copyTimeout = null;

  function downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;
    link.click();

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  }

  async function copyAscii() {
    if (!ascii.value) return;

    try {
      await navigator.clipboard.writeText(ascii.value);

      copied.value = true;

      clearTimeout(copyTimeout);

      copyTimeout = setTimeout(() => {
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

    downloadFile(blob, "jour2pluie.txt");
  }

  async function downloadPng() {
    if (!ascii.value) return;

    try {
      await document.fonts.ready;

      const container = asciiContainer.value;
      const pre = container?.querySelector("pre");

      if (!container || !pre) {
        throw new Error("Unable to find the ASCII output.");
      }

      const style = getComputedStyle(pre);
      const containerStyle = getComputedStyle(container);

      const lines = ascii.value.split("\n");

      const paddingLeft = parseFloat(style.paddingLeft);
      const paddingRight = parseFloat(style.paddingRight);
      const paddingTop = parseFloat(style.paddingTop);
      const paddingBottom = parseFloat(style.paddingBottom);

      const lineHeight = parseFloat(style.lineHeight);

      // Measure the width of one monospace character.
      const measureCanvas = document.createElement("canvas");
      const measureContext = measureCanvas.getContext("2d");

      if (!measureContext) {
        throw new Error("Unable to measure the font.");
      }

      measureContext.font = style.font;

      const characterWidth = measureContext.measureText("M").width;

      const maxCharacters = Math.max(
        ...lines.map((line) => line.length)
      );

      const width = Math.ceil(
        maxCharacters * characterWidth +
        paddingLeft +
        paddingRight
      );

      const height = Math.ceil(
        lines.length * lineHeight +
        paddingTop +
        paddingBottom
      );

      const ratio = 2;

      const canvas = document.createElement("canvas");
      canvas.width = width * ratio;
      canvas.height = height * ratio;

      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("Unable to create canvas context.");
      }

      context.scale(ratio, ratio);

      context.fillStyle = containerStyle.backgroundColor;
      context.fillRect(0, 0, width, height);

      context.fillStyle = style.color;
      context.font = style.font;
      context.textBaseline = "top";

      lines.forEach((line, index) => {
        context.fillText(
          line,
          paddingLeft,
          paddingTop + index * lineHeight
        );
      });

      canvas.toBlob((blob) => {
        if (!blob) {
          error.value = "Unable to generate the PNG.";
          return;
        }

        downloadFile(blob, "jour2pluie.png");
      }, "image/png");
    } catch (err) {
      error.value = err.message;
    }
  }

  onBeforeUnmount(() => {
    clearTimeout(copyTimeout);
  });

  return {
    copied,
    copyAscii,
    downloadAscii,
    downloadPng,
  };
}
