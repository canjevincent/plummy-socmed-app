<script setup lang="ts">
  import DataTablePagination from './DataTablePagination.vue'
  import DataTableToolbar from './DataTableToolbar.vue'
  import type { User } from '@prisma/client'

  import type {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
  } from '@tanstack/vue-table'
  
  import {
    FlexRender,
    getCoreRowModel,
    useVueTable,
  } from '@tanstack/vue-table'

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

  interface DataTableProps {
    columns: ColumnDef<UserTable, any>[]
    data: UserTable[]
    totalCount: number
    page: number
    pageSize: number
    sortBy: string
    sortOrder: string
    filters: Record<string, any>
    globalSearch: string
    loading: boolean
  }

  const props = defineProps<DataTableProps>()
  const emit = defineEmits<{
    (e: 'expand'): void
    (e: 'update-user', user: any): void
    (e: 'delete-user', user: any): void
    (e: 'update:page', page: number): void            // example with parameter
    (e: 'update:page-size', size: number): void       // example with parameter
    (e: 'update:sort', sort: any): void               // adjust 'any' to your actual type
    (e: 'update:filters', filters: any): void         // adjust 'any' to your actual type
    (e: 'update:globalSearch', search: string): void  // example with parameter
  }>()

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
      // Correctly handle both function and direct value updates, similar to how you handle sorting
      const newState = typeof updater === 'function'
        ? updater({
            pageIndex: props.page - 1,
            pageSize: props.pageSize
          })
        : updater
        
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
      
      // Convert column filters to the format expected by the server
      const filtersObject: Record<string, any> = {}
      
      newFilters.forEach(filter => {
        // Handle array values (like from faceted filters)
        if (Array.isArray(filter.value)) {
          if (filter.value.length > 0) {
            filtersObject[filter.id] = filter.value;
          }
        } else {
          filtersObject[filter.id] = filter.value;
        }
      })
      
      emit('update:filters', filtersObject)
    },
    getCoreRowModel: getCoreRowModel(),
    meta: {
      emit // Make the emit function available in the table context
    }
  })

  function handleGlobalSearchUpdate(search: string) {
    emit('update:globalSearch', search)
  }

  // Pass the update:filters event from the toolbar to parent
  function handleFiltersUpdate(newFilters: Record<string, any>) {
    emit('update:filters', newFilters)
  }
</script>

<template>
  <div class="space-y-4">
    <DataTableToolbar 
      :table="table" 
      :global-search="globalSearch"
      @update:global-search="handleGlobalSearchUpdate"
      @update:filters="handleFiltersUpdate"
    />
    <div class="border rounded-md">
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