<script setup lang="ts">
  import { MoreHorizontal } from 'lucide-vue-next'
  import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
  import { Button } from '@/components/ui/button'

  const props = defineProps<{
    user: {
      id: string
      firstName: string
      middleName: string
      lastName: string
      email: string
    }
  }>()

  const emit = defineEmits<{
    (e: 'expand'): void
    (e: 'update', user: typeof props.user): void
    (e: 'delete', user: typeof props.user): void
  }>()

</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="ghost" class="w-8 h-8 p-0">
        <span class="sr-only">Open menu</span>
        <MoreHorizontal class="w-4 h-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuLabel>
        Actions 
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem @click="$emit('expand')">
        Expand
      </DropdownMenuItem>
      <DropdownMenuItem @click="$emit('update', user)">
        Update
      </DropdownMenuItem>
      <DropdownMenuItem @click="$emit('delete', user)">
        Delete
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>