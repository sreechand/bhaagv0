"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import { Eye, EyeOff, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function SignupPage() {
  const [form, setForm] = useState({ 
    name: "", 
    phone: "", 
    email: "", 
    password: "", 
    confirmPassword: "",
    avatar: null 
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()

  const handleChange = (e: any) => {
    const { name, value, files } = e.target
    if (name === "avatar") {
      setForm((f) => ({ ...f, avatar: files[0] }))
    } else {
      setForm((f) => ({ ...f, [name]: value }))
    }
  }

  const handlePhoneChange = (value: string | undefined) => {
    setForm(f => ({ ...f, phone: value || "" }))
  }

  const passwordValid = (password: string) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(password)
  }

  const validateForm = async () => {
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match")
      return false
    }

    if (!passwordValid(form.password)) {
      setError("Password does not meet requirements")
      return false
    }

    // Check for existing email
    const { data: emailExists } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', form.email)
      .single()

    if (emailExists) {
      setError("This email is already registered. Please login instead.")
      return false
    }

    // Check for existing phone
    const { data: phoneExists } = await supabase
      .from('profiles')
      .select('phone')
      .eq('phone', form.phone)
      .single()

    if (phoneExists) {
      setError("This phone number is already linked to another account")
      return false
    }

    return true
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    const isValid = await validateForm()
    if (!isValid) {
      setLoading(false)
      return
    }

    // Sign up with Supabase
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { 
          name: form.name, 
          phone: form.phone 
        },
        emailRedirectTo: `${window.location.origin}/auth/login`
      }
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    // Optionally upload avatar
    if (form.avatar) {
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(`public/${form.email}`, form.avatar)
      
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
    <div className="flex min-h-screen items-center justify-center bg-background relative">
      <Link 
        href="/" 
        className="absolute left-4 top-4 flex items-center text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Home
      </Link>

      <form className="w-full max-w-md bg-card p-8 rounded-lg shadow-lg space-y-6" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold mb-4">Sign Up</h2>
        
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" value={form.name} onChange={handleChange} required />
        </div>

        <div>
          <Label htmlFor="phone">Phone</Label>
          <div className="phone-input-container">
            <PhoneInput
              international
              countryCallingCodeEditable={false}
              defaultCountry="IN"
              value={form.phone}
              onChange={handlePhoneChange}
              className="phone-input"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
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
          <div className="text-xs text-gray-400 mt-1">
            Password must be at least 8 characters, include 1 uppercase, 1 lowercase, 1 number, and 1 special character.
          </div>
        </div>

        <div className="relative">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative">
            <Input 
              id="confirmPassword" 
              name="confirmPassword" 
              type={showConfirmPassword ? "text" : "password"} 
              value={form.confirmPassword} 
              onChange={handleChange} 
              required 
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div>
          <Label htmlFor="avatar">Avatar (optional)</Label>
          <Input id="avatar" name="avatar" type="file" accept="image/*" onChange={handleChange} />
        </div>

        {error && <div className="text-red-500 text-sm">{error}</div>}
        {success && <div className="text-green-500 text-sm">{success}</div>}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing up..." : "Sign Up"}
        </Button>

        <div className="text-sm text-center mt-2">
          Already have an account? <Link href="/auth/login" className="text-primary underline">Login</Link>
        </div>
      </form>

      <style jsx global>{`
        .phone-input-container .PhoneInput {
          display: flex;
          align-items: center;
          border: 1px solid hsl(var(--input));
          border-radius: 0.375rem;
          padding: 0.375rem;
          background: hsl(var(--background));
        }
        .phone-input-container .PhoneInputCountry {
          margin-right: 0.5rem;
        }
        .phone-input-container .PhoneInputInput {
          border: none;
          padding: 0.25rem;
          outline: none;
          background: transparent;
          width: 100%;
        }
        .phone-input-container .PhoneInputCountrySelect {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: 100%;
          z-index: 1;
          border: 0;
          opacity: 0;
          cursor: pointer;
        }
      `}</style>
    </div>
  )
} 