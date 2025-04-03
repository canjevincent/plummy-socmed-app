<script setup lang="ts">
  import { columns } from './columns'
  import DataTable from './DataTable.vue'
  import { useUsersTable } from '@/composables/useUsersTable'

  const {
    page,
    pageSize,
    sortBy,
    sortOrder,
    filters,
    tableData,
    isLoading
  } = useUsersTable()
</script>

<template>
  <section class="container p-4 mt-5 bg-white rounded-md border border-gray-100 shadow-sm">
    <DataTable 
      :columns="columns" 
      :data="tableData?.data || []"
      :total-count="tableData?.totalCount || 0"
      :page="page"
      :page-size="pageSize"
      :sort-by="sortBy"
      :sort-order="sortOrder"
      :filters="filters"
      :loading="isLoading"
      @update:page="(newPage) => page = newPage"
      @update:page-size="(newSize) => pageSize = newSize"
      @update:sort="(newSort) => { sortBy = newSort.sortBy; sortOrder = newSort.sortOrder }"
      @update:filters="(newFilters) => filters = newFilters"
    />
  </section>
</template>