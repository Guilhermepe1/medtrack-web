'use client'

import { useEffect, useState, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/lib/api'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import { Upload, FileText, ChevronDown } from 'lucide-react'
import clsx from 'clsx'

const DENTES_SUPERIOR = [18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28]
const DENTES_INFERIOR = [48,47,46,45,44,43,42,41,31,32,33,34,35,36,37,38]

const STATUS_CONFIG: Record<string, { cor: string; label: string }> = {
  saudavel:         { cor: '#00C9A7', label: 'Saudável'           },
  carie:            { cor: '#E84545', label: 'Cárie'              },
  restaurado:       { cor: '#2B7FD4', label: 'Restaurado'         },
  ausente:          { cor: '#888888', label: 'Ausente'            },
  implante:         { cor: '#6B3FA0', label: 'Implante'           },
  coroa:            { cor: '#F5A623', label: 'Coroa'              },
  tratamento_canal: { cor: '#B85C00', label: 'Trat. de canal'     },
}

interface DenteData { status: string; observacao?: string }

export default function OdontoPage() {
  const { carregando }                  = useAuth()
  const [aba, setAba]                   = useState<'mapa' | 'upload' | 'historico'>('mapa')
  const [odontograma, setOdontograma]   = useState<Record<number, DenteData>>({})
  const [denteSel, setDenteSel]         = useState<number | null>(null)
  const [novoStatus, setNovoStatus]     = useState('saudavel')
  const [novaObs, setNovaObs]           = useState('')
  const [salvando, setSalvando]         = useState(false)
  const [registros, setRegistros]       = useState<any[]>([])
  const [abaAberta, setAbaAberta]       = useState<number | null>(null)

  // upload
  const inputRef                        = useRef<HTMLInputElement>(null)
  const [arquivo, setArquivo]           = useState<File | null>(null)
  const [meta, setMeta]                 = useState({ tipo: 'radiografia', dentista: '', clinica: '', data_registro: '' })
  const [enviando, setEnviando]         = useState(false)
  const [resultado, setResultado]       = useState<any>(null)

  useEffect(() => {
    if (!carregando) {
      api.get('/odonto/odontograma').then(r => {
        const mapa: Record<number, DenteData> = {}
        r.data.forEach((d: any) => { mapa[d.numero_dente] = { status: d.status, observacao: d.observacao } })
        setOdontograma(mapa)
      }).catch(() => {})

      api.get('/odonto/registros').then(r => setRegistros(r.data)).catch(() => {})
    }
  }, [carregando])

  function selecionarDente(num: number) {
    setDenteSel(num)
    const d = odontograma[num]
    setNovoStatus(d?.status || 'saudavel')
    setNovaObs(d?.observacao || '')
  }

  async function salvarDente() {
    if (!denteSel) return
    setSalvando(true)
    try {
      await api.post('/odonto/dente', { numero_dente: denteSel, status: novoStatus, observacao: novaObs || null })
      setOdontograma(prev => ({ ...prev, [denteSel]: { status: novoStatus, observacao: novaObs } }))
      setDenteSel(null)
    } finally {
      setSalvando(false)
    }
  }

  async function enviarDoc() {
    if (!arquivo) return
    setEnviando(true)
    const fd = new FormData()
    fd.append('arquivo', arquivo)
    fd.append('tipo', meta.tipo)
    if (meta.dentista)       fd.append('dentista',       meta.dentista)
    if (meta.clinica)        fd.append('clinica',        meta.clinica)
    if (meta.data_registro)  fd.append('data_registro',  meta.data_registro)
    try {
      const { data } = await api.post('/odonto/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setResultado(data)
      setArquivo(null)
      // recarrega odontograma
      const r = await api.get('/odonto/odontograma')
      const mapa: Record<number, DenteData> = {}
      r.data.forEach((d: any) => { mapa[d.numero_dente] = { status: d.status, observacao: d.observacao } })
      setOdontograma(mapa)
    } finally {
      setEnviando(false)
    }
  }

  function renderDente(num: number) {
    const d      = odontograma[num]
    const status = d?.status || 'saudavel'
    const cfg    = STATUS_CONFIG[status] || STATUS_CONFIG.saudavel
    const ativo  = denteSel === num

    return (
      <button
        key={num}
        onClick={() => selecionarDente(num)}
        className={clsx(
          'flex flex-col items-center justify-center w-9 h-9 rounded-lg border-2 transition-all text-xs font-bold',
          ativo ? 'scale-110 shadow-md' : 'hover:scale-105'
        )}
        style={{
          borderColor:    cfg.cor,
          backgroundColor: cfg.cor + '22',
          color:           cfg.cor,
        }}
        title={`Dente ${num} — ${cfg.label}${d?.observacao ? ': ' + d.observacao : ''}`}
      >
        {num}
      </button>
    )
  }

  if (carregando) return null

  return (
    <div className="page-container">
      <Sidebar />
      <div className="page-content">
        <Header />
        <main className="page-body">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-brand-navy">Saúde Bucal</h1>
            <p className="text-brand-muted text-sm mt-1">Odontograma, radiografias e histórico</p>
          </div>

          {/* Abas */}
          <div className="flex gap-1 bg-brand-light rounded-xl p-1 mb-6">
            {[
              { id: 'mapa',      label: '🦷 Odontograma' },
              { id: 'upload',    label: '📤 Novo Documento' },
              { id: 'historico', label: '📋 Histórico' },
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setAba(id as any)}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                  aba === id ? 'bg-white text-brand-navy shadow-sm' : 'text-brand-muted'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Odontograma */}
          {aba === 'mapa' && (
            <div className="flex flex-col gap-4">
              <div className="card">
                <p className="text-xs text-brand-muted text-center mb-3 font-medium uppercase tracking-wide">
                  Superior
                </p>
                <div className="flex flex-wrap justify-center gap-1.5 mb-4">
                  {DENTES_SUPERIOR.map(renderDente)}
                </div>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {DENTES_INFERIOR.map(renderDente)}
                </div>
                <p className="text-xs text-brand-muted text-center mt-3 font-medium uppercase tracking-wide">
                  Inferior
                </p>
              </div>

              {/* Legenda */}
              <div className="flex flex-wrap gap-2 justify-center">
                {Object.entries(STATUS_CONFIG).map(([key, { cor, label }]) => (
                  <span key={key} className="flex items-center gap-1.5 text-xs text-brand-muted">
                    <span className="w-3 h-3 rounded-full inline-block" style={{ background: cor }} />
                    {label}
                  </span>
                ))}
              </div>

              {/* Editar dente selecionado */}
              {denteSel && (
                <div className="card border-brand-blue border-2">
                  <p className="font-semibold text-brand-navy mb-3">
                    Editando dente {denteSel}
                  </p>
                  <div className="flex flex-col gap-3">
                    <div>
                      <label className="label">Status</label>
                      <select className="input" value={novoStatus}
                        onChange={e => setNovoStatus(e.target.value)}>
                        {Object.entries(STATUS_CONFIG).map(([k, { label }]) => (
                          <option key={k} value={k}>{label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="label">Observação</label>
                      <input className="input" placeholder="Ex: cárie distal"
                        value={novaObs} onChange={e => setNovaObs(e.target.value)} />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={salvarDente} disabled={salvando} className="btn-primary flex-1">
                        {salvando ? 'Salvando...' : '💾 Salvar'}
                      </button>
                      <button onClick={() => setDenteSel(null)} className="btn-secondary flex-shrink-0 px-4">
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Upload */}
          {aba === 'upload' && (
            <div className="flex flex-col gap-4">
              {resultado ? (
                <div className="card border-brand-teal border-2">
                  <p className="font-semibold text-brand-navy mb-2">✅ Documento processado!</p>
                  <p className="text-sm text-brand-muted">{resultado.resumo}</p>
                  {resultado.dentes_atualizados > 0 && (
                    <p className="text-xs text-brand-teal mt-2">
                      🦷 {resultado.dentes_atualizados} dente(s) atualizado(s) no odontograma
                    </p>
                  )}
                  <button onClick={() => setResultado(null)} className="btn-secondary mt-3">
                    Enviar outro
                  </button>
                </div>
              ) : (
                <>
                  <div
                    className="card border-2 border-dashed border-brand-border cursor-pointer hover:border-brand-blue transition-all"
                    onClick={() => inputRef.current?.click()}
                  >
                    <input ref={inputRef} type="file" accept=".pdf,.png,.jpg,.jpeg" className="hidden"
                      onChange={e => e.target.files?.[0] && setArquivo(e.target.files[0])} />
                    <div className="flex flex-col items-center py-6 gap-2">
                      <Upload size={24} className="text-brand-blue" />
                      <p className="text-sm font-medium text-brand-navy">
                        {arquivo ? arquivo.name : 'Clique para selecionar'}
                      </p>
                      <p className="text-xs text-brand-muted">Radiografia, laudo, plano ou foto</p>
                    </div>
                  </div>

                  <div className="card flex flex-col gap-3">
                    <div>
                      <label className="label">Tipo de documento</label>
                      <select className="input" value={meta.tipo}
                        onChange={e => setMeta({ ...meta, tipo: e.target.value })}>
                        <option value="radiografia">🔬 Radiografia</option>
                        <option value="laudo">📋 Laudo</option>
                        <option value="plano_tratamento">📝 Plano de tratamento</option>
                        <option value="foto">📷 Foto intraoral</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="label">Dentista</label>
                        <input className="input" placeholder="Dr. Nome" value={meta.dentista}
                          onChange={e => setMeta({ ...meta, dentista: e.target.value })} />
                      </div>
                      <div>
                        <label className="label">Clínica</label>
                        <input className="input" placeholder="Nome da clínica" value={meta.clinica}
                          onChange={e => setMeta({ ...meta, clinica: e.target.value })} />
                      </div>
                    </div>
                    <div>
                      <label className="label">Data do documento</label>
                      <input className="input" type="date" value={meta.data_registro}
                        onChange={e => setMeta({ ...meta, data_registro: e.target.value })} />
                    </div>
                  </div>

                  <button onClick={enviarDoc} disabled={!arquivo || enviando} className="btn-primary">
                    {enviando ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processando...
                      </span>
                    ) : '💾 Salvar documento'}
                  </button>
                </>
              )}
            </div>
          )}

          {/* Histórico */}
          {aba === 'historico' && (
            <div className="flex flex-col gap-3">
              {registros.length === 0 ? (
                <div className="card text-center py-12">
                  <FileText size={32} className="text-brand-muted mx-auto mb-3" />
                  <p className="font-semibold text-brand-navy">Nenhum documento ainda</p>
                </div>
              ) : registros.map(reg => {
                const data = reg.data_registro
                  ? new Date(reg.data_registro).toLocaleDateString('pt-BR')
                  : new Date(reg.created_at).toLocaleDateString('pt-BR')

                return (
                  <div key={reg.id} className="card p-0 overflow-hidden">
                    <button
                      className="w-full flex items-center justify-between p-4 text-left"
                      onClick={() => setAbaAberta(abaAberta === reg.id ? null : reg.id)}
                    >
                      <div>
                        <p className="text-sm font-medium text-brand-navy">
                          {reg.tipo.replace('_', ' ')} — {data}
                        </p>
                        {reg.dentista && (
                          <p className="text-xs text-brand-muted mt-0.5">👨‍⚕️ {reg.dentista}</p>
                        )}
                      </div>
                      <ChevronDown size={16} className={clsx(
                        'text-brand-muted transition-transform',
                        abaAberta === reg.id && 'rotate-180'
                      )} />
                    </button>
                    {abaAberta === reg.id && (
                      <div className="px-4 pb-4 border-t border-brand-border">
                        <p className="text-sm text-brand-muted mt-3 leading-relaxed">
                          {reg.resumo || 'Sem resumo.'}
                        </p>
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
