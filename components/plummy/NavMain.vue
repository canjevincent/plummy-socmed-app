<script setup lang="ts">
import type { LucideIcon } from 'lucide-vue-next'
defineProps<{
  items: {
    title: string
    url: string
    icon: LucideIcon
    isActive?: boolean
  }[]
}>()
</script>
<template>
  <SidebarMenu>
    <SidebarMenuItem v-for="item in items" :key="item.title">
      <SidebarMenuButton as-child :is-active="item.isActive">
        <a :href="item.url">
          <component :is="item.icon" />
          <span>{{ item.title }}</span>
        </a>
      </SidebarMenuButton>
    </SidebarMenuItem>
  </SidebarMenu>
</template>