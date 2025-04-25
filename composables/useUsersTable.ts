import type { User } from '@prisma/client'
import { useQuery, keepPreviousData, useQueryClient } from '@tanstack/vue-query'

export function useUsersTable() {
  const route = useRoute()
  const router = useRouter()
  const queryClient = useQueryClient() // Get the query client instance

  // Reactive state
  const page = ref(Number(route.query.page) || 1)
  const pageSize = ref(Number(route.query.pageSize) || 10)
  const sortBy = ref(route.query.sortBy as string || 'createdAt')
  const sortOrder = ref(route.query.sortOrder as string || 'desc')
  const filters = ref(route.query.filters ? JSON.parse(route.query.filters as string) : {})
  const globalSearch = ref(route.query.search as string || '')

  // Tanstack Query
  const { data: tableData, isLoading } = useQuery({
    queryKey: ['users', { page, pageSize, sortBy, sortOrder, filters, globalSearch }],
    queryFn: async () => {
      const queryParams = new URLSearchParams({
        page: page.value.toString(),
        pageSize: pageSize.value.toString(),
        sortBy: sortBy.value,
        sortOrder: sortOrder.value,
        filters: JSON.stringify(filters.value),
        search: globalSearch.value
      }).toString()

      const response = await fetch(`/api/account/accounts/users?${queryParams}`)
      if (!response.ok) throw new Error('Network response was not ok')
      return response.json()
    },
    placeholderData: keepPreviousData,
  })

  // Watch for changes
  watch([page, pageSize, sortBy, sortOrder, filters, globalSearch], () => {
    router.push({
      query: {
        page: page.value,
        pageSize: pageSize.value,
        sortBy: sortBy.value,
        sortOrder: sortOrder.value,
        filters: JSON.stringify(filters.value),
        search: globalSearch.value || undefined
      }
    })
  }, { deep: true })

  // Initial load
  onMounted(() => {
    if (route.query.page) page.value = Number(route.query.page)
    if (route.query.pageSize) pageSize.value = Number(route.query.pageSize)
    if (route.query.sortBy) sortBy.value = route.query.sortBy as string
    if (route.query.sortOrder) sortOrder.value = route.query.sortOrder as string
    if (route.query.filters) filters.value = JSON.parse(route.query.filters as string)
    if (route.query.search) globalSearch.value = route.query.search as string
  })

  // Refresh function
  const refresh = async () => {
    await queryClient.invalidateQueries({
      queryKey: ['users', { page, pageSize, sortBy, sortOrder, filters, globalSearch }]
    })
  }

  // Function to set global search value
  const setGlobalSearch = (search: string) => {
    globalSearch.value = search
  }

  // Function to reset pagination to first page
  const resetPagination = () => {
    page.value = 1
  }
  return {
    page,
    pageSize,
    sortBy,
    sortOrder,
    filters,
    globalSearch,
    tableData,
    isLoading,
    refresh,
    setGlobalSearch,
    resetPagination
  }
}