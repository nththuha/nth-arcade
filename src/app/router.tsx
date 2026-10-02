import Dashboard from '@/dashboard'
import { GAMES } from '@/games/registry'
import { Navigate, createBrowserRouter } from 'react-router'
import RootLayout from './RootLayout'

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <Dashboard /> },
      ...GAMES.map(({ path, Component }) => ({ path, element: <Component /> })),
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])
