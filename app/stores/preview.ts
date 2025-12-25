export const usePreviewStore = defineStore('preview', () => {
  // Used for exported filenames.
  const fileName = ref('Untitled-1')

  return {
    fileName,
  }
})
