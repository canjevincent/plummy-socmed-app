<script setup lang="ts">
  import type { Table } from '@tanstack/vue-table'
  import type { Role } from '@prisma/client'

  interface RoleTable {
    id: string;
    title: string;
    createdAt: Date;
    createdBy: {
      firstName: string | null;
      middleName: string | null;
      lastName: string | null;
    };
  }

  interface DataTableViewOptionsProps {
    table: Table<RoleTable>
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