// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  css:[
    '~/assets/style.scss'
  ],
  ssr: false,
  devtools: { enabled: false },
  modules: [
    '@element-plus/nuxt',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/supabase',
    'nuxt-lodash'
  ],
  lodash: {
    prefix: "_",
    prefixSkip: ["string"],
    upperAfterPrefix: false,
    exclude: ["map"],
    alias: [
      ["camelCase", "stringToCamelCase"], // => stringToCamelCase
      ["kebabCase", "stringToKebab"], // => stringToKebab
      ["isDate", "isLodashDate"], // => _isLodashDate
    ],
  },
  components: {
    global: true,
    dirs: ['~/components']
  }
})