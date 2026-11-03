# Мини-CRM «Объекты и задачи»

CRM для строительной компании: постановщик ставит задачи по объектам (стройкам), исполнитель берёт их в работу и отправляет на проверку. Демо: (подставить после деплоя)

Стек: React 19 · TypeScript · Vite · Tailwind CSS v4 · shadcn/ui · React Hook Form + Zod · TanStack Query · React Router · Supabase (Postgres, Auth, RLS) · Vitest · pgTAP

## Запуск

Нужны Node >= 20.19 (`nvm use`), pnpm и проект Supabase на бесплатном тарифе. Docker нужен только для pgTAP-тестов.

1. Создайте проект в Supabase. В Authentication -> Sign In / Providers выключите **Allow new users to sign up** и **Confirm email**.
2. В Authentication -> Users создайте трёх пользователей (Auto Confirm User, пароли любые):
   - `manager@test.com` - постановщик;
   - `user1@test.com`, `user2@test.com` - исполнители.
3. Примените миграции и демо-данные (пользователи должны существовать до этого шага):

   ```bash
   pnpm install
   pnpm exec supabase link --project-ref <ref>
   pnpm db:push -- --include-seed
   ```

   Seed назначает роли по email и создаёт 3 объекта и 8 задач во всех статусах с историей.

4. Впишите в `.env.local` значения из Project Settings -> API Keys:

   ```bash
   cp .env.example .env.local
   ```

   Нужны только `VITE_SUPABASE_URL` и `VITE_SUPABASE_PUBLISHABLE_KEY`. Ключи `secret` и `service_role` не используются.

5. Запустите приложение:

   ```bash
   pnpm dev
   ```

Пароли тестовых пользователей передаются вместе со ссылкой на приложение.

## Команды

| Команда                          | Что делает                                          |
| -------------------------------- | --------------------------------------------------- |
| `pnpm dev`                       | dev-сервер                                          |
| `pnpm lint`                      | ESLint                                              |
| `pnpm typecheck`                 | проверка типов                                      |
| `pnpm test`                      | unit-тесты Vitest (43)                              |
| `pnpm build`                     | типы и production-сборка в `dist`                   |
| `pnpm db:start` / `pnpm db:stop` | локальный Supabase в Docker                         |
| `pnpm db:test`                   | pgTAP-тесты безопасности на локальной базе (59)     |
| `pnpm db:push`                   | применить миграции к связанному проекту             |
| `pnpm db:types`                  | перегенерировать `src/shared/api/database.types.ts` |

## Безопасность

Все правила доступа проверяются в базе, интерфейс их только отражает: RLS на всех таблицах, права на колонки, смена статуса только через RPC `change_task_status`, история статусов недоступна для записи, регистрация отключена, секретных ключей в репозитории нет. Миграции: [supabase/migrations](supabase/migrations), тесты: [supabase/tests](supabase/tests).

## Деплой

Netlify или Vercel: команда сборки `pnpm build`, папка `dist`, переменные `VITE_SUPABASE_URL` и `VITE_SUPABASE_PUBLISHABLE_KEY`. В `netlify.toml` уже настроены сборка и редирект для SPA.
