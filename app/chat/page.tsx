'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { chatAPI } from '@/lib/api'
import { Mensagem } from '@/types'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import { Send, Bot, User } from 'lucide-react'
import clsx from 'clsx'

export default function ChatPage() {
  const { carregando }             = useAuth()
  const [historico, setHistorico]  = useState<Mensagem[]>([])
  const [pergunta, setPergunta]    = useState('')
  const [loading, setLoading]      = useState(false)
  const bottomRef                  = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [historico])

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    if (!pergunta.trim() || loading) return

    const novaMensagem: Mensagem = { role: 'user', content: pergunta }
    const novoHistorico = [...historico, novaMensagem]
    setHistorico(novoHistorico)
    setPergunta('')
    setLoading(true)

    try {
      const { data } = await chatAPI.perguntar(pergunta, historico)
      setHistorico([
        ...novoHistorico,
        { role: 'assistant', content: data.resposta }
      ])
    } catch {
      setHistorico([
        ...novoHistorico,
        { role: 'assistant', content: 'Desculpe, ocorreu um erro. Tente novamente.' }
      ])
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

        <main className="flex flex-col h-[calc(100vh-56px-80px)] md:h-screen">
          {/* Mensagens */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col gap-3">

            {historico.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                <div className="w-16 h-16 bg-brand-light rounded-2xl flex items-center justify-center">
                  <Bot size={32} className="text-brand-blue" />
                </div>
                <h2 className="font-semibold text-brand-navy">Chat de Saúde</h2>
                <p className="text-brand-muted text-sm max-w-xs">
                  Faça perguntas sobre seus exames. A IA responde com base no seu histórico real.
                </p>
                <div className="flex flex-col gap-2 w-full max-w-xs mt-2">
                  {[
                    'Como está minha hemoglobina?',
                    'Tenho algum valor fora do normal?',
                    'Qual foi meu último exame?',
                  ].map(s => (
                    <button
                      key={s}
                      onClick={() => setPergunta(s)}
                      className="text-sm text-brand-blue border border-brand-border rounded-xl px-4 py-2 hover:bg-brand-light transition-all text-left"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {historico.map((msg, i) => (
              <div
                key={i}
                className={clsx(
                  'flex gap-2 max-w-[85%]',
                  msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                )}
              >
                <div className={clsx(
                  'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                  msg.role === 'user'
                    ? 'bg-brand-gradient'
                    : 'bg-brand-light'
                )}>
                  {msg.role === 'user'
                    ? <User size={14} className="text-white" />
                    : <Bot  size={14} className="text-brand-blue" />}
                </div>
                <div className={clsx(
                  'px-4 py-3 rounded-2xl text-sm leading-relaxed',
                  msg.role === 'user'
                    ? 'bg-brand-blue text-white rounded-tr-none'
                    : 'bg-white border border-brand-border text-brand-navy rounded-tl-none'
                )}>
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2 mr-auto">
                <div className="w-8 h-8 rounded-full bg-brand-light flex items-center justify-center">
                  <Bot size={14} className="text-brand-blue" />
                </div>
                <div className="bg-white border border-brand-border rounded-2xl rounded-tl-none px-4 py-3">
                  <div className="flex gap-1">
                    {[0,1,2].map(i => (
                      <div
                        key={i}
                        className="w-2 h-2 bg-brand-muted rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={enviar}
            className="p-4 border-t border-brand-border bg-white flex gap-2"
          >
            <input
              className="input flex-1"
              placeholder="Pergunte sobre sua saúde..."
              value={pergunta}
              onChange={e => setPergunta(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !pergunta.trim()}
              className="w-12 h-12 rounded-xl bg-brand-gradient flex items-center justify-center disabled:opacity-50 flex-shrink-0"
            >
              <Send size={18} className="text-white" />
            </button>
          </form>
        </main>
      </div>

      <BottomNav />
    </div>
  )
}
