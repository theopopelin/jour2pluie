const DEFAULT_CHARACTERS = "@%#*+=-:. ";

export function imageToAscii(
  image,
  {
    width = 100,
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

  const columns = Math.max(1, Math.floor(width));

  // Compensation des proportions des caractères monospace.
  const rows = Math.max(
    1,
    Math.round((image.height / image.width) * columns * 0.5)
  );

  const canvas = document.createElement("canvas");
  canvas.width = columns;
  canvas.height = rows;

  const context = canvas.getContext("2d", {
    willReadFrequently: true,
  });

  if (!context) {
    throw new Error("Unable to create canvas context.");
  }

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, columns, rows);
  context.drawImage(image, 0, 0, columns, rows);

  const { data } = context.getImageData(
    0,
    0,
    columns,
    rows
  );

  const output = [];

  for (let y = 0; y < rows; y++) {
    let line = "";

    for (let x = 0; x < columns; x++) {
      const index = (y * columns + x) * 4;

      const red = data[index];
      const green = data[index + 1];
      const blue = data[index + 2];
      const alpha = data[index + 3] / 255;

      // Calcul de luminosité perceptuelle.
      const brightness =
        (0.2126 * red +
          0.7152 * green +
          0.0722 * blue) *
          alpha +
        255 * (1 - alpha);

      const normalizedBrightness = brightness / 255;

      const value = invert
        ? 1 - normalizedBrightness
        : normalizedBrightness;

      const characterIndex = Math.min(
        characters.length - 1,
        Math.floor(value * characters.length)
      );

      line += characters[characterIndex];
    }

    output.push(line);
  }

  return output.join("\n");
}
