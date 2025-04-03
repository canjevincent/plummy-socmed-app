<script setup lang="ts">
  import type { Table } from '@tanstack/vue-table'
  import type { User } from '@prisma/client'

  interface DataTableViewOptionsProps {
    table: Table<User>
  }

  const props = defineProps<DataTableViewOptionsProps>()

  const columns = computed(() => props.table.getAllColumns()
    .filter(
      column =>
        typeof column.accessorFn !== 'undefined' && column.getCanHide(),
    ))
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button
        variant="outline"
        size="sm"
        class="hidden ml-auto h-8 lg:flex"
      >
        <Icon name="lucide:settings-2" class="mr-2 w-4 h-4" />
        View
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" class="w-[150px]">
      <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
      <DropdownMenuSeparator />

      <DropdownMenuCheckboxItem
        v-for="column in columns"
        :key="column.id"
        class="capitalize"
        :model-value="column.getIsVisible()"
        @update:model-value="(value) => column.toggleVisibility(!!value)"
      >
        {{ column.id }}
      </DropdownMenuCheckboxItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>