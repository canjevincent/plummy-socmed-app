import type { ColumnDef } from '@tanstack/vue-table'
import type { User } from '@prisma/client'

import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'

import { h } from 'vue'
import { labels, priorities, statuses } from './toolbar'
import DataTableColumnHeader from './DataTableColumnHeader.vue'
import DataTableRowActions from './DataTableRowActions.vue'

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      h(DataTableColumnHeader, {
          column: column,
          title: 'Email'
      })
    ),
  },
  {
    accessorKey: 'firstName',
    header: ({ column }) => (
      h(DataTableColumnHeader, {
          column: column,
          title: 'First Name'
      })
    ),
  },
  {
    accessorKey: 'lastName',
    header: ({ column }) => (
      h(DataTableColumnHeader, {
          column: column,
          title: 'Last Name'
      })
    ),
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => {
      const role = row.getValue('role') as string | null
      return h('div', { class: 'capitalize' }, role || '-')
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Created At',
    cell: ({ row }) => {
      const dateValue = row.getValue('createdAt') as string
      const date = new Date(dateValue)
      return h('div', { class: 'text-sm' }, date.toLocaleDateString())
    },
  },
]