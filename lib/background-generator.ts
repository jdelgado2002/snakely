export function generateGrassBackground(width: number, height: number): HTMLImageElement {
  // Create an off-screen canvas
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")

  if (!ctx) {
    const img = new Image()
    img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" // Transparent GIF
    return img
  }

  // Fill background with base grass color
  ctx.fillStyle = "#7CFC00"
  ctx.fillRect(0, 0, width, height)

  // Add darker grass patches
  ctx.fillStyle = "#66BB00"
  for (let i = 0; i < 100; i++) {
    const x = Math.random() * width
    const y = Math.random() * height
    const size = 20 + Math.random() * 40

    ctx.beginPath()
    ctx.arc(x, y, size, 0, Math.PI * 2)
    ctx.fill()
  }

  // Add lighter grass highlights
  ctx.fillStyle = "#99FF33"
  for (let i = 0; i < 200; i++) {
    const x = Math.random() * width
    const y = Math.random() * height
    const size = 5 + Math.random() * 15

    ctx.beginPath()
    ctx.arc(x, y, size, 0, Math.PI * 2)
    ctx.fill()
  }

  // Add grass blades
  for (let i = 0; i < 1000; i++) {
    const x = Math.random() * width
    const y = Math.random() * height
    const bladeHeight = 5 + Math.random() * 10
    const bladeWidth = 1 + Math.random() * 2
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.5

    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(angle)

    // Create gradient for grass blade
    const gradient = ctx.createLinearGradient(0, 0, 0, -bladeHeight)
    gradient.addColorStop(0, "#66BB00")
    gradient.addColorStop(1, "#99FF33")

    ctx.fillStyle = gradient
    ctx.fillRect(-bladeWidth / 2, 0, bladeWidth, -bladeHeight)
    ctx.restore()
  }

  // Convert canvas to image
  const img = new Image()
  img.src = canvas.toDataURL()
  return img
}

