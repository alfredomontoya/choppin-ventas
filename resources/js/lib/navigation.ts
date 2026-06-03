const STORAGE_KEY = 'return_url'

export function saveReturnUrl(url?: string): void {
  sessionStorage.setItem(STORAGE_KEY, url ?? window.location.href)
}

export function getReturnUrl(fallback: string): string {
  return sessionStorage.getItem(STORAGE_KEY) ?? fallback
}

export function clearReturnUrl(): void {
  sessionStorage.removeItem(STORAGE_KEY)
}
