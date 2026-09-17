const MAX_BYTES = 1.5 * 1024 * 1024
const MAX_EDGE = 512
const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif'

export const PROFILE_PHOTO_ACCEPT = ACCEPT

/**
 * Reads a local image file into a compressed data URL suitable for demo storage.
 */
export function readProfilePhoto(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    return Promise.reject(new Error('Choose an image file (JPEG, PNG or WebP).'))
  }
  if (file.size > MAX_BYTES * 3) {
    return Promise.reject(new Error('That image is too large. Try one under 4 MB.'))
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Could not read that image.'))
    reader.onload = () => {
      const raw = String(reader.result ?? '')
      compressDataUrl(raw)
        .then(resolve)
        .catch(() => {
          if (raw.length > MAX_BYTES * 1.4) {
            reject(new Error('That image is too large after reading. Try a smaller one.'))
          } else {
            resolve(raw)
          }
        })
    }
    reader.readAsDataURL(file)
  })
}

function compressDataUrl(dataUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height))
      const width = Math.max(1, Math.round(img.width * scale))
      const height = Math.max(1, Math.round(img.height * scale))
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Could not process that image.'))
        return
      }
      ctx.drawImage(img, 0, 0, width, height)
      resolve(canvas.toDataURL('image/jpeg', 0.85))
    }
    img.onerror = () => reject(new Error('Could not open that image.'))
    img.src = dataUrl
  })
}
