<script lang="ts" setup>

  interface MemberDailyResponse {
    id: string;
    dailyUrl: string | null;
    user: {
      firstName: string | null;
      lastName: string | null;
      avatarUrl: string | null;
    };
  }

  const props = defineProps<{
    isModalVisible: boolean,
    dailyMemberContent: MemberDailyResponse | null
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

</script>

<template>
  <Dialog :open="isOpen" @update:open="emit('onClose')">
    <DialogContent class="max-h-[100vh] max-w-[100rem] h-[50rem] w-[30rem] rounded-md">
      <div class="relative rounded-md"
           :style="{ 
             backgroundImage: `url(${dailyMemberContent?.dailyUrl})`,
             backgroundSize: 'cover',
             backgroundPosition: 'center',
             backgroundRepeat: 'no-repeat'
           }">
          
          <div class="absolute flex justify-center space-x-3 top-4 left-4">
            <div class="border-2 border-white rounded-full shadow-sm w-7 h-7 top-2 left-2 ring-2 ring-purple-500">
              <NuxtImg :src="dailyMemberContent?.user?.avatarUrl || 'https://avatars.githubusercontent.com/u/41053951'" alt="Plummy App Daily" class="w-full h-full rounded-md" />
            </div>
            <p class="font-semibold text-white text-small">
              {{ dailyMemberContent?.user?.firstName }} {{ dailyMemberContent?.user?.lastName }}
            </p>
          </div>

      </div>
    </DialogContent>
  </Dialog>
</template>