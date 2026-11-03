# Мини-CRM «Объекты и задачи»

CRM для строительной компании: постановщик ставит задачи по объектам, исполнитель берёт их в работу и отправляет на проверку.

Стек: React 19 · TypeScript · Vite · Tailwind CSS · shadcn/ui · React Hook Form · Zod · Supabase · TanStack Query · React Router · Vitest.

## Запуск

Нужны Node ≥ 20.19 и [pnpm](https://pnpm.io).

```bash
nvm use
pnpm install
cp .env.example .env.local   # вписать URL и publishable key проекта Supabase
pnpm dev
```

## Команды

`pnpm lint` · `pnpm typecheck` · `pnpm test` · `pnpm build` · `pnpm format`

Архитектура и правила - в [CLAUDE.md](CLAUDE.md). База данных, безопасность и допущения будут описаны по мере готовности этапов.
