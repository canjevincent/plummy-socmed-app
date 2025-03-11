<script lang="ts">
  export const iframeHeight = '800px'
  export const description = 'A left and right sidebar.'
</script>
<template>
  <SidebarProvider>
    <PlummySidebarLeft />
    <SidebarInset>
      <header class="flex sticky top-0 gap-2 items-center h-14 shrink-0 bg-background">
        <div class="flex flex-1 gap-2 items-center px-3">
          <SidebarTrigger />
          <Separator orientation="vertical" class="mr-2 h-4" />
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
      <div class="flex flex-col flex-1 gap-4 p-4">
        <div class="mx-auto w-full max-w-3xl h-24 rounded-xl bg-muted/50" />
        <div class="mx-auto h-[100vh] w-full max-w-3xl rounded-xl bg-muted/50" />
      </div>
    </SidebarInset>
    <PlummySidebarRight />
  </SidebarProvider>
</template>
