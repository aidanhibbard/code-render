<script setup lang="ts">
import html2canvas from 'html2canvas-pro'
import { Download, ExternalLink, Image as ImageIcon, Share2 } from 'lucide-vue-next'
import type { ExportSettings } from '~/interfaces/export'
import exportSchema from '~/schemas/export'
import { DEFAULT_EXPORT_SETTINGS } from '~/constants/export'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/shadcn/ui/popover'
import { Button } from '@/components/shadcn/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
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

const exportStore = useExportStore()
const previewStore = usePreviewStore()

const isExporting = ref(false)
const lastError = ref<string | null>(null)

const commit = (partial: Partial<ExportSettings>) => {
  const next: ExportSettings = {
    format: exportStore.format,
    scale: exportStore.scale,
    destination: exportStore.destination,
    jpegQuality: exportStore.jpegQuality,
    ...partial,
  }

  const parsed = exportSchema.safeParse(next)
  if (!parsed.success)
    return

  exportStore.format = parsed.data.format
  exportStore.scale = parsed.data.scale
  exportStore.destination = parsed.data.destination
  exportStore.jpegQuality = parsed.data.jpegQuality
}

const resetToDefaults = () => {
  commit({ ...DEFAULT_EXPORT_SETTINGS })
}

const baseFileName = computed(() => {
  const raw = (previewStore.fileName || 'Untitled-1').trim()
  const safe = raw
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
  return safe.length ? safe : 'Untitled-1'
})

const extensionForFormat = (format: ExportSettings['format']) => {
  if (format === 'svg')
    return 'svg'
  if (format === 'jpeg')
    return 'jpg'
  return 'png'
}

const buildDownloadName = (format: ExportSettings['format'], scale: number) => {
  const ext = extensionForFormat(format)
  return `${baseFileName.value}@${scale}x.${ext}`
}

const openBlobInNewTab = (blob: Blob) => {
  const url = URL.createObjectURL(blob)
  window.open(url, '_blank', 'noopener,noreferrer')
  // best-effort cleanup
  setTimeout(() => URL.revokeObjectURL(url), 30_000)
}

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 30_000)
}

const exportTarget = () => {
  return document.querySelector('[data-preview-host]') as HTMLElement | null
}

const canvasFromDom = async (el: HTMLElement, scale: number) => {
  const dpr = window.devicePixelRatio || 1

  // Ensure web fonts are ready before we rasterize, otherwise text can look wrong.
  // (Especially noticeable in the filename input.)
  await document.fonts?.ready
  await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))

  return await html2canvas(el, {
    backgroundColor: null,
    // html2canvas sometimes renders <input> values with odd spacing/substitution.
    // Replace the filename <input> with a styled <div> in the cloned document.
    onclone: (clonedDoc) => {
      const host = clonedDoc.querySelector('[data-preview-host]') as HTMLElement | null
      if (!host)
        return

      const inputs = host.querySelectorAll('input')
      inputs.forEach((input) => {
        const value = (input as HTMLInputElement).value ?? ''
        const replacement = clonedDoc.createElement('div')
        replacement.textContent = value

        const win = clonedDoc.defaultView
        if (win) {
          const cs = win.getComputedStyle(input)
          // Render as plain title text (not an input) while keeping typography.
          replacement.style.font = cs.font
          replacement.style.fontFamily = cs.fontFamily
          replacement.style.fontSize = cs.fontSize
          replacement.style.fontWeight = cs.fontWeight
          replacement.style.fontStyle = cs.fontStyle
          replacement.style.letterSpacing = cs.letterSpacing
          replacement.style.lineHeight = cs.lineHeight
          replacement.style.color = cs.color
          replacement.style.textAlign = cs.textAlign
          replacement.style.textTransform = cs.textTransform

          // Keep layout similar, but remove the "input chrome".
          replacement.style.boxSizing = cs.boxSizing
          replacement.style.height = cs.height
          replacement.style.width = cs.width
          replacement.style.padding = cs.padding
          replacement.style.margin = cs.margin

          replacement.style.backgroundColor = 'transparent'
          replacement.style.border = 'none'
          replacement.style.borderRadius = '0'

          replacement.style.display = 'flex'
          replacement.style.alignItems = 'center'
          replacement.style.whiteSpace = 'nowrap'
          replacement.style.overflow = 'hidden'
          replacement.style.textOverflow = 'ellipsis'
        }

        input.replaceWith(replacement)
      })
    },
    scale: scale * dpr,
    useCORS: true,
    logging: false,
  })
}

const exportPng = async (el: HTMLElement, filename: string) => {
  const canvas = await canvasFromDom(el, exportStore.scale)
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => {
      if (!b)
        reject(new Error('Failed to create PNG blob'))
      else
        resolve(b)
    }, 'image/png')
  })

  if (exportStore.destination === 'open' || exportStore.destination === 'both')
    openBlobInNewTab(blob)
  if (exportStore.destination === 'download' || exportStore.destination === 'both')
    downloadBlob(blob, filename)
}

const exportJpeg = async (el: HTMLElement, filename: string) => {
  const canvas = await canvasFromDom(el, exportStore.scale)
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => {
      if (!b)
        reject(new Error('Failed to create JPEG blob'))
      else
        resolve(b)
    }, 'image/jpeg', exportStore.jpegQuality)
  })

  if (exportStore.destination === 'open' || exportStore.destination === 'both')
    openBlobInNewTab(blob)
  if (exportStore.destination === 'download' || exportStore.destination === 'both')
    downloadBlob(blob, filename)
}

// Minimal SVG support: embeds a rasterized PNG in an <svg> wrapper.
const exportSvg = async (el: HTMLElement, filename: string) => {
  const canvas = await canvasFromDom(el, exportStore.scale)
  const dataUrl = canvas.toDataURL('image/png')

  const width = canvas.width
  const height = canvas.height
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <image href="${dataUrl}" width="${width}" height="${height}" />
</svg>`

  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })

  if (exportStore.destination === 'open' || exportStore.destination === 'both')
    openBlobInNewTab(blob)
  if (exportStore.destination === 'download' || exportStore.destination === 'both')
    downloadBlob(blob, filename)
}

const onExport = async () => {
  lastError.value = null
  if (!import.meta.client)
    return

  const el = exportTarget()
  if (!el) {
    lastError.value = 'Could not find preview element to export.'
    return
  }

  isExporting.value = true
  try {
    const filename = buildDownloadName(exportStore.format, exportStore.scale)
    if (exportStore.format === 'svg')
      await exportSvg(el, filename)
    else if (exportStore.format === 'jpeg')
      await exportJpeg(el, filename)
    else
      await exportPng(el, filename)
  }
  catch (e) {
    lastError.value = e instanceof Error ? e.message : 'Export failed.'
  }
  finally {
    isExporting.value = false
  }
}
</script>

<template>
  <SidebarGroup>
    <SidebarGroupLabel>Export</SidebarGroupLabel>
    <SidebarMenu>
      <SidebarMenuItem>
        <Popover>
          <PopoverTrigger as-child>
            <SidebarMenuButton tooltip="Export image">
              <ImageIcon />
              <span>Export</span>
            </SidebarMenuButton>
          </PopoverTrigger>
          <SidebarMenuBadge>
            <Download :size="16" />
          </SidebarMenuBadge>

          <PopoverContent
            side="right"
            align="start"
            class="w-80 space-y-4"
          >
            <div class="space-y-1">
              <div class="text-sm font-medium">
                File name
              </div>
              <div class="text-muted-foreground text-xs font-mono break-all">
                {{ baseFileName }}
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <div class="text-sm font-medium">
                  Format
                </div>
                <Select
                  :model-value="exportStore.format"
                  @update:model-value="v => commit({ format: v as ExportSettings['format'] })"
                >
                  <SelectTrigger class="w-full">
                    <SelectValue placeholder="Select a format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="png">
                      PNG
                    </SelectItem>
                    <SelectItem value="svg">
                      SVG
                    </SelectItem>
                    <SelectItem value="jpeg">
                      JPEG
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div class="space-y-1">
                <div class="text-sm font-medium">
                  Scale
                </div>
                <Select
                  :model-value="String(exportStore.scale)"
                  @update:model-value="v => commit({ scale: Number(v) })"
                >
                  <SelectTrigger class="w-full">
                    <SelectValue placeholder="Scale" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">
                      2x
                    </SelectItem>
                    <SelectItem value="4">
                      4x
                    </SelectItem>
                    <SelectItem value="6">
                      6x
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div
              v-if="exportStore.format === 'jpeg'"
              class="space-y-2"
            >
              <div class="flex items-center justify-between">
                <div class="text-sm font-medium">
                  JPEG quality
                </div>
                <div class="text-muted-foreground text-xs tabular-nums">
                  {{ exportStore.jpegQuality.toFixed(2) }}
                </div>
              </div>
              <Slider
                :min="0.1"
                :max="1"
                :step="0.01"
                :model-value="[exportStore.jpegQuality]"
                @update:model-value="v => commit({ jpegQuality: v?.[0] ?? DEFAULT_EXPORT_SETTINGS.jpegQuality })"
              />
            </div>

            <div class="space-y-1">
              <div class="text-sm font-medium">
                Destination
              </div>
              <Select
                :model-value="exportStore.destination"
                @update:model-value="v => commit({ destination: v as ExportSettings['destination'] })"
              >
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="Destination" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="download">
                    Download
                  </SelectItem>
                  <SelectItem value="open">
                    Open in new tab
                  </SelectItem>
                  <SelectItem value="both">
                    Both
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div class="flex items-center gap-2">
              <Button
                class="flex-1"
                :disabled="isExporting"
                @click="onExport"
              >
                <Download class="mr-2 size-4" />
                {{ isExporting ? 'Exporting…' : 'Export' }}
              </Button>

              <Button
                variant="outline"
                :disabled="isExporting"
                @click="resetToDefaults"
              >
                Reset
              </Button>
            </div>

            <div
              v-if="lastError"
              class="text-destructive text-xs"
            >
              {{ lastError }}
            </div>

            <div class="text-muted-foreground text-xs">
              <div class="flex items-center gap-2">
                <ExternalLink class="size-3" />
                <span>“SVG” exports an SVG wrapper with an embedded PNG.</span>
              </div>
              <div class="flex items-center gap-2">
                <Share2 class="size-3" />
                <span>Uses the current preview + filename.</span>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </SidebarMenuItem>
    </SidebarMenu>
  </SidebarGroup>
</template>
