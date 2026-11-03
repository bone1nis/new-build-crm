import { createBrowserRouter } from 'react-router'
import { LoginPage } from '@/pages/login'
import { MyTasksPage } from '@/pages/my-tasks'
import { NotFoundPage } from '@/pages/not-found'
import { ObjectDetailsPage } from '@/pages/object-details'
import { ObjectsPage } from '@/pages/objects'
import { TaskDetailsPage } from '@/pages/task-details'
import { AppLayout } from '../layouts/AppLayout'
import { GuestOnly, RequireAuth, RequireRole } from './guards'

export const router = createBrowserRouter([
  {
    element: <GuestOnly />,
    children: [{ path: '/login', element: <LoginPage /> }],
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <ObjectsPage /> },
          { path: 'objects/:objectId', element: <ObjectDetailsPage /> },
          { path: 'tasks/:taskId', element: <TaskDetailsPage /> },
          {
            element: <RequireRole role="executor" />,
            children: [{ path: 'my-tasks', element: <MyTasksPage /> }],
          },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
