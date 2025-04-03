<script setup lang="ts">
  import type { Table } from '@tanstack/vue-table'
  import type { User } from '@prisma/client'

  import { priorities, statuses } from './toolbar'
  import DataTableFacetedFilter from './DataTableFacetedFilter.vue'
  import DataTableViewOptions from './DataTableViewOptions.vue'

  interface DataTableToolbarProps {
    table: Table<User>
  }

  const props = defineProps<DataTableToolbarProps>()

  const isFiltered = computed(() => props.table.getState().columnFilters.length > 0)
</script>

<template>
  <div class="flex justify-between items-center">
    <div class="flex flex-1 items-center space-x-2">
      <Input
        placeholder="Search ..."
        :model-value="(table.getColumn('email')?.getFilterValue() as string) ?? ''"
        class="h-8 w-[150px] lg:w-[250px]"
        @input="table.getColumn('email')?.setFilterValue($event.target.value)"
      />
      <DataTableFacetedFilter
        v-if="table.getColumn('status')"
        :column="table.getColumn('status')"
        title="Status"
        :options="statuses"
      />
      <DataTableFacetedFilter
        v-if="table.getColumn('priority')"
        :column="table.getColumn('priority')"
        title="Priority"
        :options="priorities"
      />

      <Button
        v-if="isFiltered"
        variant="ghost"
        class="px-2 h-8 lg:px-3"
        @click="table.resetColumnFilters()"
      >
        Reset
        <Icon name="lucide:circle-x" class="ml-2 w-4 h-4" />
      </Button>
    </div>
    <DataTableViewOptions :table="table" />
  </div>
</template>