<script setup lang="ts">
  import { columns } from './column'
  import DataTable from './DataTable.vue'
  import type { User } from '@prisma/client'

  const data = ref<User[]>([])

  const { mutate, isPending, error } = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/account/accounts/users')
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      return response.json()
    },
    onSuccess: (users: User[]) => {
      data.value = users
    },
    onError: (error) => {
      console.error('Error fetching users:', error)
    }
  })

  // Fetch data when component mounts
  onMounted(() => {
    mutate();
  });

</script>

<template>
  <section class="container p-4 mt-5 bg-white rounded-md border border-gray-100 shadow-sm">
    <DataTable :columns="columns" :data="data" />
  </section>
</template>