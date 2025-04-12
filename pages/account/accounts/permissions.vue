<script lang="ts" setup>
  definePageMeta({
    layout: "account"
  }) 
</script>

<template>
  <div class="flex flex-col flex-1 gap-4 p-4 pt-0">
    
    <div class="min-h-[100vh] flex-col rounded-xl bg-muted/50 md:min-h-min justify-center flex gap-3 p-4">
      <div class="flex items-center justify-between">
        <AccountHeader
          title="Permissions Overview"
          description="Grant or deny these permissions to protect privacy and security."
        />
      </div>
      <AccountAccountsPermissionsClient/>
    </div>

  </div>
</template>