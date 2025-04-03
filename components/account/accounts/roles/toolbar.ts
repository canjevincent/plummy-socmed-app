export const labels = [
  {
    value: 'bug',
    label: 'Bug',
  },
  {
    value: 'feature',
    label: 'Feature',
  },
  {
    value: 'documentation',
    label: 'Documentation',
  },
]

export const statuses = [
  {
    value: 'backlog',
    label: 'Backlog',
    icon:h('lucide:circle-help', { class: 'mr-2 w-4 h-4' }),
  },
  {
    value: 'todo',
    label: 'Todo',
    icon: h('lucide:circle', { class: 'mr-2 w-4 h-4' }),
  },
  {
    value: 'in progress',
    label: 'In Progress',
    icon: h('lucide:timer', { class: 'mr-2 w-4 h-4' }),
  },
  {
    value: 'done',
    label: 'Done',
    icon: h('lucide:circle-check', { class: 'mr-2 w-4 h-4' }),
  },
  {
    value: 'canceled',
    label: 'Canceled',
    icon: h('lucide:circle-x', { class: 'mr-2 w-4 h-4' }),
  },
]

export const priorities = [
  {
    value: 'low',
    label: 'Low',
    icon: h('lucide:arrow-down', { class: 'mr-2 w-4 h-4' }),
  },
  {
    value: 'medium',
    label: 'Medium',
    icon: h('lucide:arrow-right', { class: 'mr-2 w-4 h-4' }),
  },
  {
    value: 'high',
    label: 'High',
    icon: h('lucide:arrow-up', { class: 'mr-2 w-4 h-4' }),
  },
]