const DEFAULT_CHARACTERS = "@%#*+=-:. ";

export function imageToAscii(
  image,
  {
    scale = 100,
    scaleMode = "width",
    characters = DEFAULT_CHARACTERS,
    invert = false,
  } = {}
) {
  if (!image || !image.width || !image.height) {
    throw new Error("Invalid image.");
  }

  if (!characters || characters.length < 2) {
    throw new Error("At least two characters are required.");
  }

  if (!["width", "height"].includes(scaleMode)) {
    throw new Error("Invalid scale mode.");
  }

  const value = Math.max(1, Math.floor(scale));
  const aspectRatio = image.width / image.height;

  // Use the same resolution calculation for both modes.
  // The mode only determines which dimension is used as reference.
  const referenceScale = value;

  const columns = Math.max(
    1,
    Math.round(
      scaleMode === "width"
        ? referenceScale
        : referenceScale * aspectRatio
    )
  );

  const rows = Math.max(
    1,
    Math.round(
      scaleMode === "height"
        ? referenceScale
        : referenceScale / aspectRatio
    )
  );

  // Compensate for the proportions of monospace characters.
  const adjustedRows = Math.max(1, Math.round(rows * 0.5));

  const canvas = document.createElement("canvas");
  canvas.width = columns;
  canvas.height = adjustedRows;

  const context = canvas.getContext("2d", {
    willReadFrequently: true,
  });

  if (!context) {
    throw new Error("Unable to create canvas context.");
  }

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, columns, adjustedRows);
  context.drawImage(image, 0, 0, columns, adjustedRows);

  const { data } = context.getImageData(
    0,
    0,
    columns,
    adjustedRows
  );

  const output = [];

  for (let y = 0; y < adjustedRows; y++) {
    let line = "";

    for (let x = 0; x < columns; x++) {
      const index = (y * columns + x) * 4;

      const red = data[index];
      const green = data[index + 1];
      const blue = data[index + 2];
      const alpha = data[index + 3] / 255;

      const brightness =
        (0.2126 * red +
          0.7152 * green +
          0.0722 * blue) *
          alpha +
        255 * (1 - alpha);

      const normalizedBrightness = brightness / 255;

      const brightnessValue = invert
        ? 1 - normalizedBrightness
        : normalizedBrightness;

      const characterIndex = Math.min(
        characters.length - 1,
        Math.floor(brightnessValue * characters.length)
      );

      line += characters[characterIndex];
    }

    output.push(line);
  }

  return output.join("\n");
}
