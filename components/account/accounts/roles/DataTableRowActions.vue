<script setup lang="ts">
  import { MoreHorizontal } from 'lucide-vue-next'
  import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
  import { Button } from '@/components/ui/button'

  const props = defineProps<{
    role: {
      id: string
      title: string
    }
  }>()

  const emit = defineEmits<{
    (e: 'update', role: typeof props.role): void
    (e: 'delete', role: typeof props.role): void
  }>()

</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="ghost" class="p-0 w-8 h-8">
        <span class="sr-only">Open menu</span>
        <MoreHorizontal class="w-4 h-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuLabel>
        Actions 
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem @click="$emit('update', role)">
        Update
      </DropdownMenuItem>
      <DropdownMenuItem @click="$emit('delete', role)">
        Delete
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>