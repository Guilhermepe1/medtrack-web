'use client'

import { usePathname } from 'next/navigation'
import { Bell } from 'lucide-react'
import Link from 'next/link'

const TITULOS: Record<string, string> = {
  '/dashboard':   'Início',
  '/exames':      'Enviar Exame',
  '/timeline':    'Meus Exames',
  '/valores':     'Valores Laboratoriais',
  '/alertas':     'Alertas Clínicos',
  '/chat':        'Chat de Saúde',
  '/odonto':      'Saúde Bucal',
  '/compartilhar':'Compartilhar',
  '/conta':       'Minha Conta',
  '/privacidade': 'Privacidade',
  '/perfil':      'Perfil de Saúde',
}

export function Header({ alertasNaoLidos = 0 }: { alertasNaoLidos?: number }) {
  const pathname = usePathname()
  const titulo   = TITULOS[pathname] || 'MedTrack'

  return (
    <header className="md:hidden sticky top-0 z-40 bg-white border-b border-brand-border px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <img src="/logo-medtrack.png" alt="MedTrack" className="w-8 h-8 rounded-lg" />
        <h1 className="text-brand-navy font-semibold text-base">{titulo}</h1>
      </div>

      <Link href="/alertas" className="relative p-2">
        <Bell size={20} className="text-brand-muted" />
        {alertasNaoLidos > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        )}
      </Link>
    </header>
  )
}
