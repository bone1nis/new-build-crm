import { MoonIcon, SunIcon } from '@/shared/assets'
import { Button } from '@/shared/ui'
import { THEME_LABEL } from '../../config/constants'
import { useThemeStore } from '../../model/store'

export const ThemeToggle = () => {
  const { theme, toggle } = useThemeStore()
  const label = THEME_LABEL[theme]

  return (
    <Button variant="ghost" aria-label={label} title={label} onClick={toggle}>
      {theme === 'dark' ? <SunIcon width={18} height={18} /> : <MoonIcon width={18} height={18} />}
    </Button>
  )
}
