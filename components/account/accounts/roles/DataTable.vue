<script setup lang="ts" generic="TData">
import type { ColumnDef } from '@tanstack/vue-table'
import {
  FlexRender,
  getCoreRowModel,
  useVueTable,
} from '@tanstack/vue-table'

interface Props<TData> {
  columns: ColumnDef<TData, any>[]
  data: TData[]
  loading?: boolean
  totalPages?: number
  currentPage?: number
}

const props = withDefaults(defineProps<Props<any>>(), {
  loading: false,
  totalPages: 1,
  currentPage: 1
})

const emit = defineEmits<{
  (e: 'sort', column: string, direction: 'asc' | 'desc'): void
  (e: 'page-change', page: number): void
}>()

const table = useVueTable({
  get data() { return props.data },
  get columns() { return props.columns },
  getCoreRowModel: getCoreRowModel(),
})

const handleSort = (column: string, direction: 'asc' | 'desc') => {
  emit('sort', column, direction)
}

const handlePageChange = (page: number) => {
  if (page >= 1 && page <= props.totalPages) {
    emit('page-change', page)
  }
}
</script>

<template>
  <div class="space-y-4">
    <div class="rounded-md border">
      <div class="relative">
        <Table>
          <TableHeader>
            <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
              <TableHead v-for="header in headerGroup.headers" :key="header.id">
                <FlexRender
                  v-if="!header.isPlaceholder" 
                  :render="header.column.columnDef.header"
                  :props="header.getContext()"
                />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <template v-if="loading">
              <TableRow>
                <TableCell :colspan="columns.length" class="h-24 text-center">
                  <div class="flex gap-2 justify-center items-center">
                    <span class="loading loading-spinner loading-sm"></span>
                    Loading...
                  </div>
                </TableCell>
              </TableRow>
            </template>
            <template v-else-if="table.getRowModel().rows?.length">
              <TableRow
                v-for="row in table.getRowModel().rows" 
                :key="row.id"
                :data-state="row.getIsSelected() ? 'selected' : undefined"
              >
                <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
                  <FlexRender 
                    :render="cell.column.columnDef.cell" 
                    :props="cell.getContext()" 
                  />
                </TableCell>
              </TableRow>
            </template>
            <template v-else>
              <TableRow>
                <TableCell :colspan="columns.length" class="h-24 text-center">
                  No results found.
                </TableCell>
              </TableRow>
            </template>
          </TableBody>
        </Table>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex flex-col gap-4 justify-between items-center px-2 sm:flex-row">
      <div class="text-sm text-muted-foreground">
        Showing page {{ currentPage }} of {{ totalPages }}
      </div>
      <div class="flex items-center space-x-2">
        <Button 
          variant="outline" 
          size="sm" 
          :disabled="currentPage === 1"
          @click="handlePageChange(currentPage - 1)"
        >
          Previous
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          :disabled="currentPage === totalPages"
          @click="handlePageChange(currentPage + 1)"
        >
          Next
        </Button>
      </div>
    </div>
  </div>
</template>