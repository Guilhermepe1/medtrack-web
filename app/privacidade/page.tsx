'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/lib/api'
import { encerrarSessao } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import { Shield, FileText, List, Trash2 } from 'lucide-react'

interface Log {
  acao:       string
  descricao?: string
  ip?:        string
  created_at: string
}

const ACOES: Record<string, string> = {
  login:                     '🔐 Login realizado',
  logout:                    '🚪 Logout',
  upload_exame:              '📤 Upload de exame',
  deletou_exame:             '🗑️ Excluiu exame',
  upload_odonto:             '🦷 Upload odontológico',
  solicitou_exclusao_conta:  '⚠️ Solicitou exclusão',
}

export default function PrivacidadePage() {
  const { usuario, carregando } = useAuth()
  const router = useRouter()
  const [aba, setAba]         = useState<'politica' | 'logs' | 'exclusao'>('politica')
  const [logs, setLogs]       = useState<Log[]>([])
  const [loadingLogs, setLoadingLogs] = useState(false)
  const [confirma, setConfirma]       = useState('')
  const [excluindo, setExcluindo]     = useState(false)

  useEffect(() => {
    if (aba === 'logs' && !carregando) {
      setLoadingLogs(true)
      api.get('/lgpd/logs')
        .then(r => setLogs(r.data))
        .finally(() => setLoadingLogs(false))
    }
  }, [aba, carregando])

  async function excluirConta() {
    if (confirma !== usuario?.nome) return
    setExcluindo(true)
    try {
      await api.delete('/lgpd/excluir-conta')
      encerrarSessao()
      router.push('/login')
    } catch {
      setExcluindo(false)
    }
  }

  const TABS = [
    { id: 'politica', label: 'Política',  icon: FileText },
    { id: 'logs',     label: 'Meus logs', icon: List     },
    { id: 'exclusao', label: 'Excluir',   icon: Trash2   },
  ] as const

  if (carregando) return null

  return (
    <div className="page-container">
      <Sidebar />
      <div className="page-content">
        <Header />
        <main className="page-body">
          <div className="mb-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-light rounded-xl flex items-center justify-center">
              <Shield size={20} className="text-brand-blue" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-brand-navy">Privacidade e LGPD</h1>
              <p className="text-brand-muted text-sm">Seus dados, seus direitos</p>
            </div>
          </div>

          {/* Abas */}
          <div className="flex gap-1 bg-brand-light rounded-xl p-1 mb-6">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setAba(id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
                  aba === id
                    ? 'bg-white text-brand-navy shadow-sm'
                    : 'text-brand-muted hover:text-brand-navy'
                }`}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>

          {/* Política */}
          {aba === 'politica' && (
            <div className="card prose prose-sm max-w-none text-brand-navy">
              <h2 className="font-bold text-brand-navy mb-3">Política de Privacidade — MedTrack Health AI</h2>
              <p className="text-brand-muted text-xs mb-4">Versão 1.0 · Vigência: março de 2025</p>

              {[
                ['1. Quem somos', 'O MedTrack Health AI é uma plataforma de centralização e interpretação de exames médicos com auxílio de inteligência artificial. Não somos um serviço médico — nossas respostas têm caráter informativo.'],
                ['2. Dados coletados', 'Coletamos dados de identificação (nome, e-mail, CPF), dados de saúde (exames, perfil clínico) e dados de uso (logs de acesso).'],
                ['3. Finalidade', 'Seus dados são utilizados exclusivamente para prestar o serviço de interpretação e organização de exames e personalizar as respostas da IA.'],
                ['4. Compartilhamento', 'Seus dados nunca são vendidos. Utilizamos Supabase (banco de dados), Groq (IA) e Streamlit/Vercel (hospedagem) para operar a plataforma.'],
                ['5. Seus direitos (LGPD)', 'Você tem direito a: acesso, correção, exclusão, portabilidade e revogação do consentimento a qualquer momento.'],
                ['6. Segurança', 'Utilizamos criptografia de senhas (bcrypt), conexões SSL e armazenamento seguro em nuvem.'],
              ].map(([titulo, texto]) => (
                <div key={titulo} className="mb-4">
                  <p className="font-semibold text-brand-navy text-sm">{titulo}</p>
                  <p className="text-brand-muted text-sm mt-1 leading-relaxed">{texto}</p>
                </div>
              ))}
            </div>
          )}

          {/* Logs */}
          {aba === 'logs' && (
            <div>
              <p className="text-brand-muted text-sm mb-4">
                Registramos suas ações para garantir transparência, conforme exigido pela LGPD.
              </p>
              {loadingLogs ? (
                <div className="flex justify-center py-8">
                  <div className="w-6 h-6 border-2 border-brand-teal border-t-transparent rounded-full animate-spin" />
                </div>
              ) : logs.length === 0 ? (
                <div className="card text-center py-8 text-brand-muted text-sm">
                  Nenhum log registrado ainda.
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {logs.map((log, i) => (
                    <div key={i} className="card py-2.5 flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm text-brand-navy">
                          {ACOES[log.acao] || `🔹 ${log.acao}`}
                          {log.descricao && (
                            <span className="text-brand-muted"> — {log.descricao}</span>
                          )}
                        </p>
                        <p className="text-xs text-brand-muted mt-0.5">
                          {new Date(log.created_at).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Exclusão */}
          {aba === 'exclusao' && (
            <div>
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                <p className="font-semibold text-red-700 mb-1">⚠️ Ação irreversível</p>
                <p className="text-red-600 text-sm leading-relaxed">
                  Todos os seus dados serão permanentemente removidos: exames, laudos,
                  histórico odontológico, perfil de saúde, alertas e logs.
                </p>
              </div>

              <div className="card">
                <p className="text-sm text-brand-navy mb-4">
                  Este é seu direito garantido pelo <strong>Art. 18 da LGPD</strong> —
                  direito à eliminação dos dados pessoais tratados com consentimento.
                </p>

                <label className="label">
                  Para confirmar, digite seu username: <strong>{usuario?.nome}</strong>
                </label>
                <input
                  className="input mb-4"
                  placeholder="seu_username"
                  value={confirma}
                  onChange={e => setConfirma(e.target.value)}
                />

                <button
                  onClick={excluirConta}
                  disabled={confirma !== usuario?.nome || excluindo}
                  className="w-full py-3 px-4 rounded-xl font-medium text-white bg-red-500
                             hover:bg-red-600 transition-all disabled:opacity-40
                             disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} />
                  {excluindo ? 'Excluindo...' : 'Excluir permanentemente minha conta'}
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
