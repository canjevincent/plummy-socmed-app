<script lang="ts" setup>

  import { usePostSetDaily, usePostClearDaily, usePostRemoveDaily } from '~/composables/plummy/useDailyMyDay';
  import { useDeleteCloudinaryImage } from '~/composables/useCloudinary';
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

      // Switch to album
      clickMainAlbum();
      // Refetch newly uploaded images
      await refetchDaily();
      // Clear the selected images
      selectedImages.value = [];
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
  const { data:queryDailyData, isLoading:isDailyLoading, error:dailyError, refetch:refetchDaily } = useQuery({
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

  // Modify attributes
  const selectedImageModify = ref<string>('');
  const selectedImageId = ref<string>('');

  const imageOpacity = ref([100])
  const imageBlur = ref([0]);
  const imageBlurFace = ref([0]);
  const imageSharpen = ref([0]);
  const imageBrightness = ref([0]);
  const imageVibrance = ref([0]);
  const imageAngle = ref([0]);

  const textContent = ref('');
  const textPositionX = ref([5]);
  const textPositionY = ref([5]);
  const textFontSize = ref([200]);
  const textColor = ref('#000');

  const imageRemoveBackground = ref(false);
  const imageZoomPan = ref(false);
  const imageGrayScale = ref(false);
  
  const attributes = computed(() => ({
    effect: {
      src: selectedImageModify.value,
      alt: "My Awesome Image",
      width: "987",
      height: "987",
      opacity: imageOpacity.value[0].toString(),
      blur: imageBlur.value[0].toString(),
      blurFaces: imageBlurFace.value[0].toString(),
      sharpen: imageSharpen.value[0].toString(),
      brightness: imageBrightness.value[0].toString(),
      vibrance: imageVibrance.value[0].toString(),
      angle: imageAngle.value[0].toString(),
      removeBackground: imageRemoveBackground.value,
      zoompan: imageZoomPan.value,
      grayscale: imageGrayScale.value,
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

  // Modify Daily Image
  
  const handleModifyImage = (
    image: string,
    imageId: string,
    opacity: number,
    blur: number,
    blurFace: number,
    sharpen: number,
    brightness: number,
    vibrance: number,
    angle: number,
    content: string,
    positionX: number,
    positionY: number,
    fontSize: number,
    color: string,
    removeBackground: boolean,
    zoomPan: boolean,
    grayScale: boolean,
  ) => {
    selectedImageModify.value = image;
    selectedImageId.value = imageId;
    imageOpacity.value = [opacity || 100];
    imageBlur.value = [blur || 0];
    imageBlurFace.value = [blurFace || 0];
    imageSharpen.value = [sharpen || 0];
    imageBrightness.value = [brightness || 0];
    imageVibrance.value = [vibrance || 0];
    imageAngle.value = [angle || 0];
    textContent.value = content || '';
    textPositionX.value = [positionX || 5];
    textPositionY.value = [positionY || 5];
    textFontSize.value = [fontSize || 200];
    textColor.value = color || '#000';
    imageRemoveBackground.value = removeBackground || false;
    imageZoomPan.value = zoomPan || false;
    imageGrayScale.value = grayScale || false;
    
    showMain.value = false;
    showAlbum.value = false;
    showModify.value = true;
    showUpload.value = false;
  }

  // Save Modifications

  const handleSaveImageModifications = () => {

    const imageModificationData = {
      imageOpacity: Number(imageOpacity.value[0]),
      imageBlur: Number(imageBlur.value[0]),
      imageBlurFace: Number(imageBlurFace.value[0]),
      imageSharpen: Number(imageSharpen.value[0]),
      imageBrightness: Number(imageBrightness.value[0]),
      imageVibrance: Number(imageVibrance.value[0]),
      imageAngle: Number(imageAngle.value[0]),
      textContent: textContent.value,
      textPositionX: Number(textPositionX.value[0]),
      textPositionY: Number(textPositionY.value[0]),
      textFontSize: Number(textFontSize.value[0]),
      textColor: textColor.value,
      imageRemoveBackground: imageRemoveBackground.value,
      imageZoomPan: imageZoomPan.value,
      imageGrayScale: imageGrayScale.value
    }

    saveModification(imageModificationData);

  }

  const { mutate:saveModification, isPending:isSavingModification } = useMutation({
    mutationFn: async (payload: any) => {
      return await $fetch(`/api/plummy/home/main/dailies/${selectedImageId.value}/modifyDaily`, {
        method: 'PATCH',
        body: payload,
      });
    },
    onSuccess: async () => {
      
      toast({
        title: 'Images Modification Saved',
        description: 'Images has been modified successfully.',
      });

      // Switch to album
      clickMainAlbum();
      // Refetch newly uploaded images
      await refetchDaily();
      // Clear the selected images
      selectedImageModify.value = '';
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

  // Set Daily Image

  const { 
    setDaily,
    isSettingDaily
  } = usePostSetDaily(selectedImageId, refetchDaily)

  const selectedDailyImageSet = ref<string>('');
  const handleDailyImageSet = (image:string, imageId:string) => {
    selectedDailyImageSet.value = image;
    selectedImageId.value = imageId;

    const setImageMyDay = {
      isMyDay:true
    }

    setDaily(setImageMyDay)

    showMain.value = true;
    showAlbum.value = false;
    showModify.value = false;
    showUpload.value = false;
  }

  // Clear Daily Image

  const { 
    clearDaily,
    isClearingDaily
  } = usePostClearDaily(selectedImageId, refetchDaily)

  const handleDailyImageClear = (imageId:string) => {
    selectedImageId.value = imageId;
    
    const setImageMyDay = {
      isMyDay:false
    }

    clearDaily(setImageMyDay)

  }

  // Remove Image
  const selectedImageUrl = ref<string>('');

  const {
    deleteCloudinaryImage,
    isDeletingCloudinaryImage
  } = useDeleteCloudinaryImage(selectedImageUrl);

  const { 
    removeDaily,
    isRemovingDaily
  } = usePostRemoveDaily(selectedImageId, refetchDaily)

  const handleDailyImageRemove = (imageId:string, imageUrl: string) => {
    
    const resourceName = getResourceName(imageUrl);
    selectedImageUrl.value = resourceName as string;

    const setImageMyDayCloudinaryDelete = {
      url:selectedImageUrl
    }

    deleteCloudinaryImage(setImageMyDayCloudinaryDelete)

    selectedImageId.value = imageId;
    
    const setImageMyDayDelete = {
      id:imageId
    }

    removeDaily(setImageMyDayDelete)

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
      class="max-h-[100vh] max-w-[100rem]"
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

        <ResizablePanelGroup direction="horizontal" v-show="showModify">
        
          <!-- Modify -->
          <ResizablePanel :default-size="30">

            <div class="flex flex-col items-start justify-center gap-4 p-6">

              <div class="flex flex-col p-3 rounded-md bg-slate-200 gap-y-2">
                <p class="text-lg font-semibold">Filters & Effects</p>
                <p class="text-sm text-muted-foreground">
                  Elevate your images beyond the ordinary with premium effects that add depth, color, and emotion. ✨ #ImageEnhancement.
                </p>
              </div>

              <div class="flex flex-wrap gap-2">

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
                    v-model="imageBlur"
                    :max="1000"
                    :step="100"
                    class="text-sm"
                  />
                  <p class="ml-auto text-sm">{{ imageBlur?.[0] }}</p>
                </div>

                <div class="h-auto border-[1px] border-gray-400 rounded-md cursor-pointer min-w-40 hover:border-purple-500 space-y-2 p-3">
                  <p class="text-sm">Blurr Faces</p>
                  <Slider
                    v-model="imageBlurFace"
                    :max="1000"
                    :step="100"
                    class="text-sm"
                  />
                  <p class="ml-auto text-sm">{{ imageBlurFace?.[0] }}</p>
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
                    v-model="imageBrightness"
                    :max="100"
                    :step="1"
                    class="text-sm"
                  />
                  <p class="ml-auto text-sm">{{ imageBrightness?.[0] }}</p>
                </div>

                <div class="h-auto border-[1px] border-gray-400 rounded-md cursor-pointer min-w-40 hover:border-purple-500 space-y-2 p-3">
                  <p class="text-sm">Vibrance</p>
                  <Slider
                    v-model="imageVibrance"
                    :max="100"
                    :step="1"
                    class="text-sm"
                  />
                  <p class="ml-auto text-sm">{{ imageVibrance?.[0] }}</p>
                </div>

                <div class="h-auto border-[1px] border-gray-400 rounded-md cursor-pointer min-w-40 hover:border-purple-500 space-y-2 p-3">
                  <p class="text-sm">Angle</p>
                  <Slider
                    v-model="imageAngle"
                    :max="100"
                    :step="1"
                    class="text-sm"
                  />
                  <p class="ml-auto text-sm">{{ imageAngle?.[0] }}</p>
                </div>

              </div>

              <div class="flex flex-wrap gap-2">

                <div class="h-auto border-[1px] border-gray-400 rounded-md cursor-pointer min-w-40 hover:border-purple-500 space-x-2 p-3 justify-start items-center flex">
                  <Switch id="dashboard-posts-create" v-model="imageRemoveBackground" class="scale-75" />
                  <Label for="dashboard-posts-create" class="text-xs font-medium leading-none">Remove Background</Label>
                </div>

                <div class="h-auto border-[1px] border-gray-400 rounded-md cursor-pointer min-w-40 hover:border-purple-500 space-x-2 p-3 justify-start items-center flex">
                  <Switch id="dashboard-posts-create" v-model="imageZoomPan" class="scale-75" />
                  <Label for="dashboard-posts-create" class="text-xs font-medium leading-none">Zoom Pan</Label>
                </div>

                <div class="h-auto border-[1px] border-gray-400 rounded-md cursor-pointer min-w-40 hover:border-purple-500 space-x-2 p-3 justify-start items-center flex">
                  <Switch id="dashboard-posts-create" v-model="imageGrayScale" class="scale-75" />
                  <Label for="dashboard-posts-create" class="text-xs font-medium leading-none">Grayscale</Label>
                </div>

              </div>

              <div class="flex flex-col p-3 rounded-md bg-slate-200 gap-y-2">
                <p class="text-lg font-semibold">Content</p>
                <p class="text-sm text-muted-foreground">
                  Create with purpose. Every post, image, and word intentionally designed to deliver value. ✨ #ShortTitle.
                </p>
              </div>

              <div class="flex flex-wrap gap-2">

                <div class="h-auto border-[1px] border-gray-400 rounded-md cursor-pointer min-w-40 hover:border-purple-500 space-y-2 p-3">
                  <p class="text-sm">Text</p>
                  <Input v-model="textContent" class="text-sm" />
                </div>

                <div class="h-auto border-[1px] border-gray-400 rounded-md cursor-pointer min-w-40 hover:border-purple-500 space-y-2 p-3">
                  <p class="text-sm">Position X</p>
                  <Slider
                    v-model="textPositionX"
                    :max="1000"
                    :step="1"
                    class="text-sm"
                  />
                  <p class="ml-auto text-sm">{{ textPositionX?.[0] }}</p>
                </div>

                <div class="h-auto border-[1px] border-gray-400 rounded-md cursor-pointer min-w-40 hover:border-purple-500 space-y-2 p-3">
                  <p class="text-sm">Position Y</p>
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

              </div>

              <div class="flex flex-wrap gap-2">
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
              </div>
              
            </div>
          
          </ResizablePanel>

          <ResizableHandle with-handle />
          <!-- Modify -->
          <ResizablePanel :default-size="14">

            <div class="flex flex-col items-center justify-center p-6 space-y-4">

              <CldImage v-bind="attributes.effect" v-if="selectedImageModify" class="rounded-md" />

              <div class="flex items-center justify-start w-full p-4 bg-white border-2 rounded-md cursor-pointer hover:border-black" @click="handleSaveImageModifications" v-show="isSavingModification === false">
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

              <div class="flex items-center justify-start w-full p-4 bg-white border-2 border-black rounded-md cursor-pointer animate-pulse" v-show="isSavingModification === true">

                <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 mr-2" viewBox="0 0 24 24"><!-- Icon from SVG Spinners by Utkarsh Verma - https://github.com/n3r4zzurr0/svg-spinners/blob/main/LICENSE -->
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

        </ResizablePanelGroup>

        <!-- Upload -->
        <ResizablePanel v-show="showUpload">

          <div class="flex flex-col items-center justify-center p-6 space-y-4">

            <div class="border-[1px] border-purple-400 rounded-md min-w-96 h-96 hover:border-purple-500 items-center justify-center flex bg-purple-50 w-full hover:border-2" v-if="selectedImages.length === 0" v-show="!isUploading">
              <Icon name="lucide:image" class="w-12 h-12 text-gray-500" /> 
            </div>
            
            <div class="flex flex-wrap gap-5" v-show="isUploading">
              <div class="animate-pulse group" v-for="i in 16" :key="i">
                <div class="w-20 h-20 border-2 border-purple-600 rounded-md animate-pulse">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-full h-full" viewBox="0 0 24 24"><!-- Icon from SVG Spinners by Utkarsh Verma - https://github.com/n3r4zzurr0/svg-spinners/blob/main/LICENSE -->
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

            <div class="flex items-center justify-start w-full p-4 border-[1px] rounded-md cursor-pointer hover:border-purple-500 border-purple-400 min-w-96 bg-purple-50 hover:border-2" @click="triggerFileInput" v-show="!isUploading">
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

            <div class="flex items-center justify-start w-full p-4 border-2 border-purple-500 rounded-md cursor-pointer min-w-96 bg-purple-50 animate-pulse" v-show="isUploading">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 mr-2" viewBox="0 0 24 24"><!-- Icon from SVG Spinners by Utkarsh Verma - https://github.com/n3r4zzurr0/svg-spinners/blob/main/LICENSE -->
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

            <div class="flex items-center justify-start w-full p-4 border-[1px] rounded-md cursor-pointer hover:border-blue-500 border-blue-400 min-w-96 bg-blue-50 hover:border-2" @click="handleUploadPhoto" v-show="!isUploading && selectedImages.length > 0">
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

            <div class="flex items-center justify-start w-full p-4 border-2 border-blue-500 rounded-md cursor-pointer min-w-96 bg-blue-50 animate-pulse" v-show="isUploading">
              
              <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 mr-2" viewBox="0 0 24 24"><!-- Icon from SVG Spinners by Utkarsh Verma - https://github.com/n3r4zzurr0/svg-spinners/blob/main/LICENSE -->
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

            <div class="flex items-center justify-start w-full p-4 bg-white border-2 rounded-md cursor-pointer hover:border-black" @click="clickMainAlbum" v-show="!isUploading">
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

            <div class="flex items-center justify-start w-full p-4 bg-white border-2 border-black rounded-md cursor-pointer animate-pulse" v-show="isUploading">
              
              <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 mr-2" viewBox="0 0 24 24"><!-- Icon from SVG Spinners by Utkarsh Verma - https://github.com/n3r4zzurr0/svg-spinners/blob/main/LICENSE -->
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
              <div v-for="i in queryDailyData" :key="i" v-show="!isSettingDaily && !isClearingDaily && !isDeletingCloudinaryImage && !isRemovingDaily">
                <HoverCard>
                  <HoverCardTrigger  as-child>
                    <div class="w-24 h-24 border-[1px] border-gray-400 rounded-md cursor-pointer hover:border-purple-500 hover:border-2">
                      <NuxtImg :src="i.dailyUrl" class="rounded-md border-[1px] w-full h-full"/>
                    </div>
                  </HoverCardTrigger>
                  <HoverCardContent class="flex flex-col space-y-2">
                    
                    <div class="flex items-center justify-start w-full p-4 bg-white border-[1px] rounded-md cursor-pointer hover:border-purple-500 hover:border-2" @click="handleDailyImageSet(i.dailyUrl, i.id)" v-show="i.isMyDay === false">
                      <Icon name="lucide:image-play" class="w-6 h-6 mr-2" /> 
                      <p class="text-sm">
                        My Day
                      </p>
                      <Icon name="lucide:chevron-right" class="w-4 h-4 ml-auto" /> 
                    </div>

                    <div class="flex items-center justify-start w-full p-4 bg-white border-[1px] rounded-md cursor-pointer hover:border-purple-500 hover:border-2" @click="handleDailyImageClear(i.id)" v-show="i.isMyDay === true">
                      <Icon name="lucide:image-play" class="w-6 h-6 mr-2" /> 
                      <p class="text-sm">
                        Clear My Day
                      </p>
                      <Icon name="lucide:chevron-right" class="w-4 h-4 ml-auto" /> 
                    </div>

                    <div class="flex items-center justify-start w-full p-4 bg-white border-[1px] rounded-md cursor-pointer hover:border-purple-500 hover:border-2" 
                        @click="handleModifyImage(i.dailyUrl, i.id, i.imageOpacity, i.imageBlur, i.imageBlurFace, i.imageSharpen, i.imageBrightness, i.imageVibrance, 
                                                  i.imageAngle, i.textContent, i.textPositionX, i.textPositionY, i.textFontSize, i.textColor, i.imageRemoveBackground, 
                                                  i.imageZoomPan, i.imageGrayScale)">
                      <Icon name="lucide:images" class="w-6 h-6 mr-2" /> 
                      <p class="text-sm">
                        Modify
                      </p>
                      <Icon name="lucide:chevron-right" class="w-4 h-4 ml-auto" /> 
                    </div>

                    <div class="flex items-center justify-start w-full p-4 bg-white border-[1px] rounded-md cursor-pointer hover:border-purple-500 hover:border-2" @click="handleDailyImageRemove(i.id, i.dailyUrl)">
                      <Icon name="lucide:image-minus" class="w-6 h-6 mr-2" /> 
                      <p class="text-sm">
                        Remove
                      </p>
                      <Icon name="lucide:chevron-right" class="w-4 h-4 ml-auto" /> 
                    </div>
                    
                  </HoverCardContent>
                </HoverCard>
              </div>

              <div v-for="i in queryDailyData" :key="i" v-show="isSettingDaily || isClearingDaily || isDeletingCloudinaryImage || isRemovingDaily">
                <div class="w-24 h-24 border-[1px] border-gray-400 rounded-md cursor-pointer hover:border-purple-500 animate-pulse">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-full h-full" viewBox="0 0 24 24"><!-- Icon from SVG Spinners by Utkarsh Verma - https://github.com/n3r4zzurr0/svg-spinners/blob/main/LICENSE -->
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

