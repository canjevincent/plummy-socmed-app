<script lang="ts" setup>

  import { Picker, EmojiIndex } from 'emoji-mart-vue-fast/src';
  import data from 'emoji-mart-vue-fast/data/all.json';
  import 'emoji-mart-vue-fast/css/emoji-mart.css';

  import { useLlm } from '~/composables/llm/useLlm';
  import { useLlmStore } from '~/stores/llm';

  import { useMutation } from '@tanstack/vue-query';
  import { useToast } from '~/components/ui/toast';

  const { toast } = useToast();

  // Get the LLM services
  const { tavily } = useLlm()
  const llmStore = useLlmStore()

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

  const props = defineProps<{
    isModalVisible: boolean
  }>();

  const emit = defineEmits<{
    (e: 'onClose'): void,
    (e: 'updateEmoji', emoji: string): void
  }>();

  const isOpen = computed({
    get: () => props.isModalVisible,
    set: () => {
      emit('onClose');
    }
  });

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

  // Dynamic import of QuillEditor to avoid SSR issues when using quill on a modal component
  const { QuillEditor } = process.client ? await import('@vueup/vue-quill') : { QuillEditor: null };
  const message = ref<string>("");
  const quillEditor = ref<any>(null); // Handle quill editor instance
  
  const options = ref({
    modules: {
      toolbar: false
    },
    placeholder: 'Compose here...',
    readOnly: false,
  });

  const handle_message_change = (content: any) => {
    console.log('Event content:', content);
  };

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

  // Add these new refs and functions for image upload
  const fileInput = ref<HTMLInputElement | null>(null);
  const selectedImages = ref<string[]>([]);

  const triggerFileInput = () => {
    if (fileInput.value) {
      // Use HTMLInputElement's click method
    (fileInput.value as HTMLInputElement).click();
    }
  };

  const handleImageUpload = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (!target.files) return;
    
    Array.from(target.files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result && typeof e.target.result === 'string') {
          selectedImages.value.push(e.target.result);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    selectedImages.value.splice(index, 1);
  };

  interface EnhancedTextFormat {
    text: string;
    aiEnhancedText: string;
    index: number;
    isApplied: boolean;
  };

  const currentText = ref<EnhancedTextFormat[]>([]);

  // Define interface for Quill Delta operations
  interface QuillDeltaOperation {
    insert?: string | object;
    delete?: number;
    retain?: number;
    attributes?: Record<string, any>;
  }

  // Set text to enhance with AI
  const handleSetAiEnhance = () => {
    if (quillEditor.value) {
      // Access the Quill instance
      const quill = quillEditor.value.getQuill();

      // Get the contents as a Delta object
      const delta = quill.getContents();
      console.log("Delta contents:", delta);
      
      // Process delta operations and extract text with indices
      if (delta.ops && delta.ops.length > 0) {
        currentText.value = [];
        let currentIndex = 0;
        
        // First, get the full text and split by newlines
        let fullText = '';
        let indexMap: number[] = [];
        
        // Build the full text and track original indices
        delta.ops.forEach((op: QuillDeltaOperation) => {
          if (op.insert && typeof op.insert === 'string') {
            const startIdx = fullText.length;
            fullText += op.insert;
            
            // Map each character position to its original index
            for (let i = 0; i < op.insert.length; i++) {
              indexMap.push(currentIndex + i);
            }
            
            currentIndex += op.insert.length;
          } else if (op.insert && typeof op.insert === 'object') {
            // For non-text inserts, add a placeholder
            fullText += '\u200B'; // Zero-width space as placeholder
            indexMap.push(currentIndex);
            currentIndex += 1;
          }
        });
        
        // Split the text by newlines
        const paragraphs = fullText.split('\n');
        let charIndex = 0;
        
        // Process each paragraph
        paragraphs.forEach((paragraph, i) => {
          // Skip empty paragraphs
          if (paragraph.trim()) {
            const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
            const urlRegex = /https?:\/\/[^\s]+/g;
            const customImageRegex = /\u200B/; // Zero-width space used as placeholder for images
            
            // Check if paragraph contains only text (no emojis, URLs, or images)
            const hasNoEmojis = !emojiRegex.test(paragraph) || paragraph.replace(emojiRegex, '').trim();
            const hasNoUrls = !urlRegex.test(paragraph);
            const hasNoImages = !customImageRegex.test(paragraph);
            
            // Only process paragraphs that are regular text
            if (hasNoEmojis && hasNoUrls && hasNoImages) {
              // Get the original index for the start of this paragraph
              const originalIndex = indexMap[charIndex];
              
              currentText.value.push({
                text: paragraph.trim(),
                index: originalIndex,
                aiEnhancedText: '',
                isApplied: false
              });
            }
          }
          
          // Move to the next paragraph (add +1 for the newline character)
          charIndex += paragraph.length;
          if (i < paragraphs.length - 1) {
            charIndex += 1; // For the newline
          }
        });
        
        console.log("Current text array:", currentText.value);
      }
    }
  };

  const activeContentIndex = ref<number|null>(null);

  // Enhance with AI
  const handleAiEnhance = async (query: string, index: number) => {
    
    try {
      // Call searchTavily directly from the store
      activeContentIndex.value = index;
      const result = await llmStore.searchTavily(query)
      
      console.log('Enhanced content:', result.answer)

      // Find and update the text item with the matching index
      const textItem = currentText.value.find(item => 
        item.index === index
      )
      
      if (textItem) {
        activeContentIndex.value = null
        textItem.aiEnhancedText = result.answer
      }
      
    } catch (error) {
      activeContentIndex.value = null
      console.error('Error enhancing text with AI:', error)
    }

  };

  // Apply Ai Enhance
  const handleApplyAiEnhance = (contentIndex: number): void => {
    // Find the text item with the matching index
    const textItem = currentText.value.find(item => item.index === contentIndex)
    
    if (textItem && textItem.aiEnhancedText && quillEditor.value) {
      // Get Quill instance
      const quill = quillEditor.value.getQuill()
      
      // Calculate the length of the original text
      const originalLength = textItem.text.length
      
      // Delete the original text at the specified index
      quill.deleteText(textItem.index, originalLength)
      
      // Insert the enhanced text at the same position
      quill.insertText(textItem.index, textItem.aiEnhancedText)
      
      // Calculate the length difference between original and enhanced text
      const lengthDifference = textItem.aiEnhancedText.length - originalLength
      
      // Mark as applied
      textItem.isApplied = true
      
      // Adjust indices of all text items that come after the current one
      currentText.value.forEach(item => {
        if (item.index > contentIndex && !item.isApplied) {
          item.index += lengthDifference
        }
      })
    }
  }
  
  // share
  const handleShare = () => {
    if (quillEditor.value) {
      // Access the Quill instance
      const quill = quillEditor.value.getQuill();
      
      // Get the HTML content from Quill
      const content = quill.root.innerHTML;
      
      // Prepare the post data
      const postData = {
        content: content,
        postImages: selectedImages.value.length > 0 
          ? selectedImages.value.map((imageUrl, index) => ({
              id: `img_${Date.now()}_${index}`, // Generate a unique ID
              postId: '', // This will be filled by the server
              url: imageUrl
            }))
          : undefined
      };
      
      // Call the mutation with the post data
      createPost(postData);
    }
  };

  const { mutate: createPost, isPending:isPosting } = useMutation({
    mutationFn: async (payload: any) => {
      return await $fetch('/api/plummy/home/main/shareContent', {
        method: 'POST',
        body: payload,
      });
    },
    onSuccess: async () => {
      
      toast({
        title: 'Post Created',
        description: 'Your post has been shared successfully.',
      });
      
      // Reset form - multiple approaches to ensure it's cleared
      message.value = ''; // Reset the v-model binding
      
      // Reset the Quill editor directly
      if (quillEditor.value) {
        // Get the Quill instance
        const quill = quillEditor.value.getQuill();
        
        // Clear the editor content with an empty delta
        quill.setContents([]);
        
        // Alternative approach - clear HTML directly
        quill.root.innerHTML = '';
      }

      // Reset other state
      selectedImages.value = [];
      currentText.value = [];
      
      // Close modal
      emit('onClose');
      
    },
    onError: (error: any) => {

      // Handle validation errors
      if (error.data?.data?.errors) {
        console.error('Validation errors:', error.data.data.errors);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: Object.values(error.data.data.errors)[0] as string || 'Failed to create post',
        });
      } else {
        // Handle generic errors
        console.error('Post creation error:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'An unexpected error occurred. Please try again later.',
        });
      }
      
    }
  });

</script>

<template>
  <Dialog :open="isOpen" @update:open="emit('onClose')">
    <DialogContent 
      :class="{
        'min-w-[70rem]': selectedImages.length > 0 && !currentText.length,
        'min-w-[80rem]': currentText.length > 0 && !selectedImages.length,
        'min-w-[110rem]': selectedImages.length > 0 && currentText.length > 0
      }"
    >

      <ResizablePanelGroup direction="horizontal">

        <ResizablePanel>
          
          <div 
            :class="[
              'flex flex-col gap-y-5', 
              { 'pr-5': selectedImages.length > 0 || currentText.length > 0 }
            ]"
          >

            <DialogHeader class="p-3 rounded-md bg-slate-200">
              <DialogTitle>Share A Story</DialogTitle>
              <DialogDescription>
                Your voice has power—let it be heard! ✨ #ShareYourStory.
              </DialogDescription>
            </DialogHeader>

            <div class="flex flex-col gap-y-5">

              <div class="flex gap-x-2">
                <div class="w-10 h-10 border-2 border-white rounded-full cursor-pointer group-hover:ring-2 group-hover:ring-purple-500"> 
                  <NuxtImg 
                    src="https://avatars.githubusercontent.com/u/41053951" 
                    class="object-cover w-full h-full rounded-full" 
                  />
                </div>

                <div class="flex flex-col gap-y-1">
                  <small class="text-sm font-medium leading-none">
                    Vincent M. Canje
                  </small>
                  <p class="text-sm text-muted-foreground">
                    Plummy <Icon name="lucide:crown" class="w-4 h-4 group-hover:text-purple-500" />
                  </p>
                </div>
              </div>

              <div class="flex flex-col" v-if="!isPosting">
                  <QuillEditor 
                    ref="quillEditor"
                    :options="options" 
                    v-model:content="message" 
                    @editorChange="handle_message_change" 
                  />
              </div>

              <div class="flex w-full p-3 border-2 border-gray-400 rounded-md bg-blue-50 gap-x-1 animate-pulse" v-for="a in 4" :key="a" v-if="isPosting">
                <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24"><!-- Icon from SVG Spinners by Utkarsh Verma - https://github.com/n3r4zzurr0/svg-spinners/blob/main/LICENSE -->
                  <rect width="7.33" height="7.33" x="1" y="1" fill="#888888">
                    <animate id="svgSpinnersBlocksWave0" attributeName="x" begin="0;svgSpinnersBlocksWave1.end+0.2s" dur="0.6s" values="1;4;1"/>
                    <animate attributeName="y" begin="0;svgSpinnersBlocksWave1.end+0.2s" dur="0.6s" values="1;4;1"/>
                    <animate attributeName="width" begin="0;svgSpinnersBlocksWave1.end+0.2s" dur="0.6s" values="7.33;1.33;7.33"/>
                    <animate attributeName="height" begin="0;svgSpinnersBlocksWave1.end+0.2s" dur="0.6s" values="7.33;1.33;7.33"/>
                  </rect>
                  <rect width="7.33" height="7.33" x="8.33" y="1" fill="#888888">
                    <animate attributeName="x" begin="svgSpinnersBlocksWave0.begin+0.1s" dur="0.6s" values="8.33;11.33;8.33"/>
                    <animate attributeName="y" begin="svgSpinnersBlocksWave0.begin+0.1s" dur="0.6s" values="1;4;1"/>
                    <animate attributeName="width" begin="svgSpinnersBlocksWave0.begin+0.1s" dur="0.6s" values="7.33;1.33;7.33"/>
                    <animate attributeName="height" begin="svgSpinnersBlocksWave0.begin+0.1s" dur="0.6s" values="7.33;1.33;7.33"/>
                  </rect>
                  <rect width="7.33" height="7.33" x="1" y="8.33" fill="#888888">
                    <animate attributeName="x" begin="svgSpinnersBlocksWave0.begin+0.1s" dur="0.6s" values="1;4;1"/>
                    <animate attributeName="y" begin="svgSpinnersBlocksWave0.begin+0.1s" dur="0.6s" values="8.33;11.33;8.33"/>
                    <animate attributeName="width" begin="svgSpinnersBlocksWave0.begin+0.1s" dur="0.6s" values="7.33;1.33;7.33"/>
                    <animate attributeName="height" begin="svgSpinnersBlocksWave0.begin+0.1s" dur="0.6s" values="7.33;1.33;7.33"/>
                  </rect>
                  <rect width="7.33" height="7.33" x="15.66" y="1" fill="#888888">
                    <animate attributeName="x" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="15.66;18.66;15.66"/>
                    <animate attributeName="y" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="1;4;1"/>
                    <animate attributeName="width" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="7.33;1.33;7.33"/>
                    <animate attributeName="height" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="7.33;1.33;7.33"/>
                  </rect>
                  <rect width="7.33" height="7.33" x="8.33" y="8.33" fill="#888888">
                    <animate attributeName="x" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="8.33;11.33;8.33"/>
                    <animate attributeName="y" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="8.33;11.33;8.33"/>
                    <animate attributeName="width" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="7.33;1.33;7.33"/>
                    <animate attributeName="height" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="7.33;1.33;7.33"/>
                  </rect>
                  <rect width="7.33" height="7.33" x="1" y="15.66" fill="#888888">
                    <animate attributeName="x" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="1;4;1"/>
                    <animate attributeName="y" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="15.66;18.66;15.66"/>
                    <animate attributeName="width" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="7.33;1.33;7.33"/>
                    <animate attributeName="height" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="7.33;1.33;7.33"/>
                  </rect>
                  <rect width="7.33" height="7.33" x="15.66" y="8.33" fill="#888888">
                    <animate attributeName="x" begin="svgSpinnersBlocksWave0.begin+0.3s" dur="0.6s" values="15.66;18.66;15.66"/>
                    <animate attributeName="y" begin="svgSpinnersBlocksWave0.begin+0.3s" dur="0.6s" values="8.33;11.33;8.33"/>
                    <animate attributeName="width" begin="svgSpinnersBlocksWave0.begin+0.3s" dur="0.6s" values="7.33;1.33;7.33"/>
                    <animate attributeName="height" begin="svgSpinnersBlocksWave0.begin+0.3s" dur="0.6s" values="7.33;1.33;7.33"/>
                  </rect>
                  <rect width="7.33" height="7.33" x="8.33" y="15.66" fill="#888888">
                    <animate attributeName="x" begin="svgSpinnersBlocksWave0.begin+0.3s" dur="0.6s" values="8.33;11.33;8.33"/>
                    <animate attributeName="y" begin="svgSpinnersBlocksWave0.begin+0.3s" dur="0.6s" values="15.66;18.66;15.66"/>
                    <animate attributeName="width" begin="svgSpinnersBlocksWave0.begin+0.3s" dur="0.6s" values="7.33;1.33;7.33"/>
                    <animate attributeName="height" begin="svgSpinnersBlocksWave0.begin+0.3s" dur="0.6s" values="7.33;1.33;7.33"/>
                  </rect>
                  <rect width="7.33" height="7.33" x="15.66" y="15.66" fill="#888888">
                    <animate id="svgSpinnersBlocksWave1" attributeName="x" begin="svgSpinnersBlocksWave0.begin+0.4s" dur="0.6s" values="15.66;18.66;15.66"/>
                    <animate attributeName="y" begin="svgSpinnersBlocksWave0.begin+0.4s" dur="0.6s" values="15.66;18.66;15.66"/>
                    <animate attributeName="width" begin="svgSpinnersBlocksWave0.begin+0.4s" dur="0.6s" values="7.33;1.33;7.33"/>
                    <animate attributeName="height" begin="svgSpinnersBlocksWave0.begin+0.4s" dur="0.6s" values="7.33;1.33;7.33"/>
                  </rect>
                </svg>
                <div class="w-full h-auto col-span-2 bg-gray-400 rounded"></div>
              </div>

            </div>

            <DialogFooter>
              
              <div class="flex flex-col">

                <div class="flex items-center gap-x-2" v-if="!isPosting">

                  <Button variant="outline" class="flex h-full font-semibold text-gray-500 border-2" @click="handleSetAiEnhance">
                    <Icon name="lucide:wand-sparkles" class="w-4 h-4 hover:text-purple-500" /> 
                    Improve with AI
                  </Button>

                  <Popover>
                    <PopoverTrigger>
                      <Button variant="outline" size="icon">
                        <Icon name="lucide:smile" class="w-4 h-4 hover:text-purple-500" />
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
                  
                  <Button variant="outline" size="icon" @click="triggerFileInput">
                    <Icon name="lucide:image-play" class="w-4 h-4 hover:text-purple-500" /> 
                  </Button>

                  <input 
                    id="picture" 
                    ref="fileInput"
                    type="file" 
                    class="hidden" 
                    multiple 
                    accept="image/*" 
                    @change="handleImageUpload"
                  />
                  
                  <Popover>
                    <PopoverTrigger @click="fetchGifs">
                      <Button variant="outline" size="icon" class="text-sm font-semibold">
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
                    
                  <Button variant="outline" class="flex h-full font-semibold text-gray-500 border-2" @click="handleShare"> 
                    Share
                  </Button>
                  
                </div>

                <div class="flex items-center gap-x-2" v-if="isPosting">

                  <div class="flex p-2 border-2 rounded-md animate-pulse gap-x-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><!-- Icon from SVG Spinners by Utkarsh Verma - https://github.com/n3r4zzurr0/svg-spinners/blob/main/LICENSE -->
                      <rect width="7.33" height="7.33" x="1" y="1" fill="#888888">
                        <animate id="svgSpinnersBlocksWave0" attributeName="x" begin="0;svgSpinnersBlocksWave1.end+0.2s" dur="0.6s" values="1;4;1"/>
                        <animate attributeName="y" begin="0;svgSpinnersBlocksWave1.end+0.2s" dur="0.6s" values="1;4;1"/>
                        <animate attributeName="width" begin="0;svgSpinnersBlocksWave1.end+0.2s" dur="0.6s" values="7.33;1.33;7.33"/>
                        <animate attributeName="height" begin="0;svgSpinnersBlocksWave1.end+0.2s" dur="0.6s" values="7.33;1.33;7.33"/>
                      </rect>
                      <rect width="7.33" height="7.33" x="8.33" y="1" fill="#888888">
                        <animate attributeName="x" begin="svgSpinnersBlocksWave0.begin+0.1s" dur="0.6s" values="8.33;11.33;8.33"/>
                        <animate attributeName="y" begin="svgSpinnersBlocksWave0.begin+0.1s" dur="0.6s" values="1;4;1"/>
                        <animate attributeName="width" begin="svgSpinnersBlocksWave0.begin+0.1s" dur="0.6s" values="7.33;1.33;7.33"/>
                        <animate attributeName="height" begin="svgSpinnersBlocksWave0.begin+0.1s" dur="0.6s" values="7.33;1.33;7.33"/>
                      </rect>
                      <rect width="7.33" height="7.33" x="1" y="8.33" fill="#888888">
                        <animate attributeName="x" begin="svgSpinnersBlocksWave0.begin+0.1s" dur="0.6s" values="1;4;1"/>
                        <animate attributeName="y" begin="svgSpinnersBlocksWave0.begin+0.1s" dur="0.6s" values="8.33;11.33;8.33"/>
                        <animate attributeName="width" begin="svgSpinnersBlocksWave0.begin+0.1s" dur="0.6s" values="7.33;1.33;7.33"/>
                        <animate attributeName="height" begin="svgSpinnersBlocksWave0.begin+0.1s" dur="0.6s" values="7.33;1.33;7.33"/>
                      </rect>
                      <rect width="7.33" height="7.33" x="15.66" y="1" fill="#888888">
                        <animate attributeName="x" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="15.66;18.66;15.66"/>
                        <animate attributeName="y" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="1;4;1"/>
                        <animate attributeName="width" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="7.33;1.33;7.33"/>
                        <animate attributeName="height" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="7.33;1.33;7.33"/>
                      </rect>
                      <rect width="7.33" height="7.33" x="8.33" y="8.33" fill="#888888">
                        <animate attributeName="x" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="8.33;11.33;8.33"/>
                        <animate attributeName="y" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="8.33;11.33;8.33"/>
                        <animate attributeName="width" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="7.33;1.33;7.33"/>
                        <animate attributeName="height" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="7.33;1.33;7.33"/>
                      </rect>
                      <rect width="7.33" height="7.33" x="1" y="15.66" fill="#888888">
                        <animate attributeName="x" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="1;4;1"/>
                        <animate attributeName="y" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="15.66;18.66;15.66"/>
                        <animate attributeName="width" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="7.33;1.33;7.33"/>
                        <animate attributeName="height" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="7.33;1.33;7.33"/>
                      </rect>
                      <rect width="7.33" height="7.33" x="15.66" y="8.33" fill="#888888">
                        <animate attributeName="x" begin="svgSpinnersBlocksWave0.begin+0.3s" dur="0.6s" values="15.66;18.66;15.66"/>
                        <animate attributeName="y" begin="svgSpinnersBlocksWave0.begin+0.3s" dur="0.6s" values="8.33;11.33;8.33"/>
                        <animate attributeName="width" begin="svgSpinnersBlocksWave0.begin+0.3s" dur="0.6s" values="7.33;1.33;7.33"/>
                        <animate attributeName="height" begin="svgSpinnersBlocksWave0.begin+0.3s" dur="0.6s" values="7.33;1.33;7.33"/>
                      </rect>
                      <rect width="7.33" height="7.33" x="8.33" y="15.66" fill="#888888">
                        <animate attributeName="x" begin="svgSpinnersBlocksWave0.begin+0.3s" dur="0.6s" values="8.33;11.33;8.33"/>
                        <animate attributeName="y" begin="svgSpinnersBlocksWave0.begin+0.3s" dur="0.6s" values="15.66;18.66;15.66"/>
                        <animate attributeName="width" begin="svgSpinnersBlocksWave0.begin+0.3s" dur="0.6s" values="7.33;1.33;7.33"/>
                        <animate attributeName="height" begin="svgSpinnersBlocksWave0.begin+0.3s" dur="0.6s" values="7.33;1.33;7.33"/>
                      </rect>
                      <rect width="7.33" height="7.33" x="15.66" y="15.66" fill="#888888">
                        <animate id="svgSpinnersBlocksWave1" attributeName="x" begin="svgSpinnersBlocksWave0.begin+0.4s" dur="0.6s" values="15.66;18.66;15.66"/>
                        <animate attributeName="y" begin="svgSpinnersBlocksWave0.begin+0.4s" dur="0.6s" values="15.66;18.66;15.66"/>
                        <animate attributeName="width" begin="svgSpinnersBlocksWave0.begin+0.4s" dur="0.6s" values="7.33;1.33;7.33"/>
                        <animate attributeName="height" begin="svgSpinnersBlocksWave0.begin+0.4s" dur="0.6s" values="7.33;1.33;7.33"/>
                      </rect>
                    </svg>
                    <div class="w-[7.6rem] h-4 col-span-2 bg-gray-200 rounded-md"></div>
                  </div>

                  <Button variant="outline" size="icon"> 
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><!-- Icon from SVG Spinners by Utkarsh Verma - https://github.com/n3r4zzurr0/svg-spinners/blob/main/LICENSE -->
                      <rect width="7.33" height="7.33" x="1" y="1" fill="#888888">
                        <animate id="svgSpinnersBlocksWave0" attributeName="x" begin="0;svgSpinnersBlocksWave1.end+0.2s" dur="0.6s" values="1;4;1"/>
                        <animate attributeName="y" begin="0;svgSpinnersBlocksWave1.end+0.2s" dur="0.6s" values="1;4;1"/>
                        <animate attributeName="width" begin="0;svgSpinnersBlocksWave1.end+0.2s" dur="0.6s" values="7.33;1.33;7.33"/>
                        <animate attributeName="height" begin="0;svgSpinnersBlocksWave1.end+0.2s" dur="0.6s" values="7.33;1.33;7.33"/>
                      </rect>
                      <rect width="7.33" height="7.33" x="8.33" y="1" fill="#888888">
                        <animate attributeName="x" begin="svgSpinnersBlocksWave0.begin+0.1s" dur="0.6s" values="8.33;11.33;8.33"/>
                        <animate attributeName="y" begin="svgSpinnersBlocksWave0.begin+0.1s" dur="0.6s" values="1;4;1"/>
                        <animate attributeName="width" begin="svgSpinnersBlocksWave0.begin+0.1s" dur="0.6s" values="7.33;1.33;7.33"/>
                        <animate attributeName="height" begin="svgSpinnersBlocksWave0.begin+0.1s" dur="0.6s" values="7.33;1.33;7.33"/>
                      </rect>
                      <rect width="7.33" height="7.33" x="1" y="8.33" fill="#888888">
                        <animate attributeName="x" begin="svgSpinnersBlocksWave0.begin+0.1s" dur="0.6s" values="1;4;1"/>
                        <animate attributeName="y" begin="svgSpinnersBlocksWave0.begin+0.1s" dur="0.6s" values="8.33;11.33;8.33"/>
                        <animate attributeName="width" begin="svgSpinnersBlocksWave0.begin+0.1s" dur="0.6s" values="7.33;1.33;7.33"/>
                        <animate attributeName="height" begin="svgSpinnersBlocksWave0.begin+0.1s" dur="0.6s" values="7.33;1.33;7.33"/>
                      </rect>
                      <rect width="7.33" height="7.33" x="15.66" y="1" fill="#888888">
                        <animate attributeName="x" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="15.66;18.66;15.66"/>
                        <animate attributeName="y" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="1;4;1"/>
                        <animate attributeName="width" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="7.33;1.33;7.33"/>
                        <animate attributeName="height" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="7.33;1.33;7.33"/>
                      </rect>
                      <rect width="7.33" height="7.33" x="8.33" y="8.33" fill="#888888">
                        <animate attributeName="x" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="8.33;11.33;8.33"/>
                        <animate attributeName="y" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="8.33;11.33;8.33"/>
                        <animate attributeName="width" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="7.33;1.33;7.33"/>
                        <animate attributeName="height" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="7.33;1.33;7.33"/>
                      </rect>
                      <rect width="7.33" height="7.33" x="1" y="15.66" fill="#888888">
                        <animate attributeName="x" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="1;4;1"/>
                        <animate attributeName="y" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="15.66;18.66;15.66"/>
                        <animate attributeName="width" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="7.33;1.33;7.33"/>
                        <animate attributeName="height" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="7.33;1.33;7.33"/>
                      </rect>
                      <rect width="7.33" height="7.33" x="15.66" y="8.33" fill="#888888">
                        <animate attributeName="x" begin="svgSpinnersBlocksWave0.begin+0.3s" dur="0.6s" values="15.66;18.66;15.66"/>
                        <animate attributeName="y" begin="svgSpinnersBlocksWave0.begin+0.3s" dur="0.6s" values="8.33;11.33;8.33"/>
                        <animate attributeName="width" begin="svgSpinnersBlocksWave0.begin+0.3s" dur="0.6s" values="7.33;1.33;7.33"/>
                        <animate attributeName="height" begin="svgSpinnersBlocksWave0.begin+0.3s" dur="0.6s" values="7.33;1.33;7.33"/>
                      </rect>
                      <rect width="7.33" height="7.33" x="8.33" y="15.66" fill="#888888">
                        <animate attributeName="x" begin="svgSpinnersBlocksWave0.begin+0.3s" dur="0.6s" values="8.33;11.33;8.33"/>
                        <animate attributeName="y" begin="svgSpinnersBlocksWave0.begin+0.3s" dur="0.6s" values="15.66;18.66;15.66"/>
                        <animate attributeName="width" begin="svgSpinnersBlocksWave0.begin+0.3s" dur="0.6s" values="7.33;1.33;7.33"/>
                        <animate attributeName="height" begin="svgSpinnersBlocksWave0.begin+0.3s" dur="0.6s" values="7.33;1.33;7.33"/>
                      </rect>
                      <rect width="7.33" height="7.33" x="15.66" y="15.66" fill="#888888">
                        <animate id="svgSpinnersBlocksWave1" attributeName="x" begin="svgSpinnersBlocksWave0.begin+0.4s" dur="0.6s" values="15.66;18.66;15.66"/>
                        <animate attributeName="y" begin="svgSpinnersBlocksWave0.begin+0.4s" dur="0.6s" values="15.66;18.66;15.66"/>
                        <animate attributeName="width" begin="svgSpinnersBlocksWave0.begin+0.4s" dur="0.6s" values="7.33;1.33;7.33"/>
                        <animate attributeName="height" begin="svgSpinnersBlocksWave0.begin+0.4s" dur="0.6s" values="7.33;1.33;7.33"/>
                      </rect>
                    </svg>
                  </Button>

                  <Button variant="outline" size="icon"> 
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><!-- Icon from SVG Spinners by Utkarsh Verma - https://github.com/n3r4zzurr0/svg-spinners/blob/main/LICENSE -->
                      <rect width="7.33" height="7.33" x="1" y="1" fill="#888888">
                        <animate id="svgSpinnersBlocksWave0" attributeName="x" begin="0;svgSpinnersBlocksWave1.end+0.2s" dur="0.6s" values="1;4;1"/>
                        <animate attributeName="y" begin="0;svgSpinnersBlocksWave1.end+0.2s" dur="0.6s" values="1;4;1"/>
                        <animate attributeName="width" begin="0;svgSpinnersBlocksWave1.end+0.2s" dur="0.6s" values="7.33;1.33;7.33"/>
                        <animate attributeName="height" begin="0;svgSpinnersBlocksWave1.end+0.2s" dur="0.6s" values="7.33;1.33;7.33"/>
                      </rect>
                      <rect width="7.33" height="7.33" x="8.33" y="1" fill="#888888">
                        <animate attributeName="x" begin="svgSpinnersBlocksWave0.begin+0.1s" dur="0.6s" values="8.33;11.33;8.33"/>
                        <animate attributeName="y" begin="svgSpinnersBlocksWave0.begin+0.1s" dur="0.6s" values="1;4;1"/>
                        <animate attributeName="width" begin="svgSpinnersBlocksWave0.begin+0.1s" dur="0.6s" values="7.33;1.33;7.33"/>
                        <animate attributeName="height" begin="svgSpinnersBlocksWave0.begin+0.1s" dur="0.6s" values="7.33;1.33;7.33"/>
                      </rect>
                      <rect width="7.33" height="7.33" x="1" y="8.33" fill="#888888">
                        <animate attributeName="x" begin="svgSpinnersBlocksWave0.begin+0.1s" dur="0.6s" values="1;4;1"/>
                        <animate attributeName="y" begin="svgSpinnersBlocksWave0.begin+0.1s" dur="0.6s" values="8.33;11.33;8.33"/>
                        <animate attributeName="width" begin="svgSpinnersBlocksWave0.begin+0.1s" dur="0.6s" values="7.33;1.33;7.33"/>
                        <animate attributeName="height" begin="svgSpinnersBlocksWave0.begin+0.1s" dur="0.6s" values="7.33;1.33;7.33"/>
                      </rect>
                      <rect width="7.33" height="7.33" x="15.66" y="1" fill="#888888">
                        <animate attributeName="x" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="15.66;18.66;15.66"/>
                        <animate attributeName="y" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="1;4;1"/>
                        <animate attributeName="width" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="7.33;1.33;7.33"/>
                        <animate attributeName="height" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="7.33;1.33;7.33"/>
                      </rect>
                      <rect width="7.33" height="7.33" x="8.33" y="8.33" fill="#888888">
                        <animate attributeName="x" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="8.33;11.33;8.33"/>
                        <animate attributeName="y" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="8.33;11.33;8.33"/>
                        <animate attributeName="width" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="7.33;1.33;7.33"/>
                        <animate attributeName="height" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="7.33;1.33;7.33"/>
                      </rect>
                      <rect width="7.33" height="7.33" x="1" y="15.66" fill="#888888">
                        <animate attributeName="x" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="1;4;1"/>
                        <animate attributeName="y" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="15.66;18.66;15.66"/>
                        <animate attributeName="width" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="7.33;1.33;7.33"/>
                        <animate attributeName="height" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="7.33;1.33;7.33"/>
                      </rect>
                      <rect width="7.33" height="7.33" x="15.66" y="8.33" fill="#888888">
                        <animate attributeName="x" begin="svgSpinnersBlocksWave0.begin+0.3s" dur="0.6s" values="15.66;18.66;15.66"/>
                        <animate attributeName="y" begin="svgSpinnersBlocksWave0.begin+0.3s" dur="0.6s" values="8.33;11.33;8.33"/>
                        <animate attributeName="width" begin="svgSpinnersBlocksWave0.begin+0.3s" dur="0.6s" values="7.33;1.33;7.33"/>
                        <animate attributeName="height" begin="svgSpinnersBlocksWave0.begin+0.3s" dur="0.6s" values="7.33;1.33;7.33"/>
                      </rect>
                      <rect width="7.33" height="7.33" x="8.33" y="15.66" fill="#888888">
                        <animate attributeName="x" begin="svgSpinnersBlocksWave0.begin+0.3s" dur="0.6s" values="8.33;11.33;8.33"/>
                        <animate attributeName="y" begin="svgSpinnersBlocksWave0.begin+0.3s" dur="0.6s" values="15.66;18.66;15.66"/>
                        <animate attributeName="width" begin="svgSpinnersBlocksWave0.begin+0.3s" dur="0.6s" values="7.33;1.33;7.33"/>
                        <animate attributeName="height" begin="svgSpinnersBlocksWave0.begin+0.3s" dur="0.6s" values="7.33;1.33;7.33"/>
                      </rect>
                      <rect width="7.33" height="7.33" x="15.66" y="15.66" fill="#888888">
                        <animate id="svgSpinnersBlocksWave1" attributeName="x" begin="svgSpinnersBlocksWave0.begin+0.4s" dur="0.6s" values="15.66;18.66;15.66"/>
                        <animate attributeName="y" begin="svgSpinnersBlocksWave0.begin+0.4s" dur="0.6s" values="15.66;18.66;15.66"/>
                        <animate attributeName="width" begin="svgSpinnersBlocksWave0.begin+0.4s" dur="0.6s" values="7.33;1.33;7.33"/>
                        <animate attributeName="height" begin="svgSpinnersBlocksWave0.begin+0.4s" dur="0.6s" values="7.33;1.33;7.33"/>
                      </rect>
                    </svg>
                  </Button>

                  <Button variant="outline" size="icon"> 
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><!-- Icon from SVG Spinners by Utkarsh Verma - https://github.com/n3r4zzurr0/svg-spinners/blob/main/LICENSE -->
                      <rect width="7.33" height="7.33" x="1" y="1" fill="#888888">
                        <animate id="svgSpinnersBlocksWave0" attributeName="x" begin="0;svgSpinnersBlocksWave1.end+0.2s" dur="0.6s" values="1;4;1"/>
                        <animate attributeName="y" begin="0;svgSpinnersBlocksWave1.end+0.2s" dur="0.6s" values="1;4;1"/>
                        <animate attributeName="width" begin="0;svgSpinnersBlocksWave1.end+0.2s" dur="0.6s" values="7.33;1.33;7.33"/>
                        <animate attributeName="height" begin="0;svgSpinnersBlocksWave1.end+0.2s" dur="0.6s" values="7.33;1.33;7.33"/>
                      </rect>
                      <rect width="7.33" height="7.33" x="8.33" y="1" fill="#888888">
                        <animate attributeName="x" begin="svgSpinnersBlocksWave0.begin+0.1s" dur="0.6s" values="8.33;11.33;8.33"/>
                        <animate attributeName="y" begin="svgSpinnersBlocksWave0.begin+0.1s" dur="0.6s" values="1;4;1"/>
                        <animate attributeName="width" begin="svgSpinnersBlocksWave0.begin+0.1s" dur="0.6s" values="7.33;1.33;7.33"/>
                        <animate attributeName="height" begin="svgSpinnersBlocksWave0.begin+0.1s" dur="0.6s" values="7.33;1.33;7.33"/>
                      </rect>
                      <rect width="7.33" height="7.33" x="1" y="8.33" fill="#888888">
                        <animate attributeName="x" begin="svgSpinnersBlocksWave0.begin+0.1s" dur="0.6s" values="1;4;1"/>
                        <animate attributeName="y" begin="svgSpinnersBlocksWave0.begin+0.1s" dur="0.6s" values="8.33;11.33;8.33"/>
                        <animate attributeName="width" begin="svgSpinnersBlocksWave0.begin+0.1s" dur="0.6s" values="7.33;1.33;7.33"/>
                        <animate attributeName="height" begin="svgSpinnersBlocksWave0.begin+0.1s" dur="0.6s" values="7.33;1.33;7.33"/>
                      </rect>
                      <rect width="7.33" height="7.33" x="15.66" y="1" fill="#888888">
                        <animate attributeName="x" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="15.66;18.66;15.66"/>
                        <animate attributeName="y" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="1;4;1"/>
                        <animate attributeName="width" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="7.33;1.33;7.33"/>
                        <animate attributeName="height" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="7.33;1.33;7.33"/>
                      </rect>
                      <rect width="7.33" height="7.33" x="8.33" y="8.33" fill="#888888">
                        <animate attributeName="x" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="8.33;11.33;8.33"/>
                        <animate attributeName="y" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="8.33;11.33;8.33"/>
                        <animate attributeName="width" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="7.33;1.33;7.33"/>
                        <animate attributeName="height" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="7.33;1.33;7.33"/>
                      </rect>
                      <rect width="7.33" height="7.33" x="1" y="15.66" fill="#888888">
                        <animate attributeName="x" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="1;4;1"/>
                        <animate attributeName="y" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="15.66;18.66;15.66"/>
                        <animate attributeName="width" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="7.33;1.33;7.33"/>
                        <animate attributeName="height" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="7.33;1.33;7.33"/>
                      </rect>
                      <rect width="7.33" height="7.33" x="15.66" y="8.33" fill="#888888">
                        <animate attributeName="x" begin="svgSpinnersBlocksWave0.begin+0.3s" dur="0.6s" values="15.66;18.66;15.66"/>
                        <animate attributeName="y" begin="svgSpinnersBlocksWave0.begin+0.3s" dur="0.6s" values="8.33;11.33;8.33"/>
                        <animate attributeName="width" begin="svgSpinnersBlocksWave0.begin+0.3s" dur="0.6s" values="7.33;1.33;7.33"/>
                        <animate attributeName="height" begin="svgSpinnersBlocksWave0.begin+0.3s" dur="0.6s" values="7.33;1.33;7.33"/>
                      </rect>
                      <rect width="7.33" height="7.33" x="8.33" y="15.66" fill="#888888">
                        <animate attributeName="x" begin="svgSpinnersBlocksWave0.begin+0.3s" dur="0.6s" values="8.33;11.33;8.33"/>
                        <animate attributeName="y" begin="svgSpinnersBlocksWave0.begin+0.3s" dur="0.6s" values="15.66;18.66;15.66"/>
                        <animate attributeName="width" begin="svgSpinnersBlocksWave0.begin+0.3s" dur="0.6s" values="7.33;1.33;7.33"/>
                        <animate attributeName="height" begin="svgSpinnersBlocksWave0.begin+0.3s" dur="0.6s" values="7.33;1.33;7.33"/>
                      </rect>
                      <rect width="7.33" height="7.33" x="15.66" y="15.66" fill="#888888">
                        <animate id="svgSpinnersBlocksWave1" attributeName="x" begin="svgSpinnersBlocksWave0.begin+0.4s" dur="0.6s" values="15.66;18.66;15.66"/>
                        <animate attributeName="y" begin="svgSpinnersBlocksWave0.begin+0.4s" dur="0.6s" values="15.66;18.66;15.66"/>
                        <animate attributeName="width" begin="svgSpinnersBlocksWave0.begin+0.4s" dur="0.6s" values="7.33;1.33;7.33"/>
                        <animate attributeName="height" begin="svgSpinnersBlocksWave0.begin+0.4s" dur="0.6s" values="7.33;1.33;7.33"/>
                      </rect>
                    </svg>
                  </Button>
                  
                  <div class="p-2 border-2 rounded-md animate-pulse">
                    <div class="h-4 col-span-2 bg-gray-200 rounded w-[3.2rem]"></div>
                  </div>

                </div>

            </div>
              
            </DialogFooter>
          
          </div>

        </ResizablePanel>

        <ResizableHandle v-show="currentText.length > 0" with-handle />

        <ResizablePanel v-show="currentText.length > 0">

          <div class="flex flex-col px-5 gap-y-5">

            <DialogHeader class="p-3 rounded-md bg-slate-200">
              <DialogTitle>AI Improvement</DialogTitle>
              <DialogDescription>
                Easily enhance and improve your text using artificial intelligence ✨ #AiImprovement.
              </DialogDescription>
            </DialogHeader>

            <div class="flex flex-wrap gap-2" v-if="!isPosting">
              <div v-for="(content, i) in currentText" :key="i" class="flex flex-col w-full group gap-y-1">

                <div 
                  :class="{
                    'relative p-3 border rounded-md bg-blue-50 group-hover:border-blue-600 hover:border-2 group-hover:p-4 w-fit': !llmStore.tavily.isLoading && content.index !== activeContentIndex,
                    'relative p-3 border rounded-md bg-blue-50 w-fit': llmStore.tavily.isLoading && content.index !== activeContentIndex,
                    'hidden': llmStore.tavily.isLoading && content.index === activeContentIndex
                  }"
                >
                  <div class="text-xs">{{ content.text }}</div>
                  <Button variant="outline" size="icon" class="absolute hidden rounded-full bottom-1 right-1 group-hover:flex hover:border-blue-600" @click="handleAiEnhance(content.text,content.index)" v-if="content.aiEnhancedText.length === 0">
                    <Icon name="lucide:wand-sparkles" class="w-4 h-4" /> 
                  </Button>
                </div>

                <div class="relative p-3 border rounded-md bg-green-50 group-hover:border-green-600 hover:border-2 group-hover:p-4 w-fit" v-if="content.aiEnhancedText.length > 0">
                  <div class="text-xs">{{ content.aiEnhancedText }}</div>
                  <Button variant="outline" size="icon" class="absolute hidden rounded-full bottom-1 right-1 group-hover:flex hover:border-green-600" @click="handleApplyAiEnhance(content.index)">
                    <Icon name="lucide:wand" class="w-4 h-4" /> 
                  </Button>
                </div>

                <div class="flex flex-col p-1 ml-auto border rounded-full w-fit bg-blue-50 gap-y-2 animate-pulse" v-show="llmStore.tavily.isLoading && content.index === activeContentIndex">
                  <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24" class="ml-auto"><!-- Icon from SVG Spinners by Utkarsh Verma - https://github.com/n3r4zzurr0/svg-spinners/blob/main/LICENSE -->
                    <circle cx="4" cy="12" r="3" fill="#888888">
                      <animate id="svgSpinners3DotsScale0" attributeName="r" begin="0;svgSpinners3DotsScale1.end-0.25s" dur="0.75s" values="3;.2;3"/>
                    </circle>
                    <circle cx="12" cy="12" r="3" fill="#888888">
                      <animate attributeName="r" begin="svgSpinners3DotsScale0.end-0.6s" dur="0.75s" values="3;.2;3"/>
                    </circle>
                    <circle cx="20" cy="12" r="3" fill="#888888">
                      <animate id="svgSpinners3DotsScale1" attributeName="r" begin="svgSpinners3DotsScale0.end-0.45s" dur="0.75s" values="3;.2;3"/>
                    </circle>
                  </svg>
                </div>

              </div> 
            </div>

            <div class="flex flex-wrap gap-2" v-if="isPosting">
              <div v-for="(content, i) in currentText" :key="i" class="flex flex-col w-full group gap-y-1">

                <div class="flex flex-col w-full p-3 border-2 border-gray-400 rounded-md bg-blue-50 gap-y-2 animate-pulse">
                  <div class="w-auto h-3 col-span-2 bg-gray-400 rounded"></div>
                  <div class="w-auto h-3 col-span-2 bg-gray-400 rounded"></div>
                  <div class="w-auto h-3 col-span-2 bg-gray-400 rounded"></div>
                  <div class="w-auto h-3 col-span-2 bg-gray-400 rounded"></div>
                </div>

                <div class="flex flex-col w-full p-3 border-2 border-gray-400 rounded-md bg-green-50 gap-y-2 animate-pulse" v-if="content.aiEnhancedText.length > 0">
                  <div class="w-auto h-3 col-span-2 bg-gray-400 rounded"></div>
                  <div class="w-auto h-3 col-span-2 bg-gray-400 rounded"></div>
                  <div class="w-auto h-3 col-span-2 bg-gray-400 rounded"></div>
                  <div class="w-auto h-3 col-span-2 bg-gray-400 rounded"></div>
                </div>

              </div> 
            </div>

          </div>

        </ResizablePanel>

        <ResizableHandle v-show="selectedImages.length > 0" with-handle />

        <ResizablePanel v-show="selectedImages.length > 0">

          <div class="flex flex-col pl-5 gap-y-5">

            <DialogHeader class="p-3 rounded-md bg-slate-200">
              <DialogTitle>Media</DialogTitle>
              <DialogDescription>
                Easily add and manage images in your media library ✨ #MediaLibrary.
              </DialogDescription>
            </DialogHeader>

            <div class="flex flex-wrap gap-2" v-if="!isPosting">
              <div v-for="(image, index) in selectedImages" :key="index" class="group">
                <div class="border-[1px] w-40 h-40 group-hover:border-purple-600 group-hover:border-2 rounded-md relative">
                  <img :src="image" class="object-cover rounded-md size-full" />
                  <Icon name="lucide:circle-x" class="absolute z-10 hidden w-6 h-6 text-red-500 cursor-pointer top-1 right-1 group-hover:flex" @click="removeImage(index)" />
                  <div class="absolute inset-0 transition-opacity duration-200 rounded-md opacity-0 bg-white/30 group-hover:opacity-100"></div>
                </div>
              </div>
            </div>

            <div class="flex flex-wrap gap-2" v-if="isPosting">
              <div v-for="(image, index) in selectedImages" :key="index" class="group">
                <div class="w-40 h-40 border-2 border-gray-400 rounded-md animate-pulse">
                  <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24"><!-- Icon from SVG Spinners by Utkarsh Verma - https://github.com/n3r4zzurr0/svg-spinners/blob/main/LICENSE -->
                    <rect width="7.33" height="7.33" x="1" y="1" fill="#888888">
                      <animate id="svgSpinnersBlocksWave0" attributeName="x" begin="0;svgSpinnersBlocksWave1.end+0.2s" dur="0.6s" values="1;4;1"/>
                      <animate attributeName="y" begin="0;svgSpinnersBlocksWave1.end+0.2s" dur="0.6s" values="1;4;1"/>
                      <animate attributeName="width" begin="0;svgSpinnersBlocksWave1.end+0.2s" dur="0.6s" values="7.33;1.33;7.33"/>
                      <animate attributeName="height" begin="0;svgSpinnersBlocksWave1.end+0.2s" dur="0.6s" values="7.33;1.33;7.33"/>
                    </rect>
                    <rect width="7.33" height="7.33" x="8.33" y="1" fill="#888888">
                      <animate attributeName="x" begin="svgSpinnersBlocksWave0.begin+0.1s" dur="0.6s" values="8.33;11.33;8.33"/>
                      <animate attributeName="y" begin="svgSpinnersBlocksWave0.begin+0.1s" dur="0.6s" values="1;4;1"/>
                      <animate attributeName="width" begin="svgSpinnersBlocksWave0.begin+0.1s" dur="0.6s" values="7.33;1.33;7.33"/>
                      <animate attributeName="height" begin="svgSpinnersBlocksWave0.begin+0.1s" dur="0.6s" values="7.33;1.33;7.33"/>
                    </rect>
                    <rect width="7.33" height="7.33" x="1" y="8.33" fill="#888888">
                      <animate attributeName="x" begin="svgSpinnersBlocksWave0.begin+0.1s" dur="0.6s" values="1;4;1"/>
                      <animate attributeName="y" begin="svgSpinnersBlocksWave0.begin+0.1s" dur="0.6s" values="8.33;11.33;8.33"/>
                      <animate attributeName="width" begin="svgSpinnersBlocksWave0.begin+0.1s" dur="0.6s" values="7.33;1.33;7.33"/>
                      <animate attributeName="height" begin="svgSpinnersBlocksWave0.begin+0.1s" dur="0.6s" values="7.33;1.33;7.33"/>
                    </rect>
                    <rect width="7.33" height="7.33" x="15.66" y="1" fill="#888888">
                      <animate attributeName="x" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="15.66;18.66;15.66"/>
                      <animate attributeName="y" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="1;4;1"/>
                      <animate attributeName="width" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="7.33;1.33;7.33"/>
                      <animate attributeName="height" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="7.33;1.33;7.33"/>
                    </rect>
                    <rect width="7.33" height="7.33" x="8.33" y="8.33" fill="#888888">
                      <animate attributeName="x" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="8.33;11.33;8.33"/>
                      <animate attributeName="y" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="8.33;11.33;8.33"/>
                      <animate attributeName="width" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="7.33;1.33;7.33"/>
                      <animate attributeName="height" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="7.33;1.33;7.33"/>
                    </rect>
                    <rect width="7.33" height="7.33" x="1" y="15.66" fill="#888888">
                      <animate attributeName="x" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="1;4;1"/>
                      <animate attributeName="y" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="15.66;18.66;15.66"/>
                      <animate attributeName="width" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="7.33;1.33;7.33"/>
                      <animate attributeName="height" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="7.33;1.33;7.33"/>
                    </rect>
                    <rect width="7.33" height="7.33" x="15.66" y="8.33" fill="#888888">
                      <animate attributeName="x" begin="svgSpinnersBlocksWave0.begin+0.3s" dur="0.6s" values="15.66;18.66;15.66"/>
                      <animate attributeName="y" begin="svgSpinnersBlocksWave0.begin+0.3s" dur="0.6s" values="8.33;11.33;8.33"/>
                      <animate attributeName="width" begin="svgSpinnersBlocksWave0.begin+0.3s" dur="0.6s" values="7.33;1.33;7.33"/>
                      <animate attributeName="height" begin="svgSpinnersBlocksWave0.begin+0.3s" dur="0.6s" values="7.33;1.33;7.33"/>
                    </rect>
                    <rect width="7.33" height="7.33" x="8.33" y="15.66" fill="#888888">
                      <animate attributeName="x" begin="svgSpinnersBlocksWave0.begin+0.3s" dur="0.6s" values="8.33;11.33;8.33"/>
                      <animate attributeName="y" begin="svgSpinnersBlocksWave0.begin+0.3s" dur="0.6s" values="15.66;18.66;15.66"/>
                      <animate attributeName="width" begin="svgSpinnersBlocksWave0.begin+0.3s" dur="0.6s" values="7.33;1.33;7.33"/>
                      <animate attributeName="height" begin="svgSpinnersBlocksWave0.begin+0.3s" dur="0.6s" values="7.33;1.33;7.33"/>
                    </rect>
                    <rect width="7.33" height="7.33" x="15.66" y="15.66" fill="#888888">
                      <animate id="svgSpinnersBlocksWave1" attributeName="x" begin="svgSpinnersBlocksWave0.begin+0.4s" dur="0.6s" values="15.66;18.66;15.66"/>
                      <animate attributeName="y" begin="svgSpinnersBlocksWave0.begin+0.4s" dur="0.6s" values="15.66;18.66;15.66"/>
                      <animate attributeName="width" begin="svgSpinnersBlocksWave0.begin+0.4s" dur="0.6s" values="7.33;1.33;7.33"/>
                      <animate attributeName="height" begin="svgSpinnersBlocksWave0.begin+0.4s" dur="0.6s" values="7.33;1.33;7.33"/>
                    </rect>
                  </svg>
                </div>
              </div>
            </div>

          </div>

        </ResizablePanel>

      </ResizablePanelGroup>

    </DialogContent>
  </Dialog>
</template>

<style>
  .ql-container {
    @apply rounded-lg min-h-[120px];
    border:2px solid #e5e7eb !important;
  }
</style>