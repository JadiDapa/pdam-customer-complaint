import imageCompression from "browser-image-compression";

/**
 * Compress images in the browser BEFORE they are sent to the Server Action.
 *
 * Vercel serverless functions reject request bodies larger than ~4.5 MB
 * (FUNCTION_PAYLOAD_TOO_LARGE). Phone photos are often 3-10 MB each, so we
 * shrink them client-side first. Cloudinary still receives a valid image and
 * stores the final copy server-side.
 *
 * Non-image files are returned untouched.
 */
export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;

  try {
    const compressed = await imageCompression(file, {
      maxSizeMB: 1, // target per-image size
      maxWidthOrHeight: 1920, // plenty for evidence/complaint photos
      useWebWorker: true,
      initialQuality: 0.8,
    });
    // Preserve a sensible filename/extension.
    return new File([compressed], file.name, {
      type: compressed.type || file.type,
      lastModified: Date.now(),
    });
  } catch {
    // If compression fails for any reason, fall back to the original file.
    return file;
  }
}

export async function compressImages(files: File[]): Promise<File[]> {
  return Promise.all(files.map(compressImage));
}
