<script lang="ts" setup>

  import draggable from 'vuedraggable';
  import type { User } from '@prisma/client';
  import { useToast } from '~/components/ui/toast';
  import { useDebounceFn } from '@vueuse/core';

  interface Props {
    roleId: string
    displaySearch: boolean
    selectedDisplaySearch: string
  }

  type RoleWithUsers = {
    id: string;
    title: string;
    users: User[];
  };

  // Add this after your useInfiniteQuery declaration
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const props = defineProps<Props>();
  const PAGE_SIZE = 7;
  const containerRef = ref<HTMLElement | null>(null);

  // Add search state
  const searchQuery = ref('');

  // Add a watch on the displaySearch and selectedDisplaySearch props
  watch(
    [() => props.displaySearch, () => props.selectedDisplaySearch],
    ([newDisplaySearch, newSelectedDisplaySearch], [oldDisplaySearch, oldSelectedDisplaySearch]) => {
      // Clear search query when search is closed or when a different role is selected
      if ((!newDisplaySearch && oldDisplaySearch) || (newSelectedDisplaySearch !== props.roleId && oldSelectedDisplaySearch === props.roleId)) {
        searchQuery.value = '';
      }
    }
  );

  // Use infinite query instead of regular query
  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch
  } = useInfiniteQuery({
    queryKey: [`permissionusers-display-${props.roleId}`],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await $fetch<RoleWithUsers>(
        `/api/account/accounts/permissions/roles/${props.roleId}`,
        { query: { 
            skip: pageParam, 
            take: PAGE_SIZE,  
            search: searchQuery.value 
          } 
        }
      );
      return response;
    },
    getNextPageParam: (lastPage, allPages) => {
      // If we received fewer users than PAGE_SIZE, there are no more to load
      if (!lastPage?.users || lastPage.users.length < PAGE_SIZE) return undefined;
      return allPages.length * PAGE_SIZE;
    },
    initialPageParam: 0
  });

  // Reset pagination when search changes
  watch(searchQuery, () => {
    queryClient.resetQueries({ 
      queryKey: [`permissionusers-display-${props.roleId}`, searchQuery] 
    });

    // Then explicitly trigger a refetch
    refetch();
  });

  // Debounce search input to avoid too many requests
  const debouncedSearch = useDebounceFn((value: string) => {
    searchQuery.value = value;
  }, 100);

  // Combine all users from all pages
  const allUsers = computed(() => {
    if (!infiniteData.value?.pages) return [];
    return infiniteData.value.pages.flatMap(page => page?.users || []);
  });

  // use client side rendering to change the position of roles
  const newUserList = ref<User[]>([])

  // Update local roles when props change
  watch(() => allUsers.value, (users) => {

      if (users) newUserList.value = [...users];
      
  }, { immediate: true });

  // Set up intersection observer for infinite scrolling
  onMounted(() => {
    if (process.client) {
      const observer = new IntersectionObserver(
        (entries) => {
          const [entry] = entries;
          if (entry.isIntersecting && hasNextPage.value && !isFetchingNextPage.value) {
            fetchNextPage();
          }
        },
        { threshold: 0.5 }
      );
      
      // Add a small delay to ensure the DOM is ready
      setTimeout(() => {
        if (containerRef.value) {
          observer.observe(containerRef.value);
        }
      }, 100);
      
      onBeforeUnmount(() => {
        if (containerRef.value) {
          observer.unobserve(containerRef.value);
        }
      });
    }
  });

  // Order user on the same role
  const { mutate: updateDragUser, isPending: isDragVerticalUpdating } = useMutation({
    mutationFn: async (payload: [] ) => {
      return await $fetch(`/api/account/accounts/permissions/roles/${props.roleId}`, {
        method: 'PATCH',
        body: payload,
      })
    },
    onSuccess: async (updatedUser) => {

      // Invalidate and refetch the query to ensure data consistency
      await queryClient.invalidateQueries({ 
        queryKey: [`permissionusers-display-${props.roleId}`] 
      });
      
      toast({
        // variant: 'destructive',
        title: 'User Role Update',
        description: 'User has been switched position successfully.',
      });
      
    },
    onError: (error: any) => {

      // Handle validation errors
      console.error('User drag vertical error:', error);
    }
  });

  // Update user id upong switching role
  const { mutate: updateUserRole, isPending: isUserRoleUpdating } = useMutation({
    mutationFn: async (payload: [] ) => {
      return await $fetch(`/api/account/accounts/users/userUpdateRole`, {
        method: 'PATCH',
        body: payload,
      })
    },
    onSuccess: async (updatedUser) => {
      
      toast({
        title: 'User Role Update',
        description: 'User has been switched role successfully.',
      });
      
    },
    onError: (error: any) => {

      // Handle validation errors
      console.error('User drag vertical error:', error);
    }
  });

  const handleUserChange = async (e: any) => {

    if (e.added) {
      const { element:user } = e.added;

      // Only update if roles are different
      if (user.roleId !== props.roleId) {
        const userPayload = {
          userId: user.id,
          newRoleId: props.roleId
        };
        
        updateUserRole(userPayload as any);
      }
    }
      
    updateDragUser(newUserList.value.flatMap(item => item.id) as [])
    // console.log('Check',newUserList.value.flatMap((item) => item.id))

  }

  const emit = defineEmits<{
    (e: 'onCloseSearch', close: boolean, id: string): void
  }>();
  
  const handleCloseSearch = () => {
    emit('onCloseSearch', false, props.roleId)
    searchQuery.value = '';
  }

</script>

<template>

  <div v-if="displaySearch && selectedDisplaySearch === props.roleId" class="relative sticky top-0 z-10 flex bg-white hover:mb-1">
    <Input 
      type="text" 
      placeholder="Search User" 
      class="transition-all duration-300 delay-100 hover:border-purple-600"
      @input="(e: Event) => debouncedSearch((e.target as HTMLInputElement).value)"
    />
    <span class="absolute inset-y-0 flex items-center justify-center px-2 end-0">
      <Icon 
        name="lucide:x" 
        class="w-4 h-4 cursor-pointer" 
        @click="handleCloseSearch"  
      />
    </span>
  </div>

  <draggable
    :list="newUserList"
    handle=".handle-user-permission" 
    group="user"
    item-key="id"
    ghost-class="ghost-drag-user"
    drag-class="dragging-user"
    @change="handleUserChange"
  >
    
    <template #item="{ element }">
      <div class="flex flex-col transition-all duration-300 delay-100 bg-white border rounded-lg group dark:bg-gray-800 dark:border-gray-700 hover:border-purple-600 hover:bg-purple-100">
        
        <div class="flex items-center justify-start p-2 text-sm">
          <Icon name="lucide:grip-vertical" class="w-5 h-8 handle-user-permission cursor-grab" />

          <NuxtImg :src="element.avatarUrl" alt="Sarah Johnson" class="w-8 h-8 mr-2 rounded-sm" />
          
          <div class="flex flex-col">
            {{ element.firstName }} {{ element.lastName }}
            <small class="text-xs text-gray-500">{{ element.email }}</small>
          </div>
        </div>
        
        <div class="hidden group-hover:flex items-start py-1 pl-3 space-x-2 border-t-[1px]">
          <small class="text-sm font-medium leading-none cursor-pointer">
            <Icon name="lucide:square-pen" class="w-3 h-3" /> Update
          </small>
          <small class="text-sm font-medium leading-none cursor-pointer">
            <Icon name="lucide:trash" class="w-3 h-3" /> Delete
          </small>
        </div>

      </div>
    </template>

  </draggable>

  <!-- Loading indicator and intersection observer target -->
  <div ref="containerRef" class="py-2 text-center">
    <div v-if="isFetchingNextPage" class="flex items-center justify-center text-sm text-gray-500">
      Loading more users 
      <svg xmlns="http://www.w3.org/2000/svg" width="1rem" height="1rem" viewBox="0 0 24 24" disabled class="ml-2">
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
    </div>
    <div v-else-if="!hasNextPage && newUserList.length > 0" class="flex items-center justify-center text-sm text-gray-500">
      No more users to load <Icon name="lucide:triangle-alert" class="w-4 h-4 ml-2 handle-role-permission cursor-grab" />
    </div>
  </div>
  
</template>

<style>
  /* .ghost-drag-user > div {
    @apply bg-purple-100;
  } */
  .ghost-drag-user>div>div {
    @apply invisible;
  }
  .dragging-user > div {
    @apply shadow-2xl transform rotate-2 cursor-grabbing;
  }
  /* .sortable-chosen {
    opacity: 1 !important;
  } */
</style>