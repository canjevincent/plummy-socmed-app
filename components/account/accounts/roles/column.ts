import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import type { User } from '@prisma/client'
import DataTableColumnHeader from './DataTableColumnHeader.vue'
import DataTableDropdown from './DataTableDropdown.vue'

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'id',
    header: ({ column }) => 
      h(DataTableColumnHeader, { column, title: 'ID' }),
    enableSorting: true,
    cell: ({ row }) => h('div', { class: 'font-medium' }, row.getValue('id')),
  },
  {
    accessorKey: 'email',
    header: ({ column }) => 
      h(DataTableColumnHeader, { column, title: 'Email' }),
    enableSorting: true,
    cell: ({ row }) => h('div', row.getValue('email')),
  },
  {
    accessorKey: 'firstName',
    header: ({ column }) => 
      h(DataTableColumnHeader, { column, title: 'First Name' }),
    enableSorting: true,
    cell: ({ row }) => h('div', row.getValue('firstName') || '-'),
  },
  {
    accessorKey: 'lastName',
    header: ({ column }) => 
      h(DataTableColumnHeader, { column, title: 'Last Name' }),
    enableSorting: true,
    cell: ({ row }) => h('div', row.getValue('lastName') || '-'),
  },
  {
    accessorKey: 'role',
    header: ({ column }) => 
      h(DataTableColumnHeader, { column, title: 'Role' }),
    cell: ({ row }) => {
      const role = row.getValue('role') as string | null
      return h('div', { class: 'capitalize' }, role || '-')
    },
    enableSorting: true,
    filterFn: (row, columnId, filterValue) => {
      if (!filterValue) return true
      return row.getValue(columnId) === filterValue
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => 
      h(DataTableColumnHeader, { column, title: 'Created At' }),
    cell: ({ row }) => {
      const dateValue = row.getValue('createdAt') as string
      const date = new Date(dateValue)
      return h('div', { class: 'text-sm' }, date.toLocaleDateString())
    },
    enableSorting: true,
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const user = row.original
      return h(DataTableDropdown, { 
        user,
        onExpand: () => console.log('Expand', user),
        onUpdate: () => console.log('Update', user),
        onDelete: () => console.log('Delete', user),
      })
    },
  }
]