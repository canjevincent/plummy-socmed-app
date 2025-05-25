import { useInfiniteQuery, useQuery } from '@tanstack/vue-query'

export const useGetPostCommentsCount = (postId: Ref<string | undefined>) => {
  const { data, isLoading, error, refetch } = useQuery<{ count: number }>({
    queryKey: ['post-comments-count', postId],
    queryFn: async () => {
      if (!postId.value) return { count: 0 }
      const response = await $fetch<{ count: number }>(`/api/plummy/home/main/${postId.value}/commentCount`, {
        method: 'GET'
      })
      return response
    },
    enabled: computed(() => !!postId.value)
  })

  return {
    count: computed(() => data.value?.count ?? 0),
    isLoading,
    error,
    refetch
  }
}

export const usePostComments = (postId: Ref<string | undefined>) => {
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
    queryKey: ['post-comments', postId],
    queryFn: async ({ pageParam = 0 }) => {
      if (!postId.value) return []
      return await $fetch(`/api/plummy/home/main/${postId.value}/comment`, {
        method: 'GET',
        params: { skip: pageParam, take: PAGE_SIZE }
      })
    },
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || lastPage.length < PAGE_SIZE) return undefined
      return allPages.length * PAGE_SIZE
    },
    initialPageParam: 0,
    enabled: computed(() => !!postId.value)
  })
  
  // Computed property to flatten all pages of comments into a single array
  const postComments = computed(() => {
    return data.value?.pages.flat() || []
  })
  
  return {
    postComments,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch
  }
}