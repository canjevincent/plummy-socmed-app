<script setup lang="ts">
  import {
    type SidebarProps,
  } from '../ui/sidebar'
  import { Plus } from 'lucide-vue-next'
  const props = withDefaults(defineProps<SidebarProps>(), {
    collapsible: 'none',
  })
  // This is sample data.
  const data = {
    user: {
      name: 'shadcn',
      email: 'm@example.com',
      avatar: '', // /avatars/shadcn.jpg
    },
    calendars: [
      {
        name: 'My Calendars',
        items: ['Personal', 'Work', 'Family'],
      },
      {
        name: 'Favorites',
        items: ['Holidays', 'Birthdays'],
      },
      {
        name: 'Other',
        items: ['Travel', 'Reminders', 'Deadlines'],
      },
    ],
  }
</script>
<template>
  <Sidebar
    class="hidden sticky top-0 border-l lg:flex h-svh"
    v-bind="props"
  >
    <SidebarHeader class="h-16 border-b border-sidebar-border">
      <PlummyNavUser :user="data.user" />
    </SidebarHeader>
    <SidebarContent>
      <PlummyDatePicker />
      <SidebarSeparator class="mx-0" />
      <PlummyCalendars :calendars="data.calendars" />
    </SidebarContent>
    <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton>
            <Plus />
            <span>New Calendar</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  </Sidebar>
</template>
