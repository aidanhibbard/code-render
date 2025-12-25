// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/hints',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxt/test-utils',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode',
    '@nuxtjs/device',
    '@pinia/nuxt',
    'shadcn-nuxt',
    'nuxt-shiki',
  ],
  devtools: { enabled: true },
  app: {
    pageTransition: {
      mode: 'out-in',
      name: 'page',
    },
  },
  css: [
    '~/assets/styles/css/tailwind.css',
    '~/assets/styles/css/main.css',
  ],
  colorMode: {
    classSuffix: '',
  },
  compatibilityDate: '2025-07-15',
  typescript: {
    strict: true,
    typeCheck: true,
  },
  eslint: {
    config: {
      stylistic: {
        quotes: 'single',
      },
    },
    checker: true,
  },
  shadcn: {
    prefix: '',
    componentDir: './app/components/shadcn/ui',
  },
})
