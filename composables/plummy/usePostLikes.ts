import { useQuery, useInfiniteQuery } from '@tanstack/vue-query'

export const useGetPostLiked = (postId: Ref<string | undefined>) => { 
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['check-post-liked', postId],
    queryFn: async () => {
      if (!postId.value) return null
      const response = await $fetch(`/api/plummy/home/main/${postId.value}/likedPost`, {
        method: 'GET',
      })
      return response || null // Ensure we always return null if response is undefined
    }
  })

  const likedData = computed(() => data.value || null);
  const isLiked = computed(() => !!data.value);

  return {  
    likedData,
    isLiked,
    isLoading,
    error,
    refetch
  }
}

export const useGetPostLikesCount = (postId: Ref<string | undefined>) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['post-likes-count', postId],
    queryFn: async () => {
      if (!postId.value) return 0
      return await $fetch(`/api/plummy/home/main/${postId.value}/likeCount`, {
        method: 'GET'
      })
    },
    enabled: computed(() => !!postId.value)
  })

  const count = computed(() => data.value ? data.value.length || 0 : 0)

  const sortedEmojiData = computed(() => {
    if (!data.value) return []
    
    return Object.values(data.value.reduce((acc: Record<string, any>, curr: any) => {
      const emoji = curr.emoji
      const emojiName = curr.emoji_name
      const emojiId = curr.emoji_id
      
      // Create unique key for each emoji
      const key = `${emojiId}`
      
      if (!acc[key]) {
        acc[key] = {
          emoji,
          emojiName,
          emojiId,
          count: 0
        }
      }
      
      acc[key].count += 1
      
      return acc
    }, {}))
  })

  return {
    count,
    sortedEmojiData,
    isLoading,
    error,
    refetch
  }
}

export const usePostLikes = (postId: Ref<string | undefined>, emojiId?: Ref<string | undefined>) => {
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
    queryKey: ['post-likes', postId, emojiId],
    queryFn: async ({ pageParam = 0}) => {
      if (!postId.value) return []
      return await $fetch(`/api/plummy/home/main/${postId.value}/like`, {
        method: 'GET',
        params: { 
          skip: pageParam, 
          take: PAGE_SIZE,
          emojiId: emojiId?.value 
        }
      })
    },
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || lastPage.length < PAGE_SIZE) return undefined
      return allPages.length * PAGE_SIZE
    },
    initialPageParam: 0,
    enabled: computed(() => !!postId.value)
  })

  const postLikes = computed(() => {
    return data.value?.pages.flat() || []
  })

   return {
    postLikes,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch
  }
}


