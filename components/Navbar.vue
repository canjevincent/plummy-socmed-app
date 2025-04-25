<script setup lang="ts">

  import { Vue3Lottie } from 'vue3-lottie'
  import jitterlogoblack from '~/assets/lottie/jitter-logo-black.json'

  const navigation = [
    { name: 'Product', href: '#' },
    { name: 'Features', href: '#' },
    { name: 'Marketplace', href: '#' },
    { name: 'Company', href: '#' },
  ]

  const mobileMenuOpen = ref(false)
</script>

<template>
  <section class="bg-white">
    <header class="absolute inset-x-0 top-0 z-50">
      <nav class="flex items-center justify-between p-6 lg:px-8" aria-label="Global">
        <div class="flex lg:flex-1">
          <a href="#" class="p-1.5 -m-1.5">
            <!-- <span class="sr-only">Your Company</span>
            <NuxtImg class="w-auto h-10 rounded-md" src="/plummy-logo.png" alt="" /> -->
            <client-only>
                <Vue3Lottie
                  :animationData="jitterlogoblack"
                  :height="80"
              />
            </client-only>
          </a>
        </div>
        <div class="flex lg:hidden">
          <button type="button" class="inline-flex justify-center items-center p-2.5 -m-2.5 text-gray-700 rounded-md" @click="mobileMenuOpen = true">
            <span class="sr-only">Open main menu</span>
            <Icon name="lucide:align-justify" class="size-6" />
          </button>
        </div>
        <div class="hidden lg:flex lg:gap-x-12">
          <a v-for="item in navigation" :key="item.name" :href="item.href" class="font-semibold text-gray-900 text-sm/6">{{ item.name }}</a>
        </div>
        <div class="hidden lg:flex lg:flex-1 lg:justify-end">
          <NuxtLink to="/guest/auth/login" class="font-semibold text-gray-900 text-sm/6">
            Log in 
            <span aria-hidden="true">&rarr;</span>
          </NuxtLink>
        </div>
      </nav>
      <!-- Replace the div with v-show directive for proper toggle functionality -->
      <div class="lg:hidden" v-show="mobileMenuOpen">
        <div class="fixed inset-0 z-50" />
        <div class="fixed inset-y-0 right-0 z-50 w-full px-6 py-6 overflow-y-auto bg-white sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div class="flex items-center justify-between">
            <!-- <a href="#" class="p-1.5 -m-1.5">
              <span class="sr-only">Your Company</span>
              <NuxtImg class="w-auto h-10 rounded-md" src="/plummy-logo.png" alt="" />
            </a>
            <button type="button" class="p-2.5 -m-2.5 text-gray-700 rounded-md" @click="mobileMenuOpen = false">
              <span class="sr-only">Close menu</span>
              <Icon name="lucide:x" class="size-6" />
            </button> -->
            <client-only>
                <Vue3Lottie
                  :animationData="jitterlogoblack"
                  :height="80"
              />
            </client-only>
          </div>
          <div class="flow-root mt-6">
            <div class="-my-6 divide-y divide-gray-500/10">
              <div class="py-6 space-y-2 text-center">
                <a v-for="item in navigation" :key="item.name" :href="item.href" class="block px-3 py-2 -mx-3 font-semibold text-gray-900 rounded-lg text-base/7 hover:bg-gray-50">{{ item.name }}</a>
              </div>
              <div class="py-6 text-center">
                <a href="#" class="block px-3 py-2.5 -mx-3 font-semibold text-gray-900 rounded-lg text-base/7 hover:bg-gray-50">Log in</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  </section>
</template>