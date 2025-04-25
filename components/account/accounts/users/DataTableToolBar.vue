<script setup lang="ts">
  import type { Table } from '@tanstack/vue-table'
  import DataTableFacetedFilter from './DataTableFacetedFilter.vue'
  import DataTableViewOptions from './DataTableViewOptions.vue'

  interface UserTable {
    id: string;
    firstName: string | null;
    middleName: string | null;
    lastName: string | null;
    roleId: string;
    email: string;
    createdAt: Date;
    role: {
      title: string;
    };
  }

  interface DataTableToolbarProps {
    table: Table<UserTable>
    globalSearch: string
  }

  interface Role {
    value: string;
    label: string;
    icon?: Component;
  }

  const { data:roleToolBarData, isLoading, error } = useQuery<Role[], Error>({ 
    queryKey: ['user-role-toolbar-faceted-filter'],
    queryFn: async (): Promise<Role[]> => {
      const roles = await $fetch<Role[]>('/api/account/accounts/users/roleToolbar');
      
      // Transform the API response to include Vue component icons
      return roles.map(role => ({
        value: role.value,
        label: role.label,
        icon: h('lucide:circle-user', { class: 'mr-2 w-4 h-4' }) as Component
      }));
    }
  });

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
  <div class="flex items-center justify-between">
    <div class="flex items-center flex-1 space-x-2">
      <Input
        placeholder="Search emails, names..."
        :model-value="searchInput"
        class="h-8 w-[150px] lg:w-[250px]"
        @input="handleSearchInput"
      />
      <DataTableFacetedFilter
        v-if="table.getColumn('roleTitle')"
        :column="table.getColumn('roleTitle')"
        title="Role"
        :options="roleToolBarData || []"
      />

      <Button
        v-if="isFiltered"
        variant="ghost"
        class="h-8 px-2 lg:px-3"
        @click="resetFilters"
      >
        Reset
        <Icon name="lucide:circle-x" class="w-4 h-4 ml-2" />
      </Button>
    </div>
    <DataTableViewOptions :table="table" />
  </div>
</template>