<script setup lang="ts">
import type { SidebarProps } from '@/components/shadcn/ui/sidebar'

import {
  Settings2,
} from 'lucide-vue-next'
import SettingsNav from './SettingsNav.vue'
import ExportNav from './ExportNav.vue'

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/shadcn/ui/sidebar'

const props = withDefaults(defineProps<SidebarProps>(), {
  collapsible: 'icon',
})
</script>

<template>
  <Sidebar v-bind="props">
    <SidebarHeader class="p-2">
      <header aria-label="Settings Menu">
        <SidebarMenu>
          <SidebarMenuItem>
            <!-- Render as a non-interactive header block (not a <button>), while keeping
                the same collapsed/rail icon + tooltip behavior from SidebarMenuButton. -->
            <SidebarMenuButton
              as="div"
              tooltip="Settings Menu"
              class="cursor-default hover:bg-transparent hover:text-inherit active:bg-transparent active:text-inherit"
            >
              <Settings2 />
              <span class="font-medium">Code Render</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </header>
    </SidebarHeader>

    <SidebarContent class="gap-0">
      <SettingsNav />
      <ExportNav />
    </SidebarContent>
    <SidebarRail />
  </Sidebar>
</template>
