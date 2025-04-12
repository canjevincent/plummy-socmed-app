<script lang="ts" setup>

  import draggable from 'vuedraggable';
  import type { User } from '@prisma/client';
  import { useToast } from '~/components/ui/toast';

  interface Props {
    roleId: string
  }

  type RoleWithUsers = {
    id: string;
    title: string;
    users: User[];
  };

  const { toast } = useToast();
  const props = defineProps<Props>()

  const { data, isLoading, error } = useQuery<RoleWithUsers, Error>({ 
    queryKey: [`permissionusers-display-${props.roleId}`],
    queryFn: async () => {
      const roles = await $fetch<RoleWithUsers>(`/api/account/accounts/permissions/roles/${props.roleId}`);
      return roles;
    }
  });

  // use client side rendering to change the position of roles
  const newUserList = ref<User[]>([])

  // Update local roles when props change
  watch(() => data?.value?.users, (usersListOrder) => {
    if (usersListOrder) newUserList.value = [...usersListOrder]
  }, { immediate: true })

  // Order user on the same role
  const { mutate: updateDragUser, isPending: isDragVerticalUpdating } = useMutation({
    mutationFn: async (payload: [] ) => {
      return await $fetch(`/api/account/accounts/permissions/roles/${props.roleId}`, {
        method: 'PATCH',
        body: payload,
      })
    },
    onSuccess: async (updatedUser) => {

      console.log("Check new user order: ",updatedUser)
      
      toast({
        // variant: 'destructive',
        title: 'Permission Update',
        description: 'Permission has been updated successfully.',
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
        // variant: 'destructive',
        title: 'Role Update',
        description: 'Role has been updated successfully.',
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

    updateDragUser(newUserList.value.flatMap((item) => item.id) as [])

  }

</script>

<template>

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
      <div class="flex items-center justify-start p-2 text-sm bg-white border rounded-lg dark:bg-gray-800 dark:border-gray-700">
        <Icon name="lucide:grip-vertical" class="w-5 h-8 handle-user-permission cursor-grab" />

        <img :src="element.avatarUrl" alt="Sarah Johnson" class="w-8 h-8 mr-2 rounded-sm">
        
        <div class="flex flex-col">
         {{ element.firstName }} {{ element.lastName }}
         <small class="text-xs text-gray-500">{{ element.email }}</small>
        </div>
      </div>
    </template>

  </draggable>
  
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