<script setup lang="ts">
import {
  SidebarTrigger,
} from '@/components/shadcn/ui/sidebar'

import ModeToggle from '@/components/ModeToggle.vue'
import { Button } from '@/components/shadcn/ui/button'

import {
  Github,
} from 'lucide-vue-next'
</script>

<template>
  <header class="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
    <div class="flex w-full items-center justify-between px-4">
      <div class="flex items-center gap-2">
        <SidebarTrigger class="-ml-1" />
      </div>

      <div class="flex items-center gap-x-4">
        <NuxtLink
          :as="Button"
          to="https://github.com/aidanhibbard/code-render"
          external
          aria-label="Project Source"
          title="Project Source"
          variant="ghost"
          size="icon"
          class="relative"
        >
          <Github
            class="w-4 h-4"
          />
        </NuxtLink>
        <ModeToggle />
      </div>
    </div>
  </header>
</template>
