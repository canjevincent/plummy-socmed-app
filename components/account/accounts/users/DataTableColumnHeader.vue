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

  interface DataTableColumnHeaderProps {
    column: Column<UserTable, any>
    title: string
  }

  defineProps<DataTableColumnHeaderProps>()
</script>

<script lang="ts">
  export default {
    inheritAttrs: false,
  }
</script>

<template>
  <div v-if="column.getCanSort()" :class="cn('flex items-center space-x-2', $attrs.class ?? '')">
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button
          variant="ghost"
          size="sm"
          class="-ml-3 h-8 data-[state=open]:bg-accent"
        >
          <span>{{ title }}</span>
          <Icon name="lucide:arrow-down" v-if="column.getIsSorted() === 'desc'" class="w-4 h-4 ml-2" />
          <Icon name="lucide:arrow-up" v-else-if=" column.getIsSorted() === 'asc'" class="w-4 h-4 ml-2" />
          <Icon name="lucide:chevrons-up-down" v-else class="w-4 h-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem @click="column.toggleSorting(false)">
          <Icon name="lucide:arrow-up" class="mr-2 w-3.5 h-3.5 text-muted-foreground/70" />
          Asc
        </DropdownMenuItem>
        <DropdownMenuItem @click="column.toggleSorting(true)">
          <Icon name="lucide:arrow-down" class="mr-2 w-3.5 h-3.5 text-muted-foreground/70" />
          Desc
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem @click="column.toggleVisibility(false)">
          <Icon name="lucide:eye-off" class="mr-2 w-3.5 h-3.5 text-muted-foreground/70" />
          Hide
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>

  <div v-else :class="$attrs.class">
    {{ title }}
  </div>
</template>