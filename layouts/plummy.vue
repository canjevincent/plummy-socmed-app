<script lang="ts" setup>
  // export const iframeHeight = '800px'
  // export const description = 'A left and right sidebar.'
</script>
<template>
  <SidebarProvider>
    <PlummySidebarLeft />
    <SidebarInset>
      <header class="sticky top-0 flex items-center gap-2 h-14 shrink-0 bg-background">
        <div class="flex items-center flex-1 gap-2 px-3">
          <SidebarTrigger />
          <Separator orientation="vertical" class="h-4 mr-2" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage class="line-clamp-1">
                  Project Management & Task Tracking
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <slot />
    </SidebarInset>
    <PlummySidebarRight />
  </SidebarProvider>
</template>
