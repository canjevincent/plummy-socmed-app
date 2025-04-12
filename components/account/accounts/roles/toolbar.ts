import { h } from 'vue'

export const roles = [
  {
    value: '1',
    label: 'Admin',
    icon: h('lucide:settings-2', { class: 'mr-2 w-4 h-4' }),
  },
  {
    value: '2',
    label: 'User',
    icon: h('lucide:circle', { class: 'mr-2 w-4 h-4' }),
  },
]
