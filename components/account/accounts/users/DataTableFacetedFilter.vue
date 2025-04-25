<script setup lang="ts">
  import type { Column } from '@tanstack/vue-table'
  import type { User } from '@prisma/client'
  import { cn } from '@/lib/utils'

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

  interface DataTableFacetedFilter {
    column?: Column<UserTable, any>
    title?: string
    options: {
      label: string
      value: string
      icon?: Component
    }[]
  }

  const props = defineProps<DataTableFacetedFilter>()

  const facets = computed(() => props.column?.getFacetedUniqueValues())
  
  // Get the current filter value from the column
  const currentFilterValue = computed(() => {
    const filterValue = props.column?.getFilterValue();
    // Ensure filterValue is always an array
    return (Array.isArray(filterValue) ? filterValue : filterValue ? [filterValue] : []) as string[];
  });
  
  // Create a reactive selected values set based on the current filter
  const selectedValues = ref(new Set(currentFilterValue.value));
  
  // Watch for changes in the column filter value
  watch(() => props.column?.getFilterValue(), (newValue) => {
    const values = Array.isArray(newValue) ? newValue : newValue ? [newValue] : [];
    selectedValues.value = new Set(values as string[]);
  });

  function handleOptionSelect(option: { value: string, label: string }) {
    const isSelected = selectedValues.value.has(option.value);
    
    // Create a new Set to ensure reactivity
    const newSelectedValues = new Set(selectedValues.value);
    
    if (isSelected) {
      newSelectedValues.delete(option.value);
    } else {
      newSelectedValues.add(option.value);
    }
    
    // Update the local state
    selectedValues.value = newSelectedValues;
    
    // Update the column filter
    const filterValues = Array.from(newSelectedValues);
    props.column?.setFilterValue(filterValues.length ? filterValues : undefined);

    // Reset the page to 1 when filter changes
    // props.column?.table?.setPageIndex(0)
  }

  function clearFilters() {
    selectedValues.value = new Set();
    props.column?.setFilterValue(undefined);
  }
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <Button variant="outline" size="sm" class="h-8 border-dashed">
        <Icon name="lucide:circle-plus" class="w-4 h-4 mr-2" />
        {{ title }}
        <template v-if="selectedValues.size > 0">
          <Separator orientation="vertical" class="h-4 mx-2" />
          <Badge
            variant="secondary"
            class="px-1 font-normal rounded-sm lg:hidden"
          >
            {{ selectedValues.size }}
          </Badge>
          <div class="hidden space-x-1 lg:flex">
            <Badge
              v-if="selectedValues.size > 2"
              variant="secondary"
              class="px-1 font-normal rounded-sm"
            >
              {{ selectedValues.size }} selected
            </Badge>

            <template v-else>
              <Badge
                v-for="option in options
                  .filter((option) => selectedValues.has(option.value))"
                :key="option.value"
                variant="secondary"
                class="px-1 font-normal rounded-sm"
              >
                {{ option.label }}
              </Badge>
            </template>
          </div>
        </template>
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-[200px] p-0" align="start">
      <Command>
        <CommandInput :placeholder="title" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup>
            <CommandItem
              v-for="option in options"
              :key="option.value"
              :value="option.value"
              @select="() => handleOptionSelect(option)"
            >
              <div
                :class="cn(
                  'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                  selectedValues.has(option.value)
                    ? 'bg-primary text-primary-foreground'
                    : 'opacity-50 [&_svg]:invisible',
                )"
              >
                <Icon name="lucide:check" :class="cn('h-4 w-4')" />
              </div>
              <component :is="option.icon" v-if="option.icon" class="w-4 h-4 mr-2 text-muted-foreground" />
              <span>{{ option.label }}</span>
              <span v-if="facets?.get(option.value)" class="flex items-center justify-center w-4 h-4 ml-auto font-mono text-xs">
                {{ facets.get(option.value) }}
              </span>
            </CommandItem>
          </CommandGroup>

          <template v-if="selectedValues.size > 0">
            <CommandSeparator />
            <CommandGroup>
              <CommandItem
                value="clear-filters"
                class="justify-center text-center"
                @select="clearFilters"
              >
                Clear filters
              </CommandItem>
            </CommandGroup>
          </template>
        </CommandList>
      </Command>
    </PopoverContent>
  </Popover>
</template>