/**
 * Resolves a file under public/ against the configured base path, so the
 * site works at the domain root and under a project path alike.
 * Data files store base-less paths such as "images/profile-avatar.webp".
 */
export function asset(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`
}
