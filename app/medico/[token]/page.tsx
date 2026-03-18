'use client'

import { useState } from 'use'
import { compartilharAPI } from '@/lib/api'
import { Download, Stethoscope } from 'lucide-react'

export default function MedicoPage({ params }: { params: { token: string } }) {
  const [baixando, setBaixando] = useState(false)
  const [erro, setErro]         = useState('')

  async function baixar() {
    setBaixando(true)
    setErro('')
    try {
      const { data } = await compartilharAPI.acessoMedico(params.token)
      const blob = new Blob([data], { type: 'application/pdf' })
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `relatorio_medtrack.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      setErro('Link inválido ou expirado. Peça ao paciente que gere um novo link.')
    } finally {
      setBaixando(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-light flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <img src="/logo-medtrack.png" alt="MedTrack" className="w-16 h-16 mb-3" />
          <h1 className="text-xl font-bold text-brand-navy">MedTrack Health AI</h1>
          <p className="text-brand-muted text-sm">Relatório de Saúde do Paciente</p>
        </div>

        <div className="card text-center">
          <div className="w-16 h-16 bg-brand-light rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Stethoscope size={28} className="text-brand-blue" />
          </div>

          <h2 className="font-semibold text-brand-navy mb-2">
            Acesso somente leitura
          </h2>
          <p className="text-sm text-brand-muted mb-6">
            Este relatório foi compartilhado pelo paciente para esta consulta.
            Clique abaixo para baixar o PDF completo.
          </p>

          {erro ? (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
              {erro}
            </div>
          ) : (
            <button
              onClick={baixar}
              disabled={baixando}
              className="btn-primary flex items-center justify-center gap-2"
            >
              <Download size={16} />
              {baixando ? 'Gerando PDF...' : 'Baixar Relatório PDF'}
            </button>
          )}

          <p className="text-xs text-brand-muted mt-4">
            Este documento não substitui avaliação médica profissional.
          </p>
        </div>
      </div>
    </div>
  )
}
