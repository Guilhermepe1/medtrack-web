'use client'

import { useState, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { examesAPI } from '@/lib/api'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import { Upload, FileText, Image, CheckCircle, X } from 'lucide-react'

export default function ExamesPage() {
  const { carregando }             = useAuth()
  const inputRef                   = useRef<HTMLInputElement>(null)
  const [arquivo, setArquivo]      = useState<File | null>(null)
  const [preview, setPreview]      = useState<string | null>(null)
  const [meta, setMeta]            = useState({
    nome_exame: '', data_exame: '', medico: '', hospital: ''
  })
  const [resultado, setResultado]  = useState<any>(null)
  const [loading, setLoading]      = useState(false)
  const [erro, setErro]            = useState('')

  function handleArquivo(file: File) {
    setArquivo(file)
    setResultado(null)
    setErro('')
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file)
      setPreview(url)
    } else {
      setPreview(null)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleArquivo(file)
  }

  async function enviar() {
    if (!arquivo) return
    setLoading(true)
    setErro('')

    const formData = new FormData()
    formData.append('arquivo', arquivo)
    if (meta.nome_exame)  formData.append('nome_exame',  meta.nome_exame)
    if (meta.data_exame)  formData.append('data_exame',  meta.data_exame)
    if (meta.medico)      formData.append('medico',      meta.medico)
    if (meta.hospital)    formData.append('hospital',    meta.hospital)

    try {
      const { data } = await examesAPI.upload(formData)
      setResultado(data)
      setArquivo(null)
      setPreview(null)
    } catch (err: any) {
      const detail = err.response?.data?.detail
      if (Array.isArray(detail)) {
        setErro(detail.map((e: any) => e.msg || e.message || JSON.stringify(e)).join(', '))
      } else {
        setErro(typeof detail === 'string' ? detail : 'Erro ao processar o exame.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (carregando) return null

  return (
    <div className="page-container">
      <Sidebar />
      <div className="page-content">
        <Header />
        <main className="page-body">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-brand-navy">Enviar Exame</h1>
            <p className="text-brand-muted text-sm mt-1">
              Envie um exame para análise automática por IA
            </p>
          </div>

          {resultado ? (
            /* Resultado do processamento */
            <div className="card border-brand-teal border-2">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle size={24} className="text-brand-teal" />
                <div>
                  <p className="font-semibold text-brand-navy">Exame processado!</p>
                  <p className="text-xs text-brand-muted">
                    Categoria: {resultado.categoria}
                    {resultado.alertas > 0 && (
                      <span className="ml-2 text-red-500">
                        · {resultado.alertas} alerta(s) gerado(s)
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <p className="text-sm font-medium text-brand-muted uppercase tracking-wide mb-2">
                Resumo da IA
              </p>
              <p className="text-sm text-brand-navy leading-relaxed bg-brand-light rounded-xl p-3">
                {resultado.resumo}
              </p>
              <button
                onClick={() => setResultado(null)}
                className="btn-secondary mt-4"
              >
                Enviar outro exame
              </button>
            </div>
          ) : (
            <>
              {/* Área de upload */}
              <div
                className={`card border-2 border-dashed cursor-pointer transition-all mb-4 ${
                  arquivo ? 'border-brand-teal' : 'border-brand-border hover:border-brand-blue'
                }`}
                onClick={() => inputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={e => e.preventDefault()}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  className="hidden"
                  onChange={e => e.target.files?.[0] && handleArquivo(e.target.files[0])}
                />

                {arquivo ? (
                  <div className="flex items-center gap-3 py-2">
                    {preview
                      ? <img src={preview} className="w-16 h-16 object-cover rounded-lg" alt="preview" />
                      : <div className="w-16 h-16 bg-brand-light rounded-lg flex items-center justify-center">
                          <FileText size={24} className="text-brand-blue" />
                        </div>
                    }
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-brand-navy text-sm truncate">{arquivo.name}</p>
                      <p className="text-xs text-brand-muted">
                        {(arquivo.size / 1024 / 1024).toFixed(1)} MB
                      </p>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); setArquivo(null); setPreview(null) }}
                      className="p-1 hover:bg-brand-light rounded-lg"
                    >
                      <X size={16} className="text-brand-muted" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-8 gap-3">
                    <div className="w-14 h-14 bg-brand-light rounded-2xl flex items-center justify-center">
                      <Upload size={24} className="text-brand-blue" />
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-brand-navy text-sm">
                        Arraste ou clique para selecionar
                      </p>
                      <p className="text-xs text-brand-muted mt-1">PDF, PNG, JPG — máx. 200MB</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Metadados */}
              {arquivo && (
                <div className="card mb-4">
                  <p className="font-medium text-brand-navy mb-4 text-sm">
                    Confirme os dados do exame
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="label">Nome do exame</label>
                      <input
                        className="input"
                        placeholder="Ex: Hemograma Completo"
                        value={meta.nome_exame}
                        onChange={e => setMeta({ ...meta, nome_exame: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="label">Data do exame</label>
                      <input
                        className="input"
                        type="date"
                        value={meta.data_exame}
                        onChange={e => setMeta({ ...meta, data_exame: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="label">Médico solicitante</label>
                      <input
                        className="input"
                        placeholder="Dr. Nome Sobrenome"
                        value={meta.medico}
                        onChange={e => setMeta({ ...meta, medico: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="label">Hospital / Laboratório</label>
                      <input
                        className="input"
                        placeholder="Ex: Laboratório Fleury"
                        value={meta.hospital}
                        onChange={e => setMeta({ ...meta, hospital: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {erro && (
                <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg mb-4">{erro}</p>
              )}

              <button
                onClick={enviar}
                disabled={!arquivo || loading}
                className="btn-primary"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processando com IA...
                  </span>
                ) : '💾 Salvar exame'}
              </button>
            </>
          )}
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
