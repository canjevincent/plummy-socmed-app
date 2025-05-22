<script lang="ts" setup>

  import { formatRelativeTime } from '~/utils/dateUtils'
  import { useContentInfiniteScrolling } from '~/composables/plummy/useContentInfiniteScrolling'
  import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
  
  const { 
    data,
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage, 
    isLoading 
  } = useContentInfiniteScrolling()
  
  // Computed property to flatten all pages of posts into a single array
  const posts = computed(() => {
    return data.value?.pages.flat() || []
  });
  
  // Reference for the intersection observer
  const containerRef = ref<HTMLElement | null>(null);
  
  // Set up intersection observer for infinite scrolling
  onMounted(() => {
    if (process.client) {
      const observer = new IntersectionObserver(
        (entries) => {
          const [entry] = entries
          if (entry.isIntersecting && hasNextPage.value && !isFetchingNextPage.value) {
            fetchNextPage()
          }
        },
        { threshold: 0.5 }
      )
      
      setTimeout(() => {
        if (containerRef.value) {
          observer.observe(containerRef.value)
        }
      }, 100)
      
      onBeforeUnmount(() => {
        if (containerRef.value) {
          observer.unobserve(containerRef.value)
        }
      })
    }
  });

  const expandedPosts = ref<Record<string, boolean>>({})

  const activeImage = ref<string | null>(null)

  const showImageModal = (url: string) => {
    activeImage.value = url
  }

  // Comment modal

  const isPostCommentVisible = ref(false)

  // Define the structure for post author
  interface PostAuthor {
    id: string;
    name: string;
    avatar: string;
  }

  // Define the structure for post images
  interface PostImage {
    id: string;
    postId: string;
    url: string;
  }

  // Define the main post structure
  interface Post {
    id: string;
    content: string;
    createdAt: string | Date;
    author: PostAuthor;
    images: PostImage[];
  }

  const selectedPostComment = ref<Post | null>(null)


  const openPostCommentModal = (content: Post) => {
    selectedPostComment.value = content
    isPostCommentVisible.value = true
  }

  const closePostCommentModal = () => {
    selectedPostComment.value = null
    isPostCommentVisible.value = false
  }

</script>

<template>
  <section class="flex flex-col space-y-2">
    <div class="group" v-for="post in posts" :key="post.id">
    
      <div class="flex flex-col px-3 pt-3 pb-0 space-y-2 border rounded-sm shadow-sm group-hover:border-2 group-hover:shadow-md group-hover:border-purple-600 bg-muted/50">

        <div class="flex justify-between">
          <div class="flex space-x-2">
            <div class="w-10 h-10 border-2 border-white rounded-full cursor-pointer group-hover:ring-2 group-hover:ring-purple-600"> 
              <NuxtImg 
                :src="post.author.avatar" 
                class="object-cover w-full h-full rounded-full" 
              />
            </div>

            <div class="flex flex-col space-y-1">
              <small class="text-sm font-medium leading-none">
                {{ post.author.name }}
              </small>
              <p class="text-sm text-muted-foreground">
                {{ formatRelativeTime(post.createdAt) }} <Icon name="lucide:crown" class="w-4 h-4 group-hover:text-purple-600" />
              </p>
            </div>
          </div>

          <div class="flex items-center space-x-2">
            <div class="flex items-center justify-center p-1 rounded-full cursor-pointer w-7 h-7 aspect-square hover:bg-purple-200 hover:border hover:border-purple-300">
              <Icon name="lucide:ellipsis" class="w-6 h-6" />
            </div>
            <div class="flex items-center justify-center p-1 rounded-full cursor-pointer w-7 h-7 aspect-square hover:bg-purple-200 hover:border hover:border-purple-300">
              <Icon name="lucide:x" class="w-6 h-6" />
            </div>
          </div>
        </div>

        <div class="flex flex-col">
          <div 
            v-html="post.content" 
            class="text-sm prose-sm prose max-w-none"
            :class="{ 'max-h-96 overflow-y-hidden border shadow-sm p-1 rounded-sm': !expandedPosts[post.id] }"
          />

          <div 
            v-if="!expandedPosts[post.id]" 
            @click="expandedPosts[post.id] = true" 
            class="mt-2 text-sm font-medium text-purple-600 cursor-pointer hover:text-purple-800 hover:font-bold"
          >
            Read more ...
          </div>
        </div>
        
        <div class="flex flex-wrap gap-1">
          <div class="w-36" v-for="image in post.images" :key="image.id">
            <NuxtImg :src="image.url" :alt="image.url" class="w-full h-full rounded-md cursor-pointer" @click="showImageModal(image.url)" />
          </div>
        </div>

        <Teleport to="body">
          <div 
            v-if="activeImage" 
            class="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-[0.5px] bg-black/10"
            @click="activeImage = null"
          >
            <div class="relative max-w-[90vw] max-h-[90vh]">
              <NuxtImg 
                :src="activeImage" 
                class="max-w-full max-h-[100vh] rounded-md shadow-sm object-contain"
                @click.stop
              />
              <Button 
                class="absolute p-2 border rounded-full top-2 right-2 bg-black/10 hover:bg-black/80"
                size="icon"
                @click="activeImage = null"
              >
                <Icon name="lucide:x" class="w-6 h-6" />
              </Button>
            </div>
          </div>
        </Teleport>

        <div class="flex justify-around border-t-2">
          
          <div class="flex items-center justify-center w-full p-2 space-x-1 rounded-sm cursor-pointer hover:bg-purple-300">
            <Icon name="lucide:thumbs-up" class="w-4 h-4" /> 
            <small class="text-sm font-semibold leading-none">
              Like
            </small>
          </div>

          <div class="flex items-center justify-center w-full p-2 space-x-1 rounded-sm cursor-pointer hover:bg-purple-300" @click="openPostCommentModal(post)">
            <Icon name="lucide:message-square" class="w-4 h-4" /> 
            <small class="text-sm font-semibold leading-none">
              Comment
            </small>
          </div>

        </div>

      </div>

    </div>

    <!-- Add a loading indicator and observer target at the bottom -->
    <div ref="containerRef" class="py-4 text-center">
      <div v-if="isFetchingNextPage" class="flex items-center justify-center text-sm text-gray-600">
        Loading more posts...
        <svg xmlns="http://www.w3.org/2000/svg" width="1rem" height="1rem" viewBox="0 0 24 24" class="ml-2 animate-spin">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" stroke-dasharray="30 30" stroke-dashoffset="0"></circle>
        </svg>
      </div>
      <div v-else-if="!hasNextPage && posts.length > 0" class="text-sm text-gray-600">
        No more posts to load
      </div>
    </div>
  </section>

  <PlummyHomeMainDisplayPostCardCommentModal 
    :post-content="selectedPostComment"
    :is-modal-visible="isPostCommentVisible" 
    @on-close="closePostCommentModal" 
  />
</template>