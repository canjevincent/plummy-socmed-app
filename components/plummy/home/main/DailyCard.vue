<script lang="ts" setup>
</script>

<template>
  <section class="flex justify-between h-full gap-x-2">

      <div class="group" v-for="x in 5" :key="x">
        <div class="relative flex items-center justify-center w-auto h-full border-2 rounded-md shadow-sm bg-muted/50 group-hover:shadow-md group-hover:border-purple-500">
          
          <div class="absolute w-10 h-10 border-2 border-white rounded-full shadow-sm top-2 left-2 group-hover:ring-2 group-hover:ring-purple-500">
            <NuxtImg 
              src="https://avatars.githubusercontent.com/u/41053951" 
              alt="Sarah Johnson" 
              class="object-cover w-full h-full rounded-full"
            />
          </div>

          <NuxtImg src="https://avatars.githubusercontent.com/u/41053952" alt="Sarah Johnson" class="w-full h-full rounded-md" />
        </div>
      </div>
      
  </section>
</template>