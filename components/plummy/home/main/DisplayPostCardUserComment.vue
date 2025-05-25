<script setup lang="ts">

  import { useGetPostCommentsCount } from '~/composables/plummy/usePostComments';

  const props = defineProps<{
    postId: string | null
  }>();

  const postId = computed(() => props.postId || undefined)

  const {
    count,
    isLoading,
    error,
    refetch
  } = useGetPostCommentsCount(postId)

</script>

<template>

  <small class="space-x-1 text-sm font-semibold leading-none cursor-pointer hover:underline text-muted-foreground hover:underline-offset-2" v-if="!isLoading">
    {{ count }} comments
  </small>
  <small class="text-sm font-semibold leading-none text-muted-foreground" v-else>
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><!-- Icon from SVG Spinners by Utkarsh Verma - https://github.com/n3r4zzurr0/svg-spinners/blob/main/LICENSE -->
      <path fill="#888888" d="M12,23a9.63,9.63,0,0,1-8-9.5,9.51,9.51,0,0,1,6.79-9.1A1.66,1.66,0,0,0,12,2.81h0a1.67,1.67,0,0,0-1.94-1.64A11,11,0,0,0,12,23Z">
        <animateTransform attributeName="transform" dur="0.75s" repeatCount="indefinite" type="rotate" values="0 12 12;360 12 12"/>
      </path>
    </svg>
  </small>

</template>