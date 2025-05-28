// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
    'shadcn-nuxt',
    '@nuxtjs/google-fonts',
    '@nuxt/icon',
    '@nuxt/image',
    'nuxt-auth-utils',
    '@prisma/nuxt',
    '@hebilicious/vue-query-nuxt',
    '@nuxtjs/cloudinary',
    'nuxt-color-picker'
  ],
  shadcn: {
    /**
    * Prefix for all the imported component
    */
    prefix: '',
    /**
    * Directory that the component lives in.
    * @default "./components/ui"
    */
    componentDir: './components/ui'
  },
  runtimeConfig: {
    public: {
      cloudinaryCloudName: process.env.NUXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      uploadPreset: process.env.NUXT_PUBLIC_UPLOAD_PRESET,
      giphyApiKey: process.env.NUXT_PUBLIC_GIPHY_API_KEY,
      giphyApiUrl: process.env.NUXT_PUBLIC_GIPHY_API_URL,
      tavilyApiKey: process.env.TAVILY_API_KEY
    },
    cloudinaryApiKey: process.env.NUXT_CLOUDINARY_API_KEY,
    cloudinaryApiSecret: process.env.NUXT_CLOUDINARY_API_SECRET,
  },
  cloudinary: {
    cloudName: process.env.NUXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    uploadPreset: process.env.NUXT_PUBLIC_UPLOAD_PRESET,
    apiKey: process.env.NUXT_CLOUDINARY_API_KEY,
  }
})