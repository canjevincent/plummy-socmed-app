<script lang="ts" setup>
  
  import { Picker, EmojiIndex } from 'emoji-mart-vue-fast/src';
  import data from 'emoji-mart-vue-fast/data/all.json';
  import 'emoji-mart-vue-fast/css/emoji-mart.css';

  import { getPostLiked } from '~/composables/plummy/usePostLikes';
  import { useMutation } from '@tanstack/vue-query';
  import { useToast } from '~/components/ui/toast';
  import { formatEmojiName } from '~/utils/emojiUtils';

  const { toast } = useToast();

  const props = defineProps<{
    postId: string | null
  }>();

  const postId = computed(() => props.postId || undefined)

  const { 
    likedData, 
    isLiked,
    isLoading: isCheckPostLikedLoading, 
    error: postLikedError, 
    refetch: refetchPostLiked } = getPostLiked(postId)

  let includeEmojiLikes = ['smileys'] as any[]
  let excludeEmojiLikes = ['people','nature','foods','activity','places','objects','symbols','flags'] as any[]

  const emojiLikesIndex = new EmojiIndex(data,{
    include: includeEmojiLikes,
    exclude: excludeEmojiLikes
  });

  const { mutate: createLike, isPending: isLiking } = useMutation({
    mutationFn: async(payload: any) => {
      return await $fetch(`/api/plummy/home/main/like`, {
        method: 'POST',
        body: payload
      });
    },
    onSuccess: async() => {
      await refetchPostLiked();
      toast({
        title: 'Like Posted',
        description: 'Your like has been shared successfully.',
      });
    },
    onError: async(error:any) => {
      await refetchPostLiked();
      // Handle validation errors
      if (error.data?.data?.errors) {
        console.error('Validation errors:', error.data.data.errors);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: Object.values(error.data.data.errors)[0] as string || 'Failed to create like',
        });
      } else {
        // Handle generic errors
        console.error('Like creation error:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'An unexpected error occurred. Please try again later.',
        });
      }
    }
  });

  const handleEmojiLikeSelect = (emoji: any) => {
    if (postId.value) {
      const commentData = {
        emoji: emoji.native,
        emoji_name: formatEmojiName(emoji.short_name),
        emoji_id: emoji.id,
        postId: postId.value,
      }
      
      createLike(commentData)
    }
  }

  const { mutate: deleteLike, isPending: isDisliking } = useMutation({
    mutationFn: async(payload: any) => {
      return await $fetch(`/api/plummy/home/main/${postId.value}/like`, {
        method: 'DELETE',
        body: payload
      });
    },
    onSuccess: async(removedLike) => {
      await refetchPostLiked();
      console.log('Removed liked', removedLike);
    },
    onError: async(error:any) => {
      await refetchPostLiked();
      console.error('Like deletion error:', error);
    }
  })

  const handleDeleteLike = (likeId: string) => {
    deleteLike({
      likeId: likeId
    })
  }
  
</script>

<template>
  <div class="flex items-center justify-center w-full p-2 rounded-sm cursor-pointer bg-slate-100" v-if="isDisliking || isLiking || isCheckPostLikedLoading">
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" disabled>
      <circle cx="4" cy="12" r="3" fill="currentColor">
        <animate id="svgSpinners3DotsScale0" attributeName="r" begin="0;svgSpinners3DotsScale1.end-0.25s" dur="0.75s" values="3;.2;3"></animate>
      </circle>
      <circle cx="12" cy="12" r="3" fill="currentColor">
        <animate attributeName="r" begin="svgSpinners3DotsScale0.end-0.6s" dur="0.75s" values="3;.2;3"></animate>
      </circle>
      <circle cx="20" cy="12" r="3" fill="currentColor">
        <animate id="svgSpinners3DotsScale1" attributeName="r" begin="svgSpinners3DotsScale0.end-0.45s" dur="0.75s" values="3;.2;3"></animate>
      </circle>
    </svg>
  </div>

  <HoverCard v-if="!isLiked && !isDisliking && !isLiking && !isCheckPostLikedLoading">
    <HoverCardTrigger as-child>
      <div class="flex items-center justify-center w-full p-2 rounded-sm cursor-pointer hover:bg-purple-300 gap-x-1">
        <Icon name="lucide:thumbs-up" class="w-4 h-4" /> 
        <small class="text-sm font-semibold leading-none">
          Like
        </small>
      </div>
    </HoverCardTrigger>
    <HoverCardContent class="w-full p-1"> 
      <Picker
        :data="emojiLikesIndex"
        title="Pick your emoji…"
        emoji="smiley"
        @select="handleEmojiLikeSelect"
        :showCategories="false"
        :showPreview="false"
        :showSearch="false"
      />
    </HoverCardContent>
  </HoverCard>
  <div 
    v-if="isLiked && !isDisliking && !isLiking && !isCheckPostLikedLoading"
    @click="handleDeleteLike(likedData?.id ?? '')"
    class="flex items-center justify-center w-full p-2 rounded-sm cursor-pointer hover:bg-purple-300 gap-x-1" >
    <small class="text-sm font-semibold leading-none text-purple-600 hover:text-white">
      {{ likedData?.emoji }} {{ likedData?.emoji_name }}
    </small>
  </div>
</template>


