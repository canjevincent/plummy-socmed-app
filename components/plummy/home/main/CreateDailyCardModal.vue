<script lang="ts" setup>

  import { useToast } from '~/components/ui/toast';
  
  const { toast } = useToast();

  const props = defineProps<{
    isModalVisible: boolean
  }>();

  const emit = defineEmits<{
    (e: 'onClose'): void,
  }>();

  const isOpen = computed({
    get: () => props.isModalVisible,
    set: () => {
      emit('onClose');
    }
  });

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
    if (target.files) {
      Array.from(target.files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result && typeof e.target.result === 'string') {
            selectedImages.value.push(e.target.result);
            // Removed the code that inserts into Quill editor
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    selectedImages.value.splice(index, 1);
  };

  // share
  const handleUploadPhoto = () => {
      
    // Prepare the post data
    const postData = {
      postImages: selectedImages.value.length > 0 
        ? selectedImages.value.map((imageUrl, index) => ({
            title: `img_${Date.now()}_${index}`, // Generate a unique ID
            url: imageUrl
          }))
        : undefined
    };
    
    // Call the mutation with the post data
    uploadPhotos(postData);
  };

  const { mutate: uploadPhotos, isPending:isUploading } = useMutation({
    mutationFn: async (payload: any) => {
      return await $fetch('/api/plummy/home/main/dailyUploadImage', {
        method: 'POST',
        body: payload,
      });
    },
    onSuccess: async () => {
      
      toast({
        title: 'Images Uploaded',
        description: 'Images has been uploaded successfully.',
      });
  
      
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

  // Current Daily Images
  const { data:queryDailyData, isLoading:isDailyLoading, error:dailyError } = useQuery({
    queryKey: ['daily'],
    queryFn: async () => {
      const response = await fetch('/api/plummy/home/main/daily');
      if (!response.ok) {
        throw createError({
          statusCode: response.status,
          statusMessage: response.statusText
        });
      }
      return response.json();
    }
  });

  // Modify Daily Image
  
  const selectedImageModify = ref<string>('');
  const handleModifyImage = (image:string) => {
    selectedImageModify.value = image;
  }

  // Modify attributes
  const attributes = computed(() => ({
    effect: {
      src: selectedImageModify.value,
      alt: "My Awesome Image",
      width: "987",
      height: "987",
    }
  }));

  // Set Daily Image
  const selectedDailyImageSet = ref<string>('');
  const handleDailyImageSet = (image:string) => {
    selectedDailyImageSet.value = image;
  }

</script>

<template>

  <Dialog :open="isOpen" @update:open="emit('onClose')">
    <DialogContent class="max-h-[100vh] min-w-[115rem]">

      <ResizablePanelGroup direction="horizontal">

        <ResizablePanel 
          :class="{
            'bg-purple-500 rounded-md': selectedDailyImageSet === '',
            'bg-cover bg-center rounded-md': selectedDailyImageSet !== ''
          }"
          :style="selectedDailyImageSet !== '' ? { backgroundImage: `url(${selectedDailyImageSet})` } : {}"
        >

          <div class="flex flex-col items-center justify-end h-full p-6 space-y-4">
            <div class="flex items-center justify-start w-full p-4 bg-white border-2 rounded-md cursor-pointer hover:border-black">
              <Icon name="lucide:image-plus" class="w-12 h-12 mr-2" /> 
              <div class="flex flex-col">
                <p class="text-lg">
                  Create, my day.
                </p>
                <p class="text-xs">
                  Design a new daily vision to spark inspiration.
                </p>
              </div>
              <Icon name="lucide:chevron-right" class="w-6 h-6 ml-auto" /> 
            </div>

            <div class="flex items-center justify-start w-full p-4 bg-white border-2 rounded-md cursor-pointer hover:border-black">
              <Icon name="lucide:album" class="w-12 h-12 mr-2" /> 
              <div class="flex flex-col">
                <p class="text-lg">
                  Add, new images.
                </p>
                <p class="text-xs">
                  Add new images to your daily entry.
                </p>
              </div>
              <Icon name="lucide:chevron-right" class="w-6 h-6 ml-auto" /> 
            </div>
          </div>

        </ResizablePanel>

        <ResizableHandle with-handle />

        <ResizablePanel>

          <div class="flex flex-col items-center justify-start p-6 space-y-4">

            <div class="h-32 border-2 border-gray-400 rounded-md cursor-pointer min-w-96 hover:border-purple-500">
              
            </div>

            <div class="h-32 border-2 border-gray-400 rounded-md cursor-pointer min-w-96 hover:border-purple-500">
              
            </div>

            <div class="h-32 border-2 border-gray-400 rounded-md cursor-pointer min-w-96 hover:border-purple-500">
              
            </div>

            <div class="h-32 border-2 border-gray-400 rounded-md cursor-pointer min-w-96 hover:border-purple-500">
              
            </div>
            
          </div>
        
        </ResizablePanel>

        <ResizableHandle with-handle />

        <ResizablePanel>

          <div class="flex flex-col items-center justify-center p-6 space-y-4">

            <div class="border-[1px] border-gray-400 rounded-md cursor-pointer min-w-96 h-96 hover:border-purple-500" v-if="selectedImageModify">
              <CldImage v-bind="attributes.effect" v-if="selectedImageModify" />
            </div>

            <div class="flex items-center justify-start w-full p-4 bg-white border-2 rounded-md cursor-pointer hover:border-black">
              <Icon name="lucide:save" class="w-8 h-8 mr-2" /> 
              <div class="flex flex-col">
                <p class="text-md">
                  Save, modifications.
                </p>
                <p class="text-xs">
                  Confirm edits to finalize changes.
                </p>
              </div>
              <Icon name="lucide:chevron-right" class="w-4 h-4 ml-auto" /> 
            </div>

            <div class="flex items-center justify-start w-full p-4 bg-white border-2 rounded-md cursor-pointer hover:border-black">
              <Icon name="lucide:album" class="w-8 h-8 mr-2" /> 
              <div class="flex flex-col">
                <p class="text-md">
                  Return, to album.
                </p>
                <p class="text-xs">
                  Go back to your photo collection.
                </p>
              </div>
              <Icon name="lucide:chevron-right" class="w-4 h-4 ml-auto" /> 
            </div>

          </div>

        </ResizablePanel>

        <ResizableHandle with-handle />

        <ResizablePanel>

          <div class="flex flex-col items-center justify-center p-6 space-y-4">

            <div class="border-[1px] border-purple-400 rounded-md min-w-96 h-96 hover:border-purple-500 items-center justify-center flex bg-purple-50 w-full" v-if="selectedImages.length === 0">
              <Icon name="lucide:image" class="w-12 h-12 text-gray-500" /> 
            </div>

            <input 
              id="picture" 
              ref="fileInput"
              type="file" 
              class="hidden" 
              multiple 
              accept="image/*" 
              @change="handleImageUpload"
            />

            <div class="flex flex-wrap gap-2" v-if="!isUploading">
              <div v-for="(image, index) in selectedImages" :key="index" class="group">
                <div class="border-[1px] w-40 h-40 group-hover:border-purple-600 group-hover:border-2 rounded-md relative">
                  <img :src="image" class="object-cover rounded-md size-full" />
                  <Icon name="lucide:circle-x" class="absolute z-10 hidden w-6 h-6 text-red-500 cursor-pointer top-1 right-1 group-hover:flex" @click="removeImage(index)" />
                  <div class="absolute inset-0 transition-opacity duration-200 rounded-md opacity-0 bg-white/30 group-hover:opacity-100"></div>
                </div>
              </div>
            </div>

            <div class="flex items-center justify-start w-full p-4 border-[1px] rounded-md cursor-pointer hover:border-purple-500 border-purple-400 min-w-96 bg-purple-50" @click="triggerFileInput">
              <Icon name="lucide:image-plus" class="w-8 h-8 mr-2 text-gray-500" /> 
              <div class="flex flex-col">
                <p class="text-md text-muted-foreground">
                  Insert, additional images.
                </p>
                <p class="text-xs text-muted-foreground">
                  Bring your daily post to life with new pictures.
                </p>
              </div>
              <Icon name="lucide:diamond-plus" class="w-4 h-4 ml-auto text-gray-500" /> 
            </div>

            <div class="flex items-center justify-start w-full p-4 border-[1px] rounded-md cursor-pointer hover:border-blue-500 border-blue-400 min-w-96 bg-blue-50" @click="handleUploadPhoto">
              <Icon name="lucide:image-up" class="w-8 h-8 mr-2 text-gray-500" /> 
              <div class="flex flex-col">
                <p class="text-md text-muted-foreground">
                  Upload, selected images.
                </p>
                <p class="text-xs text-muted-foreground">
                  Diversify your photo collection.
                </p>
              </div>
              <Icon name="lucide:cloud-upload" class="w-4 h-4 ml-auto text-gray-500" /> 
            </div>
            
          </div>

        </ResizablePanel>

        <ResizableHandle with-handle />

        <ResizablePanel>

          <div class="flex flex-wrap items-center gap-2 p-6 justfiy-center">

            <div class="w-24 h-24 border-[1px] border-gray-400 rounded-md cursor-pointer hover:border-purple-500" v-for="i in queryDailyData" :key="i">
              <Popover>
                <PopoverTrigger>
                  <NuxtImg :src="i.dailyurl" class="rounded-md border-[1px] w-full h-full"/>
                </PopoverTrigger>
                <PopoverContent class="flex flex-col space-y-2">
                  <div class="flex items-center justify-start w-full p-4 bg-white border-[1px] rounded-md cursor-pointer hover:border-purple-500 hover:border-2" @click="handleDailyImageSet(i.dailyurl)">
                    <Icon name="lucide:image-play" class="w-6 h-6 mr-2" /> 
                    <p class="text-sm">
                      My Day
                    </p>
                    <Icon name="lucide:chevron-right" class="w-4 h-4 ml-auto" /> 
                  </div>
                  <div class="flex items-center justify-start w-full p-4 bg-white border-[1px] rounded-md cursor-pointer hover:border-purple-500 hover:border-2" @click="handleModifyImage(i.dailyurl)">
                    <Icon name="lucide:images" class="w-6 h-6 mr-2" /> 
                    <p class="text-sm">
                      Modify
                    </p>
                    <Icon name="lucide:chevron-right" class="w-4 h-4 ml-auto" /> 
                  </div>
                  <div class="flex items-center justify-start w-full p-4 bg-white border-[1px] rounded-md cursor-pointer hover:border-purple-500 hover:border-2">
                    <Icon name="lucide:image-minus" class="w-6 h-6 mr-2" /> 
                    <p class="text-sm">
                      Remove
                    </p>
                    <Icon name="lucide:chevron-right" class="w-4 h-4 ml-auto" /> 
                  </div>
                </PopoverContent>
              </Popover>
            </div>

          </div>

        </ResizablePanel>
        
      </ResizablePanelGroup>

    </DialogContent>
  </Dialog>

</template>

