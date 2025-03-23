import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import type { User } from '@prisma/client'
import DropdownAction from './DataTableDropdown.vue'

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'firstName',
    header: 'First Name',
  },
  {
    accessorKey: 'lastName',
    header: 'Last Name',
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
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const user = row.original
      return h('div', { class: 'relative' }, h(DropdownAction, {
        user: {
          id: user.id,
          firstName: user.firstName ?? '',
          middleName: user.middleName ?? '',
          lastName: user.lastName ?? '',
          email: user.email,
        },
      }))
    },
  },
]