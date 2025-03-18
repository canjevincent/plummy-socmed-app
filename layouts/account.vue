<script setup lang="ts">
  // loggedIn, user, session, clear     
  const { user } = useUserSession();
</script>
<template>
  <SidebarProvider>
    <AccountAppSidebar
      :name="`${user.firstName} ${user.middleName} ${user.lastName}`"
      :email="user.email"
      :avatar="user.avatar ? user.avatar : ''"
    />
    <SidebarInset>
      <header class="flex gap-2 items-center h-16 shrink-0">
        <div class="flex gap-2 items-center px-4">
          <SidebarTrigger class="-ml-1" />
          <Separator orientation="vertical" class="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem class="hidden md:block">
                <BreadcrumbLink href="#">
                  Building Your Application
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator class="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Data Fetching</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <slot />
    </SidebarInset>
  </SidebarProvider>
</template>