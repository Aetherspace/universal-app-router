// -i- Automatically generated by 'npx turbo @green-stack/core#link:routes', do not modify manually, it will get overwritten
export const routeManifest = {
  ['/images']: 'ImagesScreen',
  ['/']: 'HomeScreen',
  ['/subpages/[slug]']: 'SlugScreen',
} as const

// eslint-disable-next-line @typescript-eslint/ban-types
export type KnownRoutes = keyof typeof routeManifest | (string & {})