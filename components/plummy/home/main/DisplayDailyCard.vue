<script lang="ts" setup>

  import { useUserFeaturedDaily, useMemberFeaturedDaily } from '~/composables/plummy/useDailyMyDay';

  interface MemberDailyResponse {
    id: string;
    dailyUrl: string | null;
    user: {
      firstName: string | null;
      lastName: string | null;
      avatarUrl: string | null;
    };
  }

  const selectedMemberDaily = ref<MemberDailyResponse | null>(null)
  const isCreateDailyVisible = ref(false);
  const isDisplayDailyMemberVisible = ref(false);
  const scrollContainer = ref<HTMLElement | null>(null);
  
  const openCreateDailyCardModal = () => {
    isCreateDailyVisible.value = true;
  };

  const closeCreateDailyCardModal = () => {
    isCreateDailyVisible.value = false;
  };

  const openDisplayDailyMemberCardModal = (content: any) => {
    const member = {
      id: content.id,
      dailyUrl:content.dailyUrl,
      user: {
        firstName:content.user.firstName,
        lastName:content.user.lastName,
        avatarUrl: content.avatarUrl,
      }
    }

    selectedMemberDaily.value = member;
    isDisplayDailyMemberVisible.value = true;
  };

  const closeDisplayDailyMemberCardModal = () => {
    isDisplayDailyMemberVisible.value = false;
  };

  const scrollLeft = () => {
    if (scrollContainer.value) {
      scrollContainer.value.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainer.value) {
      scrollContainer.value.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  const { 
    featuredDaily:userFeaturedDaily, 
    isLoading:userFeatureIsLoading, 
    error:userFeatureError, 
    refetch:userFeatureRefetch 
  } = useUserFeaturedDaily();

  const { 
    featuredDaily:memberFeaturedDaily, 
    isLoading:memberFeatureIsLoading, 
    error:memberFeatureError, 
    refetch:memberFeatureRefetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useMemberFeaturedDaily();

  // Handle infinite scroll
  const handleScroll = () => {
    if (!scrollContainer.value) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainer.value;
    const scrollPosition = scrollLeft + clientWidth;
    
    // If we're near the end and there's more to load
    if (scrollWidth - scrollPosition < 200 && hasNextPage.value && !isFetchingNextPage.value) {
      fetchNextPage();
    }
  };

  // Add scroll event listener
  onMounted(() => {
    if (scrollContainer.value) {
      scrollContainer.value.addEventListener('scroll', handleScroll);
    }
  });

  // Clean up scroll event listener
  onUnmounted(() => {
    if (scrollContainer.value) {
      scrollContainer.value.removeEventListener('scroll', handleScroll);
    }
  });

</script>

<template>
  <section class="relative w-full h-full rounded-md">

    <div class="absolute z-50 flex items-center justify-center w-10 h-10 p-3 bg-white rounded-full cursor-pointer left-10 top-20" @click="scrollLeft">
      <Icon name="lucide:chevron-left" class="w-4 h-4" />
    </div>
    <div class="absolute z-50 flex items-center justify-center w-10 h-10 p-3 bg-white rounded-full cursor-pointer right-10 top-20" @click="scrollRight">
      <Icon name="lucide:chevron-right" class="w-4 h-4" />
    </div>

    <div ref="scrollContainer" class="flex overflow-x-scroll rounded-md gap-x-1 max-h-52 scrollbar-hide">
      <div class="w-full h-48">
        <div class="relative flex items-center justify-center w-40 h-full border-2 rounded-md shadow-sm cursor-pointer bg-muted/50 hover:shadow-md hover:border-purple-500" @click="openCreateDailyCardModal">
          
          <div class="absolute border-2 border-white rounded-full shadow-sm w-7 h-7 top-2 left-2 ring-2 ring-purple-500">
            <NuxtImg 
              :src="userFeaturedDaily?.avatarUrl || 'https://avatars.githubusercontent.com/u/41053951'" 
              alt="Plummy App Daily" 
              class="object-cover w-full h-full rounded-full cursor-pointer"
            />
          </div>
          <NuxtImg :src="userFeaturedDaily?.dailyUrl || 'https://avatars.githubusercontent.com/u/41053951'" alt="Plummy App Daily" class="w-full h-full rounded-md" />
          <p class="absolute text-sm font-bold text-white bottom-5">
            My Daily
          </p>
          
        </div>
      </div>
      
      <div class="group" v-for="mfd in memberFeaturedDaily" :key="mfd?.id">
        <div class="relative flex items-center justify-center w-40 h-48 border-2 rounded-md shadow-sm cursor-pointer bg-muted/50 group-hover:shadow-md group-hover:border-purple-500" @click="openDisplayDailyMemberCardModal(mfd)">
          
          <div class="absolute border-2 border-white rounded-full shadow-sm w-7 h-7 top-2 left-2 ring-2 ring-purple-500">
            <NuxtImg 
              :src="mfd?.user?.avatarUrl || 'https://avatars.githubusercontent.com/u/41053951'" 
              alt="Plummy App Daily" 
              class="object-cover w-full h-full rounded-full"
            />
          </div>

          <NuxtImg :src="mfd?.dailyUrl || 'https://avatars.githubusercontent.com/u/41053951'" alt="Plummy App Daily" class="w-full h-full rounded-md" />
          <p class="absolute text-sm font-bold text-white bottom-5">
            {{ mfd?.user?.firstName }} {{ mfd?.user?.lastName }}
          </p>
        </div>
      </div>

      <!-- Loading indicator -->
      <div v-if="isFetchingNextPage" class="flex items-center justify-center w-40 h-48">
        <div class="w-8 h-8 border-4 border-purple-500 rounded-full border-t-transparent animate-spin"></div>
      </div>
    </div>

  </section>

  <PlummyHomeMainCreateDailyCardModal :is-modal-visible="isCreateDailyVisible" @on-close="closeCreateDailyCardModal" />
  <PlummyHomeMainDisplayDailyMemberModal :is-modal-visible="isDisplayDailyMemberVisible" :daily-member-content="selectedMemberDaily" @on-close="closeDisplayDailyMemberCardModal" />
</template>

<style scoped>
  .scrollbar-hide {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }

  .scrollbar-hide::-webkit-scrollbar {
    display: none;  /* Chrome, Safari and Opera */
  }
</style>