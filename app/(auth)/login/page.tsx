'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authAPI } from '@/lib/api'
import { salvarSessao } from '@/lib/auth'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm]       = useState({ username: '', senha: '' })
  const [erro, setErro]       = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setLoading(true)

    try {
      const { data } = await authAPI.login(form.username, form.senha)
      salvarSessao(data.access_token, {
        id:   data.usuario_id,
        nome: data.usuario_nome,
      })
      router.push('/dashboard')
    } catch (err: any) {
      setErro(err.response?.data?.detail || 'Erro ao fazer login.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-light flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img src="/logo-medtrack.png" alt="MedTrack" className="w-20 h-20 mb-3" />
          <h1 className="text-2xl font-bold text-brand-navy">MedTrack</h1>
          <p className="text-brand-muted text-sm">Health AI</p>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-brand-navy mb-6">Entrar</h2>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="label">Usuário</label>
              <input
                className="input"
                placeholder="seu_username"
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="label">Senha</label>
              <input
                className="input"
                type="password"
                placeholder="••••••••"
                value={form.senha}
                onChange={e => setForm({ ...form, senha: e.target.value })}
                required
              />
            </div>

            {erro && (
              <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">
                {erro}
              </p>
            )}

            <button className="btn-primary mt-2" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p className="text-center text-sm text-brand-muted mt-4">
            Não tem conta?{' '}
            <Link href="/register" className="text-brand-blue font-medium">
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
