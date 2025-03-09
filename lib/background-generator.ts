export function generateGrassBackground(width: number, height: number): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    // Create an off-screen canvas
    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext("2d")
    
    if (!ctx) {
      reject(new Error("Could not get canvas context"))
      return
    }

    // Create a pattern from a smaller grass texture
    const baseGrass = new Image()
    baseGrass.crossOrigin = "anonymous" // Enable CORS for the image
    baseGrass.src = "/grass.png"
    
    baseGrass.onload = () => {
      try {
        // Create a repeating pattern
        const pattern = ctx.createPattern(baseGrass, "repeat")
        if (!pattern) {
          reject(new Error("Could not create pattern"))
          return
        }

        ctx.fillStyle = pattern
        ctx.fillRect(0, 0, width, height)

        // Convert canvas to image
        const finalImage = new Image()
        finalImage.onload = () => resolve(finalImage)
        finalImage.onerror = (e) => reject(e)
        finalImage.src = canvas.toDataURL()
      } catch (err) {
        reject(err)
      }
    }

    baseGrass.onerror = (e) => {
      reject(e)
    }
  })
}

