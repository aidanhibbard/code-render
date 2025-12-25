<script setup lang="ts">
import {
  SidebarTrigger,
} from '@/components/shadcn/ui/sidebar'

import ModeToggle from '@/components/ModeToggle.vue'
</script>

<template>
  <header class="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
    <div class="flex w-full items-center justify-between px-4">
      <div class="flex items-center gap-2">
        <SidebarTrigger class="-ml-1" />
      </div>

      <ModeToggle />
    </div>
  </header>
</template>
