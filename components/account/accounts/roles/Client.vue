<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { columns } from './column'
import DataTable from './DataTable.vue'
import type { User } from '@prisma/client'

interface ApiResponse {
  data: User[]
  meta: {
    page: number
    pageSize: number
    totalCount: number
    totalPages: number
  }
}

// Pagination and filtering state
const page = ref(1)
const pageSize = ref(10)
const sortColumn = ref<string | null>(null)
const sortDirection = ref<'asc' | 'desc'>('desc')
const searchQuery = ref('')
const roleFilter = ref('')

// Debounce search to prevent too many requests
const debouncedSearchQuery = ref('')
let searchTimeout: NodeJS.Timeout

watch(searchQuery, (newVal) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    debouncedSearchQuery.value = newVal
    page.value = 1 // Reset to first page on new search
  }, 500)
})

// Data Table Query with server-side rendering
const { 
  data: queryData, 
  isLoading, 
  error,
  isError
} = useQuery<ApiResponse>({
  queryKey: computed(() => [
    'users', 
    page.value, 
    pageSize.value, 
    sortColumn.value, 
    sortDirection.value, 
    debouncedSearchQuery.value,
    roleFilter.value
  ]),
  queryFn: async () => {
    const params = new URLSearchParams({
      page: page.value.toString(),
      pageSize: pageSize.value.toString(),
      ...(sortColumn.value && { sortColumn: sortColumn.value }),
      ...(sortDirection.value && { sortDirection: sortDirection.value }),
      ...(debouncedSearchQuery.value && { search: debouncedSearchQuery.value }),
      ...(roleFilter.value && { role: roleFilter.value })
    });

    const response = await fetch(`/api/account/accounts/roles?${params}`);
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    return response.json();
  },
  keepPreviousData: true // Smooth pagination transitions
});

// Computed data and metadata
const data = computed(() => queryData.value?.data || [])
const meta = computed(() => queryData.value?.meta || {
  page: 1,
  pageSize: 10,
  totalCount: 0,
  totalPages: 1
})

// Handlers for table interactions
const handleSort = (column: string, direction: 'asc' | 'desc') => {
  sortColumn.value = column
  sortDirection.value = direction
}

const handlePageChange = (newPage: number) => {
  page.value = newPage
}

const handleRoleFilter = (role: string) => {
  roleFilter.value = role
  page.value = 1
}
</script>

<template>
  <section class="container p-4 mt-5 bg-white rounded-md border border-gray-100 shadow-sm">
    <!-- Error message -->
    <div v-if="isError" class="p-4 mb-4 text-red-600 bg-red-50 rounded-md">
      Error loading data: {{ error?.message }}
    </div>

    <!-- Search and Filter Controls -->
    <div class="flex flex-col gap-4 justify-between items-center mb-4 md:flex-row">
      <input 
        type="text" 
        v-model="searchQuery"
        placeholder="Search users..." 
        class="w-full md:max-w-xs input input-bordered"
      />
      <select 
        v-model="roleFilter" 
        @change="(e: Event) => handleRoleFilter((e.target as HTMLSelectElement).value)"
        class="w-full md:max-w-xs select select-bordered"
      >
        <option value="">All Roles</option>
        <option value="ADMIN">Admin</option>
        <option value="USER">User</option>
      </select>
    </div>

    <DataTable 
      :columns="columns" 
      :data="data"
      :loading="isLoading"
      :total-pages="meta.totalPages"
      :current-page="meta.page"
      @sort="handleSort"
      @page-change="handlePageChange"
    />
  </section>
</template>