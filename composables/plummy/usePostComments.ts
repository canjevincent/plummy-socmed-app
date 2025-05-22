import { useInfiniteQuery } from '@tanstack/vue-query'

interface CommentAuthor {
  id: string
  firstName: string
  lastName: string
  avatarUrl: string
}

export interface Comment {
  id: string
  comment: string
  createdAt: string | Date
  user: CommentAuthor
  postId: string
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