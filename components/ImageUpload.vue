<script setup lang="ts">
  import { useToast } from '~/components/ui/toast';

  const { toast } = useToast();

  interface UploadImageProps {
    value: string
    allowedFormats?: string[]
    isUpdating: boolean
  }

  const props = defineProps<UploadImageProps>();

  const { public: { uploadPreset } } = useRuntimeConfig();

  const emits = defineEmits(['onChange', 'onRemove']);

  const onUpload = (upload: any) => {
      emits('onChange', upload.info.secure_url);
      console.log('Check upload output: ',upload)
  }

  const onResult = (result: any) => {
      emits('onChange', result.info.secure_url);
      console.log('Check result output: ',result)
  }

  const onError = (error: any) => {
      emits('onChange', error.info.secure_url);
      console.log('Check error output: ',error)
  }

  const { mutate: updateImage, isPending: isImageUpdating } = useMutation({
    mutationFn: async (url: string) => {
      
      emits('onRemove', url);

      const resourceName = getResourceName(url);
      
      return await $fetch(`/api/cloudinary/${resourceName}`, {
        method: 'DELETE',
      })

    },
    onSuccess: async () => {
      
      toast({
        title: 'Image Update',
        description: 'Your profile image has been updated successfully.',
      });
      
    },
    onError: (error: any) => {

      console.error('Error deleting image:', error);

    }
  });

  const deleteImage = async (url: string) => {
    updateImage(url)
  }

</script>

<template>
  <div class="flex items-center gap-4 mb-4" v-if="value">
    <div :key="value" class="relative w-[200px] h-[200px] rounded-md overflow-hidden">

      <div class="absolute z-10 top-2 right-2">
        <Button type="button" @click="deleteImage(value)" variant="destructive" size="sm" :disabled="isImageUpdating || isUpdating"> 

          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" v-if="isImageUpdating || isUpdating" disabled>
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

          <Icon name="lucide:trash" class="w-4 h-4" v-if="!isImageUpdating" />
        </Button>
      </div>
      
      <NuxtImg :src="value" class="object-cover w-full h-full" alt="image" />

      <!-- Overlay SVG Spinner -->
      <div v-if="isImageUpdating || isUpdating" class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <svg xmlns="http://www.w3.org/2000/svg" width="10em" height="10em" viewBox="0 0 24 24">
          <circle cx="4" cy="12" r="3" fill="white">
            <animate id="svgSpinners3DotsScale0" attributeName="r" begin="0;svgSpinners3DotsScale1.end-0.25s" dur="0.75s" values="3;.2;3"></animate>
          </circle>
          <circle cx="12" cy="12" r="3" fill="white">
            <animate attributeName="r" begin="svgSpinners3DotsScale0.end-0.6s" dur="0.75s" values="3;.2;3"></animate>
          </circle>
          <circle cx="20" cy="12" r="3" fill="white">
            <animate id="svgSpinners3DotsScale1" attributeName="r" begin="svgSpinners3DotsScale0.end-0.45s" dur="0.75s" values="3;.2;3"></animate>
          </circle>
        </svg>
      </div>

    </div>
  </div>

  <CldUploadWidget 
    v-slot="{ open }" 
    :uploadPreset="uploadPreset" 
    :onResult="onResult" 
    :onError="onError"
    :onUpload="onUpload"
    :options="{ 
      clientAllowedFormats: allowedFormats,
      multiple: false,
      maxFiles: 1
    }"
  >
    <Button type="button" @click="open" :disabled="isImageUpdating || isUpdating">

      <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" v-if="isImageUpdating || isUpdating" disabled>
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

      <Icon name="lucide:image-plus" class="w-4 h-4 mr-2" v-if="!isImageUpdating"></Icon>
      
      Image
    </Button>
  </CldUploadWidget>
</template>