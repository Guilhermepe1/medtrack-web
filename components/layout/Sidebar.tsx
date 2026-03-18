'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import {
  Home, Upload, FolderOpen, BarChart2, AlertTriangle,
  MessageCircle, Stethoscope, Share2, User, Lock, LogOut
} from 'lucide-react'
import clsx from 'clsx'

const NAV_GERAL = [
  { href: '/dashboard',  label: 'Início',               icon: Home          },
  { href: '/exames',     label: 'Enviar Exame',          icon: Upload        },
  { href: '/timeline',   label: 'Meus Exames',           icon: FolderOpen    },
  { href: '/valores',    label: 'Valores Laboratoriais', icon: BarChart2     },
  { href: '/alertas',    label: 'Alertas',               icon: AlertTriangle },
  { href: '/chat',       label: 'Chat de Saúde',         icon: MessageCircle },
]

const NAV_BUCAL = [
  { href: '/odonto', label: 'Odontológico', icon: Stethoscope },
]

const NAV_CONTA = [
  { href: '/compartilhar', label: 'Compartilhar com médico', icon: Share2 },
  { href: '/conta',        label: 'Minha Conta',             icon: User   },
  { href: '/privacidade',  label: 'Privacidade e LGPD',      icon: Lock   },
]

interface NavItemProps {
  href:   string
  label:  string
  icon:   React.ElementType
  badge?: number
}

function NavItem({ href, label, icon: Icon, badge }: NavItemProps) {
  const pathname = usePathname()
  const ativo    = pathname === href

  return (
    <Link
      href={href}
      className={clsx(
        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all',
        ativo
          ? 'bg-white/15 text-white font-medium border-l-2 border-brand-teal'
          : 'text-white/70 hover:bg-white/10 hover:text-white'
      )}
    >
      <Icon size={16} />
      <span>{label}</span>
      {badge ? (
        <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {badge}
        </span>
      ) : null}
    </Link>
  )
}

export function Sidebar({ alertasNaoLidos = 0 }: { alertasNaoLidos?: number }) {
  const { usuario, logout } = useAuth(false)

  return (
    <aside className="hidden md:flex flex-col w-64 min-h-screen bg-navy-gradient p-4 gap-2">

      {/* Logo */}
      <div className="flex items-center gap-3 pb-4 mb-2 border-b border-white/10">
        <img src="/logo-medtrack.png" alt="MedTrack" className="w-10 h-10 rounded-xl" />
        <div>
          <p className="text-white font-semibold text-sm">MedTrack</p>
          <p className="text-white/50 text-xs">Health AI</p>
        </div>
      </div>

      {/* Avatar */}
      {usuario && (
        <div className="flex items-center gap-3 bg-white/8 rounded-xl p-3 mb-2">
          <div className="w-9 h-9 rounded-full bg-brand-gradient flex items-center justify-center text-white font-bold text-sm">
            {usuario.nome[0].toUpperCase()}
          </div>
          <div>
            <p className="text-white text-sm font-medium">{usuario.nome}</p>
            <p className="text-white/50 text-xs">Paciente</p>
          </div>
        </div>
      )}

      {/* Saúde Geral */}
      <p className="text-white/40 text-xs font-semibold uppercase tracking-wider px-2 mt-2">
        Saúde Geral
      </p>
      {NAV_GERAL.map((item) => (
        <NavItem
          key={item.href}
          {...item}
          badge={item.href === '/alertas' ? alertasNaoLidos : undefined}
        />
      ))}

      {/* Saúde Bucal */}
      <p className="text-white/40 text-xs font-semibold uppercase tracking-wider px-2 mt-3">
        Saúde Bucal
      </p>
      {NAV_BUCAL.map((item) => (
        <NavItem key={item.href} {...item} />
      ))}

      {/* Conta */}
      <p className="text-white/40 text-xs font-semibold uppercase tracking-wider px-2 mt-3">
        Conta
      </p>
      {NAV_CONTA.map((item) => (
        <NavItem key={item.href} {...item} />
      ))}

      {/* Logout */}
      <div className="mt-auto pt-4 border-t border-white/10">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-white/70 hover:bg-white/10 hover:text-white transition-all"
        >
          <LogOut size={16} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  )
}
