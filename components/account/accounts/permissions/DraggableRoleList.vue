<script lang="ts" setup>

  import draggable from 'vuedraggable';
  import type { Role } from '@prisma/client'
  import { useToast } from '~/components/ui/toast';
  import DraggableUserList from './DraggableUserList.vue';

  import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from '@/components/ui/dropdown-menu'

  interface Props {
   roleList: Role[]
  }

  const { toast } = useToast();
  const props = defineProps<Props>()
  

  // use client side rendering to change the position of roles
  const newRoleList = ref<Role[]>([])
  
  // Update local roles when props change
  watch(() => props.roleList, (newRoles) => {
    if (newRoles) newRoleList.value = [...newRoles]
  }, { immediate: true })

  const { mutate: updatePermission, isPending: isUpdating } = useMutation({
    mutationFn: async (payload: [] ) => {
      return await $fetch(`/api/account/accounts/permissions`, {
        method: 'PATCH',
        body: payload,
      })
    },
    onSuccess: async (updatedUser) => {
      
      toast({
        // variant: 'destructive',
        title: 'Permission Update',
        description: 'Permission has been updated successfully.',
      });
      
    },
    onError: (error: any) => {

      // Handle validation errors
      console.error('Role Drag error:', error);
    }
  });

  const handleSort = async (e: any) => {

    updatePermission(newRoleList.value.flatMap(item => item.id) as [])

    // console.log('Check sort: ',newRoleList.value.flatMap(item => item.id))
    // console.log('Check sort: ',newRoleList.value.map(item => item.id) as [])
  }

</script>

<template>
  <draggable 
    :list="newRoleList" 
    class="flex gap-4 h-[30vh]" 
    handle=".handle-role-permission" 
    item-key="id"
    ghost-class="ghost-drag-role"
    drag-class="dragging-role"
    @sort="handleSort"
  >
    
    <template #item="{element}">
      <div class="flex">

        <div class="flex flex-col flex-none rounded-lg shadow bg-purple-50 w-72">
          
          <!-- Header -->
          <div class="flex items-center p-2 border-b">

            <Icon name="lucide:grip-vertical" class="w-4 h-4 handle-role-permission cursor-grab" />
            
            <small class="mr-auto text-sm font-medium leading-none">
              {{ element.title }} 
            </small>

            <DropdownMenu>
              <DropdownMenuTrigger>
                <Icon name="lucide:settings" class="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <Icon name="lucide:square-pen" class="w-4 h-4" /> Update
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Icon name="lucide:trash" class="w-4 h-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

          </div>

          <!-- Body -->
          <div class="flex-1 p-2 overflow-y-hidden list-body">
            <DraggableUserList :roleId="element.id" />
          </div>

          <!-- Footer -->
          <div class="flex items-center p-2 border-t">            
            <small class="text-sm font-medium leading-none">
              Permissions
            </small>
          </div>

        </div>

      </div>
    </template>

  </draggable>
</template>

<style>
  .ghost-drag-role > div {
    @apply bg-purple-100;
  }
  .ghost-drag-role>div>div {
    @apply invisible;
  }
  .dragging-role > div {
    @apply shadow-2xl transform rotate-2 cursor-grabbing;
  }
  /* .sortable-chosen {
    opacity: 1 !important;
  } */
</style>
