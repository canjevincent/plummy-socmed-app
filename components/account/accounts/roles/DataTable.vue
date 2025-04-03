<script setup lang="ts">
  import DataTablePagination from './DataTablePagination.vue'
  import DataTableToolbar from './DataTableToolbar.vue'
  import { valueUpdater } from '~/lib/utils'
  import type { User } from '@prisma/client'

  import type {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
  } from '@tanstack/vue-table'
  
  import {
    FlexRender,
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useVueTable,
  } from '@tanstack/vue-table'

  interface DataTableProps {
    columns: ColumnDef<User, any>[]
    data: User[]
    totalCount: number
    page: number
    pageSize: number
    sortBy: string
    sortOrder: string
    filters: Record<string, any>
    loading: boolean
  }

  const props = defineProps<DataTableProps>()
  const emit = defineEmits([
    'update:page',
    'update:page-size',
    'update:sort',
    'update:filters'
  ])

  const sorting = ref<SortingState>([{
    id: props.sortBy,
    desc: props.sortOrder === 'desc'
  }])

  const columnFilters = ref<ColumnFiltersState>(
    Object.entries(props.filters).map(([id, value]) => ({
      id,
      value
    }))
  )

  // Watch for props changes to update local state
  watch(() => props.sortBy, (newSortBy) => {
    if (sorting.value.length === 0 || sorting.value[0].id !== newSortBy) {
      sorting.value = [{
        id: newSortBy,
        desc: props.sortOrder === 'desc'
      }]
    }
  })

  watch(() => props.sortOrder, (newSortOrder) => {
    if (sorting.value.length > 0 && sorting.value[0].desc !== (newSortOrder === 'desc')) {
      sorting.value = [{
        id: sorting.value[0].id,
        desc: newSortOrder === 'desc'
      }]
    }
  })

  const table = useVueTable({
    get data() { return props.data },
    get columns() { return props.columns },
    get pageCount() { 
      return Math.ceil(props.totalCount / props.pageSize) 
    },
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    state: {
      get pagination() {
        return {
          pageIndex: props.page - 1,
          pageSize: props.pageSize
        }
      },
      get sorting() { return sorting.value },
      get columnFilters() { return columnFilters.value }
    },
    onPaginationChange: (updater) => {
      const newState = updater({
        pageIndex: props.page - 1,
        pageSize: props.pageSize
      })
      emit('update:page', newState.pageIndex + 1)
      emit('update:page-size', newState.pageSize)
    },
    onSortingChange: (updater) => {
      // Handle both function and direct value updates
      const newSorting = typeof updater === 'function' 
        ? updater(sorting.value) 
        : updater
      
      sorting.value = newSorting
      
      if (newSorting && newSorting.length > 0) {
        emit('update:sort', {
          sortBy: newSorting[0].id,
          sortOrder: newSorting[0].desc ? 'desc' : 'asc'
        })
      } else {
        // Default sort if sorting is cleared
        emit('update:sort', {
          sortBy: 'createdAt',
          sortOrder: 'desc'
        })
      }
    },
    onColumnFiltersChange: (updater) => {
      // Handle both function and direct value updates
      const newFilters = typeof updater === 'function'
        ? updater(columnFilters.value)
        : updater
        
      columnFilters.value = newFilters
      
      const filters = Object.fromEntries(
        newFilters.map(filter => [filter.id, filter.value])
      )
      emit('update:filters', filters)
    },
    getCoreRowModel: getCoreRowModel(),
  })
</script>

<template>
  <div class="space-y-4">
    <DataTableToolbar :table="table" />
    <div class="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
            <TableHead v-for="header in headerGroup.headers" :key="header.id">
              <FlexRender v-if="!header.isPlaceholder" :render="header.column.columnDef.header" :props="header.getContext()" />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <template v-if="table.getRowModel().rows?.length">
            <TableRow
              v-for="row in table.getRowModel().rows"
              :key="row.id"
              :data-state="row.getIsSelected() && 'selected'"
            >
              <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
                <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
              </TableCell>
            </TableRow>
          </template>

          <TableRow v-else>
            <TableCell
              :colspan="columns.length"
              class="h-24 text-center"
            >
              No results.
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <DataTablePagination :table="table" />
  </div>
</template>