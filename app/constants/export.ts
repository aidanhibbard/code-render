import type { ExportSettings } from '~/interfaces/export'

export const DEFAULT_EXPORT_SETTINGS = {
  format: 'png',
  scale: 2,
  destination: 'download',
  jpegQuality: 0.92,
} satisfies ExportSettings
