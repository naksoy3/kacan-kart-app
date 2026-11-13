const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const MAX_AVATAR_DIMENSION = 1920;

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const imageUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(imageUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(imageUrl);
      reject(new Error("Image could not be decoded."));
    };
    image.src = imageUrl;
  });
}

function canvasToJpeg(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Image could not be compressed."));
    }, "image/jpeg", quality);
  });
}

export async function prepareAvatarImage(file: File): Promise<File> {
  if (file.size <= MAX_AVATAR_BYTES) return file;

  const image = await loadImage(file);
  const initialScale = Math.min(1, MAX_AVATAR_DIMENSION / Math.max(image.width, image.height));
  let width = Math.round(image.width * initialScale);
  let height = Math.round(image.height * initialScale);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is unavailable.");

  while (true) {
    canvas.width = width;
    canvas.height = height;
    context.drawImage(image, 0, 0, width, height);

    for (const quality of [0.82, 0.72, 0.62, 0.52, 0.42]) {
      const compressed = await canvasToJpeg(canvas, quality);
      if (compressed.size <= MAX_AVATAR_BYTES) {
        const filename = file.name.replace(/\.[^.]+$/, "") || "avatar";
        return new File([compressed], `${filename}.jpg`, {
          type: "image/jpeg",
          lastModified: file.lastModified,
        });
      }
    }

    if (width === 1 && height === 1) break;
    width = Math.max(1, Math.floor(width * 0.8));
    height = Math.max(1, Math.floor(height * 0.8));
  }

  throw new Error("Image could not be compressed below the upload limit.");
}