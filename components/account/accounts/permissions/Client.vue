<script lang="ts" setup>
  import type { Role } from '@prisma/client'
  import DraggableRoleList from './DraggableRoleList.vue';

  const { data, isLoading, error } = useQuery<Role[], Error>({ 
    queryKey: ['permission-roles-display'],
    queryFn: async () => {
      const roles = await $fetch<Role[]>('/api/account/accounts/permissions');
      return roles;
    }
  });

</script>

<template>
  <section class="container p-4 mt-5 bg-white border border-gray-100 rounded-md shadow-sm">
    
    <DraggableRoleList :roleList="data || []" />

  </section>
</template>