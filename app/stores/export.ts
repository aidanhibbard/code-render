import { DEFAULT_EXPORT_SETTINGS } from '~/constants/export'
import type { ExportSettings } from '~/interfaces/export'

export const useExportStore = defineStore('export', () => {
  const format = ref<ExportSettings['format']>(DEFAULT_EXPORT_SETTINGS.format)
  const scale = ref<ExportSettings['scale']>(DEFAULT_EXPORT_SETTINGS.scale)
  const destination = ref<ExportSettings['destination']>(DEFAULT_EXPORT_SETTINGS.destination)
  const jpegQuality = ref<ExportSettings['jpegQuality']>(DEFAULT_EXPORT_SETTINGS.jpegQuality)

  return {
    format,
    scale,
    destination,
    jpegQuality,
  }
})
