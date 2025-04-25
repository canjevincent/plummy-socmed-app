<script setup lang="ts" generic="TData, TValue">
  import type { ColumnDef, SortingState, ColumnFiltersState } from '@tanstack/vue-table'
  
  import {
    FlexRender,
    getCoreRowModel,
    getPaginationRowModel,
    useVueTable,
    getFilteredRowModel,
    getSortedRowModel,
  } from '@tanstack/vue-table'

  import DataTableToolBar from './DataTableToolBar.vue'
  import { valueUpdater } from '~/lib/utils'
  import { useDebounce } from '@vueuse/core'
  
  // Define a type for searchable column configuration
  type SearchableColumn = {
    accessorKey?: string
    id?: string
    displayName?: string
  }

  // Extend ColumnDef with optional accessorKey
  type ExtendedColumnDef = ColumnDef<TData, TValue> & { 
    accessorKey?: string 
  }

  const props = withDefaults(defineProps<{
    columns: ExtendedColumnDef[]
    data: TData[]
    searchableColumns?: SearchableColumn[]
  }>(), {
    searchableColumns: () => []
  })

  // Compute searchable columns, falling back to columns with an accessor
  const searchableColumns = computed(() => {
    if (props.searchableColumns.length > 0) return props.searchableColumns

    return props.columns
      .filter((col): col is ExtendedColumnDef => !!(col.accessorKey || col.id))
      .map(col => ({ 
        accessorKey: col.accessorKey,
        id: col.id,
        displayName: col.header as string 
      }))
  })

  const sorting = ref<SortingState>([])
  const columnFilters = ref<ColumnFiltersState>([])

  // Global search state
  const rawGlobalFilter = ref('')
  const globalFilter = useDebounce(rawGlobalFilter, 100)

  // Add emit definition to pass events up to parent
  const emit = defineEmits<{
    (e: 'update-role', role: any): void
    (e: 'delete-role', role: any): void
  }>()

  const table = useVueTable({
    get data() { return props.data },
    get columns() { return props.columns },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: updaterOrValue => valueUpdater(updaterOrValue, sorting),
    onColumnFiltersChange: updaterOrValue => valueUpdater(updaterOrValue, columnFilters),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: (row, columnId, value) => {
      // Convert row values to string and check if they include the search term
      const searchTerm = value.toLowerCase()
      
      // Filter and map to only searchable columns
      return searchableColumns.value.some(col => {
        const key = col.accessorKey || col.id
        if (!key) return false
        const cellValue = row.getValue(key)
        return cellValue != null && 
              String(cellValue).toLowerCase().includes(searchTerm)
      })
    },
    state: {
      get sorting() { return sorting.value },
      get columnFilters() { return columnFilters.value },
      get globalFilter() { return globalFilter.value },
    },
    meta: {
      emit // Make the emit function available in the table context
    }
  })

  const columns = computed(() => table.getAllColumns()
  .filter(
    column =>
      typeof column.accessorFn !== 'undefined' && column.getCanHide(),
  ))

</script>

<template>
  
  <div class="flex gap-x-3">
  
    <!-- Search -->
    <div class="flex items-center py-4 min-w-fit">
      <Input 
        class="min-w-sm" 
        placeholder="Search" 
        :model-value="rawGlobalFilter"
        @update:model-value="value => rawGlobalFilter = String(value)"
      />
    </div>

    <!-- Column Display -->
    <DataTableToolBar :table="table" />
  
  </div>
    
  <!-- Tabel -->
  <div class="border rounded-md">
    <Table>

      <TableHeader>
        <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
          <TableHead v-for="header in headerGroup.headers" :key="header.id">
            <FlexRender
              v-if="!header.isPlaceholder" :render="header.column.columnDef.header"
              :props="header.getContext()"
            />
          </TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        <template v-if="table.getRowModel().rows?.length">
          <TableRow
            v-for="row in table.getRowModel().rows" :key="row.id"
            :data-state="row.getIsSelected() ? 'selected' : undefined"
          >
            <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
              <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
            </TableCell>
          </TableRow>
        </template>
        <template v-else>
          <TableRow>
            <TableCell :colspan="columns.length" class="h-24 text-center">
              No results.
            </TableCell>
          </TableRow>
        </template>
      </TableBody>
      
    </Table>
  </div>

  <!-- Pagination -->
  <div class="flex items-center justify-between px-2 mt-5">
    <div class="flex-1 text-sm text-muted-foreground">
      {{ table.getFilteredSelectedRowModel().rows.length }} of
      {{ table.getFilteredRowModel().rows.length }} row(s) selected.
    </div>
    <div class="flex items-center space-x-6 lg:space-x-8">
      <div class="flex items-center space-x-2">
        <p class="text-sm font-medium">
          Rows per page
        </p>
        <Select
          :model-value="`${table.getState().pagination.pageSize}`"
          @update:model-value="(value) => table.setPageSize(Number(value))"
        >
          <SelectTrigger class="h-8 w-[70px]">
            <SelectValue :placeholder="`${table.getState().pagination.pageSize}`" />
          </SelectTrigger>
          <SelectContent side="top">
            <SelectItem v-for="pageSize in [10, 20, 30, 40, 50]" :key="pageSize" :value="`${pageSize}`">
              {{ pageSize }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div class="flex w-[100px] items-center justify-center text-sm font-medium">
        Page {{ table.getState().pagination.pageIndex + 1 }} of
        {{ table.getPageCount() }}
      </div>
      <div class="flex items-center space-x-2">
        <Button
          variant="outline"
          class="hidden w-8 h-8 p-0 lg:flex"
          :disabled="!table.getCanPreviousPage()"
          @click="table.setPageIndex(0)"
        >
          <span class="sr-only">Go to first page</span>
          <Icon name="lucide:chevrons-left" class="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          class="w-8 h-8 p-0"
          :disabled="!table.getCanPreviousPage()"
          @click="table.previousPage()"
        >
          <span class="sr-only">Go to previous page</span>
          <Icon name="lucide:circle-chevron-left" class="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          class="w-8 h-8 p-0"
          :disabled="!table.getCanNextPage()"
          @click="table.nextPage()"
        >
          <span class="sr-only">Go to next page</span>
          <Icon name="lucide:circle-chevron-right" class="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          class="hidden w-8 h-8 p-0 lg:flex"
          :disabled="!table.getCanNextPage()"
          @click="table.setPageIndex(table.getPageCount() - 1)"
        >
          <span class="sr-only">Go to last page</span>
          <Icon name="lucide:chevrons-right" class="w-4 h-4" />
        </Button>
      </div>
    </div>
  </div>

</template>