<script setup lang="ts">
  definePageMeta({
    layout: "account"
  });  
</script>
<template>
  <div class="flex flex-col flex-1 gap-4 p-4 pt-0">
    <div class="grid auto-rows-min gap-4 md:grid-cols-3">
      <div class="rounded-xl aspect-video bg-muted/50" />
      <div class="rounded-xl aspect-video bg-muted/50" />
      <div class="rounded-xl aspect-video bg-muted/50" />
    </div>
    <div class="min-h-[100vh] flex-col rounded-xl bg-muted/50 md:min-h-min justify-center items-center flex gap-3 py-4">
      
      <AccountProfileHeader/>
      
      <AccountProfileSettingsForm/>

    </div>
  </div>
</template>