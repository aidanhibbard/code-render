import { DEFAULT_SETTINGS } from '~/constants/defaults'
import type { Settings } from '~/interfaces/settings'

export const useSettingsStore = defineStore('settings', () => {
  const dark = ref<Settings['dark']>(DEFAULT_SETTINGS.dark)
  // 0..128, step by 4
  const padding = ref<Settings['padding']>(DEFAULT_SETTINGS.padding)
  const glass = ref<Settings['glass']>(DEFAULT_SETTINGS.glass)
  const lineNumbers = ref<Settings['lineNumbers']>(DEFAULT_SETTINGS.lineNumbers)
  // Null is auto
  // Min 540
  // Max 1080
  const width = ref<Settings['width']>(DEFAULT_SETTINGS.width)
  const language = ref<Settings['language']>(DEFAULT_SETTINGS.language)
  const theme = ref<Settings['theme']>(DEFAULT_SETTINGS.theme)
  const background = ref<Settings['background']>(DEFAULT_SETTINGS.background)
  const backgroundColor = ref<Settings['backgroundColor']>(DEFAULT_SETTINGS.backgroundColor)
  const backgroundOpacity = ref<Settings['backgroundOpacity']>(DEFAULT_SETTINGS.backgroundOpacity)
  const gradientType = ref<Settings['gradientType']>(DEFAULT_SETTINGS.gradientType)
  const gradientAngle = ref<Settings['gradientAngle']>(DEFAULT_SETTINGS.gradientAngle)
  const gradientStops = ref<Settings['gradientStops']>(DEFAULT_SETTINGS.gradientStops)

  return {
    dark,
    padding,
    glass,
    lineNumbers,
    width,
    language,
    theme,
    background,
    backgroundColor,
    backgroundOpacity,
    gradientType,
    gradientAngle,
    gradientStops,
  }
})
