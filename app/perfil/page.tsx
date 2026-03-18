'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { perfilAPI } from '@/lib/api'
import { PerfilSaude } from '@/types'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'

const CONDICOES_OPCOES = [
  'Diabetes tipo 1', 'Diabetes tipo 2', 'Hipertensão', 'Hipotensão',
  'Hipotireoidismo', 'Hipertireoidismo', 'Colesterol alto',
  'Doença cardiovascular', 'Asma', 'Anemia', 'Obesidade',
  'Depressão / Ansiedade', 'Doença renal crônica',
]

export default function PerfilPage() {
  const { carregando }           = useAuth()
  const [perfil, setPerfil]      = useState<PerfilSaude>({})
  const [loading, setLoading]    = useState(true)
  const [salvando, setSalvando]  = useState(false)
  const [sucesso, setSucesso]    = useState(false)

  useEffect(() => {
    if (!carregando) {
      perfilAPI.get()
        .then(r => setPerfil(r.data))
        .catch(() => {})
        .finally(() => setLoading(false))
    }
  }, [carregando])

  function toggleCondicao(c: string) {
    const atuais = perfil.condicoes || []
    setPerfil({
      ...perfil,
      condicoes: atuais.includes(c)
        ? atuais.filter(x => x !== c)
        : [...atuais, c]
    })
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    setSalvando(true)
    try {
      await perfilAPI.salvar(perfil)
      setSucesso(true)
      setTimeout(() => setSucesso(false), 3000)
    } finally {
      setSalvando(false)
    }
  }

  if (carregando || loading) return null

  const imc = perfil.peso && perfil.altura
    ? (perfil.peso / ((perfil.altura / 100) ** 2)).toFixed(1)
    : null

  return (
    <div className="page-container">
      <Sidebar />
      <div className="page-content">
        <Header />
        <main className="page-body">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-brand-navy">Perfil de Saúde</h1>
            <p className="text-brand-muted text-sm mt-1">
              Essas informações personalizam as respostas da IA
            </p>
          </div>

          <form onSubmit={salvar} className="flex flex-col gap-4">

            {/* Dados básicos */}
            <div className="card">
              <h2 className="font-semibold text-brand-navy mb-4">Dados básicos</h2>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Sexo biológico</label>
                  <select
                    className="input"
                    value={perfil.sexo || ''}
                    onChange={e => setPerfil({ ...perfil, sexo: e.target.value })}
                  >
                    <option value="">Selecione</option>
                    <option>Masculino</option>
                    <option>Feminino</option>
                    <option>Outro</option>
                  </select>
                </div>
                <div>
                  <label className="label">Data de nascimento</label>
                  <input
                    className="input"
                    type="date"
                    value={perfil.data_nascimento || ''}
                    onChange={e => setPerfil({ ...perfil, data_nascimento: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Peso (kg)</label>
                  <input
                    className="input"
                    type="number"
                    step="0.1"
                    placeholder="70.0"
                    value={perfil.peso || ''}
                    onChange={e => setPerfil({ ...perfil, peso: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="label">Altura (cm)</label>
                  <input
                    className="input"
                    type="number"
                    placeholder="170"
                    value={perfil.altura || ''}
                    onChange={e => setPerfil({ ...perfil, altura: Number(e.target.value) })}
                  />
                </div>
              </div>

              {imc && (
                <div className="mt-3 p-3 bg-brand-light rounded-xl text-sm text-brand-navy">
                  IMC calculado: <strong>{imc}</strong>
                  {Number(imc) < 18.5 && ' — Abaixo do peso'}
                  {Number(imc) >= 18.5 && Number(imc) < 25 && ' — Peso normal ✅'}
                  {Number(imc) >= 25 && Number(imc) < 30 && ' — Sobrepeso'}
                  {Number(imc) >= 30 && ' — Obesidade'}
                </div>
              )}
            </div>

            {/* Condições */}
            <div className="card">
              <h2 className="font-semibold text-brand-navy mb-4">Condições de saúde</h2>
              <div className="flex flex-wrap gap-2 mb-3">
                {CONDICOES_OPCOES.map(c => {
                  const sel = (perfil.condicoes || []).includes(c)
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => toggleCondicao(c)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        sel
                          ? 'bg-brand-blue text-white'
                          : 'bg-brand-light text-brand-muted border border-brand-border hover:border-brand-blue'
                      }`}
                    >
                      {c}
                    </button>
                  )
                })}
              </div>
              <div>
                <label className="label">Outras condições</label>
                <input
                  className="input"
                  placeholder="Ex: lúpus, fibromialgia"
                  value={perfil.outras_condicoes || ''}
                  onChange={e => setPerfil({ ...perfil, outras_condicoes: e.target.value })}
                />
              </div>
            </div>

            {/* Medicamentos */}
            <div className="card">
              <h2 className="font-semibold text-brand-navy mb-4">Medicamentos em uso</h2>
              <textarea
                className="input resize-none"
                rows={3}
                placeholder="Ex: Metformina 500mg, Losartana 50mg"
                value={perfil.medicamentos || ''}
                onChange={e => setPerfil({ ...perfil, medicamentos: e.target.value })}
              />
            </div>

            {/* Hábitos */}
            <div className="card">
              <h2 className="font-semibold text-brand-navy mb-4">Hábitos de vida</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="label">Tabagismo</label>
                  <select
                    className="input"
                    value={perfil.fumante || 'Não'}
                    onChange={e => setPerfil({ ...perfil, fumante: e.target.value })}
                  >
                    {['Não', 'Ex-fumante', 'Sim (leve)', 'Sim (moderado)', 'Sim (intenso)'].map(o => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Consumo de álcool</label>
                  <select
                    className="input"
                    value={perfil.consumo_alcool || 'Não consome'}
                    onChange={e => setPerfil({ ...perfil, consumo_alcool: e.target.value })}
                  >
                    {['Não consome', 'Ocasional', 'Moderado', 'Frequente'].map(o => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Atividade física</label>
                  <select
                    className="input"
                    value={perfil.atividade_fisica || 'Sedentário'}
                    onChange={e => setPerfil({ ...perfil, atividade_fisica: e.target.value })}
                  >
                    {['Sedentário', 'Leve (1-2x/sem)', 'Moderado (3-4x/sem)', 'Intenso (5+/sem)'].map(o => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {sucesso && (
              <p className="text-emerald-600 bg-emerald-50 text-sm px-4 py-3 rounded-xl">
                ✅ Perfil salvo com sucesso!
              </p>
            )}

            <button className="btn-primary" disabled={salvando}>
              {salvando ? 'Salvando...' : '💾 Salvar perfil'}
            </button>
          </form>
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
