<script setup lang="ts">

  import { usePostLikes, getPostLikesCount } from '~/composables/plummy/usePostLikes';

  const props = defineProps<{
    postId: string | null
  }>();

  const postId = computed(() => props.postId || undefined)

  // Use the composable to fetch the likes & count

  const {
    count: likesCount,
    sortedEmojiData: sortedEmojiData,
    isLoading: isLikesCountLoading,
    error: likesCountError,
    refetch: refetchLikesCOunt
  } = getPostLikesCount(postId)

  const isLikesPopoverOpen = ref(false);
  const selectedEmojiId = ref<string | undefined>(undefined);
  
  const {
    postLikes,
    fetchNextPage: fetchNextPageLikes,
    hasNextPage: hasNextPageLikes,
    isFetchingNextPage: isFetchingNextPageLikes,
    isLoading: isLikesLoading,
    error: likesError,
    refetch: refetchLikesView
  } = usePostLikes(postId, selectedEmojiId)

  // Reference for the intersection observer
  const likesEndRef = ref<HTMLElement | null>(null);

  // Handle Infinite Scroll
  onMounted(() => {
    if (!process.client) return;
    
    const handleLikesScroll = () => {
      const container = document.querySelector('.max-h-\\[30rem\\].overflow-y-scroll');
      const endRef = likesEndRef.value;
      if (!container || !endRef || !hasNextPageLikes.value || isFetchingNextPageLikes.value) return;
      
      const { bottom: containerBottom } = container.getBoundingClientRect();
      const { top: endRefTop } = endRef.getBoundingClientRect();
      
      if (endRefTop <= containerBottom + 150) {
        fetchNextPageLikes();
      }
    };
    
    // Watch for popover state changes
    watch(isLikesPopoverOpen, (isOpen) => {
      if (isOpen) {
        // Reset emoji filter when opening popover
        selectedEmojiId.value = undefined;
        // Add scroll listener when popover opens
        setTimeout(() => {
          const likesContainer = document.querySelector('.max-h-\\[30rem\\].overflow-y-scroll');
          likesContainer?.addEventListener('scroll', handleLikesScroll);
        }, 100);
      } else {
        // Remove scroll listener when popover closes
        const likesContainer = document.querySelector('.max-h-\\[30rem\\].overflow-y-scroll');
        likesContainer?.removeEventListener('scroll', handleLikesScroll);
      }
    });
    
    onBeforeUnmount(() => {
      const likesContainer = document.querySelector('.max-h-\\[30rem\\].overflow-y-scroll');
      likesContainer?.removeEventListener('scroll', handleLikesScroll);
    });
  });

  const handleEmojiFilter = (emojiId: string | undefined) => {
    selectedEmojiId.value = emojiId;
    refetchLikesView();
  }

</script>

<template>

  <Popover>
    <PopoverTrigger class="flex items-center space-x-2">
      <div class="flex items-center">
        <small v-for="emoji in sortedEmojiData.slice(0, 3)" :key="emoji.emojiId">
          {{ emoji.emoji }}
        </small>
      </div>
      <small class="text-sm font-semibold leading-none text-muted-foreground">
        {{ likesCount }}
      </small>
    </PopoverTrigger>
    <PopoverContent 
      class="w-[50rem] max-h-[30rem] overflow-y-scroll"
      @open-auto-focus="isLikesPopoverOpen = true"
      @close-auto-focus="isLikesPopoverOpen = false"
    >

      <div v-if="isLikesPopoverOpen" class="flex flex-col w-full space-y-2">
        
        <div class="flex min-h-[2.5rem] space-x-2 items-center">
          
          <small 
            @click="handleEmojiFilter(undefined)"
            :class="[
              'p-2 text-sm font-semibold leading-none rounded-md cursor-pointer text-muted-foreground hover:border-2 hover:border-purple-600',
              !selectedEmojiId ? 'bg-gray-100' : 'bg-none'
            ]"
          >
            All
          </small>

          <div 
            @click="handleEmojiFilter(emoji.emojiId)"
            :class="[
              'flex items-center justify-center p-2 space-x-2 text-sm font-semibold leading-none rounded-md cursor-pointer hover:border-2 hover:border-purple-600 hover:rounded-md text-muted-foreground',
              selectedEmojiId === emoji.emojiId ? 'bg-gray-100' : 'bg-none'
            ]"
            v-for="emoji in sortedEmojiData.slice(0, 5)" 
            :key="emoji.emojiId">
              {{ emoji.emoji }} {{ emoji.count }}
          </div>

          <DropdownMenu v-if="sortedEmojiData.length > 5">
            <DropdownMenuTrigger>
              <small class="flex items-center p-2 text-sm font-semibold leading-none rounded-md cursor-pointer text-muted-foreground hover:border-2 hover:border-purple-600">
                More <Icon name="lucide:ellipsis" class="w-4 h-4 ml-1" />
              </small>
            </DropdownMenuTrigger>
            <DropdownMenuContent class="flex flex-col space-y-2 min-w-[4rem]">
              <div 
                @click="handleEmojiFilter(emoji.emojiId)"
                :class="[
                  'flex items-center justify-center p-2 space-x-2 text-sm font-semibold leading-none rounded-md cursor-pointer hover:border-2 hover:border-purple-600 hover:rounded-md text-muted-foreground',
                  selectedEmojiId === emoji.emojiId ? 'bg-gray-100' : 'bg-none'
                ]"
                v-for="emoji in sortedEmojiData.slice(6)" 
                :key="emoji.emojiId">
                {{ emoji.emoji }} {{ emoji.count }}
              </div> 
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
        
        <div v-for="like in postLikes" :key="like.id">
          <div class="group">

            <div class="flex p-2 space-x-2 border rounded-sm group border-slate-300 group-hover:border-purple-600 group-hover:border-2">
              <Avatar class="group-hover:border-2 group-hover:border-purple-600">
                <AvatarImage :src="like.user.avatarUrl as string" />
                <AvatarFallback>{{ like.user.firstName?.charAt(0) }} {{ like.user.lastName?.charAt(0) }}</AvatarFallback>
              </Avatar>
              <div class="space-y-1">
                <h4 class="text-sm font-semibold">
                  {{ like.user.email }}
                </h4>
                <p class="text-sm">
                  {{ like.emoji }} {{ like.user.firstName }} {{ like.user.lastName }} 
                </p>
                <div class="flex items-center">
                  <Icon name="lucide:calendar-days" class="w-4 h-4 mr-2 opacity-70" />
                  <span class="text-xs text-muted-foreground">
                    Joined {{ like.user?.createdAt ? formatRelativeTime(like.user?.createdAt ? like.user.createdAt.toString() : '') : '' }}
                  </span>
                </div>
              </div>
            </div>
            
          </div>
        </div>

        <div ref="likesEndRef" class="py-2 text-center">
          <div v-if="isFetchingNextPageLikes" class="flex items-center justify-center gap-2 text-sm text-gray-600">
            <Icon name="lucide:loader" class="w-4 h-4 animate-spin" />
            <span>Loading more likes...</span>
          </div>
          <div v-else-if="!hasNextPageLikes && postLikes.length > 0" class="text-sm text-gray-500">
            No more likes to load
          </div>
        </div>

      </div>

    </PopoverContent>
  </Popover>

</template>
