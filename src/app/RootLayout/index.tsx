import { Analytics } from '@vercel/analytics/react'
import { Suspense } from 'react'
import { Outlet, ScrollRestoration } from 'react-router'

export default function RootLayout() {
  return (
    <>
      <Suspense fallback={<div className="app-loading" />}>
        <Outlet />
      </Suspense>
      <ScrollRestoration />
      <Analytics />
    </>
  )
}
