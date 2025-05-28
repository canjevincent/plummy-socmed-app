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

    showMain.value = false;
    showAlbum.value = false;
    showModify.value = true;
    showUpload.value = false;
  }

  // Modify attributes

  const imageOpacity = ref([100])
  const imageBlurr = ref([0]);
  const imageBlurrFaces = ref([0]);
  const imageSharpen = ref([0]);
  const imagesBrightness = ref([0]);
  const imagesVibrance = ref([0]);
  const imagesAngle = ref([0]);

  const textContent = ref('');
  const textPositionX = ref([5]);
  const textPositionY = ref([5]);
  const textFontSize = ref([200]);
  const textColor = ref('#000');

  const imagesRemoveBackground = ref(false);
  const imagesZoomPan = ref(false);
  const imagesGrayScale = ref(false);
  
  const attributes = computed(() => ({
    effect: {
      src: selectedImageModify.value,
      alt: "My Awesome Image",
      width: "987",
      height: "987",
      opacity: imageOpacity.value[0].toString(),
      blur: imageBlurr.value[0].toString(),
      blurFaces: imageBlurrFaces.value[0].toString(),
      sharpen: imageSharpen.value[0].toString(),
      brightness: imagesBrightness.value[0].toString(),
      vibrance: imagesVibrance.value[0].toString(),
      angle: imagesAngle.value[0].toString(),
      removeBackground: imagesRemoveBackground.value,
      zoompan: imagesZoomPan.value,
      grayscale: imagesGrayScale.value,
      overlays: [
        {
          position: {
            y: textPositionY.value[0],
            x: textPositionX.value[0] 
          },
          text: {
            color: textColor.value.toString(),
            fontFamily: "Source Sans Pro",
            fontSize: textFontSize.value[0],
            fontWeight: "black",
            text: textContent.value || " ",
          },
        },
      ],
    }
  }));

  // Set Daily Image
  const selectedDailyImageSet = ref<string>('');
  const handleDailyImageSet = (image:string) => {
    selectedDailyImageSet.value = image;

    showMain.value = true;
    showAlbum.value = false;
    showModify.value = false;
    showUpload.value = false;
  }

  // Display Phase
  const showMain = ref(true);
  const showAlbum = ref(false);
  const showModify = ref(false);
  const showUpload = ref(false);

  const clickMainCreate = () => {
    showMain.value = false;
    showAlbum.value = false;
    showModify.value = false;
    showUpload.value = true;
  }

  const clickMainAlbum = () => {
    showMain.value = false;
    showAlbum.value = true;
    showModify.value = false;
    showUpload.value = false;
  }

  const clickAlbumUpload = () => {
    showMain.value = false;
    showAlbum.value = false;
    showModify.value = false;
    showUpload.value = true;
  }

</script>

<template>

  <Dialog :open="isOpen" @update:open="emit('onClose')">
    <DialogContent 
      class="max-h-[100vh] max-w-[115rem]"
     :class="{
      'h-[50rem] w-[30rem]': showMain === true && showAlbum === false && showModify === false || showUpload === true, // Open Main or Upload
      'h-[50rem] w-[500rem]': showMain === false && showAlbum === true && showModify === false && showUpload === false, // Open Album
     }"
    >

      <ResizablePanelGroup direction="horizontal">
        <!-- Main -->
        <ResizablePanel 
          :class="{
            'bg-purple-500 rounded-md': selectedDailyImageSet === '',
            'bg-cover bg-center rounded-md': selectedDailyImageSet !== ''
          }"
          :style="selectedDailyImageSet !== '' ? { backgroundImage: `url(${selectedDailyImageSet})` } : {}"
          v-show="showMain"
        >

          <div class="flex flex-col items-center justify-end h-full p-6 space-y-4">
            <div class="flex items-center justify-start w-full p-4 bg-white border-2 rounded-md cursor-pointer hover:border-black" @click="clickMainCreate">
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

            <div class="flex items-center justify-start w-full p-4 bg-white border-2 rounded-md cursor-pointer hover:border-black" @click="clickMainAlbum">
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

        <!-- Modify -->
        <ResizablePanel v-show="showModify">

          <div class="flex flex-wrap items-center justify-start gap-4 p-6">

            <div class="h-auto border-[1px] border-gray-400 rounded-md cursor-pointer min-w-40 hover:border-purple-500 space-y-2 p-3">
             <p class="text-sm">Opacity</p>
             <Slider
                v-model="imageOpacity"
                :max="100"
                :step="1"
                class="text-sm"
              />
              <p class="ml-auto text-sm">{{ imageOpacity?.[0] }}</p>
            </div>

            <div class="h-auto border-[1px] border-gray-400 rounded-md cursor-pointer min-w-40 hover:border-purple-500 space-y-2 p-3">
             <p class="text-sm">Blurr</p>
             <Slider
                v-model="imageBlurr"
                :max="1000"
                :step="100"
                class="text-sm"
              />
              <p class="ml-auto text-sm">{{ imageBlurr?.[0] }}</p>
            </div>

            <div class="h-auto border-[1px] border-gray-400 rounded-md cursor-pointer min-w-40 hover:border-purple-500 space-y-2 p-3">
             <p class="text-sm">Blurr Faces</p>
             <Slider
                v-model="imageBlurrFaces"
                :max="1000"
                :step="100"
                class="text-sm"
              />
              <p class="ml-auto text-sm">{{ imageBlurrFaces?.[0] }}</p>
            </div>

            <div class="h-auto border-[1px] border-gray-400 rounded-md cursor-pointer min-w-40 hover:border-purple-500 space-y-2 p-3">
             <p class="text-sm">Sharpen</p>
             <Slider
                v-model="imageSharpen"
                :max="1000"
                :step="100"
                class="text-sm"
              />
              <p class="ml-auto text-sm">{{ imageSharpen?.[0] }}</p>
            </div>

            <div class="h-auto border-[1px] border-gray-400 rounded-md cursor-pointer min-w-40 hover:border-purple-500 space-y-2 p-3">
             <p class="text-sm">Brightness</p>
             <Slider
                v-model="imagesBrightness"
                :max="100"
                :step="1"
                class="text-sm"
              />
              <p class="ml-auto text-sm">{{ imagesBrightness?.[0] }}</p>
            </div>

            <div class="h-auto border-[1px] border-gray-400 rounded-md cursor-pointer min-w-40 hover:border-purple-500 space-y-2 p-3">
             <p class="text-sm">Vibrance</p>
             <Slider
                v-model="imagesVibrance"
                :max="100"
                :step="1"
                class="text-sm"
              />
              <p class="ml-auto text-sm">{{ imagesVibrance?.[0] }}</p>
            </div>

            <div class="h-auto border-[1px] border-gray-400 rounded-md cursor-pointer min-w-40 hover:border-purple-500 space-y-2 p-3">
             <p class="text-sm">Angle</p>
             <Slider
                v-model="imagesAngle"
                :max="100"
                :step="1"
                class="text-sm"
              />
              <p class="ml-auto text-sm">{{ imagesAngle?.[0] }}</p>
            </div>

            <div class="h-auto border-[1px] border-gray-400 rounded-md cursor-pointer min-w-40 hover:border-purple-500 space-y-2 p-3">
             <p class="text-sm">Text Content</p>
             <Input v-model="textContent" class="text-sm" />
            </div>

            <div class="h-auto border-[1px] border-gray-400 rounded-md cursor-pointer min-w-40 hover:border-purple-500 space-y-2 p-3">
             <p class="text-sm">Text Position X</p>
             <Slider
                v-model="textPositionX"
                :max="1000"
                :step="1"
                class="text-sm"
              />
              <p class="ml-auto text-sm">{{ textPositionX?.[0] }}</p>
            </div>

            <div class="h-auto border-[1px] border-gray-400 rounded-md cursor-pointer min-w-40 hover:border-purple-500 space-y-2 p-3">
             <p class="text-sm">Text Position Y</p>
             <Slider
                v-model="textPositionY"
                :max="1000"
                :step="1"
                class="text-sm"
              />
              <p class="ml-auto text-sm">{{ textPositionY?.[0] }}</p>
            </div>

            <div class="h-auto border-[1px] border-gray-400 rounded-md cursor-pointer min-w-40 hover:border-purple-500 space-y-2 p-3">
             <p class="text-sm">Font Size</p>
             <Slider
                v-model="textFontSize"
                :max="1000"
                :step="1"
                class="text-sm"
              />
              <p class="ml-auto text-sm">{{ textFontSize?.[0] }}</p>
            </div>

            <color-picker-block
              v-model="textColor"
              :withAlpha="true"
              :withInitialColor="true"
              :withEyeDropper="true"
              :withHexInput="true"
              :withRgbInput="true"
              :withColorsHistory="true"
              :immediateEmit="true"
              @change="console.log('New color:', $event)"
            />

            <div class="h-auto border-[1px] border-gray-400 rounded-md cursor-pointer min-w-40 hover:border-purple-500 space-x-2 p-3 justify-start items-center flex">
              <Switch id="dashboard-posts-create" v-model="imagesRemoveBackground" class="scale-75" />
              <Label for="dashboard-posts-create" class="text-xs font-medium leading-none">Remove Background</Label>
            </div>

            <div class="h-auto border-[1px] border-gray-400 rounded-md cursor-pointer min-w-40 hover:border-purple-500 space-x-2 p-3 justify-start items-center flex">
              <Switch id="dashboard-posts-create" v-model="imagesZoomPan" class="scale-75" />
              <Label for="dashboard-posts-create" class="text-xs font-medium leading-none">Zoom Pan</Label>
            </div>

            <div class="h-auto border-[1px] border-gray-400 rounded-md cursor-pointer min-w-40 hover:border-purple-500 space-x-2 p-3 justify-start items-center flex">
              <Switch id="dashboard-posts-create" v-model="imagesGrayScale" class="scale-75" />
              <Label for="dashboard-posts-create" class="text-xs font-medium leading-none">Grayscale</Label>
            </div>
            
          </div>
        
        </ResizablePanel>

        <ResizableHandle with-handle v-show="showModify" />
        <!-- Modify -->
        <ResizablePanel v-show="showModify">

          <div class="flex flex-col items-center justify-center p-6 space-y-4">

            <CldImage v-bind="attributes.effect" v-if="selectedImageModify" class="rounded-md" />

            <div class="flex items-center justify-start w-full p-4 bg-white border-2 rounded-md cursor-pointer hover:border-black">
              <Icon name="lucide:save" class="w-12 h-12 mr-2" /> 
              <div class="flex flex-col">
                <p class="text-lg">
                  Save, modifications.
                </p>
                <p class="text-xs">
                  Confirm edits to finalize changes.
                </p>
              </div>
              <Icon name="lucide:chevron-right" class="w-6 h-6 ml-auto" /> 
            </div>

            <div class="flex items-center justify-start w-full p-4 bg-white border-2 rounded-md cursor-pointer hover:border-black" @click="clickMainAlbum">
              <Icon name="lucide:album" class="w-12 h-12 mr-2" /> 
              <div class="flex flex-col">
                <p class="text-lg">
                  Return, to album.
                </p>
                <p class="text-xs">
                  Go back to your photo collection.
                </p>
              </div>
              <Icon name="lucide:chevron-right" class="w-6 h-6 ml-auto" /> 
            </div>

          </div>

        </ResizablePanel>

        <!-- Upload -->
        <ResizablePanel v-show="showUpload">

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
              <Icon name="lucide:image-plus" class="w-12 h-12 mr-2 text-gray-500" /> 
              <div class="flex flex-col">
                <p class="text-lg text-muted-foreground">
                  Insert, additional images.
                </p>
                <p class="text-xs text-muted-foreground">
                  Bring your daily post to life with new pictures.
                </p>
              </div>
              <Icon name="lucide:diamond-plus" class="w-6 h-6 ml-auto text-gray-500" /> 
            </div>

            <div class="flex items-center justify-start w-full p-4 border-[1px] rounded-md cursor-pointer hover:border-blue-500 border-blue-400 min-w-96 bg-blue-50" @click="handleUploadPhoto">
              <Icon name="lucide:image-up" class="w-12 h-12 mr-2 text-gray-500" /> 
              <div class="flex flex-col">
                <p class="text-lg text-muted-foreground">
                  Upload, selected images.
                </p>
                <p class="text-xs text-muted-foreground">
                  Diversify your photo collection.
                </p>
              </div>
              <Icon name="lucide:cloud-upload" class="w-6 h-6 ml-auto text-gray-500" /> 
            </div>

            <div class="flex items-center justify-start w-full p-4 bg-white border-2 rounded-md cursor-pointer hover:border-black" @click="clickMainAlbum">
              <Icon name="lucide:album" class="w-12 h-12 mr-2" /> 
              <div class="flex flex-col">
                <p class="text-lg">
                  Return, to album.
                </p>
                <p class="text-xs">
                  Go back to your photo collection.
                </p>
              </div>
              <Icon name="lucide:chevron-right" class="w-6 h-6 ml-auto" /> 
            </div>
            
          </div>

        </ResizablePanel>

        <!-- Album -->
        <ResizablePanel v-show="showAlbum">

          <div class="flex flex-col space-y-4">

            <div class="flex flex-wrap items-center gap-2 justfiy-center">

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

            <div class="flex items-center justify-start w-full p-4 border-[1px] rounded-md cursor-pointer hover:border-blue-500 border-blue-400 min-w-96 bg-blue-50" @click="clickAlbumUpload">
              <Icon name="lucide:image-up" class="w-12 h-12 mr-2 text-gray-500" /> 
              <div class="flex flex-col">
                <p class="text-lg text-muted-foreground">
                  Upload, new images.
                </p>
                <p class="text-xs text-muted-foreground">
                  Diversify your photo collection.
                </p>
              </div>
              <Icon name="lucide:cloud-upload" class="w-4 h-4 ml-auto text-gray-500" /> 
            </div>

          </div>

        </ResizablePanel>
        
      </ResizablePanelGroup>

    </DialogContent>
  </Dialog>

</template>

