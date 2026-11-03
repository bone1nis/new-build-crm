import './HomePage.scss'
import { ThemeToggle } from '@/features/toggle-theme'

export const HomePage = () => (
  <main className="home">
    <header className="home__header">
      <h1 className="home__title">Мини-CRM</h1>
      <ThemeToggle />
    </header>
    <p className="home__text">Объекты и задачи строительной компании.</p>
  </main>
)
