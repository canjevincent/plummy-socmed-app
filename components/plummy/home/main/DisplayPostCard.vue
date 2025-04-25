<script lang="ts" setup>
</script>

<template>
  <section class="flex flex-col gap-y-2">

    <div class="group" v-for="x in 5" :key="x">
    
      <div class="flex flex-col px-3 pt-3 pb-0 border-[1px] group-hover:shadow-md group-hover:border-purple-500 rounded-sm shadow-sm gap-y-2 bg-muted/50">

        <div class="flex justify-between">
          <div class="flex gap-x-2">
            <div class="w-10 h-10 border-2 border-white rounded-full cursor-pointer group-hover:ring-2 group-hover:ring-purple-500"> 
              <NuxtImg 
                src="https://avatars.githubusercontent.com/u/41053951" 
                class="object-cover w-full h-full rounded-full" 
              />
            </div>

            <div class="flex flex-col gap-y-1">
              <small class="text-sm font-medium leading-none">
                Vincent M. Canje
              </small>
              <p class="text-sm text-muted-foreground">
                1h ago. <Icon name="lucide:crown" class="w-4 h-4 group-hover:text-purple-500" />
              </p>
            </div>
          </div>

          <div class="flex items-center gap-x-2">
            <div class="flex items-center justify-center p-1 rounded-full cursor-pointer w-7 h-7 aspect-square hover:bg-purple-200 hover:border hover:border-purple-300">
              <Icon name="lucide:ellipsis" class="w-6 h-6" />
            </div>
            <div class="flex items-center justify-center p-1 rounded-full cursor-pointer w-7 h-7 aspect-square hover:bg-purple-200 hover:border hover:border-purple-300">
              <Icon name="lucide:x" class="w-6 h-6" />
            </div>
          </div>
        </div>

        <div class="flex">
          <p class="text-sm">So I started to walk into the water. I won't lie to you boys, I was terrified. But I pressed on, and as I made my way past the breakers a strange calm came over me. I don't know if it was divine intervention or the kinship of all living things but I tell you Jerry at that moment, I was a marine biologist.</p>      
        </div>
        
        <div class="flex flex-wrap gap-1">
          <div class="w-36" v-for="x in 5" :key="x">
            <NuxtImg src="https://avatars.githubusercontent.com/u/41053952" alt="Sarah Johnson" class="w-full h-full rounded-md" />
          </div>
        </div>

        <div class="flex justify-around border-t-2">
          
          <div class="flex items-center justify-center w-full p-2 rounded-sm cursor-pointer hover:bg-purple-300 gap-x-1">
            <Icon name="lucide:thumbs-up" class="w-4 h-4" /> 
            <small class="text-sm font-semibold leading-none">
              Like
            </small>
          </div>

          <div class="flex items-center justify-center w-full p-2 rounded-sm cursor-pointer hover:bg-purple-300 gap-x-1">
            <Icon name="lucide:message-square" class="w-4 h-4" /> 
            <small class="text-sm font-semibold leading-none">
              Comment
            </small>
          </div>

        </div>

      </div>

    </div>
    
  </section>
</template>