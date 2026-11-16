/**
 * Development only switch for testing reduced motion without changing the
 * operating system setting: open the site with ?motion=reduce.
 * In production this is always false and the OS preference decides.
 */
export const forcedReducedMotion: boolean =
  import.meta.env.DEV &&
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).get('motion') === 'reduce'
