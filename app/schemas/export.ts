import { z } from 'zod'
import { DEFAULT_EXPORT_SETTINGS } from '~/constants/export'
import type { ExportSettings } from '~/interfaces/export'

const exportSchema = z.object({
  format: z
    .enum(['png', 'svg', 'jpeg'])
    .default(DEFAULT_EXPORT_SETTINGS.format),
  scale: z
    .number()
    .refine(v => [2, 4, 6].includes(v))
    .default(DEFAULT_EXPORT_SETTINGS.scale),
  destination: z
    .enum(['download', 'open', 'both'])
    .default(DEFAULT_EXPORT_SETTINGS.destination),
  jpegQuality: z
    .number()
    .min(0.1)
    .max(1)
    .default(DEFAULT_EXPORT_SETTINGS.jpegQuality),
}) satisfies z.ZodSchema<ExportSettings>

export default exportSchema
