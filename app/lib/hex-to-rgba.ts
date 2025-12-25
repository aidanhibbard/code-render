import { clamp } from '@/lib/clamp'

const isHexColor = (value: string) => {
  const raw = value.trim().replace(/^#/, '')
  const expanded = raw.length === 3
    ? raw.split('').map(c => c + c).join('')
    : raw
  return /^[0-9a-fA-F]{6}$/.test(expanded)
}

export const hexToRgba = (hex: string, alpha01: number) => {
  const a = clamp(alpha01, 0, 1)
  const raw = hex.trim().replace(/^#/, '')
  const expanded = raw.length === 3
    ? raw.split('').map(c => c + c).join('')
    : raw

  if (!/^[0-9a-fA-F]{6}$/.test(expanded))
    return `rgba(0,0,0,${a})`

  const r = Number.parseInt(expanded.slice(0, 2), 16)
  const g = Number.parseInt(expanded.slice(2, 4), 16)
  const b = Number.parseInt(expanded.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${a})`
}

export const colorWithOpacity = (color: string, alpha01: number) => {
  // If it's a hex, convert to rgba with provided alpha.
  if (isHexColor(color))
    return hexToRgba(color, alpha01)

  // Otherwise assume it's already a valid CSS color (rgb/rgba/hsl/etc).
  return color
}
