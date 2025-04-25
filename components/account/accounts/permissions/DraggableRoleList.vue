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
   roleList: Role[],
   activePermission: string,
   isLoading: boolean
  }
  
  const { toast } = useToast();
  const props = defineProps<Props>()

  const displaySearch = ref<boolean>(false);
  const selectedDisplaySearch = ref<string>("");
  
  // Emits for showing permission
  const emit = defineEmits<{
    (e: 'onDisplayPermission', id: string): void
  }>();

  // use client side rendering to change the position of roles
  const newRoleList = ref<Role[]>([])
  
  // Update local roles when props change
  watch(() => props.roleList, (newRoles) => {
    if (newRoles) newRoleList.value = [...newRoles]
  }, { immediate: true })

  const { mutate: updatePermission, isPending: isDragLoading } = useMutation({
    mutationFn: async (payload: [] ) => {
      return await $fetch(`/api/account/accounts/permissions`, {
        method: 'PATCH',
        body: payload,
      })
    },
    onSuccess: async (updatedUser) => {
      
      toast({
        title: 'Role Update',
        description: 'Role has been switched position successfully.',
      });
      
    },
    onError: (error: any) => {

      // Handle validation errors
      console.error('Role Drag error:', error);
    }
  });

  const handleSort = async (e: any) => {

    updatePermission(newRoleList.value.flatMap(item => item.id) as [])
    
  }

  const handleDisplaySearch = (display: boolean, roleId: string) => {
    displaySearch.value = display;
    selectedDisplaySearch.value = roleId;
  }

</script>

<template>
  <draggable 
    v-show="isLoading === false"
    :list="newRoleList" 
    class="flex flex-wrap gap-4" 
    handle=".handle-role-permission" 
    item-key="id"
    ghost-class="ghost-drag-role"
    drag-class="dragging-role"
    @sort="handleSort"
  >
    
    <template #item="{element}">

        <div class="flex flex-col flex-none transition-all duration-300 delay-100 border rounded-lg shadow h-96 bg-purple-50 w-72 hover:border-purple-600">
          
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
                <DropdownMenuItem @click="handleDisplaySearch(true,element.id)" class="text-sm font-medium leading-none">
                  <Icon name="lucide:search" class="w-3 h-3" /> Search
                </DropdownMenuItem>
                <DropdownMenuItem class="text-sm font-medium leading-none">
                  <Icon name="lucide:square-pen" class="w-3 h-3" /> Update
                </DropdownMenuItem>
                <DropdownMenuItem class="text-sm font-medium leading-none">
                  <Icon name="lucide:trash" class="w-3 h-3" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

          </div>

          <!-- Body -->
          <div class="flex-1 p-2 overflow-y-scroll list-body">
            <DraggableUserList 
              :roleId="element.id" 
              :displaySearch="displaySearch"
              :selectedDisplaySearch="selectedDisplaySearch"
              @on-close-search="handleDisplaySearch"
            />
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-between p-2 border-t">            
            <small class="text-sm font-medium leading-none">
              Permissions
            </small>

            <Icon 
              name="lucide:circle-arrow-left" 
              :class="{'w-4 h-4 cursor-pointer transition-transform duration-300' : element.id !== activePermission,
                       'w-4 h-4 cursor-pointer rotate-180 transition-transform duration-300 text-purple-600' : element.id === activePermission
                      }" 
              @click="emit('onDisplayPermission', element.id)" 
            />
          </div>

        </div>

    </template>

  </draggable>

  <!-- Loading -->

  <div class="flex flex-wrap gap-4" v-show="isLoading">
    <div class="flex flex-col flex-none transition-all duration-300 delay-100 border rounded-lg shadow h-96 bg-purple-50 w-72 hover:border-purple-600" v-for="x in 5" :key="x">
            
      <!-- Header -->
      <div class="flex items-center p-2 border-b animate-pulse">

        <div class="w-4 h-4 mr-1 bg-gray-200 rounded-md"></div>
        <div class="w-8 h-4 mr-auto bg-gray-200 rounded-md"></div>

        <div class="w-4 h-4 bg-gray-200 rounded-full"></div>

      </div>

      <!-- Body -->
      <div class="flex-1 p-2 overflow-y-scroll list-body animate-pulse">
        <div class="flex flex-col transition-all duration-300 delay-100 bg-white border rounded-lg group dark:bg-gray-800 dark:border-gray-700 hover:border-purple-600 hover:bg-purple-100" v-for="i in 4" :key="i">
          
          <div class="flex items-center justify-start p-2 text-sm">
            <div class="w-3 h-8 mr-1 bg-gray-200 rounded-sm"></div>
            <div class="w-8 h-8 mr-2 bg-gray-200 rounded-sm"></div>
            
            <div class="flex flex-col space-y-1">
              <div class="w-8 h-4 bg-gray-200 rounded-sm"></div>
              <div class="w-16 h-3 bg-gray-200 rounded-sm"></div>
            </div>
          </div>
          
        </div>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-between p-2 border-t animate-pulse">            
        <div class="w-16 h-4 bg-gray-200 rounded-md"></div>

        <div class="w-4 h-4 bg-gray-200 rounded-full"></div>
      </div>

    </div>
  </div>
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
