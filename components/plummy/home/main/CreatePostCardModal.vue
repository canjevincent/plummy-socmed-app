<script lang="ts" setup>

  const props = defineProps<{
    isModalVisible: boolean
  }>();

  const emit = defineEmits<{
    (e: 'onClose'): void
  }>();

  const isOpen = computed({
    get: () => props.isModalVisible,
    set: () => {
      emit('onClose');
    }
  });

  // Dynamic import of QuillEditor to avoid SSR issues when using quill on a modal component
  const { QuillEditor } = process.client ? await import('@vueup/vue-quill') : { QuillEditor: null };

  const options = ref({
    modules: {
      toolbar: false
    },
    placeholder: 'Compose here...',
    readOnly: false,
  })

</script>

<template>
  <Dialog :open="isOpen" @update:open="emit('onClose')">
    <DialogContent>

      <DialogHeader class="pb-5 border-b">
        <DialogTitle>Post A Story</DialogTitle>
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

        <div class="flex flex-col">
            <QuillEditor :options="options" />
        </div>

      </div>

      <DialogFooter >
        
        <div class="flex justify-end h-full gap-x-2">

          <div class="flex p-2 border-2 rounded-lg justify-evenly min-w-40">
            <Button variant="outline" size="icon">
              <Icon name="lucide:smile" class="w-4 h-4 group-hover:text-purple-500" />
            </Button>
            
            <Button variant="outline" size="icon">
              <Icon name="lucide:image-play" class="w-4 h-4 group-hover:text-purple-500" />
            </Button>
            
            <Button variant="outline" size="icon" class="text-sm font-semibold">
              GIF
            </Button>
          </div>

          <Button variant="outline" class="flex h-full font-semibold text-gray-500 border-2">
            Share
          </Button>
          
        </div>
        
      </DialogFooter>

    </DialogContent>
  </Dialog>
</template>

<style>
  .ql-container {
    @apply rounded-lg min-h-[120px];
    border:2px solid #e5e7eb !important;
  }
</style>