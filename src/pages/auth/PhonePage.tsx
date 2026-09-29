import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/common/Button'
import { useToast } from '@/components/feedback/toast-context'
import { Field } from '@/components/forms/Field'
import { PhoneInput } from '@/components/forms/PhoneInput'
import { useAuth } from '@/auth/auth-context'
import { countryByIso, DEFAULT_COUNTRY_ISO } from '@/data/country-dials'
import { AuthLayout } from '@/layouts/AuthLayout'
import { paths } from '@/routes/paths'
import { normalisePhone, validatePhone } from '@/services/auth.service'
import { toAppError } from '@/services/client'
import type { AuthIntent } from '@/auth/auth-context'

const ADVENTURE_BTN_READY =
  'rounded-2xl border-0 bg-gradient-to-r from-[#7c4dff] to-[#3a7bd5] text-white shadow-[0_12px_32px_-12px_rgba(124,77,255,0.75)] hover:from-[#8b5cff] hover:to-[#4a8be5] active:from-[#6b3de8] active:to-[#2f6bc0] focus-visible:outline-[#c4a0ff]'

const ADVENTURE_BTN_DULL =
  'rounded-2xl border-0 bg-gradient-to-r from-[#7c4dff]/70 to-[#3a7bd5]/70 text-white shadow-[0_8px_24px_-14px_rgba(124,77,255,0.45)] hover:from-[#7c4dff]/70 hover:to-[#3a7bd5]/70'

/** Phone entry — adventure split with animated sky + purple/cyan form. */
export default function PhonePage({ intent }: { intent: AuthIntent }) {
  const { sendCode } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const [dialIso, setDialIso] = useState(DEFAULT_COUNTRY_ISO)
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)

  const isSignUp = intent === 'sign-up'
  const dial = countryByIso(dialIso)?.dial ?? '91'
  const digitCount = value.replace(/\D/g, '').length
  const phoneReady = dial === '91' ? digitCount === 10 : digitCount >= 6

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()

    const message = validatePhone(value, dial)
    if (message) {
      setError(message)
      return
    }

    const phone = normalisePhone(value, dial)
    if (!phone) {
      setError('That does not look like a valid mobile number.')
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

  const handleChange = (raw: string) => {
    const max = dial === '91' ? 10 : 12
    const digits = raw.replace(/\D/g, '').slice(0, max)
    if (dial === '91') {
      setValue(digits.length > 5 ? `${digits.slice(0, 5)} ${digits.slice(5)}` : digits)
    } else {
      setValue(digits)
    }
    if (error) setError(null)
  }

  return (
    <AuthLayout
      variant="adventure"
      backTo={paths.landing}
      adventureHeadline="Your journey"
      adventureAccent="begins here"
    >
      <form onSubmit={handleSubmit} noValidate className="flex w-full flex-col gap-7">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold uppercase tracking-tight text-white sm:text-4xl">
            {isSignUp ? 'Sign up' : 'Sign in'}
          </h1>
          <p className="text-sm text-white/55">Enter your phone number</p>
        </header>

        <Field
          label="Mobile number"
          appearance="plain"
          error={error ?? undefined}
          className="[&_label]:text-white [&_p]:text-white/45"
        >
          <PhoneInput
            autoFocus
            tone="adventure"
            placeholder={dial === '91' ? '98765 43210' : 'Phone number'}
            value={value}
            onChange={handleChange}
            dialIso={dialIso}
            onDialIsoChange={(iso) => {
              setDialIso(iso)
              setValue('')
              if (error) setError(null)
            }}
            disabled={isSending}
          />
        </Field>

        <div className="mt-4 space-y-5 sm:mt-6">
          <Button
            type="submit"
            variant="ghost"
            fullWidth
            size="lg"
            loading={isSending}
            disabled={!phoneReady || isSending}
            className={phoneReady ? ADVENTURE_BTN_READY : ADVENTURE_BTN_DULL}
          >
            {isSending ? 'Sending code' : isSignUp ? 'Sign up' : 'Send code'}
          </Button>

          <p className="text-center text-sm text-white/50">
            {isSignUp ? 'Already have an account? ' : 'New to Cyklos? '}
            <Link
              to={isSignUp ? paths.signIn : paths.signUp}
              className="font-semibold text-[#c4a0ff] hover:text-white"
            >
              {isSignUp ? 'Sign in' : 'Create an account'}
            </Link>
          </p>

          <p className="text-center text-xs text-white/35 text-pretty">
            By continuing you agree to our{' '}
            <span className="text-[#c4a0ff]">Terms and Conditions</span>
          </p>
        </div>
      </form>
    </AuthLayout>
  )
}
