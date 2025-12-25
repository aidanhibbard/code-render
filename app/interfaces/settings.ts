export interface Settings {
  dark: boolean
  padding: number
  glass: boolean
  lineNumbers: boolean
  width: number | null
  language: string
  theme: string
  background: 'solid' | 'gradient' | 'none'
  /** Used when background is set to 'solid'. */
  backgroundColor: string
  /** 0..100 - used when background is set to 'solid'. */
  backgroundOpacity: number
  /** Used when background is set to 'gradient'. */
  gradientType: 'linear' | 'radial'
  /** Degrees for linear gradients (0..360). */
  gradientAngle: number
  gradientStops: Array<{
    id: string
    color: string
    /** 0..100 */
    alpha: number
    /** 0..100 */
    position: number
  }>
}
