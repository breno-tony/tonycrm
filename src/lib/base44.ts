import { Lead, Orcamento, Campanha, Venda, Ligacao, Atendimento, Evento, Notification, User } from '../types';

// Helper to load/save from localStorage
function getStorage<T>(key: string, defaultValue: T): T {
  const data = localStorage.getItem(`tony_crm_${key}`);
  if (!data) {
    return defaultValue;
  }
  try {
    return JSON.parse(data) as T;
  } catch (e) {
    return defaultValue;
  }
}

function setStorage<T>(key: string, value: T): void {
  localStorage.setItem(`tony_crm_${key}`, JSON.stringify(value));
}

// System Time Mock: "2026-05-22"
export const CURRENT_MOCK_TIME = '2026-05-22T17:00:00Z';

// Seed Initial Data
const INITIAL_LEADS: Lead[] = [
  {
    id: 'lead-1',
    nome: 'Ana Silva',
    telefone: '(21) 98765-4321',
    cidade: 'São Paulo',
    origem: 'Instagram',
    campanha: 'Verão 2024',
    status: 'Novo',
    temperatura: 'Quente',
    data_entrada: '2026-05-15T09:00:00Z',
    tempo_resposta_min: 15,
    responsavel: 'Tony',
    tipo_projeto: 'Residencial',
    interesse: 'Mármores',
    fase_obra: 'Acabamento/Revestimento',
    faixa_investimento: 'R$ 15k - R$ 50k',
    observacoes: 'Cliente busca mármore Carrara para bancada da cozinha e banheiros.',
    proxima_acao: 'Visita',
    data_proximo_followup: '2026-05-19T10:00:00Z', // 3 days overdue (22 - 19)
    valor_estimado: 25000,
    probabilidade_fechamento: 70,
    prioridade: false,
    respondido: false
  },
  {
    id: 'lead-2',
    nome: 'Pedro Oliveira',
    telefone: '(21) 91234-5678',
    cidade: 'Rio de Janeiro',
    origem: 'Indicação',
    campanha: 'Indicação',
    status: 'Em Atendimento',
    temperatura: 'Quente',
    data_entrada: '2026-05-18T14:00:00Z',
    tempo_resposta_min: 5,
    responsavel: 'Tony',
    tipo_projeto: 'Corporativo',
    interesse: 'Quartzos',
    fase_obra: 'Projeto',
    faixa_investimento: 'Acima de R$ 50k',
    observacoes: 'Startup Tech querendo revestir recepção com quartzo cinza estelar.',
    proxima_acao: 'Ligação',
    data_proximo_followup: '2026-05-23T10:00:00Z', // Tomorrow (23) at 10h
    valor_estimado: 62000,
    probabilidade_fechamento: 85, // > 80% means orange border
    prioridade: true,
    respondido: true,
    data_primeira_resposta: '2026-05-18T14:05:00Z'
  },
  {
    id: 'lead-3',
    nome: 'Empresa XPTO Ltda',
    telefone: '(31) 99876-1234',
    cidade: 'Belo Horizonte',
    origem: 'Google Ads',
    campanha: 'Lançamento Revestimentos',
    status: 'Negociação',
    temperatura: 'Morno',
    data_entrada: '2026-05-10T11:00:00Z',
    tempo_resposta_min: 45,
    responsavel: 'Tony',
    tipo_projeto: 'Comercial',
    interesse: 'Acabamentos Especiais',
    fase_obra: 'Alvenaria',
    faixa_investimento: 'R$ 15k - R$ 50k',
    observacoes: 'Contrato comercial de revestimento para restaurante fino em BH.',
    proxima_acao: 'Atendimento',
    // data_proximo_followup is 2026-05-17 (5 days overdue)
    data_proximo_followup: '2026-05-17T14:30:00Z',
    valor_estimado: 45000,
    probabilidade_fechamento: 60,
    prioridade: false,
    respondido: true,
    data_primeira_resposta: '2026-05-10T11:45:00Z'
  },
  {
    id: 'lead-4',
    nome: 'Roberto Pereira',
    telefone: '(41) 98123-4567',
    cidade: 'Curitiba',
    origem: 'Facebook Ads',
    campanha: 'Facebook Ads',
    status: 'Orçamento Entregue',
    temperatura: 'Morno',
    data_entrada: '2026-05-14T08:30:00Z',
    tempo_resposta_min: 20,
    responsavel: 'Juliana',
    tipo_projeto: 'Residencial',
    interesse: 'Porcelanatos',
    fase_obra: 'Pronto',
    faixa_investimento: 'R$ 5k - R$ 15k',
    observacoes: 'Precisando de porcelanato de grande formato polido para sala inteira.',
    proxima_acao: 'Followup',
    data_proximo_followup: '2026-05-20T16:00:00Z', // 2 days overdue (22 - 20)
    valor_estimado: 12500,
    probabilidade_fechamento: 50,
    prioridade: false,
    respondido: true,
    data_primeira_resposta: '2026-05-14T08:50:00Z'
  },
  {
    id: 'lead-5',
    nome: 'Cláudio Marques',
    telefone: '(11) 97766-5544',
    cidade: 'São Paulo',
    origem: 'Instagram',
    campanha: 'Verão 2024',
    status: 'Fechado',
    temperatura: 'Quente',
    data_entrada: '2026-05-12T10:00:00Z',
    tempo_resposta_min: 10,
    responsavel: 'Tony',
    tipo_projeto: 'Residencial',
    interesse: 'Granitos',
    fase_obra: 'Pronto',
    faixa_investimento: 'R$ 5k - R$ 15k',
    observacoes: 'Comprou granito preto absoluto para área gourmet.',
    valor_estimado: 9800,
    probabilidade_fechamento: 100,
    prioridade: false,
    respondido: true
  }
];

const INITIAL_ORCAMENTOS: Orcamento[] = [
  {
    id: 'orc-1',
    lead_id: 'lead-4',
    lead_nome: 'Roberto Pereira',
    data_orcamento: '2026-05-16',
    tipo_projeto: 'Residencial',
    valor_essencial: 9800,
    valor_premium: 12500,
    valor_completa: 16800,
    opcao_recomendada: 'Premium',
    status: 'Enviado',
    prazo_validade: '2026-05-23', // Vencendo amanhã! (near overdue)
    observacoes: 'Orçamento enviado por WhatsApp. Cliente analisando o frete.'
  },
  {
    id: 'orc-2',
    lead_id: 'lead-1',
    lead_nome: 'Ana Silva',
    data_orcamento: '2026-05-18',
    tipo_projeto: 'Residencial',
    valor_essencial: 18000,
    valor_premium: 25000,
    valor_completa: 34000,
    opcao_recomendada: 'Premium',
    status: 'A montar',
    prazo_validade: '2026-05-25',
    observacoes: 'Necessita confirmar as medidas exatas do nicho dos banheiros.'
  },
  {
    id: 'orc-3',
    lead_id: 'lead-3',
    lead_nome: 'Empresa XPTO Ltda',
    data_orcamento: '2026-05-12',
    tipo_projeto: 'Comercial',
    valor_essencial: 35000,
    valor_premium: 45000,
    valor_completa: 60000,
    opcao_recomendada: 'Premium',
    status: 'Enviado',
    prazo_validade: '2026-05-19', // Vencido! 3 days overdue
    observacoes: 'Aguardando assembleia de sócios para fechar contrato.',
    data_proximo_followup: '2026-05-17T14:30:00Z'
  }
];

const INITIAL_CAMPANHAS: Campanha[] = [
  {
    id: 'camp-1',
    nome: 'Verão 2024',
    plataforma: 'Facebook Ads',
    valor_investido: 1200,
    leads_gerados: 45,
    leads_qualificados: 18,
    orcamentos_enviados: 12,
    vendas_fechadas: 3,
    receita_gerada: 34800, // ROI = (34800 / 1200) = 29x
    ativo: true
  },
  {
    id: 'camp-2',
    nome: 'Lançamento Revestimentos',
    plataforma: 'Google Ads',
    valor_investido: 1800,
    leads_gerados: 32,
    leads_qualificados: 15,
    orcamentos_enviados: 9,
    vendas_fechadas: 2,
    receita_gerada: 52000,
    ativo: true
  },
  {
    id: 'camp-3',
    nome: 'Instagram Orgânico',
    plataforma: 'Instagram Organico',
    valor_investido: 0,
    leads_gerados: 110,
    leads_qualificados: 45,
    orcamentos_enviados: 25,
    vendas_fechadas: 12,
    receita_gerada: 145000,
    ativo: true
  }
];

const INITIAL_VENDAS: Venda[] = [
  {
    id: 'venda-1',
    lead_id: 'lead-5',
    cliente_nome: 'Cláudio Marques',
    projeto_vendido: 'Granito Preto Absoluto para Cozinha',
    valor_fechado: 9800,
    data_fechamento: '2026-05-17',
    forma_pagamento: 'Pix (50% entrada, 50% após entrega)',
    status_instalacao: 'Aguardando medição',
    observacoes: 'Apartamento novo no centro. Agendar com zelador.',
    origem: 'Instagram',
    campanha: 'Verão 2024',
    responsavel: 'Tony'
  },
  {
    id: 'venda-2',
    cliente_nome: 'Maria de Lurdes',
    projeto_vendido: 'Mármore Crema Marfil Suíte Casal',
    valor_fechado: 14200,
    data_fechamento: '2026-05-11',
    forma_pagamento: 'Cartão de Crédito 10x',
    status_instalacao: 'Em corte/produção',
    observacoes: 'Chapas já selecionadas no pátio, aguardando início do corte.',
    origem: 'Indicação',
    campanha: 'Indicação',
    responsavel: 'Juliana'
  }
];

const INITIAL_LIGACOES: Ligacao[] = [
  {
    id: 'call-1',
    lead_id: 'lead-2',
    lead_nome: 'Pedro Oliveira',
    data: '2026-05-18T14:05:00Z',
    duracao_min: 4,
    direcao: 'Ativa',
    atendeu: true,
    resultado: 'Sucesso',
    resumo: 'Apresentação da empresa. Cliente demonstrou muito interesse e solicitou agendamento para rechear medidas.',
    proxima_acao: 'Enviar portfólio por WhatsApp',
    data_retorno: '2026-05-18T15:00:00Z'
  },
  {
    id: 'call-2',
    lead_id: 'lead-1',
    lead_nome: 'Ana Silva',
    data: '2026-05-15T09:15:00Z',
    duracao_min: 0,
    direcao: 'Ativa',
    atendeu: false,
    resultado: 'Não Atendeu',
    resumo: 'Tentativa de primeiro contato após entrada do lead. Sem sucesso.'
  }
];

const INITIAL_ATENDIMENTOS: Atendimento[] = [
  {
    id: 'atend-1',
    lead_id: 'lead-2',
    lead_nome: 'Pedro Oliveira',
    data: '2026-05-18T14:30:00Z',
    canal: 'WhatsApp',
    tipo_interacao: 'Primeiro contato',
    resumo: 'Envio de catálogo de quartzos e fotos de obras corporativas concluídas.',
    proxima_acao: 'Aguardar resposta com as dimensões aproximadas.',
    data_proximo_contato: '2026-05-20T10:00:00Z'
  },
  {
    id: 'atend-2',
    lead_id: 'lead-4',
    lead_nome: 'Roberto Pereira',
    data: '2026-05-15T10:00:00Z',
    canal: 'Presencial Showroom',
    tipo_interacao: 'Envio de medidas',
    resumo: 'Cliente visitou o showroom, escolheu o porcelanato cinza polido e entregou a planta da sala.',
    proxima_acao: 'Montar orçamento com 3 opções sugeridas.',
    data_proximo_contato: '2026-05-16T15:00:00Z'
  }
];

const INITIAL_EVENTOS: Evento[] = [
  {
    id: 'event-1',
    titulo: 'Visita de Medição - Cláudio Marques',
    descricao: 'Medir revestimento gourmet para corte do Granito Preto Absoluto.',
    data_inicio: '2026-05-24T09:00:00Z',
    data_fim: '2026-05-24T11:00:00Z',
    dia_inteiro: false,
    tipo: 'Visita',
    lead_id: 'lead-5',
    lead_nome: 'Cláudio Marques',
    cor: 'green',
    concluido: false
  },
  {
    id: 'event-2',
    titulo: 'Retornar Ligação - Empresa XPTO',
    descricao: 'Seguir negociação e reavaliar desconto no frete.',
    data_inicio: '2026-05-22T15:00:00Z',
    dia_inteiro: false,
    tipo: 'Ligação',
    lead_id: 'lead-3',
    lead_nome: 'Empresa XPTO Ltda',
    cor: 'red',
    concluido: true
  },
  {
    id: 'event-3',
    titulo: 'Reunião de Alinhamento - Pedro Oliveira',
    descricao: 'Definição dos acabamentos de quartzo para a startup.',
    data_inicio: '2026-05-25T14:00:00Z',
    data_fim: '2026-05-25T15:00:00Z',
    dia_inteiro: false,
    tipo: 'Reunião',
    lead_id: 'lead-2',
    lead_nome: 'Pedro Oliveira',
    cor: 'blue',
    concluido: false
  }
];

// Seed initial notifications based on overdue data:
const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    tipo: 'atraso_followup',
    titulo: 'Follow-up Atrasado - Ana Silva',
    mensagem: 'O próximo follow-up para Ana Silva está atrasado desde 19/05/2026.',
    data: '2026-05-19T10:00:00Z',
    lida: false,
    entidadeId: 'lead-1'
  },
  {
    id: 'notif-2',
    tipo: 'atraso_followup',
    titulo: 'Follow-up Atrasado - Empresa XPTO',
    mensagem: 'O próximo follow-up para Empresa XPTO está atrasado desde 17/05/2026 e não houve ligação nos últimos 5 dias.',
    data: '2026-05-17T14:30:00Z',
    lida: false,
    entidadeId: 'lead-3'
  },
  {
    id: 'notif-3',
    tipo: 'orcamento_vencendo',
    titulo: 'Orçamento Próximo do Vencimento - Roberto Pereira',
    mensagem: 'O orçamento premiun de Roberto Pereira vence amanhã (23/05/2026).',
    data: '2026-05-22T08:00:00Z',
    lida: false,
    entidadeId: 'orc-1'
  }
];

// Initialize local DB on load
export const Base44DB = {
  initialize() {
    if (!localStorage.getItem('tony_crm_seeded')) {
      setStorage('leads', INITIAL_LEADS);
      setStorage('orcamentos', INITIAL_ORCAMENTOS);
      setStorage('campanhas', INITIAL_CAMPANHAS);
      setStorage('vendas', INITIAL_VENDAS);
      setStorage('ligacoes', INITIAL_LIGACOES);
      setStorage('atendimentos', INITIAL_ATENDIMENTOS);
      setStorage('eventos', INITIAL_EVENTOS);
      setStorage('notifications', INITIAL_NOTIFICATIONS);
      
      // Seed default user
      setStorage('users', [{ id: 'user-admin', email: 'brenotonyacabamentos@gmail.com', nome: 'Breno Tony' }]);
      setStorage('currentUser', { id: 'user-admin', email: 'brenotonyacabamentos@gmail.com', nome: 'Breno Tony' });

      localStorage.setItem('tony_crm_seeded', 'true');
    }
  },

  leads: {
    list(): Lead[] {
      return getStorage<Lead[]>('leads', []);
    },
    get(id: string): Lead | undefined {
      return this.list().find(l => l.id === id);
    },
    save(lead: Lead): Lead {
      const list = this.list();
      const idx = list.findIndex(l => l.id === lead.id);
      if (idx >= 0) {
        list[idx] = lead;
      } else {
        list.push(lead);
      }
      setStorage('leads', list);
      return lead;
    },
    delete(id: string): void {
      const list = this.list().filter(l => l.id !== id);
      setStorage('leads', list);
    }
  },

  orcamentos: {
    list(): Orcamento[] {
      return getStorage<Orcamento[]>('orcamentos', []);
    },
    get(id: string): Orcamento | undefined {
      return this.list().find(o => o.id === id);
    },
    save(orc: Orcamento): Orcamento {
      const list = this.list();
      const idx = list.findIndex(o => o.id === orc.id);
      if (idx >= 0) {
        list[idx] = orc;
      } else {
        list.push(orc);
      }
      setStorage('orcamentos', list);
      return orc;
    },
    delete(id: string): void {
      const list = this.list().filter(o => o.id !== id);
      setStorage('orcamentos', list);
    }
  },

  campanhas: {
    list(): Campanha[] {
      return getStorage<Campanha[]>('campanhas', []);
    },
    save(camp: Campanha): Campanha {
      const list = this.list();
      const idx = list.findIndex(c => c.id === camp.id);
      if (idx >= 0) {
        list[idx] = camp;
      } else {
        list.push(camp);
      }
      setStorage('campanhas', list);
      return camp;
    },
    delete(id: string): void {
      const list = this.list().filter(c => c.id !== id);
      setStorage('campanhas', list);
    }
  },

  vendas: {
    list(): Venda[] {
      return getStorage<Venda[]>('vendas', []);
    },
    save(venda: Venda): Venda {
      const list = this.list();
      const idx = list.findIndex(v => v.id === venda.id);
      if (idx >= 0) {
        list[idx] = venda;
      } else {
        list.push(venda);
      }
      setStorage('vendas', list);

      // Se a venda estiver vinculada a um Lead, atualiza o status do lead para 'Fechado'
      if (venda.lead_id) {
        const lead = Base44DB.leads.get(venda.lead_id);
        if (lead && lead.status !== 'Fechado') {
          lead.status = 'Fechado';
          lead.probabilidade_fechamento = 100;
          Base44DB.leads.save(lead);
        }
      }
      return venda;
    },
    delete(id: string): void {
      const list = this.list().filter(v => v.id !== id);
      setStorage('vendas', list);
    }
  },

  ligacoes: {
    list(): Ligacao[] {
      return getStorage<Ligacao[]>('ligacoes', []);
    },
    save(lig: Ligacao): Ligacao {
      const list = this.list();
      const idx = list.findIndex(l => l.id === lig.id);
      if (idx >= 0) {
        list[idx] = lig;
      } else {
        list.push(lig);
      }
      setStorage('ligacoes', list);

      // Se a ligação é para um Lead, e é a primeira ligação que teve resposta, marca como respondido
      const lead = Base44DB.leads.get(lig.lead_id);
      if (lead) {
        let updated = false;
        if (lig.atendeu && !lead.respondido) {
          lead.respondido = true;
          lead.data_primeira_resposta = lig.data;
          updated = true;
        }
        if (lig.proxima_acao) {
          lead.proxima_acao = lig.proxima_acao;
          updated = true;
        }
        if (lig.data_retorno) {
          lead.data_proximo_followup = lig.data_retorno;
          updated = true;
        }
        if (updated) {
          Base44DB.leads.save(lead);
        }
      }

      return lig;
    },
    delete(id: string): void {
      const list = this.list().filter(l => l.id !== id);
      setStorage('ligacoes', list);
    }
  },

  atendimentos: {
    list(): Atendimento[] {
      return getStorage<Atendimento[]>('atendimentos', []);
    },
    save(atend: Atendimento): Atendimento {
      const list = this.list();
      const idx = list.findIndex(a => a.id === atend.id);
      if (idx >= 0) {
        list[idx] = atend;
      } else {
        list.push(atend);
      }
      setStorage('atendimentos', list);

      // Marca o lead como respondido/com followup atualizado se houver detalhes
      const lead = Base44DB.leads.get(atend.lead_id);
      if (lead) {
        let updated = false;
        if (!lead.respondido) {
          lead.respondido = true;
          lead.data_primeira_resposta = atend.data;
          updated = true;
        }
        if (atend.proxima_acao) {
          lead.proxima_acao = atend.proxima_acao;
          updated = true;
        }
        if (atend.data_proximo_contato) {
          lead.data_proximo_followup = atend.data_proximo_contato;
          updated = true;
        }
        if (updated) {
          Base44DB.leads.save(lead);
        }
      }
      return atend;
    },
    delete(id: string): void {
      const list = this.list().filter(a => a.id !== id);
      setStorage('atendimentos', list);
    }
  },

  eventos: {
    list(): Evento[] {
      return getStorage<Evento[]>('eventos', []);
    },
    save(evt: Evento): Evento {
      const list = this.list();
      const idx = list.findIndex(e => e.id === evt.id);
      if (idx >= 0) {
        list[idx] = evt;
      } else {
        list.push(evt);
      }
      setStorage('eventos', list);
      return evt;
    },
    delete(id: string): void {
      const list = this.list().filter(e => e.id !== id);
      setStorage('eventos', list);
    }
  },

  notifications: {
    list(): Notification[] {
      return getStorage<Notification[]>('notifications', []);
    },
    unreadCount(): number {
      return this.list().filter(n => !n.lida).length;
    },
    markRead(id: string): void {
      const list = this.list();
      const n = list.find(item => item.id === id);
      if (n) {
        n.lida = true;
        setStorage('notifications', list);
      }
    },
    markAllRead(): void {
      const list = this.list().map(n => ({ ...n, lida: true }));
      setStorage('notifications', list);
    },
    add(n: Omit<Notification, 'id' | 'lida'>): Notification {
      const list = this.list();
      const newN: Notification = {
        ...n,
        id: `notif-${Date.now()}`,
        lida: false
      };
      list.unshift(newN);
      setStorage('notifications', list);

      // Dispatch real-time custom event to let the React application show Option 1 (In-App popup)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('tony_crm_notification_received', { detail: newN }));

        // Attempt Option 2 (Google Chrome / Desktop native standard notification pop-up)
        if ('Notification' in window && window.Notification.permission === 'granted') {
          try {
            new window.Notification(newN.titulo, {
              body: newN.mensagem,
              icon: 'https://cdn-icons-png.flaticon.com/512/2875/2875394.png' // Professional Google/Bell icon url
            });
          } catch (e) {
            console.error('Failed to dispatch native desktop notification:', e);
          }
        }
      }

      return newN;
    }
  }
};

// Auth Simulation
export const base44 = {
  auth: {
    getCurrentUser(): User | null {
      Base44DB.initialize();
      return getStorage<User | null>('currentUser', null);
    },
    login(email: string, pass: string): Promise<User> {
      Base44DB.initialize();
      return new Promise((resolve, reject) => {
        // Simple mock authentication - anyone can login for convenience,
        // but default with User brenotonyacabamentos@gmail.com
        const users = getStorage<User[]>('users', []);
        let user = users.find(u => u.email === email);
        if (!user) {
          // auto register or error - let's treat it as success and create a new session
          user = {
            id: `user-${Date.now()}`,
            email: email,
            nome: email.split('@')[0].toUpperCase()
          };
          users.push(user);
          setStorage('users', users);
        }
        setStorage('currentUser', user);
        resolve(user);
      });
    },
    signUp(email: string, pass: string, name: string): Promise<User> {
      Base44DB.initialize();
      return new Promise((resolve) => {
        const users = getStorage<User[]>('users', []);
        const newUser: User = {
          id: `user-${Date.now()}`,
          email,
          nome: name
        };
        users.push(newUser);
        setStorage('users', users);
        setStorage('currentUser', newUser);
        resolve(newUser);
      });
    },
    logout(): void {
      setStorage('currentUser', null);
    },
    forgotPassword(email: string): Promise<void> {
      return Promise.resolve();
    },
    resetPassword(token: string, pass: string): Promise<void> {
      return Promise.resolve();
    }
  },
  db: Base44DB
};

// Dynamic helper to check critical criteria and get live figures from DB
export function getCriticalMetrics() {
  const leads = Base44DB.leads.list();
  const calls = Base44DB.ligacoes.list();
  const services = Base44DB.atendimentos.list();
  const budgets = Base44DB.orcamentos.list();

  const now = new Date(CURRENT_MOCK_TIME);

  // Criteria 1: data_proximo_followup is delayed by >= 2 days
  // Criteria 2: no phone call or service logged for this lead_id in the last 5 days
  let criticalLeadsCount = 0;
  const criticalLeadList: Lead[] = [];

  leads.forEach(lead => {
    let isDelayedFollowup = false;
    let isNoActivity = false;

    if (lead.data_proximo_followup) {
      const followupDate = new Date(lead.data_proximo_followup);
      const diffTime = now.getTime() - followupDate.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      if (diffDays >= 2) {
        isDelayedFollowup = true;
      }
    }

    // Checking last activity (calls or services)
    const leadCalls = calls.filter(c => c.lead_id === lead.id);
    const leadServices = services.filter(s => s.lead_id === lead.id);
    
    const activityDates = [
      ...leadCalls.map(c => new Date(c.data).getTime()),
      ...leadServices.map(s => new Date(s.data).getTime()),
      new Date(lead.data_entrada).getTime() // entry date counts as activity start
    ];

    const lastActivityTime = Math.max(...activityDates);
    const diffActivityDays = (now.getTime() - lastActivityTime) / (1000 * 60 * 60 * 24);

    if (diffActivityDays >= 5) {
      isNoActivity = true;
    }

    if (isDelayedFollowup || isNoActivity) {
      if (lead.status !== 'Fechado' && lead.status !== 'Perdido') {
        criticalLeadsCount++;
        criticalLeadList.push(lead);
      }
    }
  });

  // Budgets due soon (where status is "Enviado" or "A montar" and prazo_validade is past or within 1 day of CURRENT_MOCK_TIME)
  let vencendoBudgetsCount = 0;
  budgets.forEach(b => {
    if (b.status === 'Enviado' || b.status === 'A montar') {
      const limitDate = new Date(b.prazo_validade);
      const diffTime = limitDate.getTime() - now.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      // Vencido ou vencendo nos próximos 1 dias (ou vencido já)
      if (diffDays <= 2) {
        vencendoBudgetsCount++;
      }
    }
  });

  return {
    criticalLeadsCount,
    criticalLeadList,
    vencendoBudgetsCount,
    totalPendencias: criticalLeadsCount + vencendoBudgetsCount
  };
}
