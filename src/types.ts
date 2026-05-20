export type LeadStatus = "Novos" | "Em análise" | "Interessantes" | "Sem perfil" | "Respondidos";

export const EVENT_TYPES = [
  "Aniversário de 15 anos",
  "Aniversário de 18 anos",
  "Aniversário de 30 anos",
  "Casamento",
  "Noivado",
  "Evento corporativo",
  "Chá revelação",
  "Festa infantil",
  "Outro"
];

export const GUEST_COUNTS = [
  "Até 30 convidados",
  "30 a 50 convidados",
  "50 a 100 convidados",
  "100 a 200 convidados",
  "Mais de 200 convidados"
];

export const BUDGET_OPTIONS = [
  "R$ 2 mil a R$ 5 mil",
  "R$ 5 mil a R$ 10 mil",
  "R$ 10 mil a R$ 20 mil",
  "Acima de R$ 20 mil",
  "Ainda não sei"
];

export const LOCATION_OPTIONS = [
  "Sim",
  "Ainda estou procurando",
  "Não"
];

export const STYLE_OPTIONS = [
  "Elegante",
  "Criativo e diferente",
  "Luxuoso",
  "Intimista",
  "Temático",
  "Colorido",
  "Minimalista",
  "Ainda não sei"
];

export const REFERRAL_OPTIONS = [
  "Série Festa Impossível",
  "Instagram A Casa do Ju",
  "TikTok",
  "Indicação",
  "Outro"
];

export interface Lead {
  id?: string;
  fullName: string;
  phone: string;
  email: string;
  city: string;
  eventDate: string;
  eventType: string;
  guestCount: string;
  budget: string;
  description: string;
  hasLocation: string;
  style: string;
  referredBy: string;
  whatsappConsent: boolean;
  status: LeadStatus;
  createdAt: any; // Store as Firestore Timestamp
}
