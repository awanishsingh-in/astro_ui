import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/common/Button'
import { useToast } from '@/components/feedback/toast-context'
import { OtpInput } from '@/components/forms/OtpInput'
import { useAuth } from '@/auth/auth-context'
import { AuthLayout } from '@/layouts/AuthLayout'
import { paths } from '@/routes/paths'
import { toAppError } from '@/services/client'
import { formatCountdown, formatPhone } from '@/utils/format'

const RESEND_SECONDS = 30
/** How long the "SMS" takes to arrive, so autofill feels like a real message. */
const SMS_DELAY_MS = 1500

/** A3 / B3 / C3 / D3 — its own screen, with nothing behind it. */
export default function CodePage() {
  const { pending, verifyCode, sendCode } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS)

  const isSignUp = pending?.intent === 'sign-up'

  // Resend countdown. Restarts whenever a new code is sent.
  useEffect(() => {
    if (secondsLeft <= 0) return
    const timer = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [secondsLeft])

  /*
    Simulated SMS autofill. The field stays editable afterwards, so a wrong
    code can still be typed — that is how the invalid state is reached.

    The toast fires here and not inside a `setCode` updater: React may call an
    updater more than once, and a side effect in that position fires twice.
    `codeRef` lets the timeout read the current value without re-arming on
    every keystroke, and `autofilled` keeps it to once per sent code.
  */
  const expected = pending?.code
  const codeRef = useRef(code)
  codeRef.current = code
  const autofilled = useRef(false)

  useEffect(() => {
    if (!expected) return
    const timer = window.setTimeout(() => {
      if (autofilled.current || codeRef.current.length > 0) return
      autofilled.current = true
      setCode(expected)
      toast.success('Code filled from SMS')
    }, SMS_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [expected, toast])

  const submit = useCallback(
    async (candidate: string) => {
      if (candidate.length !== 6 || isVerifying) return

      setError(null)
      setIsVerifying(true)
      try {
        const user = await verifyCode(candidate)
        if (user) {
          // A returning account — nothing is re-entered.
          toast.success(`Welcome back, ${user.fullName.split(' ')[0]}`)
          navigate(paths.ask, { replace: true })
        } else {
          // Sign-up only: verified phone, birth details next.
          navigate(paths.birthDetails, { replace: true })
        }
      } catch (caught) {
        const appError = toAppError(caught)
        setError(appError.message)
        setCode('')
        // Sign-in with no account — send them to create one instead of
        // collecting birth details on the wrong flow.
        if (pending?.intent === 'sign-in' && appError.message.includes('No account')) {
          toast.info('Create an account first', {
            description: 'Birth details are only asked when you sign up.',
            duration: 7000,
          })
          navigate(paths.signUp, { replace: true })
        }
      } finally {
        setIsVerifying(false)
      }
    },
    [isVerifying, verifyCode, navigate, toast, pending],
  )

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    void submit(code)
  }

  const handleResend = async () => {
    if (!pending || secondsLeft > 0 || isResending) return
    setIsResending(true)
    setError(null)
    setCode('')
    autofilled.current = false
    try {
      const next = await sendCode(pending.phone, pending.intent)
      setSecondsLeft(RESEND_SECONDS)
      toast.info(`Your new code is ${next.code}`, {
        description: 'Demo only — a real account receives this by SMS.',
        duration: 12000,
      })
    } catch (caught) {
      toast.error('Could not resend the code', { description: toAppError(caught).message })
    } finally {
      setIsResending(false)
    }
  }

  // A guard keeps this screen unreachable without a pending code, so `pending`
  // is only ever null for the frame before that redirect lands.
  const phone = pending ? formatPhone(pending.phone) : ''

  return (
    <AuthLayout
      variant="adventure"
      backTo={isSignUp ? paths.signUp : paths.signIn}
      adventureHeadline="Your journey"
      adventureAccent="continues"
    >
      <form onSubmit={handleSubmit} noValidate className="flex w-full flex-col gap-7">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold uppercase tracking-tight text-white sm:text-4xl">
            Enter code
          </h1>
          <p className="text-sm text-white/55 text-pretty">
            Sent to <span className="font-mono text-white">{phone}</span>
            {' · '}
            <Link
              to={isSignUp ? paths.signUp : paths.signIn}
              className="font-semibold text-[#c4a0ff] hover:text-white"
            >
              Change
            </Link>
          </p>
        </header>

        <div className="space-y-2.5">
          <OtpInput
            value={code}
            onChange={(next) => {
              setCode(next)
              if (error) setError(null)
            }}
            onComplete={submit}
            invalid={Boolean(error)}
            disabled={isVerifying}
            autoFocus
            label="6-digit verification code"
            className="[&_input]:border-[#5b3d9a]/70 [&_input]:bg-[#140d2c] [&_input]:text-white [&_input]:focus:border-[#c4a0ff] [&_input]:focus:shadow-[0_0_0_3px_rgba(124,77,255,0.25)]"
          />

          {error ? (
            <p role="alert" className="text-xs text-critical">
              {error}
            </p>
          ) : (
            <p className="text-xs text-white/45">
              Auto-filled from SMS ·{' '}
              {secondsLeft > 0 ? (
                <>
                  resend in{' '}
                  <span className="font-mono text-data text-white">
                    {formatCountdown(secondsLeft)}
                  </span>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isResending}
                  className="font-semibold text-[#c4a0ff] hover:text-white disabled:text-white/30"
                >
                  {isResending ? 'Sending…' : 'Resend code'}
                </button>
              )}
            </p>
          )}
        </div>

        <Button
          type="submit"
          fullWidth
          size="lg"
          loading={isVerifying}
          disabled={code.length !== 6}
          className="mt-4 rounded-2xl border-0 bg-gradient-to-r from-[#7c4dff] to-[#3a7bd5] text-white shadow-[0_12px_32px_-12px_rgba(124,77,255,0.75)] hover:from-[#8b5cff] hover:to-[#4a8be5] focus-visible:outline-[#c4a0ff] sm:mt-6"
        >
          {isVerifying ? 'Verifying' : 'Verify'}
        </Button>
      </form>
    </AuthLayout>
  )
}
