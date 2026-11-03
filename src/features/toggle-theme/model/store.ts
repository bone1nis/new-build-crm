import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'light' | 'dark'

interface ThemeState {
  theme: Theme
  toggle: () => void
}

const systemTheme = (): Theme =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: systemTheme(),
      toggle: () => set(({ theme }) => ({ theme: theme === 'dark' ? 'light' : 'dark' })),
    }),
    { name: 'mini-crm.theme' },
  ),
)

const applyTheme = ({ theme }: ThemeState) => {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

applyTheme(useThemeStore.getState())
useThemeStore.subscribe(applyTheme)
