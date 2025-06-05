<script lang="ts" setup>

  import { useUserFeaturedDaily, useMemberFeaturedDaily } from '~/composables/plummy/useDailyMyDay';

  const isCreateDailyVisible = ref(false);
  
  const openCreateDailyCardModal = () => {
    isCreateDailyVisible.value = true;
  };

  const closeCreatePostModal = () => {
    isCreateDailyVisible.value = false;
  };

  const { 
    featuredDaily:userFeaturedDaily, 
    isLoading:userFeatureIsLoading, 
    error:userFeatureError, 
    refetch:userFeatureRefetch 
  } = useUserFeaturedDaily();

  // const { 
  //   featuredDaily:memberFeaturedDaily, 
  //   isLoading:memberFeatureIsLoading, 
  //   error:memberFeatureError, 
  //   refetch:memberFeatureRefetch 
  // } = useMemberFeaturedDaily();

</script>

<template>
  <section class="flex justify-between h-full gap-x-2">

      <div class="group" @click="openCreateDailyCardModal">
        <div class="relative flex items-center justify-center w-40 h-full p-2 bg-purple-200 border-2 rounded-md shadow-sm cursor-pointer bg-muted/50 group-hover:shadow-md group-hover:border-purple-500">
          
          <div class="absolute w-10 h-10 border-2 border-white rounded-full shadow-sm top-2 left-2 group-hover:ring-2 group-hover:ring-purple-500">
            <NuxtImg 
              :src="userFeaturedDaily?.avatarUrl || 'https://avatars.githubusercontent.com/u/41053951'" 
              alt="Sarah Johnson" 
              class="object-cover w-full h-full rounded-full cursor-pointer"
            />
          </div>
          <NuxtImg :src="userFeaturedDaily?.dailyUrl || 'https://avatars.githubusercontent.com/u/41053951'" alt="Sarah Johnson" class="w-full h-full rounded-md" />
          <p class="absolute text-sm font-bold text-white bottom-8">
            My Daily
          </p>
        </div>
      </div>

      <div class="group" v-for="x in 4":key="x">
        <div class="relative flex items-center justify-center w-auto h-full border-2 rounded-md shadow-sm bg-muted/50 group-hover:shadow-md group-hover:border-purple-500">
          
          <div class="absolute w-10 h-10 border-2 border-white rounded-full shadow-sm top-2 left-2 group-hover:ring-2 group-hover:ring-purple-500">
            <NuxtImg 
              src="https://avatars.githubusercontent.com/u/41053951" 
              alt="Sarah Johnson" 
              class="object-cover w-full h-full rounded-full"
            />
          </div>

          <NuxtImg src="https://avatars.githubusercontent.com/u/41053952" alt="Sarah Johnson" class="w-full h-full rounded-md" />
        </div>
      </div>
      
  </section>


  <PlummyHomeMainCreateDailyCardModal :is-modal-visible="isCreateDailyVisible" @on-close="closeCreatePostModal" />
</template>