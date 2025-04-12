<script setup lang="ts">
  import type { Table } from '@tanstack/vue-table'
  import type { User } from '@prisma/client'
  import { computed } from 'vue'

  // import { roles } from './toolbar'
  // import DataTableFacetedFilter from './DataTableFacetedFilter.vue'
  import DataTableViewOptions from './DataTableViewOptions.vue'

  interface DataTableToolbarProps<TData> {
    table: Table<TData>
  }

  const props = defineProps<DataTableToolbarProps<any>>()

  const isFiltered = computed(() => props.table.getState().columnFilters.length > 0)
</script>

<template>
  <div class="flex items-center justify-between w-full">
    <div class="flex items-center flex-1 space-x-2">
      <!-- <DataTableFacetedFilter
        v-if="table.getColumn('role')"
        :column="table.getColumn('role')"
        title="Role"
        :options="roles"
      /> -->

      <Button
        v-if="isFiltered"
        variant="ghost"
        class="h-8 px-2 lg:px-3"
        @click="table.resetColumnFilters()"
      >
        Reset
        <Icon name="lucide:circle-x" class="w-4 h-4 ml-2" />
      </Button>
    </div>
    <DataTableViewOptions :table="table" />
  </div>
</template>