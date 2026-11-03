import { createBrowserRouter } from 'react-router'
import { LoginPage } from '@/pages/login'
import { NotFoundPage } from '@/pages/not-found'
import { ObjectsPage } from '@/pages/objects'
import { AppLayout } from '../layouts/AppLayout'
import { GuestOnly, RequireAuth } from './guards'

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
        children: [{ index: true, element: <ObjectsPage /> }],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
