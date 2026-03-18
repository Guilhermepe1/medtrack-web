import Cookies from 'js-cookie'

const TOKEN_KEY   = 'medtrack_token'
const USUARIO_KEY = 'medtrack_usuario'

export interface SessaoUsuario {
  id:   number
  nome: string
}

export function salvarSessao(token: string, usuario: SessaoUsuario) {
  Cookies.set(TOKEN_KEY,   token,                    { expires: 7, secure: true, sameSite: 'strict' })
  Cookies.set(USUARIO_KEY, JSON.stringify(usuario),  { expires: 7, secure: true, sameSite: 'strict' })
}

export function getSessao(): SessaoUsuario | null {
  const raw = Cookies.get(USUARIO_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function getToken(): string | undefined {
  return Cookies.get(TOKEN_KEY)
}

export function encerrarSessao() {
  Cookies.remove(TOKEN_KEY)
  Cookies.remove(USUARIO_KEY)
}

export function estaLogado(): boolean {
  return !!getToken()
}
