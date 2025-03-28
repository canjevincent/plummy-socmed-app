import { h } from 'vue'

// export const labels = [
//   {
//     value: 'bug',
//     label: 'Bug',
//   },
//   {
//     value: 'feature',
//     label: 'Feature',
//   },
//   {
//     value: 'documentation',
//     label: 'Documentation',
//   },
// ]

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

// export const priorities = [
//   {
//     value: 'low',
//     label: 'Low',
//     icon: h('lucide:arrow-down', { class: 'mr-2 w-4 h-4' }),
//   },
//   {
//     value: 'medium',
//     label: 'Medium',
//     icon: h('lucide:arrow-right', { class: 'mr-2 w-4 h-4' }),
//   },
//   {
//     value: 'high',
//     label: 'High',
//     icon: h('lucide:arrow-up', { class: 'mr-2 w-4 h-4' }),
//   },
// ]