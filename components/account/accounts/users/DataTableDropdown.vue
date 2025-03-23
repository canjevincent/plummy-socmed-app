<script setup lang="ts">
  import { MoreHorizontal } from 'lucide-vue-next'
  import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
  import { Button } from '@/components/ui/button'

  defineProps<{
    user: {
      id: string
      firstName: string
      middleName: string
      lastName: string
      email: string
    }
  }>()

  defineEmits<{
    (e: 'expand'): void
  }>()

  const isUpdateModalVisible = ref(false);

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
      <DropdownMenuItem @click="$emit('expand')">
        Expand
      </DropdownMenuItem>
      <DropdownMenuItem @click="isUpdateModalVisible = !isUpdateModalVisible">
        Update
      </DropdownMenuItem>
      <DropdownMenuItem>
        Delete
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>

  <AccountAccountsUsersUpdateModal
    title="Profile Update"
    description="Are you sure you want to update your profile?"
    v-if="isUpdateModalVisible"
    :is-open="isUpdateModalVisible"
    :user="user"  
    @on-close="isUpdateModalVisible = !isUpdateModalVisible"
  >
  </AccountAccountsUsersUpdateModal>
</template>