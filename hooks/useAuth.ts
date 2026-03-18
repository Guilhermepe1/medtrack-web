'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSessao, estaLogado, encerrarSessao, SessaoUsuario } from '@/lib/auth'

export function useAuth(redirecionar = true) {
  const router  = useRouter()
  const [usuario, setUsuario] = useState<SessaoUsuario | null>(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    const sessao = getSessao()
    if (!estaLogado() || !sessao) {
      if (redirecionar) router.push('/login')
    } else {
      setUsuario(sessao)
    }
    setCarregando(false)
  }, [redirecionar, router])

  function logout() {
    encerrarSessao()
    router.push('/login')
  }

  return { usuario, carregando, logout }
}
