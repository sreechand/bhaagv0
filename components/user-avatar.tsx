"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { LogOut, User, Settings, UserCircle } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Database } from "@/types/supabase"
import { useRouter } from "next/navigation"
import Image from "next/image"

type Profile = Database['public']['Tables']['profiles']['Row']

interface UserAvatarProps {
  onSignOut: () => Promise<void>
}

export default function UserAvatar({ onSignOut }: UserAvatarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [userProfile, setUserProfile] = useState<Profile | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        // Get user profile from localStorage or fetch it
        const storedProfile = localStorage.getItem('userProfile')
        let profile: Profile | null = null
        if (storedProfile) {
          profile = JSON.parse(storedProfile)
          setUserProfile(profile)
        } else {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
          if (error) {
            console.error('Error fetching profile:', error)
            return
          }
          if (data) {
            profile = data as Profile
            localStorage.setItem('userProfile', JSON.stringify(profile))
            setUserProfile(profile)
          }
        }
        // Use avatar_url from profile if present and non-empty
        if (profile && profile.avatar_url && profile.avatar_url.trim() !== "") {
          setAvatarUrl(profile.avatar_url)
        } else {
          setAvatarUrl(null)
        }
      }
    }
    fetchUserData()
  }, [supabase])

  const getInitials = (name: string | null) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full bg-black/50 border border-primary/50 hover:bg-primary/10 p-0 flex items-center justify-center"
        >
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt="User avatar"
              width={40}
              height={40}
              className="rounded-full object-cover border-2 border-primary"
              onError={() => setAvatarUrl(null)}
            />
          ) : (
            <span className="flex items-center justify-center h-10 w-10 rounded-full bg-black/50 border-2 border-primary text-primary font-semibold text-lg select-none">
              {getInitials(userProfile?.name ?? null)}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56 bg-black/90 backdrop-blur-md border border-white/10"
        align="end"
      >
        <DropdownMenuLabel className="text-white">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userProfile?.name || 'User'}</p>
            <p className="text-xs leading-none text-gray-400">{userProfile?.email || 'No email'}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem
          className="text-white hover:bg-primary/10 hover:text-primary cursor-pointer"
          onClick={() => router.push('/dashboard/profile')}
        >
          <UserCircle className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-white hover:bg-primary/10 hover:text-primary cursor-pointer"
          onClick={() => router.push('/dashboard/settings')}
        >
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem
          className="text-white hover:bg-primary/10 hover:text-primary cursor-pointer"
          onClick={onSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 