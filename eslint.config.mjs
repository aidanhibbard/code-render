// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt()
  .append({
    name: 'local/ignores',
    ignores: ['app/components/shadcn/**'],
  })
