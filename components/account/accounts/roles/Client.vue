<script setup lang="ts">
  import { columns } from './columns'
  import DataTable from './DataTable.vue'
  import type { Role } from '@prisma/client'

  interface RoleTable {
    id: string;
    title: string;
    createdAt: Date;
    createdBy: {
      firstName: string | null;
      middleName: string | null;
      lastName: string | null;
    };
  }

  // Props for create modal
  const props = defineProps<{
    isCreateModalVisible: boolean
  }>();

  // Emits for create modal
  const emit = defineEmits(['onCloseCreateModal']);

  // Handle newly created role
  const handleCreateRole = (createdRole: RoleTable) => {
    // Add the new role to the beginning of the data array
    data.value = [createdRole, ...data.value]
  }

  //  Selected update modal types
  const selectedUpdateRole = ref<{
    id: string
    title: string
  } | null>(null);

  // Open update modal boolean
  const isUpdateModalVisible = ref(false);

  // Open update modal
  const openUpdateModal = (role: typeof selectedUpdateRole.value) => {
    selectedUpdateRole.value = role
    isUpdateModalVisible.value = true
  }

  // Close update modal
  const closeUpdateModal = () => {
    isUpdateModalVisible.value = false
  }

  // Handle role update
  const handleUpdateRole = (updatedRole: typeof selectedUpdateRole.value) => {
    if (updatedRole) {
      // Find the index of the role based on the id
      const index = data.value.findIndex(role => role.id === updatedRole.id)
      if (index !== -1) {
        // Update the role data object, replace with the new update on role
        const newData = [...data.value];
        newData[index] = { ...newData[index], ...updatedRole };
        data.value = newData;
      }
    }
  }
  
  // Selected delete modal types
  const selectedDeleteRole = ref<{
    id : string
    title: string
  } | null>(null);  

  // Open delete modal boolean
  const isDeleteModalVisible = ref(false);

  // Open Delete modal
  const openDeleteModal = (role: typeof selectedDeleteRole.value) => {
    selectedDeleteRole.value = role
    isDeleteModalVisible.value = true
  }

  // Close Delete modal
  const closeDeleteModal = () => {
    isDeleteModalVisible.value = false
  }

  // Handle role delete 
  const handleDeleteRole = (deletedRole: typeof selectedDeleteRole.value) => {
    if (deletedRole) {
      // Find the index of the role based on the id
      const index = data.value.findIndex(role => role.id === deletedRole.id)
      if (index !== -1) {
        // Remove the role data object with the index of 'index'
        const newData = [...data.value];
        newData.splice(index, 1);  // Remove 1 element at the found index
        data.value = newData;
      }
    }
  }

  // Data Table Query
  const { data: queryData, isLoading, error } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const response = await fetch('/api/account/accounts/roles');
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    }
  });

  const data = ref<RoleTable[]>([]);
  watch(() => queryData.value, (newVal) => {
    if (newVal) data.value = newVal;
  }, { immediate: true });
  
</script>

<template>
  
  <section class="container p-4 mt-5 bg-white border border-gray-100 rounded-md shadow-sm">
    <DataTable 
      :columns="columns" 
      :data="data"
      :searchable-columns="[
        { accessorKey: 'title', displayName: 'Title' },
        { id: 'createdBy', displayName: 'Created By' },
      ]"
      @update-role="openUpdateModal"  
      @delete-role="openDeleteModal"
    />
  </section>

  <AccountAccountsRolesCreateModal
    title="Create Role"
    description="Fill up new role information."
    v-if="props.isCreateModalVisible"
    :is-open="props.isCreateModalVisible"
    @on-close="emit('onCloseCreateModal')"
    @on-create="handleCreateRole"
  />
  
  <AccountAccountsRolesUpdateModal
    :key="selectedUpdateRole.id"
    title="Update Role"
    description="Update include's changes to role information."
    v-if="selectedUpdateRole"
    :is-open="isUpdateModalVisible"
    :role="selectedUpdateRole"  
    @on-close="closeUpdateModal"
    @on-update="handleUpdateRole"
  />
  
  <AccountAccountsRolesDeleteModal
    :key="selectedDeleteRole.id"
    v-if="selectedDeleteRole"
    :is-open="isDeleteModalVisible"
    :role="selectedDeleteRole"
    @on-close="closeDeleteModal"
    @on-delete="handleDeleteRole"
  />
   
</template>