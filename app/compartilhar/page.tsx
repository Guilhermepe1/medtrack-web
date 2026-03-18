'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { compartilharAPI } from '@/lib/api'
import { LinkMedico } from '@/types'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import { Link2, RefreshCw, X, Download } from 'lucide-react'

export default function CompartilharPage() {
  const { carregando }         = useAuth()
  const [link, setLink]        = useState<LinkMedico | null>(null)
  const [loading, setLoading]  = useState(true)
  const [copiado, setCopiado]  = useState(false)
  const [gerando, setGerando]  = useState(false)

  async function carregar() {
    try {
      const { data } = await compartilharAPI.getLinkAtivo()
      setLink(data)
    } catch {
      setLink(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!carregando) carregar()
  }, [carregando])

  async function gerarLink() {
    setGerando(true)
    try {
      const { data } = await compartilharAPI.gerarLink()
      setLink(data)
    } finally {
      setGerando(false)
    }
  }

  async function revogar() {
    if (!confirm('Revogar o link? O médico não conseguirá mais acessar.')) return
    await compartilharAPI.revogarLink()
    setLink(null)
  }

  function copiar() {
    if (!link) return
    navigator.clipboard.writeText(link.url)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  async function baixarPdf() {
    const { data } = await compartilharAPI.downloadPdf()
    const blob = new Blob([data], { type: 'application/pdf' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `relatorio_medtrack_${new Date().toISOString().slice(0,10)}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  }

  function tempoRestante(expira: string) {
    const delta = new Date(expira).getTime() - Date.now()
    if (delta <= 0) return 'Expirado'
    const h = Math.floor(delta / 3600000)
    const m = Math.floor((delta % 3600000) / 60000)
    return h > 0 ? `${h}h ${m}min restantes` : `${m} minutos restantes`
  }

  if (carregando || loading) return null

  return (
    <div className="page-container">
      <Sidebar />
      <div className="page-content">
        <Header />
        <main className="page-body">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-brand-navy">Compartilhar com Médico</h1>
            <p className="text-brand-muted text-sm mt-1">
              Link seguro válido por 24 horas
            </p>
          </div>

          {/* Link ativo */}
          {link ? (
            <div className="card mb-4 border-brand-teal border-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-brand-teal rounded-full animate-pulse" />
                <p className="text-sm font-medium text-brand-teal">
                  Link ativo — {tempoRestante(link.expira_em)}
                </p>
              </div>

              <div className="bg-brand-light rounded-xl p-3 mb-3">
                <p className="text-xs text-brand-muted break-all">{link.url}</p>
              </div>

              <div className="flex gap-2">
                <button onClick={copiar} className="btn-primary flex-1 py-2 text-sm">
                  {copiado ? '✓ Copiado!' : 'Copiar link'}
                </button>
                <button onClick={gerarLink} className="btn-secondary flex-shrink-0 px-3 py-2">
                  <RefreshCw size={16} />
                </button>
                <button onClick={revogar} className="btn-secondary flex-shrink-0 px-3 py-2">
                  <X size={16} className="text-red-500" />
                </button>
              </div>

              {link.acessado_em && (
                <p className="text-xs text-brand-muted mt-3">
                  Último acesso: {new Date(link.acessado_em).toLocaleString('pt-BR')}
                </p>
              )}
            </div>
          ) : (
            <div className="card mb-4 text-center py-8">
              <Link2 size={32} className="text-brand-muted mx-auto mb-3" />
              <p className="font-semibold text-brand-navy mb-1">
                Nenhum link ativo
              </p>
              <p className="text-brand-muted text-sm mb-4">
                Gere um link para compartilhar com seu médico
              </p>
              <button onClick={gerarLink} disabled={gerando} className="btn-primary max-w-xs mx-auto">
                {gerando ? 'Gerando...' : '🔗 Gerar link'}
              </button>
            </div>
          )}

          {/* PDF */}
          <div className="card">
            <h2 className="font-semibold text-brand-navy mb-1">📄 Relatório em PDF</h2>
            <p className="text-sm text-brand-muted mb-4">
              Baixe o relatório completo para levar à consulta
            </p>
            <button onClick={baixarPdf} className="btn-secondary flex items-center justify-center gap-2">
              <Download size={16} />
              Baixar PDF
            </button>
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
