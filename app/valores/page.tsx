'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/lib/api'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer, Legend
} from 'recharts'

interface ValorLab {
  parametro:      string
  valor:          number
  unidade?:       string
  referencia_min?: number
  referencia_max?: number
  status?:        string
  data_coleta?:   string
}

export default function ValoresPage() {
  const { carregando }               = useAuth()
  const [parametros, setParametros]  = useState<string[]>([])
  const [selecionado, setSelecionado] = useState<string>('')
  const [dados, setDados]            = useState<ValorLab[]>([])
  const [loading, setLoading]        = useState(true)

  useEffect(() => {
    if (!carregando) {
      api.get('/valores/parametros')
        .then(r => {
          setParametros(r.data)
          if (r.data.length > 0) setSelecionado(r.data[0])
        })
        .finally(() => setLoading(false))
    }
  }, [carregando])

  useEffect(() => {
    if (!selecionado) return
    api.get(`/valores/evolucao/${encodeURIComponent(selecionado)}`)
      .then(r => setDados(r.data))
  }, [selecionado])

  const dadosGrafico = dados
    .filter(d => d.data_coleta && d.valor != null)
    .map(d => ({
      data:    new Date(d.data_coleta!).toLocaleDateString('pt-BR'),
      Valor:   Number(d.valor),
      'Ref. mín': d.referencia_min != null ? Number(d.referencia_min) : undefined,
      'Ref. máx': d.referencia_max != null ? Number(d.referencia_max) : undefined,
    }))

  const unidade = dados[0]?.unidade || ''

  const statusCor = (status?: string) => {
    if (status === 'alto')  return 'text-red-500 bg-red-50'
    if (status === 'baixo') return 'text-blue-500 bg-blue-50'
    return 'text-emerald-600 bg-emerald-50'
  }

  if (carregando || loading) return null

  return (
    <div className="page-container">
      <Sidebar />
      <div className="page-content">
        <Header />
        <main className="page-body">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-brand-navy">Valores Laboratoriais</h1>
            <p className="text-brand-muted text-sm mt-1">
              Acompanhe a evolução dos seus indicadores
            </p>
          </div>

          {parametros.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-4xl mb-3">📊</p>
              <p className="font-semibold text-brand-navy">Nenhum valor extraído ainda</p>
              <p className="text-brand-muted text-sm mt-1">
                Faça upload de exames laboratoriais para ver os valores aqui
              </p>
            </div>
          ) : (
            <>
              {/* Seletor de parâmetro */}
              <div className="mb-4">
                <label className="label">Parâmetro</label>
                <select
                  className="input"
                  value={selecionado}
                  onChange={e => setSelecionado(e.target.value)}
                >
                  {parametros.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              {/* Gráfico */}
              {dadosGrafico.length >= 1 && (
                <div className="card mb-4">
                  <p className="font-medium text-brand-navy mb-4 text-sm">
                    Evolução — {selecionado} {unidade && `(${unidade})`}
                  </p>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={dadosGrafico} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E0EAF5" />
                      <XAxis dataKey="data" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Line
                        type="monotone"
                        dataKey="Valor"
                        stroke="#2B7FD4"
                        strokeWidth={2}
                        dot={{ r: 4, fill: '#2B7FD4' }}
                        activeDot={{ r: 6 }}
                      />
                      {dadosGrafico[0]?.['Ref. mín'] != null && (
                        <Line
                          type="monotone"
                          dataKey="Ref. mín"
                          stroke="#00C9A7"
                          strokeWidth={1}
                          strokeDasharray="4 4"
                          dot={false}
                        />
                      )}
                      {dadosGrafico[0]?.['Ref. máx'] != null && (
                        <Line
                          type="monotone"
                          dataKey="Ref. máx"
                          stroke="#F5A623"
                          strokeWidth={1}
                          strokeDasharray="4 4"
                          dot={false}
                        />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Tabela */}
              <div className="card p-0 overflow-hidden">
                <div className="grid grid-cols-4 px-4 py-2 bg-brand-navy">
                  {['Data', 'Valor', 'Referência', 'Status'].map(h => (
                    <p key={h} className="text-xs font-semibold text-white/80 uppercase">{h}</p>
                  ))}
                </div>
                {dados.map((d, i) => (
                  <div
                    key={i}
                    className={`grid grid-cols-4 px-4 py-3 border-b border-brand-border text-sm ${
                      i % 2 === 1 ? 'bg-brand-light' : 'bg-white'
                    }`}
                  >
                    <p className="text-brand-muted text-xs">
                      {d.data_coleta
                        ? new Date(d.data_coleta).toLocaleDateString('pt-BR')
                        : '—'}
                    </p>
                    <p className="font-semibold text-brand-navy">
                      {d.valor} <span className="text-xs font-normal text-brand-muted">{d.unidade}</span>
                    </p>
                    <p className="text-brand-muted text-xs">
                      {d.referencia_min != null && d.referencia_max != null
                        ? `${d.referencia_min} – ${d.referencia_max}`
                        : '—'}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium w-fit ${statusCor(d.status)}`}>
                      {d.status || '—'}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
