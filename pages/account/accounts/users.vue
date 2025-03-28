<script setup lang="ts">
  definePageMeta({
    layout: "account"
  });  

  // Add state for create modal visibility
  const isCreateModalVisible = ref(false);

  // Function to open create modal
  const openCreateModal = () => {
    isCreateModalVisible.value = true;
  };

  // Function to close create modal
  const closeCreateModal = () => {
    isCreateModalVisible.value = false;
  };
</script>

<template>
  <div class="flex flex-col flex-1 gap-4 p-4 pt-0">
    
    <div class="min-h-[100vh] flex-col rounded-xl bg-muted/50 md:min-h-min justify-center flex gap-3 p-4">
      <div class="flex justify-between items-center">
        <AccountHeader
          title="User Overview"
          description="A team of dedicated professionals bringing unique expertise to every project."
        />
        <Button @click="openCreateModal">
          New User
        </Button>
      </div>
      <AccountAccountsUsersClient
        :is-create-modal-visible="isCreateModalVisible"
        @on-close-create-modal="closeCreateModal"
      />
    </div>  

  </div>
</template>


