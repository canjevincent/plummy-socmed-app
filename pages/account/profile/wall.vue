<script setup lang="ts">
  definePageMeta({
    layout: "account"
  });
</script>
<template>
  <div class="flex flex-col flex-1 gap-4 p-4 pt-0">
    <div class="min-h-[100vh] flex-col rounded-xl bg-muted/50 md:min-h-min justify-center items-center flex gap-3 py-4">
      
      <AccountProfileHeader/>
      
      <AccountProfilePost/>

    </div>
  </div>
</template>