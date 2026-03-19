import axios from 'axios'
import Cookies from 'js-cookie'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

// injeta o token JWT em todas as requisições autenticadas
api.interceptors.request.use((config) => {
  const token = Cookies.get('medtrack_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// redireciona para login se token expirar
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('medtrack_token')
      Cookies.remove('medtrack_usuario')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ── Auth ──
export const authAPI = {
  login: (username: string, senha: string) =>
    api.post('/auth/login', { username, senha }),

  register: (dados: object) =>
    api.post('/auth/register', dados),

  alterarSenha: (dados: object) =>
    api.post('/auth/alterar-senha', dados),
}

// ── Dashboard ──
export const dashboardAPI = {
  get: () => api.get('/dashboard/'),
}

// ── Exames ──
export const examesAPI = {
  listar: () => api.get('/exames/'),

  upload: (formData: FormData) =>
    api.post('/exames/upload', formData),

  excluir: (id: number) => api.delete(`/exames/${id}`),

  buscar: (id: number) => api.get(`/exames/${id}`),
}

// ── Alertas ──
export const alertasAPI = {
  listar: () => api.get('/alertas/'),

  marcarLido: (id: number) => api.patch(`/alertas/${id}/lido`),

  marcarTodosLidos: () => api.patch('/alertas/lidos/todos'),
}

// ── Perfil ──
export const perfilAPI = {
  get: () => api.get('/perfil/'),

  salvar: (dados: object) => api.put('/perfil/', dados),
}

// ── Chat ──
export const chatAPI = {
  perguntar: (pergunta: string, historico: object[]) =>
    api.post('/chat/', { pergunta, historico }),
}

// ── Compartilhar ──
export const compartilharAPI = {
  gerarLink:   () => api.post('/compartilhar/link'),
  getLinkAtivo: () => api.get('/compartilhar/link/ativo'),
  revogarLink:  () => api.delete('/compartilhar/link'),
  downloadPdf:  () => api.get('/compartilhar/pdf', { responseType: 'blob' }),
  acessoMedico: (token: string) =>
    api.get(`/compartilhar/medico/${token}`, { responseType: 'blob' }),
}
