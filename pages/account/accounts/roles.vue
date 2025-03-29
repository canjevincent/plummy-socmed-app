<script lang="ts" setup>
  definePageMeta({
    layout: "account"
  });
</script>

<template>
  <div class="flex flex-col flex-1 gap-4 p-4 pt-0">
      <AccountHeader
        title="Roles Overview"
        description="Authority, accountability, and collaboration, ensuring smooth workflows and effective goal achievement."
      />
      <AccountAccountsRolesClient/>
  </div>
</template>