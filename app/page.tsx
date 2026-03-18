'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { estaLogado } from '@/lib/auth'

export default function RootPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace(estaLogado() ? '/dashboard' : '/login')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-brand-teal border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
