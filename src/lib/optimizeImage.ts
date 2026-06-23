export interface OptimizedImage {
  blob: Blob
  /** File extension to use ('webp', or 'png' if the browser can't encode webp). */
  ext: string
}

function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Could not read the file.'))
    reader.readAsDataURL(file)
  })
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('That file does not look like an image.'))
    img.src = src
  })
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality))
}

/**
 * Resize an uploaded image so its longest edge is at most `maxEdge` and
 * re-encode it as WebP (falling back to PNG if the browser can't make WebP).
 * Mirrors the optimization used for the original catalog photos.
 */
export async function optimizeImage(file: File, maxEdge = 1200, quality = 0.82): Promise<OptimizedImage> {
  const img = await loadImage(await readAsDataURL(file))
  let { width, height } = img
  if (Math.max(width, height) > maxEdge) {
    const scale = maxEdge / Math.max(width, height)
    width = Math.round(width * scale)
    height = Math.round(height * scale)
  }

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Could not process the image.')
  ctx.drawImage(img, 0, 0, width, height)

  const webp = await toBlob(canvas, 'image/webp', quality)
  if (webp && webp.type === 'image/webp') return { blob: webp, ext: 'webp' }

  const png = await toBlob(canvas, 'image/png')
  if (!png) throw new Error('Could not encode the image.')
  return { blob: png, ext: 'png' }
}
