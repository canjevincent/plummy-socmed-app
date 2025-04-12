<script setup lang="ts">
  import type { Table } from '@tanstack/vue-table'
  import type { User } from '@prisma/client'

  import { roles } from './toolbar'
  import DataTableFacetedFilter from './DataTableFacetedFilter.vue'
  import DataTableViewOptions from './DataTableViewOptions.vue'

  interface DataTableToolbarProps {
    table: Table<User>
    globalSearch: string
  }

  const props = defineProps<DataTableToolbarProps>()
  const emit = defineEmits(['update:globalSearch', 'update:filters'])

  const isFiltered = computed(() => 
    props.table.getState().columnFilters.length > 0 || props.globalSearch
  )

  const searchInput = ref(props.globalSearch || '')

  watch(() => props.globalSearch, (newVal) => {
    searchInput.value = newVal
  }, { immediate: true })

  function handleSearchInput(e: Event) {
    const target = e.target as HTMLInputElement
    searchInput.value = target.value
    emit('update:globalSearch', target.value)

    // Reset page to 1 when search is applied
    props.table.setPageIndex(0)
  }

  function resetFilters() {
    // Reset all column filters
    props.table.resetColumnFilters()
    
    // Reset the global search input
    searchInput.value = ''
    emit('update:globalSearch', '')
    
    // Explicitly reset the filters in URL
    emit('update:filters', {})
  }
</script>

<template>
  <div class="flex justify-between items-center">
    <div class="flex flex-1 items-center space-x-2">
      <Input
        placeholder="Search emails, names..."
        :model-value="searchInput"
        class="h-8 w-[150px] lg:w-[250px]"
        @input="handleSearchInput"
      />
      <DataTableFacetedFilter
        v-if="table.getColumn('role')"
        :column="table.getColumn('role')"
        title="Role"
        :options="roles"
      />

      <Button
        v-if="isFiltered"
        variant="ghost"
        class="px-2 h-8 lg:px-3"
        @click="resetFilters"
      >
        Reset
        <Icon name="lucide:circle-x" class="ml-2 w-4 h-4" />
      </Button>
    </div>
    <DataTableViewOptions :table="table" />
  </div>
</template>