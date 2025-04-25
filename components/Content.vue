<script setup lang="ts">

  import { Vue3Lottie } from 'vue3-lottie'
  import jittercontentf from '~/assets/lottie/jitter-content.json'
  
</script>

<template>
  <section>
    <div class="relative px-6 py-24 overflow-hidden bg-white isolate sm:py-32 lg:overflow-visible lg:px-0">
      <div class="absolute inset-0 overflow-hidden -z-10">
        <svg class="absolute top-0 left-[max(50%,25rem)] h-[64rem] w-[128rem] -translate-x-1/2 stroke-gray-200 [mask-image:radial-gradient(64rem_64rem_at_top,white,transparent)]" aria-hidden="true">
          <defs>
            <pattern id="e813992c-7d03-4cc4-a2bd-151760b470a0" width="200" height="200" x="50%" y="-1" patternUnits="userSpaceOnUse">
              <path d="M100 200V.5M.5 .5H200" fill="none" />
            </pattern>
          </defs>
          <svg x="50%" y="-1" class="overflow-visible fill-gray-50">
            <path d="M-100.5 0h201v201h-201Z M699.5 0h201v201h-201Z M499.5 400h201v201h-201Z M-300.5 600h201v201h-201Z" stroke-width="0" />
          </svg>
          <rect width="100%" height="100%" stroke-width="0" fill="url(#e813992c-7d03-4cc4-a2bd-151760b470a0)" />
        </svg>
      </div>
      <div class="grid max-w-2xl grid-cols-1 mx-auto gap-x-8 gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:items-start lg:gap-y-10">
        <div class="lg:col-span-2 lg:col-start-1 lg:row-start-1 lg:mx-auto lg:grid lg:w-full lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8">
          <div class="lg:pr-4">
            <div class="lg:max-w-lg">
              <p class="font-semibold text-purple-600 text-base/7">Luxury Networking</p>
              <h1 class="mt-2 text-4xl font-semibold tracking-tight text-gray-900 text-pretty sm:text-5xl">Ambition Meets Opulence</h1>
              <p class="mt-6 text-gray-700 text-xl/8">The social media app for those who shape the future. Whether you’re a CEO, entrepreneur, or innovator, this is your space to connect with like-minded individuals, share your vision, and build a legacy.</p>
            </div>
          </div>
        </div>
        <div class="p-12 -mt-12 -ml-12 lg:sticky lg:top-4 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:overflow-hidden">
          <!-- <NuxtImg class="w-[48rem] max-w-none rounded-xl bg-gray-900 ring-1 shadow-xl ring-gray-400/10 sm:w-[57rem]" src="https://tailwindcss.com/plus-assets/img/component-images/dark-project-app-screenshot.png" alt="" /> -->
          <client-only>
            <Vue3Lottie
              :animationData="jittercontentf"
              :height="700"
              :width="700"
            />
          </client-only>
        </div>
        <div class="lg:col-span-2 lg:col-start-1 lg:row-start-2 lg:mx-auto lg:grid lg:w-full lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8">
          <div class="lg:pr-4">
            <div class="max-w-xl text-gray-700 text-base/7 lg:max-w-lg">
              <p>Designed for the wealthy and ambitious, it’s a space to network, inspire, and grow with a community that shares your drive for excellence. Join the platform where every connection is a step toward greatness.</p>
              <ul role="list" class="mt-8 space-y-8 text-gray-600">
                <li class="flex gap-x-3">
                  <Icon name="lucide:copy" class="flex-none mt-1 text-purple-600 size-5" aria-hidden="true" />
                  <span><strong class="font-semibold text-gray-900">The Elite Social Network for Visionaries.</strong> Plummy is where the world’s most ambitious and affluent connect. Share your successes, discover exclusive opportunities, and build a network that reflects your refined lifestyle. </span>
                </li>
                <li class="flex gap-x-3">
                  <Icon name="lucide:copy" class="flex-none mt-1 text-purple-600 size-5" aria-hidden="true" />
                  <span><strong class="font-semibold text-gray-900">Where Luxury Meets Influence.</strong> Step into a world of sophistication and power. Plummy is the social media app designed for high achievers, trendsetters, and tastemakers.</span>
                </li>
                <li class="flex gap-x-3">
                  <Icon name="lucide:copy" class="flex-none mt-1 text-purple-600 size-5" aria-hidden="true" />
                  <span><strong class="font-semibold text-gray-900">Redefining Social Media for the Affluent.</strong> For those who live life at the top, Plummy is the ultimate networking platform. Share your journey, explore exclusive events, and connect with a community that values success, ambition, and luxury.</span>
                </li>
              </ul>
              <p class="mt-8">Here, connections are more than just followers—they’re opportunities to network with like-minded visionaries, tastemakers, and influencers. Whether you’re sharing your latest achievements, exploring high-end experiences, or building your elite circle, Plummy is your gateway to a lifestyle where sophistication meets social power. 
                              Join the platform where ambition is celebrated, and every interaction feels like a step into a world of opulence. Welcome to Plummy—where your network is as refined as your taste. </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>