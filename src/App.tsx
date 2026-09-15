import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from '@/auth/AuthProvider'
import { ToastProvider } from '@/components/feedback/ToastProvider'
import { ProfilesProvider } from '@/profiles/ProfilesProvider'
import { ThemeProvider } from '@/theme/ThemeProvider'
import { router } from '@/routes'

/**
 * Theme wraps everything so chrome and toasts follow appearance.
 * Toast → Auth → Profiles → Router.
 */
export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <ProfilesProvider>
            <RouterProvider router={router} />
          </ProfilesProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}
