<script lang="ts" setup>

  const isCreatePostVisible = ref(false);
  
  const openCreatePostModal = () => {
    isCreatePostVisible.value = true;
  };

  const closeCreatePostModal = () => {
    isCreatePostVisible.value = false;
  };

</script>

<template>
  <section class="group">
    <div class="flex bg-muted/50 border-[1px] p-3 rounded-sm gap-x-2 justify-center items-center shadow-sm group-hover:shadow-md group-hover:border-purple-500">
      <div class="flex-shrink-0 w-10 h-10 border-2 border-white rounded-full group-hover:ring-2 group-hover:ring-purple-500">
        <NuxtImg src="https://avatars.githubusercontent.com/u/41053951" alt="Sarah Johnson" class="w-full h-full rounded-full" /> 
      </div>
      <Button variant="outline" class="text-gray-500 border-2 rounded-full grow group-hover:border-purple-300 disabled:cursor-pointer group-hover:text-black group-hover:font-semibold" @click="openCreatePostModal"> 
        What's on your mind, Vincent ?
      </Button>
    </div>
  </section>

  <PlummyHomeMainCreatePostCardModal :is-modal-visible="isCreatePostVisible" @on-close="closeCreatePostModal" />
</template>