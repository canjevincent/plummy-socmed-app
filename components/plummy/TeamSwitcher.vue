<script setup lang="ts">
import { ChevronDown, Plus } from 'lucide-vue-next'
import { type Component, ref } from 'vue'
const props = defineProps<{
  teams: {
    name: string
    logo: Component
    plan: string
  }[]
}>()
const activeTeam = ref(props.teams[0])
</script>
<template>
  <SidebarMenu>
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <SidebarMenuButton class="px-1.5 w-fit">
            <div class="flex justify-center items-center rounded-md aspect-square size-5 bg-sidebar-primary text-sidebar-primary-foreground">
              <component :is="activeTeam.logo" class="size-3" />
            </div>
            <span class="font-semibold truncate">{{ activeTeam.name }}</span>
            <ChevronDown class="opacity-50" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          class="w-64 rounded-lg"
          align="start"
          side="bottom"
          :side-offset="4"
        >
          <DropdownMenuLabel class="text-xs text-muted-foreground">
            Teams
          </DropdownMenuLabel>
          <DropdownMenuItem
            v-for="(team, index) in teams"
            :key="team.name"
            class="gap-2 p-2"
            @click="activeTeam = team"
          >
            <div class="flex justify-center items-center rounded-sm border size-6">
              <component :is="team.logo" class="size-4 shrink-0" />
            </div>
            {{ team.name }}
            <DropdownMenuShortcut>⌘{{ index + 1 }}</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem class="gap-2 p-2">
            <div class="flex justify-center items-center rounded-md border size-6 bg-background">
              <Plus class="size-4" />
            </div>
            <div class="font-medium text-muted-foreground">
              Add team
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  </SidebarMenu>
</template>
