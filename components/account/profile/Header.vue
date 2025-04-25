<script setup lang="ts">

  interface UserAuthProps {
    firstName: string
    middleName: string
    lastName: string
    email: string
    avatarUrl: string
  }

  const props = defineProps<{
    user: UserAuthProps
  }>()

</script>

<template>   
  <section class="container px-4 py-4 bg-white border border-gray-100 rounded-md shadow-sm">
    <div class="mb-12">
      <div class="flex flex-col items-center gap-8 md:flex-row">
        <div class="relative">
          <NuxtImg :src="user.avatarUrl" alt="Sarah Johnson" class="w-32 h-32 border-4 rounded-full border-primary/10" />
          <div class="inline-flex absolute right-0 -bottom-2 items-center px-3 py-0.5 text-xs font-semibold rounded-full border border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/80"> Author </div>
        </div>
        <div class="flex-1 text-center md:text-left">
          <h2 class="mb-2 text-3xl font-bold">{{ user.firstName }} {{ user.middleName }} {{ user.lastName }}</h2>
          <p class="mb-4 text-gray-600">
            {{ user.email }}
          </p>
          <p class="max-w-2xl mb-4 text-gray-600">Passionate about explaining complex technical concepts in simple terms. 10+ years of experience in technical writing and developer advocacy.</p>
          <div class="flex flex-wrap items-center gap-4">
            <span class="flex items-center gap-2 text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 lucide lucide-globe-icon">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path>
                <path d="M2 12h20"></path>
              </svg> San Francisco, CA </span>
            <div class="flex items-center gap-3">
              <a href="https://twitter.com/sarahjohnson" target="_blank" class="text-gray-600 hover:text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 lucide lucide-twitter-icon">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
              </a>
              <a href="https://linkedin.com/in/sarahjohnson" target="_blank" class="text-gray-600 hover:text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 lucide lucide-linkedin-icon">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect width="4" height="12" x="2" y="9"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </a>
              <a href="https://github.com/sarahjohnson" target="_blank" class="text-gray-600 hover:text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 lucide lucide-github-icon">
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
                  <path d="M9 18c-4.51 2-5-2-7-2"></path>
                </svg>
              </a>
            </div>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          <div class="p-4 text-center rounded-lg bg-gray-50">
            <div class="text-2xl font-bold text-primary">156</div>
            <div class="text-sm text-gray-600">Posts</div>
          </div>
          <div class="p-4 text-center rounded-lg bg-gray-50">
            <div class="text-2xl font-bold text-primary">428.5k</div>
            <div class="text-sm text-gray-600">Views</div>
          </div>
          <div class="p-4 text-center rounded-lg bg-gray-50">
            <div class="text-2xl font-bold text-primary">3.2k</div>
            <div class="text-sm text-gray-600">Comments</div>
          </div>
          <div class="p-4 text-center rounded-lg bg-gray-50">
            <div class="text-2xl font-bold text-primary">1.9k</div>
            <div class="text-sm text-gray-600">Shares</div>
          </div>
        </div>
      </div>
    </div>
    <div class="space-y-8">
      <div class="inline-flex items-center justify-start w-full p-1 rounded-md bg-muted text-muted-foreground">
        <NuxtLink to="/account/profile/wall" class="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
          <span class="truncate">Wall</span>
        </NuxtLink>
        <NuxtLink to="/account/profile/activity" class="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
          <span class="truncate">Activity</span>
        </NuxtLink>
        <NuxtLink to="/account/profile/settings" class="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
          <span class="truncate">Settings</span>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>