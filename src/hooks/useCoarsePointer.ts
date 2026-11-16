import { useMediaQuery } from './useMediaQuery.ts'

/**
 * True on touch first devices. Pointer driven 3D tilt is switched off there,
 * so a card can never be left stuck at an angle while the page scrolls.
 */
export function useCoarsePointer(): boolean {
  return useMediaQuery('(pointer: coarse)')
}
