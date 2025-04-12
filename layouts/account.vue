<script setup lang="ts">
  // loggedIn, user, session, clear     
  const { user } = useUserSession();

  // Create a computed key that depends on name, email, and avatar
  const userKey = computed(() => {
    return `${user.value.firstName}-${user.value.middleName}-${user.value.lastName}-${user.value.email}-${user.value.avatarUrl}`;
  });

</script>
<template>
  <SidebarProvider>
    <AccountAppSidebar
      :key="userKey"
      :name="`${user.firstName} ${user.middleName} ${user.lastName}`"
      :email="user.email"
      :avatar="user.avatarUrl ? user.avatarUrl : ''"
    />
    <SidebarInset>
      <header class="flex items-center h-16 gap-2 shrink-0">
        <div class="flex items-center gap-2 px-4">
          <SidebarTrigger class="-ml-1" />
          <Separator orientation="vertical" class="h-4 mr-2" />
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