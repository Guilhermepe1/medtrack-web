'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Upload, AlertTriangle, MessageCircle, FolderOpen } from 'lucide-react'
import clsx from 'clsx'

const NAV_MOBILE = [
  { href: '/dashboard', label: 'Início',    icon: Home          },
  { href: '/exames',    label: 'Exames',    icon: Upload        },
  { href: '/timeline',  label: 'Histórico', icon: FolderOpen    },
  { href: '/alertas',   label: 'Alertas',   icon: AlertTriangle },
  { href: '/chat',      label: 'Chat',      icon: MessageCircle },
]

export function BottomNav({ alertasNaoLidos = 0 }: { alertasNaoLidos?: number }) {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-brand-border z-50">
      <div className="flex items-center justify-around py-2 px-2">
        {NAV_MOBILE.map(({ href, label, icon: Icon }) => {
          const ativo = pathname === href
          const badge = href === '/alertas' && alertasNaoLidos > 0

          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-0.5 px-3 py-1 relative"
            >
              <div className={clsx(
                'p-1.5 rounded-xl transition-all',
                ativo ? 'bg-brand-light' : ''
              )}>
                <Icon
                  size={20}
                  className={ativo ? 'text-brand-blue' : 'text-brand-muted'}
                />
                {badge && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </div>
              <span className={clsx(
                'text-xs',
                ativo ? 'text-brand-blue font-medium' : 'text-brand-muted'
              )}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
