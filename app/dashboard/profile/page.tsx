"use client"

import { useEffect, useState, useRef } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Database } from "@/types/supabase"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { ArrowLeft, UploadCloud, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

type Profile = Database['public']['Tables']['profiles']['Row']

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [originalAvatarUrl, setOriginalAvatarUrl] = useState<string | null>(null)
  const [form, setForm] = useState({ name: "", phone: "", height: "", weight: "" })
  const [saving, setSaving] = useState(false)
  const [unsaved, setUnsaved] = useState(false)
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [passwordSuccess, setPasswordSuccess] = useState("")
  const [passwordLoading, setPasswordLoading] = useState(false)

  // Track unsaved changes
  useEffect(() => {
    if (!profile) return
    const changed =
      form.name !== (profile.name || "") ||
      form.phone !== (profile.phone || "") ||
      form.height !== (profile.height?.toString() || "") ||
      form.weight !== (profile.weight?.toString() || "") ||
      avatarFile !== null ||
      avatarPreview !== originalAvatarUrl
    setUnsaved(changed)
  }, [form, avatarFile, avatarPreview, originalAvatarUrl, profile])

  // Add beforeunload event for unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (unsaved) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [unsaved])

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true)
      const { data: sessionData } = await supabase.auth.getSession()
      const session = sessionData?.session
      if (!session) {
        router.replace("/auth/login")
        return
      }
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", String(session.user.id) as any)
        .maybeSingle()
      if (error || !data || typeof data !== 'object' || !('id' in data)) {
        setLoading(false)
        return
      }
      const profileData = data as Profile
      setProfile(profileData)
      setForm({
        name: profileData.name || "",
        phone: profileData.phone || "",
        height: profileData.height?.toString() || "",
        weight: profileData.weight?.toString() || "",
      })
      setAvatarPreview((profileData.avatar_url ?? null) as string | null)
      setOriginalAvatarUrl((profileData.avatar_url ?? null) as string | null)
      setLoading(false)
    }
    fetchProfile()
  }, [router])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  const uploadAvatar = async () => {
    if (!avatarFile || !profile) return null
    setAvatarUploading(true)
    // Delete old avatar if present
    if (profile.avatar_url) {
      try {
        const url = new URL(profile.avatar_url)
        const path = url.pathname.split('/').slice(3).join('/')
        await supabase.storage.from('avatars').remove([path])
      } catch {}
    }
    const fileExt = avatarFile.name.split('.').pop()
    const filePath = `${profile.id}/avatar.${fileExt}`
    const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, avatarFile, { upsert: true })
    if (uploadError) {
      setAvatarUploading(false)
      return null
    }
    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
    setAvatarUploading(false)
    // Add cache-busting param
    return data.publicUrl ? `${data.publicUrl}?t=${Date.now()}` : null
  }

  const removeAvatar = async () => {
    if (!profile || !profile.avatar_url) return
    // Extract file path from public URL
    const url = new URL(profile.avatar_url)
    const path = url.pathname.split('/').slice(3).join('/')
    await supabase.storage.from('avatars').remove([path])
    // Update profile
    const updatePayload: Database['public']['Tables']['profiles']['Update'] = { avatar_url: null }
    const { data, error } = await supabase
      .from("profiles")
      .update(updatePayload as any)
      .eq("id", profile.id as any)
      .select()
      .maybeSingle()
    if (!error && data && typeof data === 'object' && 'id' in data) {
      setProfile(data as Profile)
      setAvatarPreview(null)
      setAvatarFile(null)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    let avatar_url = profile?.avatar_url || null
    if (avatarFile) {
      const url = await uploadAvatar()
      if (url) avatar_url = url
    }
    const updatePayload: Database['public']['Tables']['profiles']['Update'] = {
      name: form.name,
      phone: form.phone,
      height: form.height ? Number(form.height) : null,
      weight: form.weight ? Number(form.weight) : null,
      avatar_url,
    }
    const { data, error } = await supabase
      .from("profiles")
      .update(updatePayload as any)
      .eq("id", profile?.id as any)
      .select()
      .maybeSingle()
    if (!error && data && typeof data === 'object' && 'id' in data) {
      setProfile(data as Profile)
      setAvatarFile(null)
      setAvatarPreview(data.avatar_url)
      setUnsaved(false)
      setTimeout(() => router.push('/dashboard'), 500)
    }
    setSaving(false)
  }

  const handleBack = () => {
    if (unsaved) {
      setShowUnsavedWarning(true)
    } else {
      router.push('/dashboard')
    }
  }

  const handlePasswordChange = async () => {
    setPasswordError("")
    setPasswordSuccess("")
    if (!password || password.length < 6) {
      setPasswordError("Password must be at least 6 characters.")
      return
    }
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match.")
      return
    }
    setPasswordLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setPasswordLoading(false)
    if (error) {
      setPasswordError(error.message)
    } else {
      setPasswordSuccess("Password changed successfully!")
      setTimeout(() => setShowPasswordModal(false), 1200)
      setPassword("")
      setConfirmPassword("")
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center bg-black/90 px-4 py-12"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div className="w-full max-w-md bg-black/80 rounded-2xl shadow-lg p-8 border border-white/10">
        <div className="flex items-center mb-8">
          <Button variant="ghost" size="icon" onClick={handleBack} className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-3xl font-exo font-black text-white">Your Profile</h2>
        </div>
        <div className="flex flex-col items-center mb-6">
          <div className="relative group mb-2">
            {avatarPreview ? (
              <Image src={avatarPreview} alt="Avatar" width={96} height={96} className="rounded-full border-4 border-primary object-cover aspect-square" style={{width: 96, height: 96}} />
            ) : (
              <div className="flex items-center justify-center h-24 w-24 rounded-full bg-black/50 border-4 border-primary text-primary font-exo text-3xl">
                {profile?.name ? profile.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2) : 'U'}
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleAvatarChange}
            />
            <Button
              variant="secondary"
              size="icon"
              className="absolute bottom-0 right-0 rounded-full border-2 border-primary bg-primary/80 hover:bg-primary"
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarUploading}
            >
              <UploadCloud className="h-5 w-5" />
            </Button>
            {avatarPreview && (
              <Button
                variant="destructive"
                size="icon"
                className="absolute bottom-0 left-0 rounded-full border-2 border-primary bg-red-600 hover:bg-red-700"
                onClick={removeAvatar}
                disabled={avatarUploading}
                type="button"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            )}
          </div>
          <p className="text-gray-400 font-barlow text-sm">Change your avatar</p>
        </div>
        <form className="space-y-5" onSubmit={e => { e.preventDefault(); handleSave() }}>
          <div>
            <label className="block text-white font-barlow mb-1">Name</label>
            <input
              type="text"
              className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2 text-white font-barlow focus:outline-none focus:ring-2 focus:ring-primary"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-white font-barlow mb-1">Phone</label>
            <input
              type="tel"
              className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2 text-white font-barlow focus:outline-none focus:ring-2 focus:ring-primary"
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            />
          </div>
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-white font-barlow mb-1">Height (cm)</label>
              <input
                type="number"
                min="0"
                className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2 text-white font-barlow focus:outline-none focus:ring-2 focus:ring-primary"
                value={form.height}
                onChange={e => setForm(f => ({ ...f, height: e.target.value }))}
              />
            </div>
            <div className="flex-1">
              <label className="block text-white font-barlow mb-1">Weight (kg)</label>
              <input
                type="number"
                min="0"
                className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2 text-white font-barlow focus:outline-none focus:ring-2 focus:ring-primary"
                value={form.weight}
                onChange={e => setForm(f => ({ ...f, weight: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex flex-col space-y-2">
            <label className="block text-white font-barlow mb-1">Password</label>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setShowPasswordModal(true)}
            >
              Change Password
            </Button>
          </div>
          <Button
            type="submit"
            className="w-full btn-primary text-lg font-barlow mt-4"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
        {showUnsavedWarning && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
            <div className="bg-yellow-900 border border-yellow-600 rounded-lg text-yellow-200 p-8 flex flex-col items-center shadow-xl">
              <span className="mb-4 text-lg font-bold">You have unsaved changes. Are you sure you want to leave?</span>
              <div className="flex space-x-4">
                <Button variant="destructive" onClick={() => router.push('/dashboard')}>Leave Anyway</Button>
                <Button variant="secondary" onClick={() => setShowUnsavedWarning(false)}>Stay</Button>
              </div>
            </div>
          </div>
        )}
        {unsaved && !showUnsavedWarning && (
          <div className="mt-4 text-yellow-400 text-center font-barlow">You have unsaved changes.</div>
        )}
      </motion.div>
      {/* Change Password Modal */}
      <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
        <DialogContent className="bg-black/90 border border-primary/30">
          <DialogHeader>
            <DialogTitle className="text-white">Change Password</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col space-y-4 mt-2">
            <input
              type="password"
              className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2 text-white font-barlow focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="New password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              minLength={6}
            />
            <input
              type="password"
              className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2 text-white font-barlow focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              minLength={6}
            />
            {passwordError && <div className="text-red-400 text-sm font-barlow">{passwordError}</div>}
            {passwordSuccess && <div className="text-green-400 text-sm font-barlow">{passwordSuccess}</div>}
          </div>
          <DialogFooter className="mt-4">
            <Button variant="secondary" onClick={() => setShowPasswordModal(false)} disabled={passwordLoading}>Cancel</Button>
            <Button onClick={handlePasswordChange} disabled={passwordLoading} className="btn-primary">{passwordLoading ? 'Saving...' : 'Change Password'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
} 