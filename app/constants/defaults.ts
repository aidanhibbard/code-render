import type { Settings } from '~/interfaces/settings'

export const DEFAULT_SETTINGS = {
  dark: true,
  padding: 64,
  glass: true,
  lineNumbers: false,
  width: null as number | null,
  language: 'typescript',
  theme: 'github-dark',
  background: 'gradient',
  backgroundColor: '#020024',
  backgroundOpacity: 100,
  gradientType: 'linear',
  gradientAngle: 90,
  gradientStops: [
    { id: 's1', color: '#00C499', alpha: 100, position: 0 },
    { id: 's2', color: '#00D4FF', alpha: 100, position: 100 },
  ],
} satisfies Settings
