import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import type { User } from '@prisma/client'
import DropdownAction from './DataTableDropdown.vue'
import DataTableColumnHeader from './DataTableColumnHeader.vue'

// Define custom meta type to include emit function
interface TableEmitMeta {
  emit: (event: string, ...args: any[]) => void
}

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
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row, table }) => {
      const user = row.original
      
      // Create user object to pass to dropdown
      const userData = {
        id: user.id,
        firstName: user.firstName ?? '',
        middleName: user.middleName ?? '',
        lastName: user.lastName ?? '',
        email: user.email,
      }

      // Access meta data with proper type checking
      const tableMeta = table.options.meta as TableEmitMeta | undefined
      
      return h(DropdownAction, {
        user: userData,
        onUpdate: (user) => {
          if (tableMeta?.emit) {
            tableMeta.emit('update-user', user)
          }
        },
        onDelete: (user) => {
          if (tableMeta?.emit) {
            tableMeta.emit('delete-user', user)
          }
        },
        onExpand: () => {
          if (tableMeta?.emit) {
            tableMeta.emit('expand')
          }
        }
      })
    },
  },
]