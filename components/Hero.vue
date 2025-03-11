<script setup lang="ts">

  import { Vue3Lottie } from 'vue3-lottie'
  import jitterherof from '~/assets/lottie/jitter-hero-1.json'
  import jitterheros from '~/assets/lottie/jitter-hero-2.json'
  import jitterherot from '~/assets/lottie/jitter-hero-3.json'
  import jitterheroff from '~/assets/lottie/jitter-hero-4.json'
  import jitterherofff from '~/assets/lottie/jitter-hero-5.json'
  import jitterheross from '~/assets/lottie/jitter-hero-6.json'
  import jitterherosss from '~/assets/lottie/jitter-hero-7.json'

</script>

<template>

  <section>
    <div class="isolate relative px-6 pt-14 lg:px-8">
      <div class="pt-16 pb-80 sm:pt-24 sm:pb-40 lg:pt-40 lg:pb-48">
        <div class="relative px-4 mx-auto max-w-7xl sm:static sm:px-6 lg:px-8">
          <div class="sm:max-w-lg">
            <h1 class="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">👑 The Social Palace for the Modern Mogul</h1>
            <p class="mt-4 text-xl text-gray-500">The ultimate social media app designed for those who thrive in the world of luxury, success, and exclusivity. </p>
          </div>
          <div>
            <div class="mt-10">
              <!-- Decorative image grid -->
              <div aria-hidden="true" class="pointer-events-none lg:absolute lg:inset-y-0 lg:mx-auto lg:w-full lg:max-w-7xl">
                <div class="absolute transform sm:top-0 sm:left-1/2 sm:translate-x-8 lg:top-1/2 lg:left-1/2 lg:-translate-y-1/2 lg:translate-x-8">
                  <div class="flex items-center space-x-6 lg:space-x-8">
                    <div class="grid grid-cols-1 gap-y-6 shrink-0 lg:gap-y-8">
                      <div class="overflow-hidden w-44 h-64 bg-purple-600 rounded-lg border border-purple-700 sm:opacity-0 lg:opacity-100">
                        <client-only>
                          <Vue3Lottie
                            :animationData="jitterheroff"
                            :height="255"
                            :width="180"
                          />
                        </client-only>
                      </div>
                      <div class="overflow-hidden w-44 h-64 bg-purple-500 rounded-lg border border-purple-700">
                        <client-only>
                          <Vue3Lottie
                            :animationData="jitterheros"
                            :height="255"
                            :width="180"
                          />
                        </client-only>
                      </div>
                    </div>
                    <div class="grid grid-cols-1 gap-y-6 shrink-0 lg:gap-y-8">
                      <div class="overflow-hidden w-44 h-64 bg-violet-600 rounded-lg border border-violet-700">
                        <client-only>
                          <Vue3Lottie
                            :animationData="jitterherofff"
                            :height="255"
                            :width="180"
                          />
                        </client-only>
                      </div>
                      <div class="overflow-hidden w-44 h-64 bg-fuchsia-700 rounded-lg border border-purple-700">
                        <client-only>
                          <Vue3Lottie
                            :animationData="jitterherot"
                            :height="255"
                            :width="180"
                          />
                        </client-only>
                      </div>
                      <div class="overflow-hidden w-44 h-64 bg-purple-600 rounded-lg border border-purple-700">
                        <client-only>
                          <Vue3Lottie
                            :animationData="jitterheross"
                            :height="255"
                            :width="180"
                          />
                        </client-only>
                      </div>
                    </div>
                    <div class="grid grid-cols-1 gap-y-6 shrink-0 lg:gap-y-8">
                      <div class="overflow-hidden w-44 h-64 bg-fuchsia-900 rounded-lg border border-fuchsia-700">
                        <client-only>
                          <Vue3Lottie
                            :animationData="jitterherof"
                            :height="255"
                            :width="180"
                          />
                        </client-only>
                      </div>
                      <div class="overflow-hidden w-44 h-64 bg-purple-600 rounded-lg border border-purple-700">
                        <client-only>
                          <Vue3Lottie
                            :animationData="jitterherosss"
                            :height="255"
                            :width="180"
                          />
                        </client-only>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <a
                class="inline-block px-8 py-3 text-sm font-bold text-white bg-purple-600 rounded-sm transition hover:scale-110 hover:rotate-2 focus:ring-3 focus:outline-hidden"
                href="#"
              >
                PLUM ME IN
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

</template>