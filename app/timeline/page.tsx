'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { examesAPI } from '@/lib/api'
import { Exame } from '@/types'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import { ChevronDown, Trash2, FileText } from 'lucide-react'
import clsx from 'clsx'

export default function TimelinePage() {
  const { carregando }           = useAuth()
  const [exames, setExames]      = useState<Exame[]>([])
  const [loading, setLoading]    = useState(true)
  const [aberto, setAberto]      = useState<number | null>(null)
  const [filtro, setFiltro]      = useState('Todos')

  const CATEGORIAS = ['Todos', 'Hemograma', 'Colesterol', 'Diabetes', 'Imagem', 'Outros']

  useEffect(() => {
    if (!carregando) {
      examesAPI.listar()
        .then(r => setExames(r.data))
        .finally(() => setLoading(false))
    }
  }, [carregando])

  async function excluir(id: number, e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirm('Excluir este exame permanentemente?')) return
    await examesAPI.excluir(id)
    setExames(prev => prev.filter(ex => ex.id !== id))
  }

  const filtrados = filtro === 'Todos'
    ? exames
    : exames.filter(e => e.categoria === filtro)

  if (carregando || loading) return null

  return (
    <div className="page-container">
      <Sidebar />
      <div className="page-content">
        <Header />
        <main className="page-body">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-brand-navy">Meus Exames</h1>
            <p className="text-brand-muted text-sm mt-1">
              Histórico completo dos seus exames
            </p>
          </div>

          {/* Filtro */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
            {CATEGORIAS.map(cat => (
              <button
                key={cat}
                onClick={() => setFiltro(cat)}
                className={clsx(
                  'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all',
                  filtro === cat
                    ? 'bg-brand-blue text-white'
                    : 'bg-white border border-brand-border text-brand-muted hover:border-brand-blue'
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {filtrados.length === 0 ? (
            <div className="card text-center py-12">
              <FileText size={32} className="text-brand-muted mx-auto mb-3" />
              <p className="font-semibold text-brand-navy">Nenhum exame encontrado</p>
              <p className="text-brand-muted text-sm mt-1">
                Faça upload do seu primeiro exame
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filtrados.map(exame => {
                const nome = exame.nome_exame || exame.arquivo
                const data = exame.data_exame
                  ? new Date(exame.data_exame).toLocaleDateString('pt-BR')
                  : new Date(exame.data_upload).toLocaleDateString('pt-BR')

                return (
                  <div key={exame.id} className="card p-0 overflow-hidden">
                    <button
                      className="w-full flex items-center justify-between p-4 text-left"
                      onClick={() => setAberto(aberto === exame.id ? null : exame.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-brand-navy text-sm truncate">
                          📄 {nome}
                        </p>
                        <p className="text-xs text-brand-muted mt-0.5">
                          {data}
                          {exame.medico && ` · ${exame.medico}`}
                          {exame.hospital && ` · ${exame.hospital}`}
                        </p>
                      </div>
                      <ChevronDown
                        size={16}
                        className={clsx(
                          'text-brand-muted transition-transform ml-2 flex-shrink-0',
                          aberto === exame.id && 'rotate-180'
                        )}
                      />
                    </button>

                    {aberto === exame.id && (
                      <div className="px-4 pb-4 border-t border-brand-border">
                        <p className="text-sm text-brand-navy leading-relaxed mt-3">
                          {exame.resumo || 'Sem resumo disponível.'}
                        </p>
                        <button
                          onClick={e => excluir(exame.id, e)}
                          className="flex items-center gap-1.5 text-xs text-red-500 mt-3 hover:underline"
                        >
                          <Trash2 size={12} />
                          Excluir exame
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
