<script setup lang="ts">
  import {
    type SidebarProps,
  } from '../ui/sidebar'
  import {
    BookOpen,
    Bot,
    Command,
    Frame,
    LifeBuoy,
    Map,
    PieChart,
    Send,
    Settings2,
    SquareTerminal,
  } from 'lucide-vue-next'

  // Combine AuthUserProps and SidebarProps into a single interface
  interface AuthUserProps extends SidebarProps {
    name: string;
    email: string;
    avatar: string;
  }
  
  const props = withDefaults(defineProps<AuthUserProps>(), {
    variant: 'inset',
  })

  const data = {
    user: {
      name: props.name,
      email: props.email,
      avatar: props.avatar,
    },
    navMain: [
      {
        title: 'Dashboard',
        url: '#',
        icon: SquareTerminal,
        isActive: true,
        items: [
          {
            title: 'Posts',
            url: '#',
          },
          {
            title: 'Uploads',
            url: '#',
          },
          {
            title: 'Activities',
            url: '#',
          },
        ],
      },
      {
        title: 'Accounts',
        url: '#',
        icon: Bot,
        items: [
          {
            title: 'Users',
            url: '#',
          },
          {
            title: 'Roles',
            url: '#',
          },
          {
            title: 'Permissions',
            url: '#',
          },
        ],
      },
      {
        title: 'Contents',
        url: '#',
        icon: BookOpen,
        items: [
          {
            title: 'Introduction',
            url: '#',
          },
          {
            title: 'Get Started',
            url: '#',
          },
          {
            title: 'Tutorials',
            url: '#',
          },
          {
            title: 'Changelog',
            url: '#',
          },
        ],
      },
      {
        title: 'Settings',
        url: '#',
        icon: Settings2,
        items: [
          {
            title: 'General',
            url: '#',
          },
          {
            title: 'Team',
            url: '#',
          },
          {
            title: 'Billing',
            url: '#',
          },
          {
            title: 'Limits',
            url: '#',
          },
        ],
      },
    ],
    navSecondary: [
      {
        title: 'Support',
        url: '#',
        icon: LifeBuoy,
      },
      {
        title: 'Feedback',
        url: '#',
        icon: Send,
      },
    ],
    projects: [
      {
        name: 'Design Engineering',
        url: '#',
        icon: Frame,
      },
      {
        name: 'Sales & Marketing',
        url: '#',
        icon: PieChart,
      },
      {
        name: 'Travel',
        url: '#',
        icon: Map,
      },
    ],
  }
</script>
<template>
  <Sidebar v-bind="props">
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" as-child>
            <a href="#">
              <div class="flex justify-center items-center rounded-lg aspect-square size-8 bg-sidebar-primary text-sidebar-primary-foreground">
                <Command class="size-4" />
              </div>
              <div class="grid flex-1 text-sm leading-tight text-left">
                <span class="font-semibold truncate">Plummy App</span>
                <span class="text-xs truncate">Social Media</span>
              </div>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
    <SidebarContent>
      <AccountNavMain :items="data.navMain" />
      <AccountNavProjects :projects="data.projects" />
      <AccountNavSecondary :items="data.navSecondary" class="mt-auto" />
    </SidebarContent>
    <SidebarFooter>
      <AccountNavUser :user="data.user" />
    </SidebarFooter>
  </Sidebar>
</template>