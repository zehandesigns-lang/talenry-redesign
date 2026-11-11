const MIN_SIZE = 300

/** Center-crops an uploaded image into a 300×300 JPEG data URL. */
export async function toSquareAvatar(file: File): Promise<string> {
  let image: ImageBitmap
  try {
    image = await createImageBitmap(file)
  } catch {
    throw new Error("I couldn't open that file")
  }

  const { width, height } = image
  if (width < MIN_SIZE || height < MIN_SIZE) {
    image.close()
    throw new Error(`I need at least ${MIN_SIZE}×${MIN_SIZE}`)
  }

  const side = Math.min(width, height)
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = MIN_SIZE
  canvas
    .getContext('2d')!
    .drawImage(image, (width - side) / 2, (height - side) / 2, side, side, 0, 0, MIN_SIZE, MIN_SIZE)
  image.close()
  return canvas.toDataURL('image/jpeg', 0.9)
}
