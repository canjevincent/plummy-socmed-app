<script setup lang="ts">
  import { columns } from './columns'
  import DataTable from './DataTable.vue'
  import { useUsersTable } from '@/composables/useUsersTable'
  import type { User } from '@prisma/client'

  interface UserTable {
    id: string;
    firstName: string | null;
    middleName: string | null;
    lastName: string | null;
    roleId: string;
    email: string;
    createdAt: Date;
    role: {
      title: string;
    };
  }

  const {
    page,
    pageSize,
    sortBy,
    sortOrder,
    filters,
    globalSearch,
    tableData,
    isLoading,
    refresh,
    setGlobalSearch,
    resetPagination 
  } = useUsersTable()

  // Props for create modal
  const props = defineProps<{
    isCreateModalVisible: boolean
  }>();

  // Emits for create modal
  const emit = defineEmits(['onCloseCreateModal']);

  // Handle newly created user
  const handleCreateUser = async (createdUser: UserTable) => {
    // Refresh the table data to include the new user
    await refresh()

    // Set the global search to the new user's email to filter the table
    if (createdUser && createdUser.email) {
      // Reset to first page and set search to the new user's email
      resetPagination()
      setGlobalSearch(createdUser.email)
    }
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
  const handleUpdateUser = async (updatedUser: typeof selectedUpdateUser.value) => {
    if (updatedUser) {
      // Refresh the table data to reflect the update
      await refresh()

      // Optionally set the global search to show the updated user
      resetPagination()
      setGlobalSearch(updatedUser.email)
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
  const handleDeleteUser = async (deletedUser: typeof selectedDeleteUser.value) => {
    if (deletedUser) {
      // Refresh the table data to remove the deleted user
      await refresh()
    }
  }

</script>

<template>
  <section class="container p-4 mt-5 bg-white border border-gray-100 rounded-md shadow-sm">
    <DataTable 
      :columns="columns" 
      :data="tableData?.data || []"
      :total-count="tableData?.totalCount || 0"
      :page="page"
      :page-size="pageSize"
      :sort-by="sortBy"
      :sort-order="sortOrder"
      :filters="filters"
      :global-search="globalSearch"
      :loading="isLoading"
      @update:page="(newPage) => page = newPage"
      @update:page-size="(newSize) => pageSize = newSize"
      @update:sort="(newSort) => { sortBy = newSort.sortBy; sortOrder = newSort.sortOrder }"
      @update:filters="(newFilters) => filters = newFilters"
      @update:global-search="(search) => globalSearch = search"
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