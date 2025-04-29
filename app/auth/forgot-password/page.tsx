"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    if (resetError) {
      setError(resetError.message)
      setLoading(false)
      return
    }
    setSuccess("Password reset email sent! Please check your inbox.")
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <form className="w-full max-w-md bg-card p-8 rounded-lg shadow-lg space-y-6" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold mb-4">Forgot Password</h2>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        {success && <div className="text-green-500 text-sm">{success}</div>}
        <Button type="submit" className="w-full" disabled={loading}>{loading ? "Sending..." : "Send Reset Email"}</Button>
        <div className="text-sm text-center mt-2">
          <a href="/auth/login" className="text-primary underline">Back to Login</a> | <a href="/" className="text-primary underline">Back to Home</a>
        </div>
      </form>
    </div>
  )
} 