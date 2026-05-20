import React, { useState, useEffect } from 'react';
import { 
  Users, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Info, 
  Search, 
  Download, 
  LogOut, 
  Trash2, 
  Sparkles, 
  ExternalLink,
  MessageSquare,
  Clock,
  Home,
  CheckCircle,
  Eye,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  Edit,
  Save
} from 'lucide-react';
import { subscribeToLeads, updateLeadStatus, updateLead, deleteLead } from '../lib/services';
import { loginWithGoogle, logout, auth } from '../lib/firebase';
import { type Lead, type LeadStatus } from '../types';
import { User } from 'firebase/auth';

interface AdminDashboardProps {
  onBackToLanding: () => void;
}

export default function AdminDashboard({ onBackToLanding }: AdminDashboardProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [leadsError, setLeadsError] = useState('');
  
  // Fitler lists
  const [statusFilter, setStatusFilter] = useState<'Todos' | LeadStatus>('Todos');
  const [searchQuery, setSearchQuery] = useState('');

  // Sorting state
  const [sortField, setSortField] = useState<'createdAt' | 'fullName' | 'phone' | 'city' | 'eventDate' | 'guestCount' | 'budget' | 'status'>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Modal details
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isUpdatingStatusId, setIsUpdatingStatusId] = useState<string | null>(null);

  // Edit & Delete state
  const [isEditing, setIsEditing] = useState(false);
  const [editedLead, setEditedLead] = useState<Lead | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [leadIdToDelete, setLeadIdToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleStartEdit = () => {
    if (selectedLead) {
      setEditedLead({ ...selectedLead });
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedLead(null);
  };

  const handleSaveEdit = async () => {
    if (!editedLead || !selectedLead || !selectedLead.id) return;
    setIsSaving(true);
    try {
      await updateLead(selectedLead.id, editedLead);
      setSelectedLead(editedLead);
      setIsEditing(false);
      setEditedLead(null);
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar edições no Firebase.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangeField = (key: keyof Lead, value: any) => {
    setEditedLead(prev => prev ? { ...prev, [key]: value } : null);
  };

  // Sync auth state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  // Fetch leads when authenticated and correct email
  useEffect(() => {
    if (!currentUser || (currentUser.email !== 'contatojuniorla@gmail.com' && currentUser.email !== 'CanalPapeldeTrouxa@gmail.com')) {
      return;
    }

    setLeadsLoading(true);
    const unsubscribe = subscribeToLeads(
      (data) => {
        setLeads(data);
        setLeadsLoading(false);
        setLeadsError('');
      },
      (error) => {
        console.error('Falha ao sincronizar leads:', error);
        setLeadsError('Erro de carregamento: verifique as regras de segurança no Firebase configuradas.');
        setLeadsLoading(false);
      }
    );

    return unsubscribe;
  }, [currentUser]);

  // Handle Login Google
  const handleLogin = async () => {
    try {
      setAuthLoading(true);
      await loginWithGoogle();
    } catch (err) {
      console.error('Falha no login:', err);
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await logout();
      setSelectedLead(null);
    } catch (err) {
      console.error('Falha no logout:', err);
    }
  };

  // Update status directly from table dropdown or detail view
  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    setIsUpdatingStatusId(leadId);
    try {
      await updateLeadStatus(leadId, newStatus);
      
      // Update local modal state if visible
      if (selectedLead && selectedLead.id === leadId) {
        setSelectedLead(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (err) {
      console.error('Falha ao atualizar status:', err);
      alert('Erro ao atualizar status. Permissão negada ou problemas no Firebase.');
    } finally {
      setIsUpdatingStatusId(null);
    }
  };

  // Export Filtered Contacts to CSV
  const handleExportCSV = () => {
    const csvLeads = getFilteredLeads();
    if (csvLeads.length === 0) {
      alert('Nenhum contato encontrado para exportar.');
      return;
    }

    // Define columns
    const headers = [
      'Nome Completo',
      'Telefone / WhatsApp',
      'E-mail',
      'Cidade',
      'Data do Evento',
      'Tipo de Evento',
      'Qtd Convidados',
      'Orcamento de Decoracao',
      'Local Definido',
      'Estilo Escolhido',
      'Como Conheceu',
      'Autorizou WhatsApp',
      'Status Atual',
      'data de Envio'
    ];

    const rows = csvLeads.map(lead => {
      const dateStr = lead.createdAt instanceof Date 
        ? lead.createdAt.toLocaleDateString('pt-BR') + ' ' + lead.createdAt.toLocaleTimeString('pt-BR')
        : String(lead.createdAt);

      return [
        `"${lead.fullName.replace(/"/g, '""')}"`,
        `"${lead.phone.replace(/"/g, '""')}"`,
        `"${lead.email.replace(/"/g, '""')}"`,
        `"${lead.city.replace(/"/g, '""')}"`,
        `"${lead.eventDate}"`,
        `"${lead.eventType}"`,
        `"${lead.guestCount}"`,
        `"${lead.budget}"`,
        `"${lead.hasLocation}"`,
        `"${lead.style}"`,
        `"${lead.referredBy}"`,
        lead.whatsappConsent ? 'Sim' : 'Nao',
        `"${lead.status}"`,
        `"${dateStr}"`
      ];
    });

    // Excel CSV pre-pend with UTF-8 BOM representation to resolve accents issues
    const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `leads_casa_do_ju_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Sorting helper
  const handleSort = (field: 'createdAt' | 'fullName' | 'phone' | 'city' | 'eventDate' | 'guestCount' | 'budget' | 'status') => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const renderSortIndicator = (field: 'createdAt' | 'fullName' | 'phone' | 'city' | 'eventDate' | 'guestCount' | 'budget' | 'status') => {
    if (sortField !== field) {
      return <span className="text-slate-500 opacity-40 ml-1.5 font-mono select-none">↕</span>;
    }
    return sortDirection === 'asc' 
      ? <span className="text-[#eab308] font-black ml-1.5 select-none">↑</span>
      : <span className="text-[#eab308] font-black ml-1.5 select-none">↓</span>;
  };

  // Filter and sort logic
  const getFilteredLeads = () => {
    const list = leads.filter(lead => {
      const matchStatus = statusFilter === 'Todos' || lead.status === statusFilter;
      
      const searchLower = searchQuery.toLowerCase();
      const matchQuery = !searchQuery.trim() || 
        lead.fullName.toLowerCase().includes(searchLower) ||
        lead.email.toLowerCase().includes(searchLower) ||
        lead.phone.includes(searchQuery) ||
        lead.city.toLowerCase().includes(searchLower) ||
        lead.eventType.toLowerCase().includes(searchLower);

      return matchStatus && matchQuery;
    });

    if (sortField) {
      list.sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        if (valA === undefined || valA === null) valA = '';
        if (valB === undefined || valB === null) valB = '';

        // Native dates
        if (sortField === 'createdAt') {
          const dateA = valA instanceof Date ? valA.getTime() : new Date(valA).getTime();
          const dateB = valB instanceof Date ? valB.getTime() : new Date(valB).getTime();
          return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
        }

        // Custom enum sort for logical GUEST_COUNTS mapping
        if (sortField === 'guestCount') {
          const orders = [
            "Até 30 convidados",
            "30 a 50 convidados",
            "50 a 100 convidados",
            "100 a 200 convidados",
            "Mais de 200 convidados"
          ];
          const idxA = orders.indexOf(String(valA));
          const idxB = orders.indexOf(String(valB));
          if (idxA !== -1 && idxB !== -1) {
            return sortDirection === 'asc' ? idxA - idxB : idxB - idxA;
          }
        }

        // Custom budget sort based on BUDGET_OPTIONS options
        if (sortField === 'budget') {
          const orders = [
            "R$ 2 mil a R$ 5 mil",
            "R$ 5 mil a R$ 10 mil",
            "R$ 10 mil a R$ 20 mil",
            "Acima de R$ 20 mil",
            "Ainda não sei"
          ];
          const idxA = orders.indexOf(String(valA));
          const idxB = orders.indexOf(String(valB));
          if (idxA !== -1 && idxB !== -1) {
            return sortDirection === 'asc' ? idxA - idxB : idxB - idxA;
          }
        }

        // Case-insensitive comparisons for other string columns
        const strA = String(valA).toLowerCase();
        const strB = String(valB).toLowerCase();

        if (strA < strB) return sortDirection === 'asc' ? -1 : 1;
        if (strA > strB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return list;
  };

  // Rendering Helper for Status Badges
  const getStatusBadgeStyle = (status: LeadStatus) => {
    switch (status) {
      case 'Novos':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Em análise':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Interessantes':
        return 'bg-amber-50 text-[#b45309] border-amber-200';
      case 'Sem perfil':
        return 'bg-slate-100 text-slate-600 border-slate-300';
      case 'Respondidos':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getStatusDotColor = (status: LeadStatus) => {
    switch (status) {
      case 'Novos': return 'bg-purple-500';
      case 'Em análise': return 'bg-blue-500';
      case 'Interessantes': return 'bg-amber-500';
      case 'Sem perfil': return 'bg-slate-400';
      case 'Respondidos': return 'bg-emerald-500';
    }
  };

  const filteredLeads = getFilteredLeads();

  // STAGE 1: AUTH LOADING
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FAF9FC] flex flex-col justify-center items-center py-10 px-4">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#6d06dc]"></div>
        <p className="mt-4 text-xs font-mono text-slate-500">Verificando credenciais de segurança...</p>
      </div>
    );
  }

  // STAGE 2: NOT LOGGED IN Screen (Google Auth Call)
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#F2F1F5] flex flex-col justify-center items-center py-12 px-4 relative">
        <div className="absolute top-4 left-4">
          <button 
            onClick={onBackToLanding}
            className="flex items-center gap-2 text-xs font-bold text-[#6d06dc] hover:text-[#5804b3] bg-white px-3 py-2 rounded-xl border border-slate-200 transition-all cursor-pointer"
          >
            ← Voltar para a Página
          </button>
        </div>

        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl border border-slate-200 text-center space-y-6">
          <div className="relative mx-auto w-16 h-16 rounded-2xl bg-[#6d06dc]/10 flex items-center justify-center text-[#6d06dc]">
            <ShieldCheck className="w-8 h-8 text-[#6d06dc]" />
            <span className="absolute -top-1 -right-1 bg-[#eab308] w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
              <span className="block w-1.5 h-1.5 rounded-full bg-slate-900"></span>
            </span>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-extrabold text-slate-900">Acesso Restrito ao Painel</h2>
            <p className="text-slate-500 text-xs leading-relaxed">
              Área de administração privada reservada exclusivamente para o gerenciamento de curadoria do projeto do Ju.
            </p>
          </div>

          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200/50 flex gap-3 text-left">
            <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800 space-y-1">
              <p className="font-bold">E-mails autorizados para consulta:</p>
              <p>• contatojuniorla@gmail.com</p>
              <p>• CanalPapeldeTrouxa@gmail.com</p>
              <p className="mt-1.5 pt-1.5 border-t border-amber-200/50 text-[10px] text-amber-750">
                💡 <strong>Dica de teste:</strong> Se o popup de login do Google for bloqueado dentro do iframe, clique no botão de <strong>Abrir o aplicativo em nova guia</strong> no topo direito da tela.
              </p>
            </div>
          </div>

          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-3 bg-[#6d06dc] hover:bg-[#5804b3] text-white font-extrabold py-4 px-6 rounded-2xl shadow-[0_5px_15px_rgba(109,6,220,0.3)] transition-all cursor-pointer"
          >
            {/* Google Vector Icon */}
            <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 24 24">
              <path d="M12.24 10.285V13.4h6.887C18.2 15.614 15.645 18 12.24 18c-3.86 0-7-3.14-7-7s3.14-7 7-7c1.71 0 3.284.614 4.51 1.636l2.427-2.427C17.433 1.773 14.975 1 12.24 1 6.584 1 2 5.584 2 11.24s4.584 10.24 10.24 10.24c5.795 0 10.24-4.068 10.24-10.24 0-.568-.068-1.222-.185-1.755H12.24z"/>
            </svg>
            <span>Logar com Google</span>
          </button>
        </div>
      </div>
    );
  }

  // STAGE 3: LOGGED IN BUT EMAIL DENIED
  if (currentUser && currentUser.email !== 'contatojuniorla@gmail.com' && currentUser.email !== 'CanalPapeldeTrouxa@gmail.com') {
    return (
      <div className="min-h-screen bg-[#F2F1F5] flex flex-col justify-center items-center py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl border border-rose-100 text-center space-y-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-black text-rose-800">Acesso Negado</h2>
            <p className="text-slate-500 text-xs leading-relaxed">
              O seu e-mail do Google (<strong>{currentUser.email}</strong>) não possui permissão para acessar este painel administrativo.
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleLogout}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 px-4 rounded-xl text-sm transition-colors cursor-pointer"
            >
              Alternar de Conta
            </button>
            <button
              onClick={onBackToLanding}
              className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold py-3.5 px-4 rounded-xl text-sm transition-colors cursor-pointer"
            >
              Voltar à Landing
            </button>
          </div>
        </div>
      </div>
    );
  }

  // STAGE 4: AUTHORIZED ADMIN DASHBOARD
  return (
    <div className="min-h-screen bg-[#FAF9FD] text-[#1e1b24] font-sans pb-16">
      
      {/* ADMIN TOP CONTAINER */}
      <header className="sticky top-0 bg-white border-b border-purple-100/50 px-4 sm:px-8 py-4 shadow-sm z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-[#6d06dc] w-9 h-9 rounded-xl flex items-center justify-center text-white font-black shadow-[0_4px_10px_rgba(109,6,220,0.2)]">
            Ju
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>Painel do Ju</span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase font-mono">ON-LINE</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-mono leading-none mt-0.5">{currentUser.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onBackToLanding}
            className="hidden sm:inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 px-3 py-2 border border-slate-200 rounded-xl transition-all cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Ver Site Público</span>
          </button>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 text-xs font-bold text-rose-600 hover:bg-rose-50 px-3 py-2 border border-rose-100 rounded-xl transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Desconectar</span>
          </button>
        </div>
      </header>

      {/* DASHBOARD HERO CONTROLS */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 mt-8 space-y-6">
        
        {/* TOP COUNTERS OVERVIEW */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-4 border border-purple-50 shadow-sm flex flex-col justify-between">
            <span className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider">Total Recebidos</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-900">{leads.length}</span>
              <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded font-bold text-slate-500 font-mono"> Leads</span>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-purple-50 shadow-sm flex flex-col justify-between">
            <span className="text-xs font-mono font-medium text-purple-600 uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span> Novos
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl sm:text-3xl font-black text-purple-700">{leads.filter(l => l.status === 'Novos').length}</span>
              <span className="text-[10px] text-purple-500 font-mono">não lidos</span>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-purple-50 shadow-sm flex flex-col justify-between">
            <span className="text-xs font-mono font-medium text-amber-600 uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Interessantes
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl sm:text-3xl font-black text-[#b45309]">{leads.filter(l => l.status === 'Interessantes').length}</span>
              <span className="text-[10px] text-amber-500 font-mono">elegíveis</span>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-purple-50 shadow-sm flex flex-col justify-between">
            <span className="text-xs font-mono font-medium text-emerald-600 uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Respondidos
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl sm:text-3xl font-black text-emerald-700">{leads.filter(l => l.status === 'Respondidos').length}</span>
              <span className="text-[10px] text-emerald-500 font-mono">contatados</span>
            </div>
          </div>
        </div>

        {/* CONTROLS BAR: FILTERS, SEARCH AND EXPORT */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Filters Pills */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {['Todos', 'Novos', 'Em análise', 'Interessantes', 'Sem perfil', 'Respondidos'].map((filterVal) => {
              const count = filterVal === 'Todos' ? leads.length : leads.filter(l => l.status === filterVal).length;
              const isSelected = statusFilter === filterVal;
              return (
                <button
                  key={filterVal}
                  onClick={() => setStatusFilter(filterVal as any)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected 
                      ? 'bg-[#6d06dc]/10 text-[#6d06dc] border-[#6d06dc]' 
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {filterVal !== 'Todos' && (
                    <span className={`w-1.5 h-1.5 rounded-full ${getStatusDotColor(filterVal as LeadStatus)}`}></span>
                  )}
                  <span>{filterVal}</span>
                  <span className="text-[10px] text-slate-400 font-mono font-semibold">({count})</span>
                </button>
              );
            })}
          </div>

          {/* Search Input, Actions */}
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto items-stretch shrink-0">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filtrar por nome, cidade ou e-mail..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 px-4 py-2.5 pl-10 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#6d06dc]/15 transition-all"
              />
            </div>

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center justify-center gap-2 bg-[#6d06dc] hover:bg-[#5804b3] text-white text-xs font-extrabold px-4 py-2.5 rounded-xl shadow-md transition-colors whitespace-nowrap cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#eab308]" />
              <span>Exportar CSV</span>
            </button>
          </div>
        </div>

        {/* LEADS LISTING - TABLE VIEW (DESKTOP) AND CARDS (MOBILE) */}
        {leadsError ? (
          <div className="p-8 bg-red-50 text-red-700 border border-red-200 text-center rounded-2xl">
            {leadsError}
          </div>
        ) : leadsLoading ? (
          <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6d06dc] mx-auto mb-4"></div>
            <p className="text-xs text-slate-500 font-mono">Buscando leads no Firestore em tempo real...</p>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center text-slate-500">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold">Nenhum lead encontrado neste filtro</p>
            <p className="text-xs text-slate-400 mt-1">Experimente alterar a pesquisa ou selecionar outro filtro.</p>
          </div>
        ) : (
          <>
            {/* DESKTOP TABLE VIEW */}
            <div className="hidden md:block bg-white rounded-2xl border border-purple-50 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#120D1A] text-slate-300 font-mono text-[10px] uppercase tracking-wider select-none">
                    <tr>
                      <th 
                        onClick={() => handleSort('createdAt')}
                        className="py-4.5 px-4 font-bold cursor-pointer hover:text-white transition-colors"
                      >
                        <div className="flex items-center">
                          <span>Data de Envio</span>
                          {renderSortIndicator('createdAt')}
                        </div>
                      </th>
                      <th 
                        onClick={() => handleSort('fullName')}
                        className="py-4.5 px-4 font-bold cursor-pointer hover:text-white transition-colors"
                      >
                        <div className="flex items-center">
                          <span>Nome</span>
                          {renderSortIndicator('fullName')}
                        </div>
                      </th>
                      <th 
                        onClick={() => handleSort('phone')}
                        className="py-4.5 px-4 font-bold cursor-pointer hover:text-white transition-colors"
                      >
                        <div className="flex items-center">
                          <span>WhatsApp</span>
                          {renderSortIndicator('phone')}
                        </div>
                      </th>
                      <th 
                        onClick={() => handleSort('city')}
                        className="py-4.5 px-4 font-bold cursor-pointer hover:text-white transition-colors"
                      >
                        <div className="flex items-center">
                          <span>Cidade</span>
                          {renderSortIndicator('city')}
                        </div>
                      </th>
                      <th 
                        onClick={() => handleSort('eventDate')}
                        className="py-4.5 px-4 font-bold cursor-pointer hover:text-white transition-colors"
                      >
                        <div className="flex items-center">
                          <span>Evento / Data</span>
                          {renderSortIndicator('eventDate')}
                        </div>
                      </th>
                      <th 
                        onClick={() => handleSort('guestCount')}
                        className="py-4.5 px-4 font-bold cursor-pointer hover:text-white transition-colors"
                      >
                        <div className="flex items-center">
                          <span>Convidados</span>
                          {renderSortIndicator('guestCount')}
                        </div>
                      </th>
                      <th 
                        onClick={() => handleSort('budget')}
                        className="py-4.5 px-4 font-bold cursor-pointer hover:text-white transition-colors"
                      >
                        <div className="flex items-center">
                          <span>Verba</span>
                          {renderSortIndicator('budget')}
                        </div>
                      </th>
                      <th 
                        onClick={() => handleSort('status')}
                        className="py-4.5 px-4 font-bold cursor-pointer hover:text-white transition-colors"
                      >
                        <div className="flex items-center">
                          <span>Status do Atendimento</span>
                          {renderSortIndicator('status')}
                        </div>
                      </th>
                      <th className="py-4.5 px-4 text-center font-bold">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredLeads.map((lead) => {
                      const sendDateFormatted = lead.createdAt instanceof Date 
                        ? lead.createdAt.toLocaleDateString('pt-BR') 
                        : 'Hoje';

                      return (
                        <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors">
                          {/* Data Envio */}
                          <td className="p-4 whitespace-nowrap text-slate-400 font-mono">
                            {sendDateFormatted}
                          </td>

                          {/* Nome */}
                          <td className="p-4 font-extrabold text-slate-900">
                            {lead.fullName}
                          </td>

                          {/* WhatsApp */}
                          <td className="p-4 whitespace-nowrap">
                            <a 
                              href={`https://wa.me/55${lead.phone.replace(/\D/g, '')}`}
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-[#6d06dc] hover:underline font-bold flex items-center gap-1.5"
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500/10" />
                              <span>{lead.phone}</span>
                            </a>
                          </td>

                          {/* Cidade */}
                          <td className="p-4 font-medium text-slate-800">
                            {lead.city}
                          </td>

                          {/* Evento / Data */}
                          <td className="p-4">
                            <div className="font-bold text-slate-900">{lead.eventType}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{lead.eventDate}</div>
                          </td>

                          {/* Convidados */}
                          <td className="p-4 text-slate-500 font-sans whitespace-nowrap">
                            {lead.guestCount}
                          </td>

                          {/* Verba */}
                          <td className="p-4 font-mono font-medium text-slate-900 whitespace-nowrap">
                            {lead.budget}
                          </td>

                          {/* Status */}
                          <td className="p-4 whitespace-nowrap">
                            <select
                              value={lead.status}
                              disabled={isUpdatingStatusId === lead.id}
                              onChange={(e) => handleStatusChange(lead.id!, e.target.value as LeadStatus)}
                              className={`px-2 py-1 text-[11px] font-semibold rounded-lg border focus:outline-none transition-colors cursor-pointer ${getStatusBadgeStyle(lead.status)}`}
                            >
                              <option value="Novos">Novos</option>
                              <option value="Em análise">Em análise</option>
                              <option value="Interessantes">Interessantes</option>
                              <option value="Sem perfil">Sem perfil</option>
                              <option value="Respondidos">Respondidos</option>
                            </select>
                          </td>

                          {/* Ações */}
                          <td className="p-4 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => {
                                  setIsEditing(false);
                                  setEditedLead(null);
                                  setSelectedLead(lead);
                                }}
                                className="inline-flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-[#6d06dc] hover:text-white text-slate-700 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Ver</span>
                              </button>
                              <button
                                onClick={() => setLeadIdToDelete(lead.id!)}
                                className="inline-flex items-center justify-center p-2 rounded-xl text-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white border border-rose-200/50 transition-all cursor-pointer shadow-sm"
                                title="Excluir Ficha"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* MOBILE CARDS VIEW */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {filteredLeads.map((lead) => (
                <div key={lead.id} className="bg-white rounded-2xl p-5 border border-purple-50 shadow-sm space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">{lead.fullName}</h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        Enviado em: {lead.createdAt instanceof Date ? lead.createdAt.toLocaleDateString('pt-BR') : 'Hoje'}
                      </p>
                    </div>
                    <span className={`px-2.5 py-1 text-[10px] font-bold border rounded-lg whitespace-nowrap ${getStatusBadgeStyle(lead.status)}`}>
                      {lead.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-x-2 gap-y-3 bg-slate-50 p-3 rounded-xl text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 font-mono block uppercase">Cidade</span>
                      <span className="font-bold text-slate-800">{lead.city}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-mono block uppercase">Data Evento</span>
                      <span className="font-bold text-[#6d06dc]">{lead.eventDate}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-mono block uppercase">Tipo de Evento</span>
                      <span className="font-bold text-slate-800">{lead.eventType}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-mono block uppercase font-mono">Orçamento</span>
                      <span className="font-bold text-slate-900 font-mono">{lead.budget}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                    <div className="flex gap-1.5">
                      <a 
                        href={`https://wa.me/55${lead.phone.replace(/\D/g, '')}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-bold bg-emerald-50 hover:bg-emerald-100/75 px-3 py-2 rounded-xl transition-all"
                      >
                        <MessageSquare className="w-3.5 h-3.5 fill-emerald-50" />
                        <span>Zap</span>
                      </a>
                      <button
                        onClick={() => setLeadIdToDelete(lead.id!)}
                        className="p-2 rounded-xl text-rose-605 bg-rose-50 hover:bg-rose-600 hover:text-white border border-rose-100 transition-all cursor-pointer"
                        title="Excluir Ficha"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditedLead(null);
                        setSelectedLead(lead);
                      }}
                      className="inline-flex items-center gap-1 bg-[#6d06dc]/10 text-[#6d06dc] px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      <span>Ver Ficha</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

       {/* LEAD DETAILED MODAL */}
      {selectedLead && (
        <div className="fixed inset-0 bg-[#120D1A]/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-purple-50 flex flex-col">
            
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-purple-50 px-6 py-5 flex items-start justify-between shrink-0 z-10">
              <div>
                <span className="text-[10px] font-mono uppercase bg-[#6d06dc]/10 text-[#6d06dc] px-2.5 py-1 rounded-md font-bold tracking-wider">
                  {isEditing ? 'Modo de Edição da Ficha' : 'Ficha Completa do Lead'}
                </span>
                {isEditing ? (
                  <div className="mt-2 text-slate-900">
                    <span className="text-xs font-bold text-slate-400 font-mono block">NOME DO CLIENTE</span>
                    <input 
                      type="text" 
                      className="w-full max-w-md px-3 py-1.5 bg-slate-50 text-base font-extrabold text-slate-950 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#6d06dc]/15 mt-1"
                      value={editedLead?.fullName || ''} 
                      onChange={(e) => handleChangeField('fullName', e.target.value)} 
                    />
                  </div>
                ) : (
                  <h3 className="text-xl font-extrabold text-slate-900 mt-2">{selectedLead.fullName}</h3>
                )}
                <p className="text-xs text-slate-400 font-mono mt-1">
                  Enviado em: {selectedLead.createdAt instanceof Date ? selectedLead.createdAt.toLocaleString('pt-BR') : String(selectedLead.createdAt)}
                </p>
              </div>

              <button
                onClick={() => {
                  setSelectedLead(null);
                  setIsEditing(false);
                  setEditedLead(null);
                }}
                className="text-slate-400 hover:text-slate-800 bg-slate-100 p-2 rounded-xl transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Scroll Content */}
            <div className="p-6 space-y-6">
              
              {/* STATUS ACTION SELECTOR */}
              <div className="bg-purple-50/50 rounded-2xl p-4 border border-[#6d06dc]/15 flex items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] text-[#6d06dc] font-bold font-mono tracking-wider block uppercase">Acompanhamento e Status</span>
                  <p className="text-xs text-slate-500 mt-0.5">Altere o andamento deste lead para organizar sua curadoria.</p>
                </div>
                <div>
                  <select
                    value={isEditing ? (editedLead?.status || 'Novos') : selectedLead.status}
                    disabled={isUpdatingStatusId === selectedLead.id}
                    onChange={(e) => {
                      if (isEditing) {
                        handleChangeField('status', e.target.value as LeadStatus);
                      } else {
                        handleStatusChange(selectedLead.id!, e.target.value as LeadStatus);
                      }
                    }}
                    className={`px-3 py-2 text-xs font-bold rounded-xl border focus:outline-none transition-colors cursor-pointer ${getStatusBadgeStyle(isEditing ? (editedLead?.status || 'Novos') : selectedLead.status)}`}
                  >
                    <option value="Novos">Novos</option>
                    <option value="Em análise">Em análise</option>
                    <option value="Interessantes">Interessantes</option>
                    <option value="Sem perfil">Sem perfil</option>
                    <option value="Respondidos">Respondidos</option>
                  </select>
                </div>
              </div>

              {/* SECTION CONTATOS */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[#6d06dc] uppercase tracking-wider font-mono border-b border-slate-100 pb-1">Meios de Contato</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                  {isEditing ? (
                    <>
                      <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                        <span className="text-slate-400 block font-mono text-[10px]">WhatsApp / Celular</span>
                        <input 
                          type="text" 
                          className="w-full px-3 py-1.5 bg-white text-slate-800 rounded-lg border border-slate-205 focus:outline-none focus:ring-1 focus:ring-[#6d06dc]"
                          value={editedLead?.phone || ''} 
                          onChange={(e) => handleChangeField('phone', e.target.value)} 
                        />
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                        <span className="text-slate-400 block font-mono text-[10px]">E-mail</span>
                        <input 
                          type="email" 
                          className="w-full px-3 py-1.5 bg-white text-slate-800 rounded-lg border border-slate-205 focus:outline-none focus:ring-1 focus:ring-[#6d06dc]"
                          value={editedLead?.email || ''} 
                          onChange={(e) => handleChangeField('email', e.target.value)} 
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                        <span className="text-slate-400 block font-mono text-[10px]">WhatsApp / Celular</span>
                        <a 
                          href={`https://wa.me/55${selectedLead.phone.replace(/\D/g, '')}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[#6d06dc] hover:underline font-extrabold flex items-center gap-1.5 text-sm"
                        >
                          <MessageSquare className="w-4 h-4 text-emerald-500 fill-emerald-500/10" />
                          <span>{selectedLead.phone}</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </a>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                        <span className="text-slate-400 block font-mono text-[10px]">E-mail</span>
                        <a 
                          href={`mailto:${selectedLead.email}`}
                          className="text-slate-800 hover:underline font-extrabold text-sm"
                        >
                          {selectedLead.email}
                        </a>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* SECTION LOGÍSTICA DETALHES */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[#6d06dc] uppercase tracking-wider font-mono border-b border-slate-100 pb-1">Dados Funcionais</h4>
                {isEditing ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                      <span className="text-slate-400 block font-mono text-[10px]">Cidade / UF</span>
                      <input 
                        type="text" 
                        className="w-full px-2 py-1 bg-white text-slate-800 rounded border border-slate-200 focus:outline-none"
                        value={editedLead?.city || ''} 
                        onChange={(e) => handleChangeField('city', e.target.value)} 
                      />
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                      <span className="text-slate-400 block font-mono text-[10px]">Data Prevista</span>
                      <input 
                        type="text" 
                        className="w-full px-2 py-1 bg-white text-slate-800 rounded border border-slate-200 focus:outline-none"
                        value={editedLead?.eventDate || ''} 
                        onChange={(e) => handleChangeField('eventDate', e.target.value)} 
                      />
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                      <span className="text-slate-400 block font-mono text-[10px]">Qtd Convidados</span>
                      <input 
                        type="text" 
                        className="w-full px-2 py-1 bg-white text-slate-800 rounded border border-slate-200 focus:outline-none"
                        value={editedLead?.guestCount || ''} 
                        onChange={(e) => handleChangeField('guestCount', e.target.value)} 
                      />
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                      <span className="text-slate-400 block font-mono text-[10px]">Verba Estimada</span>
                      <input 
                        type="text" 
                        className="w-full px-2 py-1 bg-white text-slate-800 rounded border border-slate-200 focus:outline-none"
                        value={editedLead?.budget || ''} 
                        onChange={(e) => handleChangeField('budget', e.target.value)} 
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <span className="text-slate-400 block font-mono text-[10px]">Cidade / UF</span>
                      <span className="font-extrabold text-slate-800">{selectedLead.city}</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <span className="text-slate-400 block font-mono text-[10px]">Data Prevista</span>
                      <span className="font-extrabold text-[#6d06dc]">{selectedLead.eventDate}</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <span className="text-slate-400 block font-mono text-[10px]">Qtd Convidados</span>
                      <span className="font-extrabold text-slate-800">{selectedLead.guestCount}</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <span className="text-slate-400 block font-mono text-[10px]">Verba Estimada</span>
                      <span className="font-extrabold text-amber-700 font-mono">{selectedLead.budget}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* OUTRAS PERGUNTAS */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[#6d06dc] uppercase tracking-wider font-mono border-b border-slate-100 pb-1 font-sans">Condições Adicionais</h4>
                {isEditing ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                      <span className="text-slate-400 block font-mono text-[10px] leading-tight">Já tem local definido?</span>
                      <input 
                        type="text" 
                        className="w-full px-2 py-1 bg-white text-slate-800 rounded border border-slate-200 focus:outline-none"
                        value={editedLead?.hasLocation || ''} 
                        onChange={(e) => handleChangeField('hasLocation', e.target.value)} 
                      />
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                      <span className="text-slate-400 block font-mono text-[10px] leading-tight flex-1">Estilo desejado</span>
                      <input 
                        type="text" 
                        className="w-full px-2 py-1 bg-white text-slate-800 rounded border border-slate-200 focus:outline-none"
                        value={editedLead?.style || ''} 
                        onChange={(e) => handleChangeField('style', e.target.value)} 
                      />
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                      <span className="text-slate-400 block font-mono text-[10px] leading-tight">Origem / Como conheceu</span>
                      <input 
                        type="text" 
                        className="w-full px-2 py-1 bg-white text-slate-800 rounded border border-slate-200 focus:outline-none"
                        value={editedLead?.referredBy || ''} 
                        onChange={(e) => handleChangeField('referredBy', e.target.value)} 
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl flex flex-col">
                      <span className="text-slate-400 block font-mono text-[10px] leading-tight">Já tem local definido?</span>
                      <span className="font-extrabold text-slate-800 mt-1">{selectedLead.hasLocation}</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl flex flex-col">
                      <span className="text-slate-400 block font-mono text-[10px] leading-tight font-sans">Estilo desejado</span>
                      <span className="font-extrabold text-slate-800 mt-1">{selectedLead.style}</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl flex flex-col">
                      <span className="text-slate-400 block font-mono text-[10px] leading-tight font-sans">Origem / Como conheceu</span>
                      <span className="font-extrabold text-slate-800 mt-1">{selectedLead.referredBy}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* EVENTO DOS SONHOS (CAMP ABERTO) */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[#6d06dc] uppercase tracking-wider font-mono border-b border-slate-100 pb-1">O Evento que Sonha Fazer</h4>
                {isEditing ? (
                  <textarea 
                    rows={5}
                    className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-202 text-slate-700 text-sm whitespace-pre-wrap leading-relaxed font-sans focus:outline-none focus:ring-2 focus:ring-[#6d06dc]/15"
                    value={editedLead?.description || ''} 
                    onChange={(e) => handleChangeField('description', e.target.value)} 
                  />
                ) : (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-150 text-slate-700 text-sm whitespace-pre-wrap leading-relaxed font-sans">
                    "{selectedLead.description}"
                  </div>
                )}
              </div>

              {/* CONSENTMENT */}
              <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 flex items-center justify-between text-xs text-emerald-800">
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500 fill-emerald-100" />
                  <span>Autorização WhatsApp fornecida</span>
                </span>
                <span className="font-mono text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded uppercase font-bold">Autorizado</span>
              </div>
            </div>

            {/* Modal Footer */}
            {isEditing ? (
              <div className="sticky bottom-0 bg-white border-t border-slate-100 px-6 py-4 flex gap-3 justify-end shrink-0 z-10">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleSaveEdit}
                  className="inline-flex items-center gap-2 bg-[#6d06dc] hover:bg-[#5804b3] text-white text-xs font-extrabold px-5 py-3 rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Save className="w-4 h-4 text-[#eab308]" />
                  <span>{isSaving ? 'Salvando...' : 'Salvar Alterações'}</span>
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleCancelEdit}
                  className="px-5 py-3 border border-slate-200 hover:bg-slate-50 text-slate-600 font-extrabold text-xs rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <div className="sticky bottom-0 bg-white border-t border-slate-100 px-6 py-4 flex flex-wrap justify-between gap-3 shrink-0 z-10">
                <div className="flex flex-wrap gap-2">
                  <a 
                    href={`https://wa.me/55${selectedLead.phone.replace(/\D/g, '')}?text=Olá%20${encodeURIComponent(selectedLead.fullName.split(' ')[0])},%20aqui%2520é%2520o%2520Junior%2520Launther%2520(A%2520Casa%2520do%2520Ju)!%2520Adorei%2520seu%2520projeto%2520enviado...`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold px-4 py-3 rounded-xl shadow-sm transition-all"
                  >
                    <MessageSquare className="w-4 h-4 fill-emerald-50" />
                    <span>Iniciar Zap</span>
                  </a>

                  <button
                    onClick={handleStartEdit}
                    className="inline-flex items-center gap-2 bg-[#6d06dc]/10 text-[#6d06dc] hover:bg-[#6d06dc]/15 text-xs font-extrabold px-4 py-3 rounded-xl transition-all cursor-pointer"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Editar</span>
                  </button>

                  <button
                    onClick={() => setLeadIdToDelete(selectedLead.id!)}
                    className="inline-flex items-center gap-2 bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-extrabold px-4 py-3 rounded-xl transition-all cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Excluir</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    setSelectedLead(null);
                    setIsEditing(false);
                    setEditedLead(null);
                  }}
                  className="px-5 py-3 border border-slate-200 hover:bg-slate-50 text-slate-600 font-extrabold text-xs rounded-xl cursor-pointer"
                >
                  Fechar Ficha
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {leadIdToDelete && (
        <div className="fixed inset-0 bg-[#120D1A]/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-rose-100 text-center space-y-5 animate-in fade-in duration-200">
            <div className="mx-auto w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center">
              <Trash2 className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-black text-slate-900">Excluir Ficha Permanentemente?</h4>
              <p className="text-slate-500 text-xs leading-relaxed">
                Esta ação é irreversível. O contato e todas as respostas do cliente serão apagados para sempre do banco de dados do Ju.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={async () => {
                  setIsDeleting(true);
                  try {
                    await deleteLead(leadIdToDelete);
                    if (selectedLead && selectedLead.id === leadIdToDelete) {
                      setSelectedLead(null);
                      setIsEditing(false);
                      setEditedLead(null);
                    }
                    setLeadIdToDelete(null);
                  } catch (err) {
                    console.error(err);
                    alert('Erro ao excluir do Firebase.');
                  } finally {
                    setIsDeleting(false);
                  }
                }}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs py-3 rounded-xl disabled:opacity-50 cursor-pointer transition-colors"
              >
                {isDeleting ? 'Excluindo...' : 'Sim, Excluir'}
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setLeadIdToDelete(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs py-3 rounded-xl cursor-pointer transition-colors"
               >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
