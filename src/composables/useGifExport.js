import { ref, onBeforeUnmount } from "vue";
import { GIFEncoder, quantize, applyPalette } from "gifenc";

export function useGifExport(frames, options = {}) {
  const isExporting = ref(false);
  const error = ref("");

  const {
    fontFamily = '"DM Mono", monospace',
    fontSize = 8,
    lineHeight = 1,
    padding = 24,
    foreground = "#c5ff65",
    background = "#090b09",
  } = options;

  let exportId = 0;

  function createFrameCanvas(ascii) {
    const lines = ascii.split("\n");

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Unable to create canvas context.");
    }

    context.font = `${fontSize}px ${fontFamily}`;

    const characterWidth = context.measureText("M").width;
    const maxCharacters = Math.max(
      1,
      ...lines.map((line) => line.length)
    );

    const width = Math.ceil(
      maxCharacters * characterWidth + padding * 2
    );

    const height = Math.ceil(
      lines.length * fontSize * lineHeight + padding * 2
    );

    canvas.width = width;
    canvas.height = height;

    context.font = `${fontSize}px ${fontFamily}`;
    context.textBaseline = "top";

    context.fillStyle = background;
    context.fillRect(0, 0, width, height);

    context.fillStyle = foreground;

    lines.forEach((line, index) => {
      context.fillText(
        line,
        padding,
        padding + index * fontSize * lineHeight
      );
    });

    return canvas;
  }

  function downloadBlob(blob) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "jour2pluie.gif";
    link.click();

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  }

  async function downloadGif() {
    if (!frames.value?.length || isExporting.value) return;

    const currentExport = ++exportId;

    isExporting.value = true;
    error.value = "";

    try {
      await document.fonts.ready;

      const encoder = GIFEncoder();

      for (const frame of frames.value) {
        if (currentExport !== exportId) return;

        const canvas = createFrameCanvas(frame.ascii);
        const context = canvas.getContext("2d", {
          willReadFrequently: true,
        });

        if (!context) {
          throw new Error("Unable to read canvas.");
        }

        const imageData = context.getImageData(
          0,
          0,
          canvas.width,
          canvas.height
        );

        const palette = quantize(imageData.data, 256);
        const indexed = applyPalette(imageData.data, palette);

        encoder.writeFrame(indexed, canvas.width, canvas.height, {
          palette,
          delay: Math.max(20, frame.delay || 100),
        });
      }

      if (currentExport !== exportId) return;

      encoder.finish();

      const blob = new Blob([encoder.bytes()], {
        type: "image/gif",
      });

      downloadBlob(blob);
    } catch (err) {
      if (currentExport === exportId) {
        error.value = err.message || "Unable to export GIF.";
      }
    } finally {
      if (currentExport === exportId) {
        isExporting.value = false;
      }
    }
  }

  onBeforeUnmount(() => {
    exportId++;
  });

  return {
    isExporting,
    error,
    downloadGif,
  };
}
