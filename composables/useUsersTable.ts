import type { User } from '@prisma/client'

export function useUsersTable() {
  const route = useRoute()
  const router = useRouter()

  // Reactive state
  const page = ref(Number(route.query.page) || 1)
  const pageSize = ref(Number(route.query.pageSize) || 10)
  const sortBy = ref(route.query.sortBy as string || 'createdAt')
  const sortOrder = ref(route.query.sortOrder as string || 'desc')
  const filters = ref(route.query.filters ? JSON.parse(route.query.filters as string) : {})

  // Tanstack Query
  const { data: tableData, isLoading } = useQuery({
    queryKey: ['users', { page, pageSize, sortBy, sortOrder, filters }],
    queryFn: async () => {
      const queryParams = new URLSearchParams({
        page: page.value.toString(),
        pageSize: pageSize.value.toString(),
        sortBy: sortBy.value,
        sortOrder: sortOrder.value,
        filters: JSON.stringify(filters.value)
      }).toString()

      const response = await fetch(`/api/account/accounts/roles?${queryParams}`)
      if (!response.ok) throw new Error('Network response was not ok')
      return response.json()
    },
    keepPreviousData: true
  })

  // Watch for changes
  watch([page, pageSize, sortBy, sortOrder, filters], () => {
    router.push({
      query: {
        page: page.value,
        pageSize: pageSize.value,
        sortBy: sortBy.value,
        sortOrder: sortOrder.value,
        filters: JSON.stringify(filters.value)
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
  })

  return {
    page,
    pageSize,
    sortBy,
    sortOrder,
    filters,
    tableData,
    isLoading
  }
}