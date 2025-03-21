export const getResourceName = (resourceUrl: string) => {
  return resourceUrl.split('.')[resourceUrl.split('.').length - 2].split('/').pop()
}