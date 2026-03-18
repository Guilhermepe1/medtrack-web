'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { api, authAPI } from '@/lib/api'
import { Usuario } from '@/types'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'

export default function ContaPage() {
  const { usuario: sessao, carregando } = useAuth()
  const [dados, setDados]    = useState<Partial<Usuario>>({})
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [sucesso, setSucesso]   = useState('')
  const [erro, setErro]         = useState('')

  // estado de senha
  const [senha, setSenha] = useState({ atual: '', nova: '', confirma: '' })
  const [senhaErro, setSenhaErro]     = useState('')
  const [senhaSucesso, setSenhaSucesso] = useState(false)

  useEffect(() => {
    if (!carregando) {
      api.get('/usuarios/me')
        .then(r => setDados(r.data))
        .catch(() => {})
        .finally(() => setLoading(false))
    }
  }, [carregando])

  async function buscarCep(cep: string) {
    const limpo = cep.replace(/\D/g, '')
    if (limpo.length !== 8) return
    try {
      const r = await fetch(`https://viacep.com.br/ws/${limpo}/json/`)
      const d = await r.json()
      if (!d.erro) {
        setDados(prev => ({
          ...prev,
          logradouro: d.logradouro,
          bairro:     d.bairro,
          cidade:     d.localidade,
          estado:     d.uf,
        }))
      }
    } catch {}
  }

  async function salvarDados(e: React.FormEvent) {
    e.preventDefault()
    setSalvando(true)
    setErro('')
    setSucesso('')
    try {
      await api.put('/usuarios/me', dados)
      setSucesso('Dados atualizados com sucesso!')
      setTimeout(() => setSucesso(''), 3000)
    } catch (err: any) {
      setErro(err.response?.data?.detail || 'Erro ao salvar.')
    } finally {
      setSalvando(false)
    }
  }

  async function alterarSenha(e: React.FormEvent) {
    e.preventDefault()
    setSenhaErro('')
    if (senha.nova !== senha.confirma) {
      setSenhaErro('As senhas não coincidem.')
      return
    }
    try {
      await authAPI.alterarSenha({
        senha_atual:    senha.atual,
        nova_senha:     senha.nova,
        confirma_senha: senha.confirma,
      })
      setSenhaSucesso(true)
      setSenha({ atual: '', nova: '', confirma: '' })
      setTimeout(() => setSenhaSucesso(false), 3000)
    } catch (err: any) {
      setSenhaErro(err.response?.data?.detail || 'Erro ao alterar senha.')
    }
  }

  const ESTADOS = ['','AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS',
    'MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']

  if (carregando || loading) return null

  return (
    <div className="page-container">
      <Sidebar />
      <div className="page-content">
        <Header />
        <main className="page-body">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-brand-navy">Minha Conta</h1>
            <p className="text-brand-muted text-sm mt-1">Visualize e edite seus dados cadastrais</p>
          </div>

          {/* Dados pessoais */}
          <form onSubmit={salvarDados} className="flex flex-col gap-4 mb-6">
            <div className="card">
              <h2 className="font-semibold text-brand-navy mb-4">Dados pessoais</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="label">Nome completo *</label>
                  <input className="input" value={dados.nome_completo || ''}
                    onChange={e => setDados({ ...dados, nome_completo: e.target.value })} required />
                </div>
                <div>
                  <label className="label">E-mail *</label>
                  <input className="input" type="email" value={dados.email || ''}
                    onChange={e => setDados({ ...dados, email: e.target.value })} required />
                </div>
                <div>
                  <label className="label">CPF</label>
                  <input className="input bg-brand-light" value={dados.cpf || ''} disabled
                    title="O CPF não pode ser alterado" />
                </div>
                <div>
                  <label className="label">Celular *</label>
                  <input className="input" placeholder="(11) 99999-9999"
                    value={dados.celular || ''}
                    onChange={e => setDados({ ...dados, celular: e.target.value })} required />
                </div>
                <div className="md:col-span-2">
                  <label className="label">Data de nascimento *</label>
                  <input className="input" type="date" value={dados.data_nascimento || ''}
                    onChange={e => setDados({ ...dados, data_nascimento: e.target.value })} required />
                </div>
              </div>
            </div>

            <div className="card">
              <h2 className="font-semibold text-brand-navy mb-4">Endereço</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="label">CEP *</label>
                    <input className="input" placeholder="00000-000" maxLength={9}
                      value={dados.cep || ''}
                      onChange={e => setDados({ ...dados, cep: e.target.value })}
                      onBlur={e => buscarCep(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="label">Número *</label>
                  <input className="input" value={dados.numero || ''}
                    onChange={e => setDados({ ...dados, numero: e.target.value })} required />
                </div>
                <div className="md:col-span-2">
                  <label className="label">Logradouro *</label>
                  <input className="input" value={dados.logradouro || ''}
                    onChange={e => setDados({ ...dados, logradouro: e.target.value })} required />
                </div>
                <div>
                  <label className="label">Complemento</label>
                  <input className="input" placeholder="Apto, Bloco..." value={dados.complemento || ''}
                    onChange={e => setDados({ ...dados, complemento: e.target.value })} />
                </div>
                <div>
                  <label className="label">Bairro *</label>
                  <input className="input" value={dados.bairro || ''}
                    onChange={e => setDados({ ...dados, bairro: e.target.value })} required />
                </div>
                <div>
                  <label className="label">Cidade *</label>
                  <input className="input" value={dados.cidade || ''}
                    onChange={e => setDados({ ...dados, cidade: e.target.value })} required />
                </div>
                <div>
                  <label className="label">Estado *</label>
                  <select className="input" value={dados.estado || ''}
                    onChange={e => setDados({ ...dados, estado: e.target.value })} required>
                    {ESTADOS.map(uf => <option key={uf} value={uf}>{uf || 'Selecione'}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {sucesso && <p className="text-emerald-600 bg-emerald-50 text-sm px-4 py-3 rounded-xl">✅ {sucesso}</p>}
            {erro    && <p className="text-red-500 bg-red-50 text-sm px-4 py-3 rounded-xl">{erro}</p>}

            <button className="btn-primary" disabled={salvando}>
              {salvando ? 'Salvando...' : '💾 Salvar dados'}
            </button>
          </form>

          {/* Alterar senha */}
          <form onSubmit={alterarSenha} className="flex flex-col gap-4">
            <div className="card">
              <h2 className="font-semibold text-brand-navy mb-4">Alterar senha</h2>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="label">Senha atual *</label>
                  <input className="input" type="password" value={senha.atual}
                    onChange={e => setSenha({ ...senha, atual: e.target.value })} required />
                </div>
                <div>
                  <label className="label">Nova senha *</label>
                  <input className="input" type="password" placeholder="mínimo 8 caracteres"
                    value={senha.nova}
                    onChange={e => setSenha({ ...senha, nova: e.target.value })} required />
                </div>
                <div>
                  <label className="label">Confirmar nova senha *</label>
                  <input className="input" type="password" value={senha.confirma}
                    onChange={e => setSenha({ ...senha, confirma: e.target.value })} required />
                </div>
              </div>
            </div>

            {senhaErro   && <p className="text-red-500 bg-red-50 text-sm px-4 py-3 rounded-xl">{senhaErro}</p>}
            {senhaSucesso && <p className="text-emerald-600 bg-emerald-50 text-sm px-4 py-3 rounded-xl">✅ Senha alterada!</p>}

            <button className="btn-secondary">🔑 Alterar senha</button>
          </form>
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
