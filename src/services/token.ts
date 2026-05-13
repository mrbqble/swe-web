const ACCESS_KEY = 'icare_admin_access'
const REFRESH_KEY = 'icare_admin_refresh'

export const token = {
  save: (access: string) => localStorage.setItem(ACCESS_KEY, access),
  get: (): string | null => localStorage.getItem(ACCESS_KEY),
  clear: () => {
    localStorage.removeItem(ACCESS_KEY)
    localStorage.removeItem(REFRESH_KEY)
  },
}
