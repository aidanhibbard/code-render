import { z } from 'zod'
import { DEFAULT_SETTINGS } from '~/constants/defaults'
import { bundledLanguagesInfo, bundledThemesInfo } from 'shiki'
import type { Settings } from '~/interfaces/settings'

const settingsSchema = z.object({
  dark: z
    .boolean()
    .default(DEFAULT_SETTINGS.dark),
  padding: z
    .number()
    .min(0)
    .max(128)
    .multipleOf(4)
    .default(DEFAULT_SETTINGS.padding),
  glass: z
    .boolean()
    .default(DEFAULT_SETTINGS.glass),
  lineNumbers: z
    .boolean()
    .default(DEFAULT_SETTINGS.lineNumbers),
  width: z
    .number()
    .min(540)
    .max(1080)
    .nullable()
    .default(DEFAULT_SETTINGS.width),
  language: z
    .string()
    .refine(v => new Set(
      bundledLanguagesInfo.flatMap(l => [l.id, ...(l.aliases ?? [])]),
    ).has(v))
    .default(DEFAULT_SETTINGS.language),
  theme: z
    .string()
    .refine(v => new Set(bundledThemesInfo.map(t => t.id)).has(v))
    .default(DEFAULT_SETTINGS.theme),
  background: z
    .enum(['solid', 'gradient', 'none'])
    .default(DEFAULT_SETTINGS.background),
  backgroundColor: z
    .string()
    .default(DEFAULT_SETTINGS.backgroundColor),
  backgroundOpacity: z
    .number()
    .min(0)
    .max(100)
    .default(DEFAULT_SETTINGS.backgroundOpacity),
  gradientType: z
    .enum(['linear', 'radial'])
    .default(DEFAULT_SETTINGS.gradientType),
  gradientAngle: z
    .number()
    .min(0)
    .max(360)
    .default(DEFAULT_SETTINGS.gradientAngle),
  gradientStops: z
    .array(z.object({
      id: z.string(),
      color: z.string(),
      alpha: z.number().min(0).max(100),
      position: z.number().min(0).max(100),
    }))
    .min(2)
    .default(DEFAULT_SETTINGS.gradientStops),
}) satisfies z.ZodSchema<Settings>

export default settingsSchema
