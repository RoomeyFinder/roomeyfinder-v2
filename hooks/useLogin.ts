"use client"

import { SubmitEventHandler, useCallback, useState } from "react"

export default function useLogin() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin: SubmitEventHandler = useCallback(
    async (e) => {
      e.preventDefault()
      if (!email || loading) return setError("Email is required")
      if (loading) return
      setLoading(true)
      setError("")
      setSuccess("")

      try {
        const response = await fetch("/auth/magic-link", {
          method: "POST",
          credentials: "same-origin",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        })

        const result = (await response.json()) as { error?: string }

        if (!response.ok) {
          setError(result.error ?? "Unable to send magic link")
          return
        }
        setEmail("")
        setSuccess("Check your email for the sign-in link.")
      } catch {
        setError("Unable to send magic link")
      } finally {
        setLoading(false)
      }
    },
    [email, loading],
  )

  return { email, setEmail, loading, handleLogin, error, success }
}
