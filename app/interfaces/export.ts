export interface ExportSettings {
  format: 'png' | 'svg' | 'jpeg'
  /** 2 | 4 | 6 */
  scale: number
  destination: 'download' | 'open' | 'both'
  /** Only used when format is 'jpeg'. */
  jpegQuality: number
}
