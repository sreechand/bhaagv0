"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleChange = (e: any) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    })
    if (loginError) {
      setError(loginError.message)
      setLoading(false)
      return
    }
    setLoading(false)
    router.push("/")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <form className="w-full max-w-md bg-card p-8 rounded-lg shadow-lg space-y-6" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" value={form.password} onChange={handleChange} required />
        </div>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <Button type="submit" className="w-full" disabled={loading}>{loading ? "Logging in..." : "Login"}</Button>
        <div className="text-sm text-center mt-2">
          <a href="/auth/forgot-password" className="text-primary underline">Forgot password?</a> | <a href="/auth/signup" className="text-primary underline">Sign up</a>
        </div>
        <div className="text-sm text-center mt-2">
          <a href="/" className="text-primary underline">Back to Home</a>
        </div>
      </form>
    </div>
  )
} 