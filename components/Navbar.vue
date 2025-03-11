<script setup lang="ts">

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
      <nav class="flex justify-between items-center p-6 lg:px-8" aria-label="Global">
        <div class="flex lg:flex-1">
          <a href="#" class="p-1.5 -m-1.5">
            <span class="sr-only">Your Company</span>
            <img class="w-auto h-10 rounded-md" src="/plummy-logo.png" alt="" />
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
          <a href="#" class="font-semibold text-gray-900 text-sm/6">Log in <span aria-hidden="true">&rarr;</span></a>
        </div>
      </nav>
      <!-- Replace the div with v-show directive for proper toggle functionality -->
      <div class="lg:hidden" v-show="mobileMenuOpen">
        <div class="fixed inset-0 z-50" />
        <div class="overflow-y-auto fixed inset-y-0 right-0 z-50 px-6 py-6 w-full bg-white sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div class="flex justify-between items-center">
            <a href="#" class="p-1.5 -m-1.5">
              <span class="sr-only">Your Company</span>
              <img class="w-auto h-10 rounded-md" src="/plummy-logo.png" alt="" />
            </a>
            <button type="button" class="p-2.5 -m-2.5 text-gray-700 rounded-md" @click="mobileMenuOpen = false">
              <span class="sr-only">Close menu</span>
              <Icon name="lucide:x" class="size-6" />
            </button>
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

  <section>
    <div class="isolate relative px-6 pt-14 lg:px-8">
      <div class="pt-16 pb-80 sm:pt-24 sm:pb-40 lg:pt-40 lg:pb-48">
        <div class="relative px-4 mx-auto max-w-7xl sm:static sm:px-6 lg:px-8">
          <div class="sm:max-w-lg">
            <h1 class="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">Summer styles are finally here</h1>
            <p class="mt-4 text-xl text-gray-500">This year, our new summer collection will shelter you from the harsh elements of a world that doesn't care if you live or die.</p>
          </div>
          <div>
            <div class="mt-10">
              <!-- Decorative image grid -->
              <div aria-hidden="true" class="pointer-events-none lg:absolute lg:inset-y-0 lg:mx-auto lg:w-full lg:max-w-7xl">
                <div class="absolute transform sm:top-0 sm:left-1/2 sm:translate-x-8 lg:top-1/2 lg:left-1/2 lg:-translate-y-1/2 lg:translate-x-8">
                  <div class="flex items-center space-x-6 lg:space-x-8">
                    <div class="grid grid-cols-1 gap-y-6 shrink-0 lg:gap-y-8">
                      <div class="overflow-hidden w-44 h-64 rounded-lg sm:opacity-0 lg:opacity-100">
                        <img src="https://tailwindcss.com/plus-assets/img/ecommerce-images/home-page-03-hero-image-tile-01.jpg" alt="" class="object-cover size-full" />
                      </div>
                      <div class="overflow-hidden w-44 h-64 rounded-lg">
                        <img src="https://tailwindcss.com/plus-assets/img/ecommerce-images/home-page-03-hero-image-tile-02.jpg" alt="" class="object-cover size-full" />
                      </div>
                    </div>
                    <div class="grid grid-cols-1 gap-y-6 shrink-0 lg:gap-y-8">
                      <div class="overflow-hidden w-44 h-64 rounded-lg">
                        <img src="https://tailwindcss.com/plus-assets/img/ecommerce-images/home-page-03-hero-image-tile-03.jpg" alt="" class="object-cover size-full" />
                      </div>
                      <div class="overflow-hidden w-44 h-64 rounded-lg">
                        <img src="https://tailwindcss.com/plus-assets/img/ecommerce-images/home-page-03-hero-image-tile-04.jpg" alt="" class="object-cover size-full" />
                      </div>
                      <div class="overflow-hidden w-44 h-64 rounded-lg">
                        <img src="https://tailwindcss.com/plus-assets/img/ecommerce-images/home-page-03-hero-image-tile-05.jpg" alt="" class="object-cover size-full" />
                      </div>
                    </div>
                    <div class="grid grid-cols-1 gap-y-6 shrink-0 lg:gap-y-8">
                      <div class="overflow-hidden w-44 h-64 rounded-lg">
                        <img src="https://tailwindcss.com/plus-assets/img/ecommerce-images/home-page-03-hero-image-tile-06.jpg" alt="" class="object-cover size-full" />
                      </div>
                      <div class="overflow-hidden w-44 h-64 rounded-lg">
                        <img src="https://tailwindcss.com/plus-assets/img/ecommerce-images/home-page-03-hero-image-tile-07.jpg" alt="" class="object-cover size-full" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <a href="#" class="inline-block px-8 py-3 font-medium text-center text-white bg-purple-600 rounded-md border border-transparent hover:bg-purple-700">Shop Collection</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section>
    <div class="isolate overflow-hidden relative px-6 py-24 bg-white sm:py-32 lg:overflow-visible lg:px-0">
      <div class="overflow-hidden absolute inset-0 -z-10">
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
      <div class="grid grid-cols-1 gap-x-8 gap-y-16 mx-auto max-w-2xl lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:items-start lg:gap-y-10">
        <div class="lg:col-span-2 lg:col-start-1 lg:row-start-1 lg:mx-auto lg:grid lg:w-full lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8">
          <div class="lg:pr-4">
            <div class="lg:max-w-lg">
              <p class="font-semibold text-purple-600 text-base/7">Deploy faster</p>
              <h1 class="mt-2 text-4xl font-semibold tracking-tight text-gray-900 text-pretty sm:text-5xl">A better workflow</h1>
              <p class="mt-6 text-gray-700 text-xl/8">Aliquet nec orci mattis amet quisque ullamcorper neque, nibh sem. At arcu, sit dui mi, nibh dui, diam eget aliquam. Quisque id at vitae feugiat egestas.</p>
            </div>
          </div>
        </div>
        <div class="p-12 -mt-12 -ml-12 lg:sticky lg:top-4 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:overflow-hidden">
          <img class="w-[48rem] max-w-none rounded-xl bg-gray-900 ring-1 shadow-xl ring-gray-400/10 sm:w-[57rem]" src="https://tailwindcss.com/plus-assets/img/component-images/dark-project-app-screenshot.png" alt="" />
        </div>
        <div class="lg:col-span-2 lg:col-start-1 lg:row-start-2 lg:mx-auto lg:grid lg:w-full lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8">
          <div class="lg:pr-4">
            <div class="max-w-xl text-gray-700 text-base/7 lg:max-w-lg">
              <p>Faucibus commodo massa rhoncus, volutpat. Dignissim sed eget risus enim. Mattis mauris semper sed amet vitae sed turpis id. Id dolor praesent donec est. Odio penatibus risus viverra tellus varius sit neque erat velit. Faucibus commodo massa rhoncus, volutpat. Dignissim sed eget risus enim. Mattis mauris semper sed amet vitae sed turpis id.</p>
              <ul role="list" class="mt-8 space-y-8 text-gray-600">
                <li class="flex gap-x-3">
                  <Icon name="lucide:copy" class="flex-none mt-1 text-purple-600 size-5" aria-hidden="true" />
                  <span><strong class="font-semibold text-gray-900">Push to deploy.</strong> Lorem ipsum, dolor sit amet consectetur adipisicing elit. Maiores impedit perferendis suscipit eaque, iste dolor cupiditate blanditiis ratione.</span>
                </li>
                <li class="flex gap-x-3">
                  <Icon name="lucide:copy" class="flex-none mt-1 text-purple-600 size-5" aria-hidden="true" />
                  <span><strong class="font-semibold text-gray-900">SSL certificates.</strong> Anim aute id magna aliqua ad ad non deserunt sunt. Qui irure qui lorem cupidatat commodo.</span>
                </li>
                <li class="flex gap-x-3">
                  <Icon name="lucide:copy" class="flex-none mt-1 text-purple-600 size-5" aria-hidden="true" />
                  <span><strong class="font-semibold text-gray-900">Database backups.</strong> Ac tincidunt sapien vehicula erat auctor pellentesque rhoncus. Et magna sit morbi lobortis.</span>
                </li>
              </ul>
              <p class="mt-8">Et vitae blandit facilisi magna lacus commodo. Vitae sapien duis odio id et. Id blandit molestie auctor fermentum dignissim. Lacus diam tincidunt ac cursus in vel. Mauris varius vulputate et ultrices hac adipiscing egestas. Iaculis convallis ac tempor et ut. Ac lorem vel integer orci.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section>
    <div class="py-24 bg-white sm:py-32">
      <div class="px-6 mx-auto max-w-7xl lg:px-8">
        <h2 class="font-semibold text-center text-gray-900 text-lg/8">Trusted by the world’s most innovative teams</h2>
        <div class="grid grid-cols-4 gap-x-8 gap-y-10 items-center mx-auto mt-10 max-w-lg sm:max-w-xl sm:grid-cols-6 sm:gap-x-10 lg:mx-0 lg:max-w-none lg:grid-cols-5">
          <img class="object-contain col-span-2 w-full max-h-12 lg:col-span-1" src="https://tailwindcss.com/plus-assets/img/logos/158x48/transistor-logo-gray-900.svg" alt="Transistor" width="158" height="48" />
          <img class="object-contain col-span-2 w-full max-h-12 lg:col-span-1" src="https://tailwindcss.com/plus-assets/img/logos/158x48/reform-logo-gray-900.svg" alt="Reform" width="158" height="48" />
          <img class="object-contain col-span-2 w-full max-h-12 lg:col-span-1" src="https://tailwindcss.com/plus-assets/img/logos/158x48/tuple-logo-gray-900.svg" alt="Tuple" width="158" height="48" />
          <img class="object-contain col-span-2 w-full max-h-12 sm:col-start-2 lg:col-span-1" src="https://tailwindcss.com/plus-assets/img/logos/158x48/savvycal-logo-gray-900.svg" alt="SavvyCal" width="158" height="48" />
          <img class="object-contain col-span-2 col-start-2 w-full max-h-12 sm:col-start-auto lg:col-span-1" src="https://tailwindcss.com/plus-assets/img/logos/158x48/statamic-logo-gray-900.svg" alt="Statamic" width="158" height="48" />
        </div>
      </div>
    </div>
  </section>

  <section>
    <div class="px-4 pt-16 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-8">
      <div class="grid gap-10 mb-8 row-gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div class="sm:col-span-2">
          <a href="/" aria-label="Go home" title="Company" class="inline-flex items-center">
            <svg class="w-8 text-deep-purple-accent-400" viewBox="0 0 24 24" stroke-linejoin="round" stroke-width="2" stroke-linecap="round" stroke-miterlimit="10" stroke="currentColor" fill="none">
              <rect x="3" y="1" width="7" height="12"></rect>
              <rect x="3" y="17" width="7" height="6"></rect>
              <rect x="14" y="1" width="7" height="6"></rect>
              <rect x="14" y="11" width="7" height="12"></rect>
            </svg>
            <span class="ml-2 text-xl font-bold tracking-wide text-gray-800 uppercase">Company</span>
          </a>
          <div class="mt-6 lg:max-w-sm">
            <p class="text-sm text-gray-800">
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam.
            </p>
            <p class="mt-4 text-sm text-gray-800">
              Eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
            </p>
          </div>
        </div>
        <div class="space-y-2 text-sm">
          <p class="text-base font-bold tracking-wide text-gray-900">Contacts</p>
          <div class="flex">
            <p class="mr-1 text-gray-800">Phone:</p>
            <a href="tel:850-123-5021" aria-label="Our phone" title="Our phone" class="transition-colors duration-300 text-deep-purple-accent-400 hover:text-deep-purple-800">850-123-5021</a>
          </div>
          <div class="flex">
            <p class="mr-1 text-gray-800">Email:</p>
            <a href="mailto:info@lorem.mail" aria-label="Our email" title="Our email" class="transition-colors duration-300 text-deep-purple-accent-400 hover:text-deep-purple-800">info@lorem.mail</a>
          </div>
          <div class="flex">
            <p class="mr-1 text-gray-800">Address:</p>
            <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer" aria-label="Our address" title="Our address" class="transition-colors duration-300 text-deep-purple-accent-400 hover:text-deep-purple-800">
              312 Lovely Street, NY
            </a>
          </div>
        </div>
        <div>
          <span class="text-base font-bold tracking-wide text-gray-900">Social</span>
          <div class="flex items-center mt-1 space-x-3">
            <a href="/" class="text-gray-500 transition-colors duration-300 hover:text-deep-purple-accent-400">
              <svg viewBox="0 0 24 24" fill="currentColor" class="h-5">
                <path
                  d="M24,4.6c-0.9,0.4-1.8,0.7-2.8,0.8c1-0.6,1.8-1.6,2.2-2.7c-1,0.6-2,1-3.1,1.2c-0.9-1-2.2-1.6-3.6-1.6 c-2.7,0-4.9,2.2-4.9,4.9c0,0.4,0,0.8,0.1,1.1C7.7,8.1,4.1,6.1,1.7,3.1C1.2,3.9,1,4.7,1,5.6c0,1.7,0.9,3.2,2.2,4.1 C2.4,9.7,1.6,9.5,1,9.1c0,0,0,0,0,0.1c0,2.4,1.7,4.4,3.9,4.8c-0.4,0.1-0.8,0.2-1.3,0.2c-0.3,0-0.6,0-0.9-0.1c0.6,2,2.4,3.4,4.6,3.4 c-1.7,1.3-3.8,2.1-6.1,2.1c-0.4,0-0.8,0-1.2-0.1c2.2,1.4,4.8,2.2,7.5,2.2c9.1,0,14-7.5,14-14c0-0.2,0-0.4,0-0.6 C22.5,6.4,23.3,5.5,24,4.6z"
                ></path>
              </svg>
            </a>
            <a href="/" class="text-gray-500 transition-colors duration-300 hover:text-deep-purple-accent-400">
              <svg viewBox="0 0 30 30" fill="currentColor" class="h-6">
                <circle cx="15" cy="15" r="4"></circle>
                <path
                  d="M19.999,3h-10C6.14,3,3,6.141,3,10.001v10C3,23.86,6.141,27,10.001,27h10C23.86,27,27,23.859,27,19.999v-10   C27,6.14,23.859,3,19.999,3z M15,21c-3.309,0-6-2.691-6-6s2.691-6,6-6s6,2.691,6,6S18.309,21,15,21z M22,9c-0.552,0-1-0.448-1-1   c0-0.552,0.448-1,1-1s1,0.448,1,1C23,8.552,22.552,9,22,9z"
                ></path>
              </svg>
            </a>
            <a href="/" class="text-gray-500 transition-colors duration-300 hover:text-deep-purple-accent-400">
              <svg viewBox="0 0 24 24" fill="currentColor" class="h-5">
                <path
                  d="M22,0H2C0.895,0,0,0.895,0,2v20c0,1.105,0.895,2,2,2h11v-9h-3v-4h3V8.413c0-3.1,1.893-4.788,4.659-4.788 c1.325,0,2.463,0.099,2.795,0.143v3.24l-1.918,0.001c-1.504,0-1.795,0.715-1.795,1.763V11h4.44l-1,4h-3.44v9H22c1.105,0,2-0.895,2-2 V2C24,0.895,23.105,0,22,0z"
                ></path>
              </svg>
            </a>
          </div>
          <p class="mt-4 text-sm text-gray-500">
            Bacon ipsum dolor amet short ribs pig sausage prosciutto chicken spare ribs salami.
          </p>
        </div>
      </div>
      <div class="flex flex-col-reverse justify-between pt-5 pb-10 border-t lg:flex-row">
        <p class="text-sm text-gray-600">
          © Copyright 2020 Lorem Inc. All rights reserved.
        </p>
        <ul class="flex flex-col mb-3 space-y-2 lg:mb-0 sm:space-y-0 sm:space-x-5 sm:flex-row">
          <li>
            <a href="/" class="text-sm text-gray-600 transition-colors duration-300 hover:text-deep-purple-accent-400">F.A.Q</a>
          </li>
          <li>
            <a href="/" class="text-sm text-gray-600 transition-colors duration-300 hover:text-deep-purple-accent-400">Privacy Policy</a>
          </li>
          <li>
            <a href="/" class="text-sm text-gray-600 transition-colors duration-300 hover:text-deep-purple-accent-400">Terms &amp; Conditions</a>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>