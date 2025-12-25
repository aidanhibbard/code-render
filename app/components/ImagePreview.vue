<script setup lang="ts">
import { codeToHtml } from 'shiki'
import { cn } from '@/lib/utils'
import { Input } from '@/components/shadcn/ui/input'
import { clamp } from '@/lib/clamp'
import { colorWithOpacity, hexToRgba } from '@/lib/hex-to-rgba'

const store = useSettingsStore()
const previewStore = usePreviewStore()

const code = ref(`export interface StoreEvent<S extends object, K extends keyof S>
  extends CustomEvent {
  detail: {
    value: S[K];
    oldValue: S[K];
  };
}`)

const highlightedHtml = ref<string>('')

const textareaRef = ref<HTMLTextAreaElement | null>(null)

const isResizing = ref(false)
const resizeSide = ref<'left' | 'right' | null>(null)
const resizeStartX = ref(0)
const resizeStartWidth = ref(0)

const lines = computed(() => code.value.split('\n'))

const canvasWidthStyle = computed(() => {
  return {
    width: store.width === null ? 'fit-content' : `${store.width}px`,
    minWidth: '540px',
    maxWidth: '1080px',
  } as const
})

const previewClass = computed(() => {
  const isDark = store.dark
  return cn(
    'relative w-full max-w-full rounded-xl overflow-hidden shadow-2xl',
    store.glass && (isDark ? 'border border-white/10 bg-black/30' : 'border border-black/10 bg-white/60'),
    !store.glass && (isDark ? 'border border-white/10 bg-[#0B0D12]' : 'border border-black/10 bg-white'),
  )
})

const previewStyle = computed(() => {
  if (!store.glass)
    return {} as Record<string, string>

  const blur = 'blur(12px)'
  return {
    backdropFilter: blur,
    WebkitBackdropFilter: blur,
  } as Record<string, string>
})

const canvasStyle = computed(() => {
  const style = {
    ...canvasWidthStyle.value,
    padding: `${store.padding}px`,
  } as Record<string, string>

  if (store.background === 'solid') {
    const a = clamp(Number(store.backgroundOpacity) || 0, 0, 100) / 100
    style.backgroundColor = colorWithOpacity(store.backgroundColor, a)
  }

  if (store.background === 'gradient')
    style.backgroundImage = gradientCss.value

  if (store.background === 'none' && !store.glass)
    style.backgroundColor = store.dark ? '#0B0D12' : '#FFFFFF'

  return style
})

const canvasClass = computed(() => {
  if (store.background === 'none')
    return 'bg-transparent'
  return ''
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

const headerClass = computed(() => cn(
  'flex w-full items-center gap-3 border-b px-4 py-3',
  store.glass
    ? (store.dark ? 'border-white/10 bg-black/10' : 'border-black/10 bg-white/50')
    : (store.dark ? 'border-white/10 bg-[#111522]' : 'border-black/10 bg-[#F3F4F6]'),
))

const fileNameInputClass = computed(() => {
  const base = 'h-8 w-full px-2 font-mono text-sm'

  if (store.glass) {
    return cn(
      base,
      store.dark
        ? 'border-white/10 bg-transparent text-white/80 placeholder:text-white/40 focus-visible:ring-white/20'
        : 'border-black/10 bg-transparent text-black/80 placeholder:text-black/40 focus-visible:ring-black/20',
    )
  }

  return cn(
    base,
    store.dark
      ? 'border-white/10 bg-transparent text-white/90 placeholder:text-white/40 focus-visible:ring-white/20'
      : 'border-black/10 bg-transparent text-black/90 placeholder:text-black/40 focus-visible:ring-black/20',
  )
})

const lineNumbersGutterClass = computed(() => cn(
  'absolute left-0 top-0 bottom-0 z-20 w-14 select-none border-r font-mono text-sm',
  store.glass
    ? (store.dark ? 'border-white/10 bg-black/10 opacity-60' : 'border-black/10 bg-white/40 opacity-70')
    : (store.dark ? 'border-white/10 bg-[#111522] text-white/60' : 'border-black/10 bg-[#F3F4F6] text-black/60'),
))

const lineNumberClass = computed(() => cn(
  'h-5 leading-5 tabular-nums',
  store.glass
    ? (store.dark ? 'text-white/70' : 'text-black/60')
    : (store.dark ? 'text-white/60' : 'text-black/60'),
))

const highlight = async () => {
  if (!import.meta.client)
    return

  try {
    highlightedHtml.value = await codeToHtml(code.value, {
      lang: store.language,
      theme: store.theme,
    })
  }
  catch {
    highlightedHtml.value = `<pre class="shiki"><code>${code.value}</code></pre>`
  }
}

const syncTextareaHeight = async () => {
  await nextTick()
  const el = textareaRef.value
  if (!el)
    return

  // Reset then measure so it can shrink as well as grow.
  el.style.height = '0px'
  el.style.height = `${el.scrollHeight}px`
}

const clampWidth = (v: number) => Math.min(1080, Math.max(540, Math.round(v)))

const startResize = (side: 'left' | 'right', e: PointerEvent) => {
  const host = (e.currentTarget as HTMLElement)?.closest('[data-preview-host]') as HTMLElement | null
  if (!host)
    return

  const rect = host.getBoundingClientRect()
  if (store.width === null)
    store.width = clampWidth(rect.width)

  isResizing.value = true
  resizeSide.value = side
  resizeStartX.value = e.clientX
  resizeStartWidth.value = store.width ?? clampWidth(rect.width)

  ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
  e.preventDefault()
}

const onResizeMove = (e: PointerEvent) => {
  if (!isResizing.value || !resizeSide.value)
    return

  const delta = e.clientX - resizeStartX.value
  const next = resizeStartWidth.value + (resizeSide.value === 'right' ? delta : -delta)
  store.width = clampWidth(next)
}

const stopResize = () => {
  isResizing.value = false
  resizeSide.value = null
}

onMounted(() => {
  watch([code, () => store.language, () => store.theme], highlight, { immediate: true })
  watch(code, syncTextareaHeight, { immediate: true })
  window.addEventListener('pointermove', onResizeMove)
  window.addEventListener('pointerup', stopResize)
})

onBeforeUnmount(() => {
  if (!import.meta.client)
    return
  window.removeEventListener('pointermove', onResizeMove)
  window.removeEventListener('pointerup', stopResize)
})
</script>

<template>
  <div class="flex h-full w-full items-center justify-center overflow-x-auto">
    <div
      data-preview-host
      class="relative inline-flex w-fit max-w-full"
      :class="canvasClass"
      :style="canvasStyle"
    >
      <!-- Drag handles (resize the whole canvas) -->
      <div
        class="absolute inset-y-0 left-0 z-30 w-2 cursor-ew-resize"
        :class="isResizing && resizeSide === 'left'
          ? (store.glass ? 'bg-white/10' : 'bg-muted')
          : (store.glass ? 'hover:bg-white/5' : 'hover:bg-muted')
        "
        @pointerdown="startResize('left', $event)"
      />
      <div
        class="absolute inset-y-0 right-0 z-30 w-2 cursor-ew-resize"
        :class="isResizing && resizeSide === 'right'
          ? (store.glass ? 'bg-white/10' : 'bg-muted')
          : (store.glass ? 'hover:bg-white/5' : 'hover:bg-muted')
        "
        @pointerdown="startResize('right', $event)"
      />

      <div class="flex w-full items-center justify-center">
        <div
          :class="previewClass"
          :style="previewStyle"
        >
          <!-- Filename header (no window controls) -->
          <div :class="headerClass">
            <Input
              v-model="previewStore.fileName"
              :class="fileNameInputClass"
              placeholder="Untitled-1"
            />
          </div>

          <!-- Editor -->
          <div class="relative grid">
            <div
              v-if="store.lineNumbers"
              :class="lineNumbersGutterClass"
            >
              <div
                class="py-5 pr-4 text-right"
              >
                <div
                  v-for="(_, i) in lines"
                  :key="i"
                  :class="lineNumberClass"
                >
                  {{ i + 1 }}
                </div>
              </div>
            </div>

            <!-- eslint-disable vue/no-v-html -->
            <div
              class="pointer-events-none col-start-1 row-start-1"
              :style="{ '--editor-pad-left': store.lineNumbers ? '64px' : '16px' }"
              v-html="highlightedHtml"
            />
            <!-- eslint-enable vue/no-v-html -->

            <textarea
              ref="textareaRef"
              v-model="code"
              class="col-start-1 row-start-1 z-10 w-full resize-none overflow-hidden bg-transparent font-mono text-sm whitespace-pre-wrap wrap-break-word outline-none"
              :class="store.lineNumbers ? 'pl-16 pr-4' : 'pl-4 pr-4'"
              style="
                line-height: 20px;
                color: transparent;
                caret-color: rgba(255, 255, 255, 0.9);
                -webkit-text-fill-color: transparent;
                padding-right: 16px;
                padding-top: 20px;
                padding-bottom: 20px;
              "
              spellcheck="false"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(pre.shiki) {
  margin: 0;
  background: transparent !important;
  padding-top: 20px !important;
  padding-right: 16px !important;
  padding-bottom: 20px !important;
  padding-left: var(--editor-pad-left, 24px) !important;
  overflow: visible !important;
  font-size: 14px !important;
  line-height: 20px !important;
  white-space: pre-wrap !important;
  overflow-wrap: anywhere !important;
}

:deep(pre.shiki code) {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace !important;
  font-size: 14px !important;
  line-height: 20px !important;
}
</style>
