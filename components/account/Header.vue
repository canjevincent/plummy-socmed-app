<script setup lang="ts">
  const props = defineProps<{
      title: string
      description: string
  }>();
</script>
<template>
  <section>
    <h2 class="text-base font-bold tracking-tighter sm:text-lg md:text-xl"> {{ title }} </h2>
    <p class="max-w-3xl text-muted-foreground md:text-sm"> {{ description }} </p>
  </section>
</template>