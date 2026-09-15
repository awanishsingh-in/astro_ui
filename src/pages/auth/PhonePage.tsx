import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/common/Button'
import { useToast } from '@/components/feedback/toast-context'
import { Field } from '@/components/forms/Field'
import { PhoneInput } from '@/components/forms/PhoneInput'
import { useAuth } from '@/auth/auth-context'
import { AuthLayout } from '@/layouts/AuthLayout'
import { paths } from '@/routes/paths'
import { normalisePhone, validatePhone } from '@/services/auth.service'
import { toAppError } from '@/services/client'
import type { AuthIntent } from '@/auth/auth-context'
import { PANEL_BODY, SIGNIN_PANEL_TITLE, SIGNIN_STEPS, SIGNUP_PANEL_TITLE, SIGNUP_STEPS } from './flow'

/** A2 / B2 / C2 / D2 — one screen, entered from either landing control. */
export default function PhonePage({ intent }: { intent: AuthIntent }) {
  const { sendCode } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)

  const isSignUp = intent === 'sign-up'

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()

    const message = validatePhone(value)
    if (message) {
      setError(message)
      return
    }

    const phone = normalisePhone(value)
    if (!phone) {
      setError('That does not look like an Indian mobile number.')
      return
    }

    setError(null)
    setIsSending(true)
    try {
      const pending = await sendCode(phone, intent)
      toast.info(`Your code is ${pending.code}`, {
        description: 'Demo only — a real account receives this by SMS.',
        duration: 12000,
      })
      navigate(paths.verify)
    } catch (caught) {
      const appError = toAppError(caught)
      setError(appError.message)
      toast.error('Could not send the code', { description: appError.message })
    } finally {
      setIsSending(false)
    }
  }

  // Group as 5 + 5 while typing, the way the number is read aloud.
  const handleChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 10)
    setValue(digits.length > 5 ? `${digits.slice(0, 5)} ${digits.slice(5)}` : digits)
    if (error) setError(null)
  }

  return (
    <AuthLayout
      steps={isSignUp ? SIGNUP_STEPS : SIGNIN_STEPS}
      currentStep={0}
      panelTitle={isSignUp ? SIGNUP_PANEL_TITLE : SIGNIN_PANEL_TITLE}
      panelBody={<p>{PANEL_BODY}</p>}
      backTo={paths.landing}
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-7">
        <header className="space-y-2">
          <h1 className="text-title font-semibold text-ink text-balance lg:text-title-lg">
            Your mobile number
          </h1>
          <p className="text-sub text-muted text-pretty">
            We send a 6-digit code to confirm it. This number is how you sign in later.
          </p>
        </header>

        <Field
          label="Mobile number"
          error={error ?? undefined}
          help="No password — you sign in with a code each time."
        >
          <PhoneInput
            autoFocus
            placeholder="98765 43210"
            value={value}
            onChange={(event) => handleChange(event.target.value)}
            disabled={isSending}
          />
        </Field>

        <div className="space-y-4">
          <Button type="submit" fullWidth loading={isSending}>
            {isSending ? 'Sending code' : 'Send code'}
          </Button>

          <p className="text-center text-sm text-muted lg:text-left">
            {isSignUp ? 'Already have an account? ' : 'New to Cyklos? '}
            <Link
              to={isSignUp ? paths.signIn : paths.signUp}
              className="font-semibold text-navy hover:text-gold-deep"
            >
              {isSignUp ? 'Sign in' : 'Create an account'}
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  )
}
