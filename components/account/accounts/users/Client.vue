<script setup lang="ts">
  import { columns } from './columns'
  import DataTable from './DataTable.vue'
  import type { User } from '@prisma/client'

  // Props for create modal
  const props = defineProps<{
    isCreateModalVisible: boolean
  }>();

  // Emits for create modal
  const emit = defineEmits(['onCloseCreateModal']);

  // Handle newly created user
  const handleCreateUser = (createdUser: User) => {
    // Add the new user to the beginning of the data array
    data.value = [createdUser, ...data.value]
  }

  //  Selected update modal types
  const selectedUpdateUser = ref<{
    id: string
    firstName: string
    middleName: string
    lastName: string
    email: string
  } | null>(null);

  // Open update modal boolean
  const isUpdateModalVisible = ref(false);

  // Open update modal
  const openUpdateModal = (user: typeof selectedUpdateUser.value) => {
    selectedUpdateUser.value = user
    isUpdateModalVisible.value = true
  }

  // Close update modal
  const closeUpdateModal = () => {
    isUpdateModalVisible.value = false
  }

  // Handle user update
  const handleUpdateUser = (updatedUser: typeof selectedUpdateUser.value) => {
    if (updatedUser) {
      // Find the index of the user based on the id
      const index = data.value.findIndex(user => user.id === updatedUser.id)
      if (index !== -1) {
        // Update the user data object, replace with the new update on user
        const newData = [...data.value];
        newData[index] = { ...newData[index], ...updatedUser };
        data.value = newData;
      }
    }
  }
  
  // Selected delete modal types
  const selectedDeleteUser = ref<{
    id : string
    firstName: string
    middleName: string
    lastName: string
  } | null>(null);  

  // Open delete modal boolean
  const isDeleteModalVisible = ref(false);

  // Open Delete modal
  const openDeleteModal = (user: typeof selectedDeleteUser.value) => {
    selectedDeleteUser.value = user
    isDeleteModalVisible.value = true
  }

  // Close Delete modal
  const closeDeleteModal = () => {
    isDeleteModalVisible.value = false
  }

  // Handle user delete 
  const handleDeleteUser = (deletedUser: typeof selectedDeleteUser.value) => {
    if (deletedUser) {
      // Find the index of the user based on the id
      const index = data.value.findIndex(user => user.id === deletedUser.id)
      if (index !== -1) {
        // Remove the user data object with the index of 'index'
        const newData = [...data.value];
        newData.splice(index, 1);  // Remove 1 element at the found index
        data.value = newData;
      }
    }
  }

  // Data Table Query
  const { data: queryData, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await fetch('/api/account/accounts/users');
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    }
  });

  const data = ref<User[]>([]);
  watch(() => queryData.value, (newVal) => {
    if (newVal) data.value = newVal;
  }, { immediate: true });
  
</script>

<template>
  
  <section class="container p-4 mt-5 bg-white rounded-md border border-gray-100 shadow-sm">
    <DataTable 
      :columns="columns" 
      :data="data"
      :searchable-columns="[
        { accessorKey: 'email', displayName: 'Email' },
        { accessorKey: 'firstName', displayName: 'First Name' },
        { accessorKey: 'lastName', displayName: 'Last Name' }
      ]"
      @update-user="openUpdateModal"  
      @delete-user="openDeleteModal"
    />
  </section>

  <AccountAccountsUsersCreateModal
      title="Create User Account"
      description="Fill up new account information."
      v-if="props.isCreateModalVisible"
      :is-open="props.isCreateModalVisible"
      @on-close="emit('onCloseCreateModal')"
      @on-create="handleCreateUser"
  />
  
  <AccountAccountsUsersUpdateModal
      :key="selectedUpdateUser.id"
      title="Update User Account"
      description="Update include's changes to full name and email information."
      v-if="selectedUpdateUser"
      :is-open="isUpdateModalVisible"
      :user="selectedUpdateUser"  
      @on-close="closeUpdateModal"
      @on-update="handleUpdateUser"
   />
   
   <AccountAccountsUsersDeleteModal
      :key="selectedDeleteUser.id"
      v-if="selectedDeleteUser"
      :is-open="isDeleteModalVisible"
      :user="selectedDeleteUser"
      @on-close="closeDeleteModal"
      @on-delete="handleDeleteUser"
   />
   
</template>