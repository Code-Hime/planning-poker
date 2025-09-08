// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  
  modules: [
    '@pinia/nuxt',
    '@nuxt/icon'
  ],

  css: ['~/assets/styles/main.scss'],
  
  nitro: {
    experimental: {
      wasm: true
    }
  },

  // Enable server-side rendering for better SEO
  ssr: true,
  
  // Add meta tags
  app: {
    head: {
      title: 'Planning Poker',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Simple Sprint Planning Poker app for agile teams' }
      ]
    }
  }
})
