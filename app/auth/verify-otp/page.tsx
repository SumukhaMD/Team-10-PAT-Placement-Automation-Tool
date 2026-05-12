"use client"

import { useState, useRef, useEffect, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

function VerifyOTPContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""
  const { verifyOtp } = useAuth()

  const [isLoading, setIsLoading] = useState(false)
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [error, setError] = useState("")
  const [resendTimer, setResendTimer] = useState(60)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").slice(0, 6)
    if (!/^\d+$/.test(pastedData)) return

    const newOtp = [...otp]
    pastedData.split("").forEach((char, index) => {
      if (index < 6) newOtp[index] = char
    })
    setOtp(newOtp)

    const lastFilledIndex = Math.min(pastedData.length - 1, 5)
    inputRefs.current[lastFilledIndex]?.focus()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const otpValue = otp.join("")
    if (otpValue.length !== 6) {
      setError("Please enter the complete OTP")
      return
    }

    setIsLoading(true)

    try {
      const result = await verifyOtp(email, otpValue)

      if (result.success) {
        toast.success("Email verified! Please login.")
        router.push("/auth/login?verified=true")
      } else {
        setError(result.error || "OTP verification failed")
        toast.error(result.error || "OTP verification failed")
      }
    } catch {
      setError("An unexpected error occurred. Please try again.")
      toast.error("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    setResendTimer(60)
    try {
      await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      toast.info("A new OTP has been sent to your email")
    } catch {
      toast.error("Failed to resend OTP. Please try again.")
    }
  }

  return (
    <div className="space-y-6">
      <div className="lg:hidden flex items-center gap-2 mb-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <span className="text-lg font-bold text-primary-foreground">P</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">PlaceIT</span>
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-foreground">Verify your email</h1>
        <p className="text-muted-foreground mt-1">
          We&apos;ve sent a 6-digit code to{" "}
          <span className="font-medium text-foreground">{email || "your email"}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {error}
          </div>
        )}

        <div className="flex justify-center gap-3">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              disabled={isLoading}
              className="w-12 h-14 text-center text-xl font-semibold rounded-lg border border-border bg-background focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all disabled:opacity-50"
            />
          ))}
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify Email"
          )}
        </Button>
      </form>

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Didn&apos;t receive the code?{" "}
          {resendTimer > 0 ? (
            <span className="text-foreground">Resend in {resendTimer}s</span>
          ) : (
            <button
              onClick={handleResend}
              className="text-accent font-medium hover:underline"
            >
              Resend Code
            </button>
          )}
        </p>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/auth/register" className="text-accent font-medium hover:underline">
          Use a different email
        </Link>
      </p>
    </div>
  )
}

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <VerifyOTPContent />
    </Suspense>
  )
}
