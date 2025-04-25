<script lang="ts" setup>
  import type { Role } from '@prisma/client'
  import DraggableRoleList from './DraggableRoleList.vue';
  import RolePermissionList from './RolePermissionList.vue';

  const { data, isLoading, error } = useQuery<Role[], Error>({ 
    queryKey: ['permission-roles-display'],
    queryFn: async () => {
      const roles = await $fetch<Role[]>('/api/account/accounts/permissions');
      return roles;
    }
  });

  const rolePermission = ref<string>('');
  const displayPermission = ref<boolean>(false);

  const handleDisplayPermission = (roleIdPermission:string) => {
    rolePermission.value = roleIdPermission;
    displayPermission.value = true;
  }

  const handleClosePermission = (closePermission:boolean) => {
    rolePermission.value = "";
    displayPermission.value = closePermission;
  }

</script>

<template>
  <section class="container p-4 mt-5 bg-white border border-gray-100 rounded-md shadow-sm">
    
    <ResizablePanelGroup direction="horizontal">
      
      <ResizablePanel :min-size="20">
        <DraggableRoleList 
          :activePermission="rolePermission || ''" 
          :roleList="data || []" 
          @on-display-permission="handleDisplayPermission" 
          :isLoading="isLoading || false" 
        />
      </ResizablePanel>

      <ResizableHandle with-handle v-show="displayPermission" />

      <ResizablePanel v-show="displayPermission" :min-size="31">
        <RolePermissionList 
          :roleId="rolePermission" 
          @on-close="handleClosePermission" 
        />
      </ResizablePanel>

    </ResizablePanelGroup>

  </section>
</template>