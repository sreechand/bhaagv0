"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

export default function SignupPage() {
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "", avatar: null })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  const handleChange = (e: any) => {
    const { name, value, files } = e.target
    if (name === "avatar") {
      setForm((f) => ({ ...f, avatar: files[0] }))
    } else {
      setForm((f) => ({ ...f, [name]: value }))
    }
  }

  const passwordValid = (password: string) => {
    // At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(password)
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")
    if (!passwordValid(form.password)) {
      setError("Password does not meet requirements.")
      setLoading(false)
      return
    }
    // Sign up with Supabase
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { name: form.name, phone: form.phone },
        emailRedirectTo: `${window.location.origin}/auth/login`
      }
    })
    if (signUpError) {
      if (signUpError.message.includes("duplicate key value") || signUpError.message.includes("already registered")) {
        setError("Email or phone already registered. Please use a different one or login.")
      } else {
        setError(signUpError.message)
      }
      setLoading(false)
      return
    }
    // Optionally upload avatar
    if (form.avatar) {
      const { error: uploadError } = await supabase.storage.from("avatars").upload(`public/${form.email}`, form.avatar)
      if (uploadError) {
        setError("Signup succeeded, but avatar upload failed.")
        setLoading(false)
        return
      }
    }
    setSuccess("Signup successful! Please check your email to verify your account.")
    setLoading(false)
    setTimeout(() => router.push("/auth/login"), 2000)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <form className="w-full max-w-md bg-card p-8 rounded-lg shadow-lg space-y-6" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold mb-4">Sign Up</h2>
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" value={form.name} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" value={form.phone} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" value={form.password} onChange={handleChange} required />
          <div className="text-xs text-gray-400 mt-1">Password must be at least 8 characters, include 1 uppercase, 1 lowercase, 1 number, and 1 special character.</div>
        </div>
        <div>
          <Label htmlFor="avatar">Avatar (optional)</Label>
          <Input id="avatar" name="avatar" type="file" accept="image/*" onChange={handleChange} />
        </div>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        {success && <div className="text-green-500 text-sm">{success}</div>}
        <Button type="submit" className="w-full" disabled={loading}>{loading ? "Signing up..." : "Sign Up"}</Button>
        <div className="text-sm text-center mt-2">Already have an account? <a href="/auth/login" className="text-primary underline">Login</a></div>
        <div className="text-sm text-center mt-2">
          <a href="/" className="text-primary underline">Back to Home</a>
        </div>
      </form>
    </div>
  )
} 