'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { dashboardAPI } from '@/lib/api'
import { Dashboard } from '@/types'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import { AlertTriangle, FileText, Activity, User } from 'lucide-react'

export default function DashboardPage() {
  const { usuario, carregando } = useAuth()
  const [data, setData]         = useState<Dashboard | null>(null)
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    if (!carregando && usuario) {
      dashboardAPI.get()
        .then(r => setData(r.data))
        .finally(() => setLoading(false))
    }
  }, [carregando, usuario])

  if (carregando || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-teal border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const saudacao = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Bom dia'
    if (h < 18) return 'Boa tarde'
    return 'Boa noite'
  }

  return (
    <div className="page-container">
      <Sidebar alertasNaoLidos={data?.alertas_nao_lidos} />

      <div className="page-content">
        <Header alertasNaoLidos={data?.alertas_nao_lidos} />

        <main className="page-body">
          {/* Saudação */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-brand-navy">
              {saudacao()}, {usuario?.nome} 👋
            </h1>
            <p className="text-brand-muted text-sm mt-1">
              Aqui está um resumo da sua saúde hoje
            </p>
          </div>

          {data && (
            <>
              {/* Score */}
              <div
                className="card mb-4 text-center"
                style={{ borderColor: data.cor + '44', background: data.cor + '11' }}
              >
                <p className="text-xs font-bold uppercase tracking-widest mb-1"
                   style={{ color: data.cor }}>
                  Score de Saúde
                </p>
                <p className="text-6xl font-bold leading-none mb-1"
                   style={{ color: data.cor }}>
                  {data.score}
                </p>
                <p className="font-medium" style={{ color: data.cor + 'CC' }}>
                  {data.categoria}
                </p>
                <div className="mt-3 h-2 bg-white/50 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${data.score}%`, background: data.cor }}
                  />
                </div>
              </div>

              {/* Métricas */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="card">
                  <User size={18} className="text-brand-muted mb-2" />
                  <p className="label">IMC</p>
                  <p className="text-xl font-bold text-brand-navy">
                    {data.imc ?? '—'}
                  </p>
                  <p className="text-xs text-brand-muted">{data.categoria_imc ?? 'Complete o perfil'}</p>
                </div>

                <div className="card">
                  <AlertTriangle
                    size={18}
                    className={data.alertas_nao_lidos > 0 ? 'text-red-500 mb-2' : 'text-brand-teal mb-2'}
                  />
                  <p className="label">Alertas ativos</p>
                  <p className="text-xl font-bold text-brand-navy">
                    {data.alertas_nao_lidos}
                  </p>
                  <p className="text-xs text-brand-muted">
                    {data.alertas_nao_lidos > 0 ? 'não lidos' : 'tudo ok'}
                  </p>
                </div>

                <div className="card">
                  <Activity size={18} className="text-brand-blue mb-2" />
                  <p className="label">Idade</p>
                  <p className="text-xl font-bold text-brand-navy">
                    {data.idade ? `${data.idade} anos` : '—'}
                  </p>
                </div>

                <div className="card">
                  <FileText size={18} className="text-brand-muted mb-2" />
                  <p className="label">Exames</p>
                  <p className="text-xl font-bold text-brand-navy">
                    {data.total_exames}
                  </p>
                  <p className="text-xs text-brand-muted">cadastrados</p>
                </div>
              </div>

              {/* Último exame */}
              {data.ultimo_exame && (
                <div className="card mb-4 border-l-4 border-brand-blue">
                  <p className="label">Último exame</p>
                  <p className="font-semibold text-brand-navy">
                    {data.ultimo_exame.nome_exame || data.ultimo_exame.arquivo}
                  </p>
                  <p className="text-xs text-brand-muted mt-0.5">
                    📅 {data.ultimo_exame.data_exame
                      ? new Date(data.ultimo_exame.data_exame).toLocaleDateString('pt-BR')
                      : new Date(data.ultimo_exame.data_upload).toLocaleDateString('pt-BR')}
                    {data.ultimo_exame.medico && ` · ${data.ultimo_exame.medico}`}
                  </p>
                </div>
              )}

              {/* Recomendações */}
              {data.recomendacoes.length > 0 && (
                <div className="mb-4">
                  <h2 className="font-semibold text-brand-navy mb-3">
                    💡 Recomendações
                  </h2>
                  <div className="flex flex-col gap-2">
                    {data.recomendacoes.map((rec, i) => (
                      <div
                        key={i}
                        className="card border-l-4 py-3"
                        style={{
                          borderLeftColor: ['#E84545','#F5A623','#2B7FD4','#6B8CB0'][rec.prioridade - 1] || '#6B8CB0'
                        }}
                      >
                        <p className="text-sm text-brand-navy">
                          {rec.icone} {rec.texto}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      <BottomNav alertasNaoLidos={data?.alertas_nao_lidos} />
    </div>
  )
}
