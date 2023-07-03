// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    '@element-plus/nuxt',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/supabase'
  ],
  runtimeConfig: {
    public: {
      supabaseUrl: 'https://atfvdnnepdccfaibthpd.supabase.co',
      supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0ZnZkbm5lcGRjY2ZhaWJ0aHBkIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODgzNjcwMDksImV4cCI6MjAwMzk0MzAwOX0.G5hbhxxzL2WZ8PbyYz2aGNGQfVoirPO6eYEOorhNmdo',
    }
  }
})