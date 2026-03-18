// ── Auth ──
export interface TokenResponse {
  access_token: string
  token_type:   string
  usuario_id:   number
  usuario_nome: string
}

export interface LoginRequest {
  username: string
  senha:    string
}

export interface RegistroRequest {
  nome:            string
  username:        string
  senha:           string
  nome_completo:   string
  data_nascimento: string
  cpf:             string
  email:           string
  celular:         string
  cep:             string
  logradouro:      string
  numero:          string
  complemento?:    string
  bairro:          string
  cidade:          string
  estado:          string
}

// ── Usuário ──
export interface Usuario {
  id:              number
  nome:            string
  username:        string
  email?:          string
  nome_completo?:  string
  data_nascimento?: string
  cpf?:            string
  celular?:        string
  cep?:            string
  logradouro?:     string
  numero?:         string
  complemento?:    string
  bairro?:         string
  cidade?:         string
  estado?:         string
}

// ── Exames ──
export interface Exame {
  id:           number
  arquivo:      string
  resumo?:      string
  categoria?:   string
  nome_exame?:  string
  data_exame?:  string
  data_upload:  string
  medico?:      string
  hospital?:    string
  storage_path?: string
}

// ── Dashboard ──
export interface Recomendacao {
  icone:      string
  texto:      string
  prioridade: number
}

export interface Dashboard {
  score:              number
  categoria:          string
  cor:                string
  total_exames:       number
  alertas_nao_lidos:  number
  imc?:               number
  categoria_imc?:     string
  idade?:             number
  ultimo_exame?:      Exame
  recomendacoes:      Recomendacao[]
}

// ── Alertas ──
export interface Alerta {
  id:             number
  parametro:      string
  valor:          number
  unidade?:       string
  referencia_min?: number
  referencia_max?: number
  status:         'alto' | 'baixo' | 'normal'
  lido:           boolean
  created_at:     string
  arquivo?:       string
}

// ── Perfil de saúde ──
export interface PerfilSaude {
  data_nascimento?:  string
  sexo?:             string
  peso?:             number
  altura?:           number
  condicoes?:        string[]
  outras_condicoes?: string
  medicamentos?:     string
  fumante?:          string
  consumo_alcool?:   string
  atividade_fisica?: string
  imc?:              number
  idade?:            number
}

// ── Chat ──
export interface Mensagem {
  role:    'user' | 'assistant'
  content: string
}

export interface ChatRequest {
  pergunta:  string
  historico: Mensagem[]
}

// ── Compartilhar ──
export interface LinkMedico {
  token:        string
  url:          string
  expira_em:    string
  acessado_em?: string
  created_at:   string
}

// ── Valores laboratoriais ──
export interface ValorLaboratorial {
  parametro:      string
  valor?:         number
  unidade?:       string
  referencia_min?: number
  referencia_max?: number
  status?:        string
  data_coleta?:   string
}
