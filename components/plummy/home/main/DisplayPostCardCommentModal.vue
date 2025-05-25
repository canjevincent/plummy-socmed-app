<script setup lang="ts">

  import { formatRelativeTime } from '~/utils/dateUtils'
  import { Picker, EmojiIndex } from 'emoji-mart-vue-fast/src';
  import data from 'emoji-mart-vue-fast/data/all.json';
  import 'emoji-mart-vue-fast/css/emoji-mart.css';

  import { useMutation } from '@tanstack/vue-query';
  import { useToast } from '~/components/ui/toast';
  import { usePostComments } from '~/composables/plummy/usePostComments';

  const { toast } = useToast();

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
    images: PostImage[] | [];
  }

  const props = defineProps<{
    isModalVisible: boolean,
    postContent: Post | null
  }>();

  const postId = computed(() => props.postContent?.id)
  
  // Use the composable to fetch comments
  const { 
    postComments, 
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingComments, 
    error: commentsError,
    refetch: refetchComments
  } = usePostComments(postId)
  
  // Refetch comments when the modal is opened with a new post
  watch(() => props.isModalVisible, (isVisible) => {
    if (isVisible && postId.value) {
      refetchComments()
    }
  });

  // Reference for the intersection observer
  const commentsEndRef = ref<HTMLElement | null>(null);
  
  // Handle Infinite Scroll
  onMounted(() => {
    if (!process.client) return;
    
    const handleScroll = () => {
      const container = document.querySelector('.max-h-\\[90vh\\].overflow-y-scroll');
      const endRef = commentsEndRef.value;
      if (!container || !endRef || !hasNextPage.value || isFetchingNextPage.value) return;
      
      const { bottom: containerBottom } = container.getBoundingClientRect();
      const { top: endRefTop } = endRef.getBoundingClientRect();
      
      if (endRefTop <= containerBottom + 150) {
        fetchNextPage();
      }
    };
    
    watch(() => props.isModalVisible, (isVisible) => {
      if (!isVisible) return;
      
      setTimeout(() => {
        const container = document.querySelector('.max-h-\\[90vh\\].overflow-y-scroll');
        container?.addEventListener('scroll', handleScroll);
      }, 300);
    }, { immediate: true });
    
    onBeforeUnmount(() => {
      const container = document.querySelector('.max-h-\\[90vh\\].overflow-y-scroll');
      container?.removeEventListener('scroll', handleScroll);
    });
  });

  // Modal emits

  const emit = defineEmits<{
    (e: 'onClose'): void,
  }>();

  const isOpen = computed({
    get: () => props.isModalVisible,
    set: () => {
      emit('onClose');
    }
  })

  // Expand image

  const activeImage = ref<string | null>(null)

  const showImageModal = (url: string) => {
    activeImage.value = url
  }

  // Quill editor - Comment

  // Import Quill and Parchment for custom blot
  const Quill = process.client ? (await import('quill')).default : null;
  const Parchment = process.client ? Quill?.import('parchment') : null;
  const ImageBlot = process.client ? Quill?.import('formats/image') : null;

  // Define custom image blot with class
  if (process.client && Quill && ImageBlot) {
    class CustomImageBlot extends ImageBlot {
      static create(value: any) {
        const node = super.create(value);
        node.classList.add('gif-image');
        // node.classList.add('w-full');
        node.classList.add('rounded-md');
        // node.classList.add('my-2');
        return node;
      }
    }
    CustomImageBlot.blotName = 'customImage';
    CustomImageBlot.tagName = 'img';
    Quill.register(CustomImageBlot);
  };

  // Dynamic import of QuillEditor to avoid SSR issues when using quill on a modal component
  const { QuillEditor } = process.client ? await import('@vueup/vue-quill') : { QuillEditor: null };
  const message = ref<string>("");
  const quillEditor = ref<any>(null); // Handle quill editor instance

  const options = ref({
    modules: {
      toolbar: false
    },
    placeholder: 'Compose here...',
    readOnly: false
  });

  // Giphy Config
  const config = useRuntimeConfig()
  const gif_apikey = config.public.giphyApiKey;
  const gif_apiurl = config.public.giphyApiUrl;
  const searchGiphy = ref("");
  const gifs = ref<any[]>([]);

  const fetchGifs = async () => {
    const endpoint = searchGiphy.value.trim() === "" ? "trending" : `search?q=${searchGiphy.value}`
    const params = {
      api_key: gif_apikey,
      limit: 20,
      ...(endpoint === "search" && {q:searchGiphy.value})
    }
    const response = await $fetch(`${gif_apiurl}/${endpoint}`,{ params })
    gifs.value = response.data
  }

  const handleGifSelect = (gif: any) => {
    if (quillEditor.value){
      const quill = quillEditor.value.getQuill();
      const range = quill.getSelection(true);
      const position = range ? range.index : quill.getLength();
      // Use customImage instead of image
      quill.insertEmbed(position, 'customImage', gif);
      // Move cursor after the inserted image
      quill.setSelection(position + 1);
    }
  }

  // Emoji State
  const emojiIndex = new EmojiIndex(data);

  const handleEmojiSelect = (emoji : any) => {

    // emit('updateEmoji', emoji.native);

    if (quillEditor.value){
      const quill = quillEditor.value.getQuill();
      const range = quill.getSelection();
      const position = range ? range.index : quill.getLength();
      quill.insertText(position, emoji.native);
      // Move cursor after the inserted emoji
      quill.setSelection(position + emoji.native.length);
    }
  };

  const { mutate: createComment, isPending: isCommenting } = useMutation({
    mutationFn: async (payload: any) => {
      return await $fetch('/api/plummy/home/main/comment', {
        method: 'POST',
        body: payload,
      });
    },
    onSuccess: async () => {
      
      toast({
        title: 'Comment Posted',
        description: 'Your comment has been shared successfully.',
      });

      // Reset form
      message.value = '';
      if (quillEditor.value) {
        const quill = quillEditor.value.getQuill();
        quill.setContents([]);
        quill.root.innerHTML = '';
      }

      // Refetch comments to show the new comment
      refetchComments();

    },
    onError: (error: any) => {
      
      // Handle validation errors
      if (error.data?.data?.errors) {
        console.error('Validation errors:', error.data.data.errors);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: Object.values(error.data.data.errors)[0] as string || 'Failed to create comment',
        });
      } else {
        // Handle generic errors
        console.error('Comment creation error:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'An unexpected error occurred. Please try again later.',
        });
      }

    }
  }) 

  const handleComment = () => {
    if (quillEditor.value) {

      const quill = quillEditor.value.getQuill();
      const content = quill.root.innerHTML;

      const commentData = {
        comment: content,
        postId: props.postContent?.id
      }

      createComment(commentData);
      
    }
  }

  const expandedComments = ref<Record<string, boolean>>({})

  // Function to check if a comment is short and auto-expand it
  const checkCommentLength = (comment: string, commentId: string) => {
    // Only run on client-side to avoid SSR issues
    if (!process.client) return
    
    // Extract text content from HTML to get accurate character count
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = comment
    const textContent = tempDiv.textContent || tempDiv.innerText
    
    // If comment is short (less than 300 characters), auto-expand it
    if (textContent.length < 300) {
      expandedComments.value[commentId] = true
    }
  }

  // Watch for changes in postComments and apply auto-expansion
  watch(postComments, (newComments) => {
    if (newComments.length > 0) {
      newComments.forEach(comment => {
        checkCommentLength(comment.comment, comment.id)
      })
    }
  }, { immediate: true })

</script>

<template>

  <Dialog :open="isOpen" @update:open="emit('onClose')">
    <DialogContent class="max-h-[90vh] overflow-y-scroll min-w-[35rem] pb-0">
      <div class="relative flex flex-col gap-y-5">
        <div class="flex flex-col px-3 pt-3 pb-0 border rounded-sm shadow-sm group-hover:border-2 group-hover:shadow-md group-hover:border-purple-600 gap-y-2 bg-muted/50">

          <!-- Post author and content sections -->

          <div class="flex justify-between">
            <div class="flex gap-x-2">
              <div class="w-10 h-10 border-2 border-white rounded-full cursor-pointer group-hover:ring-2 group-hover:ring-purple-600"> 
                <NuxtImg 
                  :src="postContent?.author.avatar" 
                  class="object-cover w-full h-full rounded-full" 
                />
              </div>

              <div class="flex flex-col gap-y-1">
                <small class="text-sm font-medium leading-none">
                  {{ postContent?.author.name }}
                </small>
                <p class="text-sm text-muted-foreground">
                  {{ postContent?.createdAt ? formatRelativeTime(postContent?.createdAt ? postContent.createdAt.toString() : '') : '' }} <Icon name="lucide:crown" class="w-4 h-4 group-hover:text-purple-600" />
                </p>
              </div>
            </div>

            <div class="flex items-center gap-x-2">
              <div class="flex items-center justify-center p-1 rounded-full cursor-pointer w-7 h-7 aspect-square hover:bg-purple-200 hover:border hover:border-purple-300">
                <Icon name="lucide:ellipsis" class="w-6 h-6" />
              </div>
              <div class="flex items-center justify-center p-1 rounded-full cursor-pointer w-7 h-7 aspect-square hover:bg-purple-200 hover:border hover:border-purple-300">
                <Icon name="lucide:x" class="w-6 h-6" />
              </div>
            </div>
          </div>

          <div 
            v-html="postContent?.content" 
            class="text-sm prose-sm prose max-w-none"
          />
          
          <div class="flex flex-wrap gap-1">
            <div class="w-36" v-for="image in postContent?.images" :key="image.id">
              <NuxtImg :src="image.url" :alt="image.url" class="w-full h-full rounded-md cursor-pointer" @click="showImageModal(image.url)" />
            </div>
          </div>

          <div class="flex justify-between">
            <PlummyHomeMainDisplayPostCardUserLike :postId="postId || null" />

            <PlummyHomeMainDisplayPostCardUserComment :postId="postId || null" />
          </div>

          <div class="flex justify-around border-y-2">
            
            <PlummyHomeMainDisplayPostCardLike :postId="postId || null" />

            <div class="flex items-center justify-center w-full p-2 rounded-sm cursor-pointer hover:bg-purple-300 gap-x-1">
              <Icon name="lucide:message-square" class="w-4 h-4" /> 
              <small class="text-sm font-semibold leading-none">
                Comment
              </small>
            </div>

          </div>

          <!-- Comments section -->

          <div v-if="isLoadingComments" class="flex justify-center py-2">
            <div class="flex items-center justify-center gap-2 text-sm text-gray-600">
              <Icon name="lucide:loader" class="w-5 h-5 animate-spin" />
              <span>Loading comments...</span>
            </div>
          </div>
          
          <div v-else-if="commentsError" class="p-2 text-sm text-center text-red-500">
            Failed to load comments. Please try again.
          </div>
          
          <div v-else-if="postComments.length === 0" class="p-4 text-center text-gray-500">
            No comments yet. Be the first to comment!
          </div>

          <div class="flex flex-col p-x-3" v-for="postComment in postComments" :key="postComment.id">
            <div class="flex group gap-x-3">
              <div class="w-10 h-10 border-2 border-white rounded-full cursor-pointer aspect-square group-hover:ring-2 group-hover:ring-purple-600"> 
                <NuxtImg 
                  :src="postComment.user.avatarUrl || '/path/to/default-avatar.png'" 
                  class="object-cover w-full h-full rounded-full" 
                />
              </div>

              <div class="flex flex-col mb-3 gap-y-2">
                <div class="flex flex-col p-3 border-[1px] rounded-lg gap-y-3 bg-slate-100 border-slate-300 group-hover:border-purple-600 group-hover:border-2">
                  
                  <small class="text-sm font-medium leading-none group-hover:text-purple-600 group-hover:font-bold">
                    {{ postComment.user.firstName }} {{ postComment.user.lastName }}
                  </small>

                  <div 
                    v-html="postComment.comment" 
                    class="w-full text-sm prose-sm prose text-muted-foreground group-hover:text-slate-600 group-hover:font-semibold"
                    :class="{ 'max-h-32 overflow-y-hidden border shadow-sm p-1 rounded-sm': !expandedComments[postComment.id] }"
                  />

                  <div 
                    v-if="!expandedComments[postComment.id]" 
                    @click="expandedComments[postComment.id] = true" 
                    class="mt-1 text-sm font-medium text-purple-600 cursor-pointer hover:text-purple-800 hover:font-bold"
                  >
                    Read more ...
                  </div>

                </div>
                <small class="text-sm font-medium leading-none text-muted-foreground group-hover:font-bold group-hover:text-purple-600">
                  {{ formatRelativeTime(postComment.createdAt) }}
                </small>
              </div>
            </div>
          </div>

          <div ref="commentsEndRef" class="py-2 text-center">
            <div v-if="isFetchingNextPage" class="flex items-center justify-center gap-2 text-sm text-gray-600">
              <Icon name="lucide:loader" class="w-4 h-4 animate-spin" />
              <span>Loading more comments...</span>
            </div>
            <div v-else-if="!hasNextPage && postComments.length > 0" class="text-sm text-gray-500">
              No more comments to load
            </div>
          </div>

        </div>

        <div class="absolute sticky bottom-0 z-50 flex flex-col w-full p-3 bg-white border-2 border-b-0 border-purple-600 rounded-t-lg rounded-ss-lg">

          <QuillEditor 
            ref="quillEditor"
            :options="options" 
            v-model:content="message" 
          />

          <div class="flex justify-end p-y-3 gap-x-2" v-if="!isCommenting">
            <Popover>
              <PopoverTrigger>
                <Button variant="outline" size="icon" class="text-white bg-purple-600 border-2 border-purple-600">
                  <Icon name="lucide:smile" class="w-4 h-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent class="w-full p-1 hover:bg-purple-600">
                <Picker
                  :data="emojiIndex"
                  title="Pick your emoji…"
                  emoji="point_up"
                  @select="handleEmojiSelect"
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger @click="fetchGifs">
                <Button variant="outline" size="icon" class="text-sm font-semibold text-white bg-purple-600 border-2 border-purple-600">
                  GIF
                </Button>
              </PopoverTrigger>
              <PopoverContent class="flex flex-wrap p-1 border-2 overflow-y-scroll w-[50rem] h-96 hover:border-purple-600 gap-y-1 relative">

                <Input 
                  @keyup="fetchGifs"
                  v-model="searchGiphy"
                  tye="text" 
                  placeholder="Search gif.." 
                  class="border-[1px] w-full absolute top-0 bg-white z-10 sticky focus:border-purple-600 focus:border-2"
                />

                <div class="border-2 rounded-sm cursor-pointer hover:border-purple-600" v-for="gif in gifs" :key="gif.id">
                  <NuxtImg 
                    :src="gif.images.fixed_height.url" 
                    class="rounded-md border-[1px] w-full h-auto" 
                    @click="handleGifSelect(gif.images.fixed_height.url)"
                  />
                </div>

              </PopoverContent>
            </Popover>

            <Button variant="outline" class="flex h-full font-semibold text-white bg-purple-600 border-2 border-purple-600" @click="handleComment"> 
              Comment
            </Button>
          </div>

          <div class="flex justify-end p-y-3 gap-x-2" v-if="isCommenting">

            <Button variant="outline" size="icon" class="border-2 border-purple-600 animate-pulse"> 
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><!-- Icon from SVG Spinners by Utkarsh Verma - https://github.com/n3r4zzurr0/svg-spinners/blob/main/LICENSE -->
                <rect width="7.33" height="7.33" x="1" y="1" fill="#A020F0">
                  <animate id="svgSpinnersBlocksWave0" attributeName="x" begin="0;svgSpinnersBlocksWave1.end+0.2s" dur="0.6s" values="1;4;1"/>
                  <animate attributeName="y" begin="0;svgSpinnersBlocksWave1.end+0.2s" dur="0.6s" values="1;4;1"/>
                  <animate attributeName="width" begin="0;svgSpinnersBlocksWave1.end+0.2s" dur="0.6s" values="7.33;1.33;7.33"/>
                  <animate attributeName="height" begin="0;svgSpinnersBlocksWave1.end+0.2s" dur="0.6s" values="7.33;1.33;7.33"/>
                </rect>
                <rect width="7.33" height="7.33" x="8.33" y="1" fill="#A020F0">
                  <animate attributeName="x" begin="svgSpinnersBlocksWave0.begin+0.1s" dur="0.6s" values="8.33;11.33;8.33"/>
                  <animate attributeName="y" begin="svgSpinnersBlocksWave0.begin+0.1s" dur="0.6s" values="1;4;1"/>
                  <animate attributeName="width" begin="svgSpinnersBlocksWave0.begin+0.1s" dur="0.6s" values="7.33;1.33;7.33"/>
                  <animate attributeName="height" begin="svgSpinnersBlocksWave0.begin+0.1s" dur="0.6s" values="7.33;1.33;7.33"/>
                </rect>
                <rect width="7.33" height="7.33" x="1" y="8.33" fill="#A020F0">
                  <animate attributeName="x" begin="svgSpinnersBlocksWave0.begin+0.1s" dur="0.6s" values="1;4;1"/>
                  <animate attributeName="y" begin="svgSpinnersBlocksWave0.begin+0.1s" dur="0.6s" values="8.33;11.33;8.33"/>
                  <animate attributeName="width" begin="svgSpinnersBlocksWave0.begin+0.1s" dur="0.6s" values="7.33;1.33;7.33"/>
                  <animate attributeName="height" begin="svgSpinnersBlocksWave0.begin+0.1s" dur="0.6s" values="7.33;1.33;7.33"/>
                </rect>
                <rect width="7.33" height="7.33" x="15.66" y="1" fill="#A020F0">
                  <animate attributeName="x" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="15.66;18.66;15.66"/>
                  <animate attributeName="y" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="1;4;1"/>
                  <animate attributeName="width" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="7.33;1.33;7.33"/>
                  <animate attributeName="height" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="7.33;1.33;7.33"/>
                </rect>
                <rect width="7.33" height="7.33" x="8.33" y="8.33" fill="#A020F0">
                  <animate attributeName="x" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="8.33;11.33;8.33"/>
                  <animate attributeName="y" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="8.33;11.33;8.33"/>
                  <animate attributeName="width" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="7.33;1.33;7.33"/>
                  <animate attributeName="height" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="7.33;1.33;7.33"/>
                </rect>
                <rect width="7.33" height="7.33" x="1" y="15.66" fill="#A020F0">
                  <animate attributeName="x" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="1;4;1"/>
                  <animate attributeName="y" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="15.66;18.66;15.66"/>
                  <animate attributeName="width" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="7.33;1.33;7.33"/>
                  <animate attributeName="height" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="7.33;1.33;7.33"/>
                </rect>
                <rect width="7.33" height="7.33" x="15.66" y="8.33" fill="#A020F0">
                  <animate attributeName="x" begin="svgSpinnersBlocksWave0.begin+0.3s" dur="0.6s" values="15.66;18.66;15.66"/>
                  <animate attributeName="y" begin="svgSpinnersBlocksWave0.begin+0.3s" dur="0.6s" values="8.33;11.33;8.33"/>
                  <animate attributeName="width" begin="svgSpinnersBlocksWave0.begin+0.3s" dur="0.6s" values="7.33;1.33;7.33"/>
                  <animate attributeName="height" begin="svgSpinnersBlocksWave0.begin+0.3s" dur="0.6s" values="7.33;1.33;7.33"/>
                </rect>
                <rect width="7.33" height="7.33" x="8.33" y="15.66" fill="#A020F0">
                  <animate attributeName="x" begin="svgSpinnersBlocksWave0.begin+0.3s" dur="0.6s" values="8.33;11.33;8.33"/>
                  <animate attributeName="y" begin="svgSpinnersBlocksWave0.begin+0.3s" dur="0.6s" values="15.66;18.66;15.66"/>
                  <animate attributeName="width" begin="svgSpinnersBlocksWave0.begin+0.3s" dur="0.6s" values="7.33;1.33;7.33"/>
                  <animate attributeName="height" begin="svgSpinnersBlocksWave0.begin+0.3s" dur="0.6s" values="7.33;1.33;7.33"/>
                </rect>
                <rect width="7.33" height="7.33" x="15.66" y="15.66" fill="#A020F0">
                  <animate id="svgSpinnersBlocksWave1" attributeName="x" begin="svgSpinnersBlocksWave0.begin+0.4s" dur="0.6s" values="15.66;18.66;15.66"/>
                  <animate attributeName="y" begin="svgSpinnersBlocksWave0.begin+0.4s" dur="0.6s" values="15.66;18.66;15.66"/>
                  <animate attributeName="width" begin="svgSpinnersBlocksWave0.begin+0.4s" dur="0.6s" values="7.33;1.33;7.33"/>
                  <animate attributeName="height" begin="svgSpinnersBlocksWave0.begin+0.4s" dur="0.6s" values="7.33;1.33;7.33"/>
                </rect>
              </svg>
            </Button>

            <Button variant="outline" size="icon" class="border-2 border-purple-600 animate-pulse"> 
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><!-- Icon from SVG Spinners by Utkarsh Verma - https://github.com/n3r4zzurr0/svg-spinners/blob/main/LICENSE -->
                <rect width="7.33" height="7.33" x="1" y="1" fill="#A020F0">
                  <animate id="svgSpinnersBlocksWave0" attributeName="x" begin="0;svgSpinnersBlocksWave1.end+0.2s" dur="0.6s" values="1;4;1"/>
                  <animate attributeName="y" begin="0;svgSpinnersBlocksWave1.end+0.2s" dur="0.6s" values="1;4;1"/>
                  <animate attributeName="width" begin="0;svgSpinnersBlocksWave1.end+0.2s" dur="0.6s" values="7.33;1.33;7.33"/>
                  <animate attributeName="height" begin="0;svgSpinnersBlocksWave1.end+0.2s" dur="0.6s" values="7.33;1.33;7.33"/>
                </rect>
                <rect width="7.33" height="7.33" x="8.33" y="1" fill="#A020F0">
                  <animate attributeName="x" begin="svgSpinnersBlocksWave0.begin+0.1s" dur="0.6s" values="8.33;11.33;8.33"/>
                  <animate attributeName="y" begin="svgSpinnersBlocksWave0.begin+0.1s" dur="0.6s" values="1;4;1"/>
                  <animate attributeName="width" begin="svgSpinnersBlocksWave0.begin+0.1s" dur="0.6s" values="7.33;1.33;7.33"/>
                  <animate attributeName="height" begin="svgSpinnersBlocksWave0.begin+0.1s" dur="0.6s" values="7.33;1.33;7.33"/>
                </rect>
                <rect width="7.33" height="7.33" x="1" y="8.33" fill="#A020F0">
                  <animate attributeName="x" begin="svgSpinnersBlocksWave0.begin+0.1s" dur="0.6s" values="1;4;1"/>
                  <animate attributeName="y" begin="svgSpinnersBlocksWave0.begin+0.1s" dur="0.6s" values="8.33;11.33;8.33"/>
                  <animate attributeName="width" begin="svgSpinnersBlocksWave0.begin+0.1s" dur="0.6s" values="7.33;1.33;7.33"/>
                  <animate attributeName="height" begin="svgSpinnersBlocksWave0.begin+0.1s" dur="0.6s" values="7.33;1.33;7.33"/>
                </rect>
                <rect width="7.33" height="7.33" x="15.66" y="1" fill="#A020F0">
                  <animate attributeName="x" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="15.66;18.66;15.66"/>
                  <animate attributeName="y" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="1;4;1"/>
                  <animate attributeName="width" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="7.33;1.33;7.33"/>
                  <animate attributeName="height" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="7.33;1.33;7.33"/>
                </rect>
                <rect width="7.33" height="7.33" x="8.33" y="8.33" fill="#A020F0">
                  <animate attributeName="x" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="8.33;11.33;8.33"/>
                  <animate attributeName="y" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="8.33;11.33;8.33"/>
                  <animate attributeName="width" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="7.33;1.33;7.33"/>
                  <animate attributeName="height" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="7.33;1.33;7.33"/>
                </rect>
                <rect width="7.33" height="7.33" x="1" y="15.66" fill="#A020F0">
                  <animate attributeName="x" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="1;4;1"/>
                  <animate attributeName="y" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="15.66;18.66;15.66"/>
                  <animate attributeName="width" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="7.33;1.33;7.33"/>
                  <animate attributeName="height" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="7.33;1.33;7.33"/>
                </rect>
                <rect width="7.33" height="7.33" x="15.66" y="8.33" fill="#A020F0">
                  <animate attributeName="x" begin="svgSpinnersBlocksWave0.begin+0.3s" dur="0.6s" values="15.66;18.66;15.66"/>
                  <animate attributeName="y" begin="svgSpinnersBlocksWave0.begin+0.3s" dur="0.6s" values="8.33;11.33;8.33"/>
                  <animate attributeName="width" begin="svgSpinnersBlocksWave0.begin+0.3s" dur="0.6s" values="7.33;1.33;7.33"/>
                  <animate attributeName="height" begin="svgSpinnersBlocksWave0.begin+0.3s" dur="0.6s" values="7.33;1.33;7.33"/>
                </rect>
                <rect width="7.33" height="7.33" x="8.33" y="15.66" fill="#A020F0">
                  <animate attributeName="x" begin="svgSpinnersBlocksWave0.begin+0.3s" dur="0.6s" values="8.33;11.33;8.33"/>
                  <animate attributeName="y" begin="svgSpinnersBlocksWave0.begin+0.3s" dur="0.6s" values="15.66;18.66;15.66"/>
                  <animate attributeName="width" begin="svgSpinnersBlocksWave0.begin+0.3s" dur="0.6s" values="7.33;1.33;7.33"/>
                  <animate attributeName="height" begin="svgSpinnersBlocksWave0.begin+0.3s" dur="0.6s" values="7.33;1.33;7.33"/>
                </rect>
                <rect width="7.33" height="7.33" x="15.66" y="15.66" fill="#A020F0">
                  <animate id="svgSpinnersBlocksWave1" attributeName="x" begin="svgSpinnersBlocksWave0.begin+0.4s" dur="0.6s" values="15.66;18.66;15.66"/>
                  <animate attributeName="y" begin="svgSpinnersBlocksWave0.begin+0.4s" dur="0.6s" values="15.66;18.66;15.66"/>
                  <animate attributeName="width" begin="svgSpinnersBlocksWave0.begin+0.4s" dur="0.6s" values="7.33;1.33;7.33"/>
                  <animate attributeName="height" begin="svgSpinnersBlocksWave0.begin+0.4s" dur="0.6s" values="7.33;1.33;7.33"/>
                </rect>
              </svg>
            </Button>

            <div class="flex p-2 border-2 border-purple-600 rounded-md animate-pulse gap-x-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><!-- Icon from SVG Spinners by Utkarsh Verma - https://github.com/n3r4zzurr0/svg-spinners/blob/main/LICENSE -->
                <rect width="7.33" height="7.33" x="1" y="1" fill="#A020F0">
                  <animate id="svgSpinnersBlocksWave0" attributeName="x" begin="0;svgSpinnersBlocksWave1.end+0.2s" dur="0.6s" values="1;4;1"/>
                  <animate attributeName="y" begin="0;svgSpinnersBlocksWave1.end+0.2s" dur="0.6s" values="1;4;1"/>
                  <animate attributeName="width" begin="0;svgSpinnersBlocksWave1.end+0.2s" dur="0.6s" values="7.33;1.33;7.33"/>
                  <animate attributeName="height" begin="0;svgSpinnersBlocksWave1.end+0.2s" dur="0.6s" values="7.33;1.33;7.33"/>
                </rect>
                <rect width="7.33" height="7.33" x="8.33" y="1" fill="#A020F0">
                  <animate attributeName="x" begin="svgSpinnersBlocksWave0.begin+0.1s" dur="0.6s" values="8.33;11.33;8.33"/>
                  <animate attributeName="y" begin="svgSpinnersBlocksWave0.begin+0.1s" dur="0.6s" values="1;4;1"/>
                  <animate attributeName="width" begin="svgSpinnersBlocksWave0.begin+0.1s" dur="0.6s" values="7.33;1.33;7.33"/>
                  <animate attributeName="height" begin="svgSpinnersBlocksWave0.begin+0.1s" dur="0.6s" values="7.33;1.33;7.33"/>
                </rect>
                <rect width="7.33" height="7.33" x="1" y="8.33" fill="#A020F0">
                  <animate attributeName="x" begin="svgSpinnersBlocksWave0.begin+0.1s" dur="0.6s" values="1;4;1"/>
                  <animate attributeName="y" begin="svgSpinnersBlocksWave0.begin+0.1s" dur="0.6s" values="8.33;11.33;8.33"/>
                  <animate attributeName="width" begin="svgSpinnersBlocksWave0.begin+0.1s" dur="0.6s" values="7.33;1.33;7.33"/>
                  <animate attributeName="height" begin="svgSpinnersBlocksWave0.begin+0.1s" dur="0.6s" values="7.33;1.33;7.33"/>
                </rect>
                <rect width="7.33" height="7.33" x="15.66" y="1" fill="#A020F0">
                  <animate attributeName="x" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="15.66;18.66;15.66"/>
                  <animate attributeName="y" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="1;4;1"/>
                  <animate attributeName="width" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="7.33;1.33;7.33"/>
                  <animate attributeName="height" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="7.33;1.33;7.33"/>
                </rect>
                <rect width="7.33" height="7.33" x="8.33" y="8.33" fill="#A020F0">
                  <animate attributeName="x" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="8.33;11.33;8.33"/>
                  <animate attributeName="y" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="8.33;11.33;8.33"/>
                  <animate attributeName="width" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="7.33;1.33;7.33"/>
                  <animate attributeName="height" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="7.33;1.33;7.33"/>
                </rect>
                <rect width="7.33" height="7.33" x="1" y="15.66" fill="#A020F0">
                  <animate attributeName="x" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="1;4;1"/>
                  <animate attributeName="y" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="15.66;18.66;15.66"/>
                  <animate attributeName="width" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="7.33;1.33;7.33"/>
                  <animate attributeName="height" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="7.33;1.33;7.33"/>
                </rect>
                <rect width="7.33" height="7.33" x="15.66" y="8.33" fill="#A020F0">
                  <animate attributeName="x" begin="svgSpinnersBlocksWave0.begin+0.3s" dur="0.6s" values="15.66;18.66;15.66"/>
                  <animate attributeName="y" begin="svgSpinnersBlocksWave0.begin+0.3s" dur="0.6s" values="8.33;11.33;8.33"/>
                  <animate attributeName="width" begin="svgSpinnersBlocksWave0.begin+0.3s" dur="0.6s" values="7.33;1.33;7.33"/>
                  <animate attributeName="height" begin="svgSpinnersBlocksWave0.begin+0.3s" dur="0.6s" values="7.33;1.33;7.33"/>
                </rect>
                <rect width="7.33" height="7.33" x="8.33" y="15.66" fill="#A020F0">
                  <animate attributeName="x" begin="svgSpinnersBlocksWave0.begin+0.3s" dur="0.6s" values="8.33;11.33;8.33"/>
                  <animate attributeName="y" begin="svgSpinnersBlocksWave0.begin+0.3s" dur="0.6s" values="15.66;18.66;15.66"/>
                  <animate attributeName="width" begin="svgSpinnersBlocksWave0.begin+0.3s" dur="0.6s" values="7.33;1.33;7.33"/>
                  <animate attributeName="height" begin="svgSpinnersBlocksWave0.begin+0.3s" dur="0.6s" values="7.33;1.33;7.33"/>
                </rect>
                <rect width="7.33" height="7.33" x="15.66" y="15.66" fill="#A020F0">
                  <animate id="svgSpinnersBlocksWave1" attributeName="x" begin="svgSpinnersBlocksWave0.begin+0.4s" dur="0.6s" values="15.66;18.66;15.66"/>
                  <animate attributeName="y" begin="svgSpinnersBlocksWave0.begin+0.4s" dur="0.6s" values="15.66;18.66;15.66"/>
                  <animate attributeName="width" begin="svgSpinnersBlocksWave0.begin+0.4s" dur="0.6s" values="7.33;1.33;7.33"/>
                  <animate attributeName="height" begin="svgSpinnersBlocksWave0.begin+0.4s" dur="0.6s" values="7.33;1.33;7.33"/>
                </rect>
              </svg>
              <div class="w-[3.7rem] h-4 col-span-2 bg-purple-600 rounded-md"></div>
            </div>
            
          </div>

        </div>

      </div>
    </DialogContent>
  </Dialog>

</template>

<style>
  .ql-container.ql-snow {
    border: none !important;
  }
  .ql-toolbar.ql-snow {
    border: none !important;
  }
</style>