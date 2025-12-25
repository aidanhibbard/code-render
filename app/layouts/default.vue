<script setup lang="ts">
import AppSidebar from '~/components/navigation/aside/AppSidebar.vue'
import AppHeader from '~/components/navigation/header/AppHeader.vue'
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/shadcn/ui/sidebar'
</script>

<template>
  <SidebarProvider>
    <AppSidebar />
    <SidebarInset>
      <AppHeader />
      <main class="flex min-h-0 flex-1 flex-col gap-4 p-4 pt-0">
        <div class="flex min-h-0 flex-1">
          <slot name="default" />
        </div>
      </main>
    </SidebarInset>
  </SidebarProvider>
</template>
