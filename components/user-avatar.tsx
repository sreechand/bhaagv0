import { User } from "@supabase/supabase-js"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

interface UserAvatarProps {
  user: User
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
  xl: "h-24 w-24"
}

export default function UserAvatar({ user, size = "md", className = "" }: UserAvatarProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getProfile() {
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', user.id)
          .single()

        if (error) {
          console.error('Error fetching profile:', error)
          return
        }

        if (profile?.avatar_url) {
          setAvatarUrl(profile.avatar_url)
        }
      } catch (error) {
        console.error('Error fetching avatar:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user?.id) {
      getProfile()
    }
  }, [user])

  // Get initials from user's email or name
  const getInitials = () => {
    const name = user.user_metadata?.name || user.email || ''
    return name
      .split(' ')
      .map((part: string) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (!user) return null

  return (
    <Avatar className={`${sizeClasses[size]} ${className} ring-2 ring-primary/20`}>
      <AvatarImage 
        src={avatarUrl || ''} 
        alt={user.user_metadata?.name || user.email || 'User'} 
        className="object-cover"
      />
      <AvatarFallback 
        className="bg-black/50 text-primary font-medium"
        delayMs={loading ? 1500 : 0}
      >
        {loading ? '...' : getInitials()}
      </AvatarFallback>
    </Avatar>
  )
} 