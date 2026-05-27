export type LeadStatus = 'Novo' | 'Em Atendimento' | 'Orçamento Entregue' | 'Negociação' | 'Fechado' | 'Perdido';
export type LeadTemperatura = 'Frio' | 'Morno' | 'Quente';
export type TipoProjeto = 'Residencial' | 'Comercial' | 'Corporativo' | 'Industrial' | 'Outro';
export type InteresseAcabamento = 'Mármores' | 'Granitos' | 'Quartzos' | 'Acabamentos Especiais' | 'Porcelanatos' | 'Outro';
export type FaseObra = 'Projeto' | 'Alvenaria' | 'Acabamento/Revestimento' | 'Instalação' | 'Pronto';
export type FaixaInvestimento = 'Até R$ 5k' | 'R$ 5k - R$ 15k' | 'R$ 15k - R$ 50k' | 'Acima de R$ 50k';

export interface Lead {
  id: string;
  nome: string;
  telefone?: string;
  cidade?: string;
  origem?: string;
  campanha?: string;
  status: LeadStatus;
  temperatura: LeadTemperatura;
  data_entrada: string; // ISO DateTime
  tempo_resposta_min?: number;
  responsavel?: string;
  tipo_projeto?: TipoProjeto;
  interesse?: string;
  fase_obra?: FaseObra;
  faixa_investimento?: string;
  medidas?: string;
  foto_url?: string; // Reservado para link do Google Maps
  observacoes?: string;
  proxima_acao?: string;
  data_proximo_followup?: string; // ISO DateTime
  valor_estimado?: number;
  probabilidade_fechamento?: number; // 0-100
  data_prevista_fechamento?: string; // ISO Date (YYYY-MM-DD)
  prioridade: boolean;
  respondido: boolean;
  data_primeira_resposta?: string; // ISO DateTime
  arquivado?: boolean;
}

export type OrcamentoStatus = 'A montar' | 'Enviado' | 'Aprovado' | 'Recusado' | 'Vencido';
export type OpcaoOrcamento = 'Essencial' | 'Premium' | 'Completa';

export interface Orcamento {
  id: string;
  lead_id: string;
  lead_nome: string;
  data_orcamento: string; // ISO Date YYYY-MM-DD
  tipo_projeto?: TipoProjeto;
  valor_essencial?: number;
  valor_premium?: number;
  valor_completa?: number;
  opcao_recomendada?: OpcaoOrcamento;
  status: OrcamentoStatus;
  prazo_validade: string; // ISO Date
  observacoes?: string;
  data_proximo_followup?: string; // ISO DateTime
  motivo_perda?: string;
}

export type CampanhaPlataforma = 'Facebook Ads' | 'Google Ads' | 'Instagram Organico' | 'Indicação' | 'Panfletagem' | 'Outro';

export interface Campanha {
  id: string;
  nome: string;
  plataforma: CampanhaPlataforma;
  valor_investido: number;
  leads_gerados: number;
  leads_qualificados: number;
  orcamentos_enviados: number;
  vendas_fechadas: number;
  receita_gerada: number;
  ativo: boolean;
}

export type StatusInstalacao = 'Aguardando medição' | 'Medição agendada' | 'Em corte/produção' | 'Instalação agendada' | 'Instalação concluída' | 'Entregue';

export interface Venda {
  id: string;
  lead_id?: string;
  cliente_nome: string;
  projeto_vendido: string;
  valor_fechado: number;
  data_fechamento: string; // ISO Date
  forma_pagamento?: string;
  status_instalacao: StatusInstalacao;
  observacoes?: string;
  origem?: string;
  campanha?: string;
  responsavel?: string;
}

export type LigacaoDirecao = 'Ativa' | 'Receptiva';
export type LigacaoResultado = 'Sucesso' | 'Não Atendeu' | 'Caixa Postal' | 'Ocupado' | 'Ligar mais tarde';

export interface Ligacao {
  id: string;
  lead_id: string;
  lead_nome: string;
  data: string; // ISO DateTime
  duracao_min: number;
  direcao: LigacaoDirecao;
  atendeu: boolean;
  resultado: LigacaoResultado;
  resumo?: string;
  proxima_acao?: string;
  data_retorno?: string; // ISO DateTime
}

export type AtendimentoCanal = 'WhatsApp' | 'Ligação' | 'E-mail' | 'Presencial Showroom' | 'Instagram DM';
export type AtendimentoTipoInteracao = 'Primeiro contato' | 'Dúvida' | 'Envio de medidas' | 'Negociação' | 'Pós-Venda';

export interface Atendimento {
  id: string;
  lead_id: string;
  lead_nome: string;
  data: string; // ISO DateTime
  canal: AtendimentoCanal;
  tipo_interacao: AtendimentoTipoInteracao;
  resumo?: string;
  resultado?: string;
  proxima_acao?: string;
  data_proximo_contato?: string; // ISO DateTime
}

export type EventoTipo = 'Follow-up' | 'Visita' | 'Reunião' | 'Ligação' | 'Instalação' | 'Outro';
export type EventoCor = 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'orange';

export interface Evento {
  id: string;
  titulo: string;
  descricao?: string;
  data_inicio: string; // ISO DateTime
  data_fim?: string; // ISO DateTime
  dia_inteiro: boolean;
  tipo: EventoTipo;
  lead_id?: string;
  lead_nome?: string;
  cor: EventoCor;
  concluido: boolean;
}

export interface Notification {
  id: string;
  tipo: 'atraso_followup' | 'novo_urgente' | 'orcamento_vencendo' | 'geral';
  titulo: string;
  mensagem: string;
  data: string; // ISO DateTime
  lida: boolean;
  link?: string;
  entidadeId?: string;
}

export interface User {
  id: string;
  email: string;
  nome: string;
}
