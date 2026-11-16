import { ref, onBeforeUnmount } from "vue";
import { parseGIF, decompressFrames } from "gifuct-js";
import { imageToAscii } from "@/utils/imageToAscii.js";

export function useGifConverter() {
  const frames = ref([]);
  const isProcessing = ref(false);
  const error = ref("");

  let conversionId = 0;

  async function convertGif(file, options = {}) {
    const currentConversion = ++conversionId;

    frames.value = [];
    error.value = "";
    isProcessing.value = true;

    try {
      if (!file || file.type !== "image/gif") {
        throw new Error("Please select a valid GIF.");
      }

      if (file.size > 10 * 1024 * 1024) {
        throw new Error("Maximum file size is 10 MB.");
      }

      const buffer = await file.arrayBuffer();

      if (currentConversion !== conversionId) return;

      const gif = parseGIF(buffer);
      const decodedFrames = decompressFrames(gif, true);

      if (!decodedFrames.length) {
        throw new Error("This GIF contains no frames.");
      }

      const width = gif.lsd.width;
      const height = gif.lsd.height;

      if (!width || !height) {
        throw new Error("Invalid GIF dimensions.");
      }

      // Canvas used to reconstruct the complete animation.
      const canvas = document.createElement("canvas");

      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext("2d", {
        willReadFrequently: true,
      });

      if (!context) {
        throw new Error("Unable to create canvas context.");
      }

      context.clearRect(0, 0, width, height);

      const convertedFrames = [];

      let previousFrame = null;
      let previousRestoreData = null;

      for (const frame of decodedFrames) {
        if (currentConversion !== conversionId) return;

        // Apply the previous frame's disposal method.
        if (previousFrame) {
          if (previousFrame.disposalType === 2) {
            const { left, top, width, height } =
              previousFrame.dims;

            context.clearRect(left, top, width, height);
          } else if (
            previousFrame.disposalType === 3 &&
            previousRestoreData
          ) {
            context.putImageData(previousRestoreData, 0, 0);
          }
        }

        // Save the canvas before drawing frames using disposal 3.
        const restoreData =
          frame.disposalType === 3
            ? context.getImageData(0, 0, width, height)
            : null;

        const { left, top, width: frameWidth, height: frameHeight } =
          frame.dims;

        const imageData = new ImageData(
          frame.patch,
          frameWidth,
          frameHeight
        );

        context.putImageData(imageData, left, top);

        // Convert the complete reconstructed frame.
        const ascii = imageToAscii(canvas, options);

        convertedFrames.push({
          ascii,
          delay: frame.delay > 0 ? frame.delay : 100,
        });

        previousFrame = frame;
        previousRestoreData = restoreData;
      }

      if (currentConversion !== conversionId) return;

      frames.value = convertedFrames;
    } catch (err) {
      if (currentConversion !== conversionId) return;

      frames.value = [];
      error.value = err.message || "Unable to convert this GIF.";
    } finally {
      if (currentConversion === conversionId) {
        isProcessing.value = false;
      }
    }
  }

  function clearFrames() {
    conversionId++;
    frames.value = [];
    error.value = "";
    isProcessing.value = false;
  }

  onBeforeUnmount(() => {
    conversionId++;
  });

  return {
    frames,
    isProcessing,
    error,
    convertGif,
    clearFrames,
  };
}
