import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import type { Role } from '@prisma/client'
import DataTableRowActions from './DataTableRowActions.vue'
import DataTableColumnHeader from './DataTableColumnHeader.vue'

// Define custom meta type to include emit function
interface TableEmitMeta {
  emit: (event: string, ...args: any[]) => void
}

export const columns: ColumnDef<Role>[] = [
  {
    accessorKey: 'title',
    header: ({ column }) => (
      h(DataTableColumnHeader, {
          column: column,
          title: 'Title'
      })
    ),
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
      const role = row.original
      
      // Create role object to pass to dropdown
      const roleData = {
        id: role.id,
        title: role.title 
      }

      // Access meta data with proper type checking
      const tableMeta = table.options.meta as TableEmitMeta | undefined
      
      return h(DataTableRowActions, {
        role: roleData,
        onUpdate: (role) => {
          if (tableMeta?.emit) {
            tableMeta.emit('update-role', role)
          }
        },
        onDelete: (role) => {
          if (tableMeta?.emit) {
            tableMeta.emit('delete-role', role)
          }
        }
      })
    },
  },
]