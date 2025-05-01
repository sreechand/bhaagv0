"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
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
    <div className="flex min-h-screen items-center justify-center bg-background relative">
      <Link 
        href="/" 
        className="absolute left-4 top-4 flex items-center text-primary hover:text-primary/80 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Home
      </Link>

      <form className="w-full max-w-md bg-card p-8 rounded-lg shadow-lg space-y-6" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        
        <div>
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            name="email" 
            type="email" 
            value={form.email} 
            onChange={handleChange} 
            required 
          />
        </div>

        <div className="relative">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input 
              id="password" 
              name="password" 
              type={showPassword ? "text" : "password"} 
              value={form.password} 
              onChange={handleChange} 
              required 
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {error && <div className="text-red-500 text-sm">{error}</div>}

        <Button 
          type="submit" 
          className="w-full hover:bg-primary/90 transition-colors" 
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </Button>

        <div className="text-sm text-center mt-2">
          <Link href="/auth/forgot-password" className="text-primary underline">Forgot password?</Link>
          {" | "}
          <Link href="/auth/signup" className="text-primary underline">Sign up</Link>
        </div>
      </form>
    </div>
  )
} 