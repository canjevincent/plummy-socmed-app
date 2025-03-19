<script setup lang="ts">
  import { GalleryVerticalEnd } from 'lucide-vue-next'
</script>
<template>
  <div class="flex flex-col gap-6 justify-center items-center p-6 min-h-svh bg-muted md:p-10">
    <div class="flex flex-col gap-6 justify-center items-center w-full max-w-sm">
      <a href="#" class="flex gap-2 items-center self-center font-medium">
        <div class="flex justify-center items-center w-6 h-6 rounded-md bg-primary text-primary-foreground">
          <GalleryVerticalEnd class="size-4" />
        </div>
        Plummy
      </a>
      <GuestRegisterForm />
    </div>
  </div>
</template>