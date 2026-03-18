'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { alertasAPI } from '@/lib/api'
import { Alerta } from '@/types'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import { CheckCheck } from 'lucide-react'

export default function AlertasPage() {
  const { carregando }           = useAuth()
  const [alertas, setAlertas]    = useState<Alerta[]>([])
  const [loading, setLoading]    = useState(true)

  async function carregar() {
    const { data } = await alertasAPI.listar()
    setAlertas(data)
    setLoading(false)
  }

  useEffect(() => {
    if (!carregando) carregar()
  }, [carregando])

  async function marcarLido(id: number) {
    await alertasAPI.marcarLido(id)
    setAlertas(prev => prev.map(a => a.id === id ? { ...a, lido: true } : a))
  }

  async function marcarTodos() {
    await alertasAPI.marcarTodosLidos()
    setAlertas(prev => prev.map(a => ({ ...a, lido: true })))
  }

  const naoLidos = alertas.filter(a => !a.lido)

  if (carregando || loading) return null

  return (
    <div className="page-container">
      <Sidebar alertasNaoLidos={naoLidos.length} />

      <div className="page-content">
        <Header alertasNaoLidos={naoLidos.length} />

        <main className="page-body">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-brand-navy">Alertas Clínicos</h1>
              <p className="text-brand-muted text-sm">Valores que merecem atenção</p>
            </div>
            {naoLidos.length > 0 && (
              <button
                onClick={marcarTodos}
                className="flex items-center gap-2 text-sm text-brand-blue border border-brand-border rounded-xl px-3 py-2 hover:bg-brand-light transition-all"
              >
                <CheckCheck size={14} />
                Marcar todos
              </button>
            )}
          </div>

          {alertas.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-4xl mb-3">✅</p>
              <p className="font-semibold text-brand-navy">Nenhum alerta encontrado</p>
              <p className="text-brand-muted text-sm mt-1">
                Seus valores estão dentro da referência!
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {alertas.map(alerta => {
                const isAlto  = alerta.status === 'alto'
                const corBorda = isAlto ? '#E84545' : '#2B7FD4'
                const bgClass  = isAlto ? 'bg-red-50'  : 'bg-blue-50'
                const txtClass = isAlto ? 'text-red-600' : 'text-blue-600'

                return (
                  <div
                    key={alerta.id}
                    className={`card border-l-4 ${alerta.lido ? 'opacity-60' : ''}`}
                    style={{ borderLeftColor: corBorda }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-brand-navy">
                            {alerta.parametro}
                            {!alerta.lido && (
                              <span className="ml-2 text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">
                                novo
                              </span>
                            )}
                          </p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${bgClass} ${txtClass}`}>
                            {alerta.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-brand-navy">
                          Valor: <strong>{alerta.valor} {alerta.unidade || ''}</strong>
                        </p>
                        {alerta.referencia_min != null && alerta.referencia_max != null && (
                          <p className="text-xs text-brand-muted mt-0.5">
                            Referência: {alerta.referencia_min} – {alerta.referencia_max} {alerta.unidade || ''}
                          </p>
                        )}
                        {alerta.arquivo && (
                          <p className="text-xs text-brand-muted mt-1">
                            Exame: {alerta.arquivo}
                          </p>
                        )}
                      </div>

                      {!alerta.lido && (
                        <button
                          onClick={() => marcarLido(alerta.id)}
                          className="text-xs text-brand-muted border border-brand-border rounded-lg px-2 py-1 hover:bg-brand-light transition-all flex-shrink-0"
                        >
                          Lido
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </main>
      </div>

      <BottomNav alertasNaoLidos={naoLidos.length} />
    </div>
  )
}
