// https://www.shadcn-vue.com/docs/installation/nuxt#add-a-nuxt-plugin-for-providing-ssrwidth-optional

import { provideSSRWidth } from '@vueuse/core'

export default defineNuxtPlugin((nuxtApp) => {
  provideSSRWidth(1024, nuxtApp.vueApp)
})
