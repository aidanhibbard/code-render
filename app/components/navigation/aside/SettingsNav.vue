<script setup lang="ts">
import { bundledLanguagesInfo, bundledThemesInfo } from 'shiki'
import {
  Code2,
  Hash,
  LayoutGrid,
  Moon,
  Palette,
  RotateCcw,
  Ruler,
  SlidersHorizontal,
  Sun,
  Eye,
} from 'lucide-vue-next'
import type { Settings } from '~/interfaces/settings'
import settingsSchema from '~/schemas/settings'
import { DEFAULT_SETTINGS } from '~/constants/defaults'
import { cn } from '@/lib/utils'
import { clamp } from '@/lib/clamp'
import { hexToRgba } from '@/lib/hex-to-rgba'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/shadcn/ui/popover'
import { Button } from '@/components/shadcn/ui/button'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/shadcn/ui/select'
import { Slider } from '@/components/shadcn/ui/slider'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/shadcn/ui/sidebar'
import { Switch } from '@/components/shadcn/ui/switch'
import { Input } from '@/components/shadcn/ui/input'

const store = useSettingsStore()

const themeOptions = computed(() => {
  const dark = bundledThemesInfo
    .filter(t => t.type === 'dark')
    .map(t => ({ value: t.id, label: t.displayName }))
  const light = bundledThemesInfo
    .filter(t => t.type === 'light')
    .map(t => ({ value: t.id, label: t.displayName }))
  return { dark, light }
})

const languageOptions = computed(() => {
  return bundledLanguagesInfo
    .map(l => ({ value: l.id, label: l.name }))
    .sort((a, b) => a.label.localeCompare(b.label))
})

const backgroundOptions = [
  { value: 'gradient', label: 'Gradient' },
  { value: 'solid', label: 'Solid' },
  { value: 'none', label: 'None' },
] as const satisfies Array<{ value: Settings['background'], label: string }>

const solidBgHex = ref<string>(store.backgroundColor)

const activeStopId = ref<string>(store.gradientStops?.[0]?.id ?? 's1')
watch(() => store.gradientStops, (stops) => {
  if (!stops?.length)
    return
  if (!stops.some(s => s.id === activeStopId.value))
    activeStopId.value = stops[0]!.id
}, { deep: true })

const activeStopIndex = computed(() => {
  return Math.max(0, store.gradientStops.findIndex(s => s.id === activeStopId.value))
})

const activeStop = computed(() => {
  return store.gradientStops[activeStopIndex.value] ?? store.gradientStops[0]!
})

const gradientCss = computed(() => {
  const stops = [...store.gradientStops]
    .sort((a, b) => a.position - b.position)
    .map((s) => {
      const a = (store.glass ? s.alpha : 100) / 100
      return `${hexToRgba(s.color, a)} ${clamp(s.position, 0, 100)}%`
    })
    .join(', ')

  if (store.gradientType === 'radial')
    return `radial-gradient(circle at center, ${stops})`

  const angle = clamp(Number(store.gradientAngle) || 0, 0, 360)
  return `linear-gradient(${angle}deg, ${stops})`
})

const gradientBarRef = ref<HTMLElement | null>(null)
const draggingStopId = ref<string | null>(null)

const setStopPosition = (stopId: string, position: number) => {
  const next = store.gradientStops.map(st => st.id === stopId ? { ...st, position } : st)
  commit({ gradientStops: next as Settings['gradientStops'] })
}

const onStopPointerDown = (stopId: string, e: PointerEvent) => {
  draggingStopId.value = stopId
  activeStopId.value = stopId
  ;(e.currentTarget as HTMLElement | null)?.setPointerCapture?.(e.pointerId)
  e.preventDefault()
}

const onStopPointerMove = (e: PointerEvent) => {
  if (!draggingStopId.value)
    return
  const el = gradientBarRef.value
  if (!el)
    return

  const rect = el.getBoundingClientRect()
  const pct = ((e.clientX - rect.left) / rect.width) * 100
  setStopPosition(draggingStopId.value, clamp(Math.round(pct), 0, 100))
}

const onStopPointerUp = () => {
  draggingStopId.value = null
}

onMounted(() => {
  window.addEventListener('pointermove', onStopPointerMove)
  window.addEventListener('pointerup', onStopPointerUp)
})

onBeforeUnmount(() => {
  window.removeEventListener('pointermove', onStopPointerMove)
  window.removeEventListener('pointerup', onStopPointerUp)
})

const commit = (partial: Partial<Settings>) => {
  const next: Settings = {
    dark: store.dark,
    padding: store.padding,
    glass: store.glass,
    lineNumbers: store.lineNumbers,
    width: store.width,
    language: store.language,
    theme: store.theme,
    background: store.background,
    backgroundColor: store.backgroundColor,
    backgroundOpacity: store.backgroundOpacity,
    gradientType: store.gradientType,
    gradientAngle: store.gradientAngle,
    gradientStops: store.gradientStops,
    ...partial,
  }

  const parsed = settingsSchema.safeParse(next)
  if (!parsed.success)
    return

  store.dark = parsed.data.dark
  store.padding = parsed.data.padding
  store.glass = parsed.data.glass
  store.lineNumbers = parsed.data.lineNumbers
  store.width = parsed.data.width
  store.language = parsed.data.language
  store.theme = parsed.data.theme
  store.background = parsed.data.background
  store.backgroundColor = parsed.data.backgroundColor
  store.backgroundOpacity = parsed.data.backgroundOpacity
  store.gradientType = parsed.data.gradientType
  store.gradientAngle = parsed.data.gradientAngle
  store.gradientStops = parsed.data.gradientStops
}

const resetToDefaults = () => {
  commit({ ...DEFAULT_SETTINGS })
}

watch(() => store.backgroundColor, (v) => {
  solidBgHex.value = v
})
</script>

<template>
  <SidebarGroup>
    <SidebarGroupLabel>Settings</SidebarGroupLabel>
    <SidebarMenu>
      <SidebarMenuItem>
        <Popover>
          <PopoverTrigger as-child>
            <SidebarMenuButton tooltip="Theme">
              <Palette />
              <span>Theme</span>
            </SidebarMenuButton>
          </PopoverTrigger>
          <SidebarMenuBadge>
            {{ store.theme }}
          </SidebarMenuBadge>
          <PopoverContent
            side="right"
            align="start"
            class="w-72"
          >
            <Select
              :model-value="store.theme"
              @update:model-value="v => commit({ theme: v as Settings['theme'] })"
            >
              <SelectTrigger class="w-full">
                <SelectValue placeholder="Select a theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Dark</SelectLabel>
                  <SelectItem
                    v-for="t in themeOptions.dark"
                    :key="t.value"
                    :value="t.value"
                  >
                    {{ t.label }}
                  </SelectItem>
                </SelectGroup>
                <SelectSeparator />
                <SelectGroup>
                  <SelectLabel>Light</SelectLabel>
                  <SelectItem
                    v-for="t in themeOptions.light"
                    :key="t.value"
                    :value="t.value"
                  >
                    {{ t.label }}
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </PopoverContent>
        </Popover>
      </SidebarMenuItem>

      <SidebarMenuItem>
        <Popover>
          <PopoverTrigger as-child>
            <SidebarMenuButton tooltip="Language">
              <Code2 />
              <span>Language</span>
            </SidebarMenuButton>
          </PopoverTrigger>
          <SidebarMenuBadge>
            {{ store.language }}
          </SidebarMenuBadge>
          <PopoverContent
            side="right"
            align="start"
            class="w-72"
          >
            <Select
              :model-value="store.language"
              @update:model-value="v => commit({ language: v as Settings['language'] })"
            >
              <SelectTrigger class="w-full">
                <SelectValue placeholder="Select a language" />
              </SelectTrigger>
              <SelectContent class="max-h-80">
                <SelectItem
                  v-for="l in languageOptions"
                  :key="l.value"
                  :value="l.value"
                >
                  {{ l.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </PopoverContent>
        </Popover>
      </SidebarMenuItem>

      <SidebarMenuItem>
        <Popover>
          <PopoverTrigger as-child>
            <SidebarMenuButton tooltip="Background">
              <LayoutGrid />
              <span>Background</span>
            </SidebarMenuButton>
          </PopoverTrigger>
          <SidebarMenuBadge>
            {{ store.background }}
          </SidebarMenuBadge>
          <PopoverContent
            side="right"
            align="start"
            :class="cn(
              'space-y-4',
              store.background === 'gradient' ? 'w-[720px]' : 'w-72',
            )"
          >
            <Select
              :model-value="store.background"
              @update:model-value="v => commit({ background: v as Settings['background'] })"
            >
              <SelectTrigger class="w-full">
                <SelectValue placeholder="Select a background" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="o in backgroundOptions"
                  :key="o.value"
                  :value="o.value"
                >
                  {{ o.label }}
                </SelectItem>
              </SelectContent>
            </Select>

            <div
              v-if="store.background === 'solid'"
              class="space-y-2"
            >
              <div class="flex items-center justify-between">
                <div class="text-sm font-medium">
                  Color
                </div>
                <div class="text-muted-foreground text-xs font-mono">
                  {{ store.backgroundColor }}
                </div>
              </div>

              <div class="flex items-center gap-2">
                <input
                  type="color"
                  :value="store.backgroundColor"
                  class="h-9 w-10 shrink-0 cursor-pointer rounded-md border border-input bg-transparent p-1"
                  aria-label="Background color"
                  @input="(e) => commit({ backgroundColor: (e.target as HTMLInputElement).value })"
                >
                <Input
                  v-model="solidBgHex"
                  class="font-mono"
                  placeholder="#020024"
                  @blur="commit({ backgroundColor: solidBgHex })"
                  @keydown.enter.prevent="commit({ backgroundColor: solidBgHex })"
                />
              </div>

              <div class="space-y-1">
                <div class="flex items-center justify-between text-muted-foreground text-xs">
                  <span>Opacity</span>
                  <span class="tabular-nums">{{ store.backgroundOpacity }}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  class="w-full"
                  :value="store.backgroundOpacity"
                  @input="(e) => commit({ backgroundOpacity: clamp(Number((e.target as HTMLInputElement).value), 0, 100) })"
                >
              </div>
            </div>

            <div
              v-else-if="store.background === 'gradient'"
              class="space-y-4"
            >
              <div class="flex items-center justify-between gap-3">
                <div class="inline-flex rounded-md border border-input bg-background">
                  <button
                    type="button"
                    class="px-3 py-1.5 text-sm"
                    :class="store.gradientType === 'linear' ? 'bg-muted font-medium' : 'text-muted-foreground'"
                    @click="commit({ gradientType: 'linear' })"
                  >
                    Linear
                  </button>
                  <button
                    type="button"
                    class="px-3 py-1.5 text-sm"
                    :class="store.gradientType === 'radial' ? 'bg-muted font-medium' : 'text-muted-foreground'"
                    @click="commit({ gradientType: 'radial' })"
                  >
                    Radial
                  </button>
                </div>

                <div
                  class="flex items-center gap-2"
                  :class="store.gradientType === 'radial' ? 'pointer-events-none opacity-50' : ''"
                  :aria-disabled="store.gradientType === 'radial'"
                >
                  <div class="text-muted-foreground text-xs">
                    Deg
                  </div>
                  <Input
                    :model-value="store.gradientAngle"
                    class="w-20 tabular-nums"
                    @update:model-value="(v) => commit({ gradientAngle: clamp(Number(v), 0, 360) })"
                  />
                </div>
              </div>

              <!-- Gradient bar + stop handles -->
              <div class="space-y-2">
                <div
                  ref="gradientBarRef"
                  class="relative h-10 w-full rounded-md border border-input"
                  :style="{ backgroundImage: gradientCss }"
                >
                  <button
                    v-for="s in store.gradientStops"
                    :key="s.id"
                    type="button"
                    class="absolute top-1/2 size-5 -translate-y-1/2 -translate-x-1/2 rounded-full border-2 border-background shadow"
                    :style="{
                      left: `${clamp(s.position, 0, 100)}%`,
                      backgroundColor: s.color,
                      outline: s.id === activeStopId ? '2px solid hsl(var(--ring))' : 'none',
                    }"
                    @click="activeStopId = s.id"
                    @pointerdown="onStopPointerDown(s.id, $event)"
                  />
                </div>

                <div class="flex items-center justify-between text-muted-foreground text-xs tabular-nums">
                  <span>0</span>
                  <span>100</span>
                </div>
              </div>

              <!-- Active stop editor -->
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <div class="text-sm font-medium">
                    Picker
                  </div>
                  <div class="flex items-center gap-2">
                    <input
                      type="color"
                      :value="activeStop.color"
                      class="h-9 w-10 shrink-0 cursor-pointer rounded-md border border-input bg-transparent p-1"
                      aria-label="Stop color"
                      @input="(e) => {
                        const v = (e.target as HTMLInputElement).value
                        const next = store.gradientStops.map(st => st.id === activeStop.id ? { ...st, color: v } : st)
                        commit({ gradientStops: next as Settings['gradientStops'] })
                      }"
                    >
                    <Input
                      :model-value="activeStop.color"
                      class="font-mono"
                      @update:model-value="(v) => {
                        const next = store.gradientStops.map(st => st.id === activeStop.id ? { ...st, color: String(v) } : st)
                        commit({ gradientStops: next as Settings['gradientStops'] })
                      }"
                    />
                  </div>

                  <div class="space-y-1">
                    <div class="flex items-center justify-between text-muted-foreground text-xs">
                      <span>Alpha</span>
                      <span class="tabular-nums">{{ activeStop.alpha }}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      class="w-full"
                      :value="activeStop.alpha"
                      @input="(e) => {
                        const a = clamp(Number((e.target as HTMLInputElement).value), 0, 100)
                        const next = store.gradientStops.map(st => st.id === activeStop.id ? { ...st, alpha: a } : st)
                        commit({ gradientStops: next as Settings['gradientStops'] })
                      }"
                    >
                  </div>
                </div>

                <div class="space-y-2">
                  <div class="flex items-center justify-between">
                    <div class="text-sm font-medium">
                      Stops
                    </div>
                    <button
                      type="button"
                      class="text-xs text-primary hover:underline"
                      @click="() => {
                        const id = `s${Date.now()}`
                        const base = activeStop
                        const next = [...store.gradientStops, {
                          id,
                          color: base?.color ?? '#000000',
                          alpha: base?.alpha ?? 100,
                          position: 50,
                        }]
                        commit({ gradientStops: next as Settings['gradientStops'] })
                        activeStopId = id
                      }"
                    >
                      + Add
                    </button>
                  </div>

                  <div class="space-y-2">
                    <div
                      v-for="s in [...store.gradientStops].sort((a, b) => a.position - b.position)"
                      :key="s.id"
                      class="flex items-center gap-2 rounded-md border border-input bg-muted/30 p-2"
                      :class="s.id === activeStopId ? 'ring-2 ring-ring' : ''"
                      @click="activeStopId = s.id"
                    >
                      <div
                        class="size-8 rounded-md border border-input"
                        :style="{ backgroundColor: s.color }"
                      />
                      <Input
                        :model-value="s.color"
                        class="font-mono"
                        @update:model-value="(v) => {
                          const next = store.gradientStops.map(st => st.id === s.id ? { ...st, color: String(v) } : st)
                          commit({ gradientStops: next })
                        }"
                      />
                      <Input
                        :model-value="s.position"
                        class="w-20 tabular-nums"
                        disabled
                      />
                      <button
                        v-if="store.gradientStops.length > 2"
                        type="button"
                        class="ml-auto px-2 text-muted-foreground hover:text-foreground"
                        @click.stop="() => {
                          const next = store.gradientStops.filter(st => st.id !== s.id)
                          commit({ gradientStops: next })
                        }"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </SidebarMenuItem>

      <SidebarMenuItem>
        <SidebarMenuButton
          as="div"
          tooltip="Dark mode"
        >
          <component :is="store.dark ? Moon : Sun" />
          <span>Dark mode</span>
          <span class="ml-auto">
            <Switch
              :model-value="store.dark"
              @update:model-value="(v: boolean) => commit({ dark: v })"
            />
          </span>
        </SidebarMenuButton>
      </SidebarMenuItem>

      <SidebarMenuItem>
        <SidebarMenuButton
          as="div"
          tooltip="Line numbers"
        >
          <Hash />
          <span>Line numbers</span>
          <span class="ml-auto">
            <Switch
              :model-value="store.lineNumbers"
              @update:model-value="(v: boolean) => commit({ lineNumbers: v })"
            />
          </span>
        </SidebarMenuButton>
      </SidebarMenuItem>

      <SidebarMenuItem>
        <Popover>
          <PopoverTrigger as-child>
            <SidebarMenuButton tooltip="Padding">
              <SlidersHorizontal />
              <span>Padding</span>
            </SidebarMenuButton>
          </PopoverTrigger>
          <SidebarMenuBadge>
            {{ store.padding }}
          </SidebarMenuBadge>
          <PopoverContent
            side="right"
            align="start"
            class="w-72"
          >
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <div class="text-sm font-medium">
                  Padding
                </div>
                <div class="text-muted-foreground text-xs tabular-nums">
                  {{ store.padding }}px
                </div>
              </div>

              <Slider
                :min="0"
                :max="128"
                :step="4"
                :model-value="[store.padding]"
                @update:model-value="v => commit({ padding: v?.[0] ?? DEFAULT_SETTINGS.padding })"
              />

              <div class="flex items-center justify-between text-muted-foreground text-xs tabular-nums">
                <span>0</span>
                <span>128</span>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </SidebarMenuItem>

      <SidebarMenuItem>
        <Popover>
          <PopoverTrigger as-child>
            <SidebarMenuButton tooltip="Width">
              <Ruler />
              <span>Width</span>
            </SidebarMenuButton>
          </PopoverTrigger>
          <SidebarMenuBadge>
            {{ store.width === null ? 'Auto' : `${store.width}px` }}
          </SidebarMenuBadge>
          <PopoverContent
            side="right"
            align="start"
            class="w-80 space-y-4 bg-popover"
          >
            <div class="flex items-center justify-between gap-3">
              <div class="flex flex-col gap-0.5">
                <div class="text-sm font-medium">
                  Width
                </div>
                <div class="text-muted-foreground text-xs">
                  {{ store.width === null ? 'Auto' : `${store.width}px` }}
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                @click="commit({ width: null })"
              >
                Auto
              </Button>
            </div>

            <Slider
              :min="540"
              :max="1080"
              :step="1"
              :model-value="[store.width ?? 810]"
              @update:model-value="v => commit({ width: v?.[0] ?? null })"
            />

            <div class="flex items-center justify-between text-muted-foreground text-xs tabular-nums">
              <span>540</span>
              <span>1080</span>
            </div>
          </PopoverContent>
        </Popover>
      </SidebarMenuItem>

      <SidebarMenuItem>
        <SidebarMenuButton
          as="div"
          tooltip="Glass"
        >
          <Eye />
          <span>Glass</span>
          <span class="ml-auto">
            <Switch
              :model-value="store.glass"
              @update:model-value="(v: boolean) => commit({ glass: v })"
            />
          </span>
        </SidebarMenuButton>
      </SidebarMenuItem>

      <SidebarMenuItem>
        <SidebarMenuButton
          tooltip="Reset to defaults"
          @click="resetToDefaults"
        >
          <RotateCcw />
          <span>Reset</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  </SidebarGroup>
</template>
