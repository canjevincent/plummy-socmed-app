<script setup lang="ts">
  
  interface Result {
    event: string
    info: {
      secure_url: string
    }
  } 

  interface UploadImageProps {
    value: string
    allowedFormats?: string[]
  }

  const props = defineProps<UploadImageProps>();

  const { public: { uploadPreset } } = useRuntimeConfig();

  const emits = defineEmits(['onChange', 'onRemove']);

  const onUpload = (result: Result) => {
      emits('onChange', result.info.secure_url);
      console.log('Check result output: ',result)
  }

  const deleteImage = async (url: string) => {
    try {
      const resourceName = getResourceName(url);
      await $fetch(`/api/admin/cloudinary/delete/${resourceName}`, {
        method: 'DELETE'
      });
      emits('onRemove', url);
    } catch (error: any) {
      console.error('Error deleting image:', error);
    }
  }

</script>

<template>
  <CldImage
    src="cld-sample-5"
    width="987"
    height="987"
    alt="My Awesome Image"
  />

  <CldUploadWidget v-slot="{ open }" uploadPreset="nuxt-cloudinary-unsigned">
    <button type="button" @click="open">Upload an Image</button>
  </CldUploadWidget>
</template>