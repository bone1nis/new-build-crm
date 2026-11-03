import { Moon, Sun } from 'lucide-react'
import { Button } from '@/shared/ui'
import { THEME_LABEL } from '../../config/constants'
import { useThemeStore } from '../../model/store'

export const ThemeToggle = () => {
  const { theme, toggle } = useThemeStore()
  const label = THEME_LABEL[theme]

  return (
    <Button variant="ghost" size="icon" aria-label={label} title={label} onClick={toggle}>
      {theme === 'dark' ? <Sun /> : <Moon />}
    </Button>
  )
}
