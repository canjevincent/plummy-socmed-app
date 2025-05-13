import { useInfiniteQuery } from '@tanstack/vue-query'

interface Post {
  id: string
  content: string
  author: {
    id: string
    name: string
    avatar: string
  }
  createdAt: string
  images?: string[]
  // Add other post properties as needed
}

export function useContentInfiniteScrolling() {
  const PAGE_SIZE = 5

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch
  } = useInfiniteQuery({
    queryKey: ['posts'],
    queryFn: async ({ pageParam = 0 }) => {
      // Use the API endpoint we created
      const response = await $fetch(`/api/plummy/home/main/content?skip=${pageParam}&take=${PAGE_SIZE}`)
      return response
    },
    getNextPageParam: (lastPage, allPages) => {
      // If we received fewer posts than PAGE_SIZE, there are no more to load
      if (!lastPage || lastPage.length < PAGE_SIZE) return undefined
      return allPages.length * PAGE_SIZE
    },
    initialPageParam: 0
  })

  return {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch
  }
}