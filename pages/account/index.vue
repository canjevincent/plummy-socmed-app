<script setup lang="ts">
  const description = 'An inset sidebar with secondary navigation.'
  const iframeHeight = '800px'
</script>
<template>
  <SidebarProvider>
    <AccountAppSidebar />
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
      <div class="flex flex-col flex-1 gap-4 p-4 pt-0">
        <div class="grid auto-rows-min gap-4 md:grid-cols-3">
          <div class="rounded-xl aspect-video bg-muted/50" />
          <div class="rounded-xl aspect-video bg-muted/50" />
          <div class="rounded-xl aspect-video bg-muted/50" />
        </div>
        <div class="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>