<script setup lang="ts">
  import type { Table } from '@tanstack/vue-table'

  interface UserTable {
    id: string;
    firstName: string | null;
    middleName: string | null;
    lastName: string | null;
    roleId: string;
    email: string;
    createdAt: Date;
    role: {
      title: string;
    };
  }

  interface DataTableViewOptionsProps {
    table: Table<UserTable>
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
        class="hidden h-8 ml-auto lg:flex"
      >
        <Icon name="lucide:settings-2" class="w-4 h-4 mr-2" />
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