import { createBrowserRouter } from 'react-router'
import { NotFoundPage } from '@/pages/not-found'
import { AppLayout } from '../layouts/AppLayout'
import { GuestOnly, RequireAuth, RequireRole } from './guards'

export const router = createBrowserRouter([
  {
    element: <GuestOnly />,
    children: [
      {
        path: '/login',
        lazy: async () => ({ Component: (await import('@/pages/login')).LoginPage }),
      },
    ],
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            index: true,
            lazy: async () => ({ Component: (await import('@/pages/objects')).ObjectsPage }),
          },
          {
            path: 'objects/:objectId',
            lazy: async () => ({
              Component: (await import('@/pages/object-details')).ObjectDetailsPage,
            }),
          },
          {
            path: 'tasks/:taskId',
            lazy: async () => ({
              Component: (await import('@/pages/task-details')).TaskDetailsPage,
            }),
          },
          {
            element: <RequireRole role="executor" />,
            children: [
              {
                path: 'my-tasks',
                lazy: async () => ({ Component: (await import('@/pages/my-tasks')).MyTasksPage }),
              },
            ],
          },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
