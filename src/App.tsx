/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Users, 
  MessageSquare, 
  Phone, 
  FileText, 
  Clock, 
  Target, 
  Award, 
  Bell, 
  Calendar,
  Menu,
  LogOut,
  ChevronRight,
  MoreHorizontal,
  X,
  Sparkles
} from 'lucide-react';
import { base44, getCriticalMetrics } from './lib/base44';
import { User } from './types';
import AuthScreens from './components/AuthScreens';

// Page Views Imports
import DashboardPage from './components/pages/DashboardPage';
import LeadsPage from './components/pages/LeadsPage';
import FollowUpPage from './components/pages/FollowUpPage';
import CalendarioPage from './components/pages/CalendarioPage';
import AtendimentosPage from './components/pages/AtendimentosPage';
import LigacoesPage from './components/pages/LigacoesPage';
import OrcamentosPage from './components/pages/OrcamentosPage';
import CampanhasPage from './components/pages/CampanhasPage';
import VendasPage from './components/pages/VendasPage';
import NotificacoesPage from './components/pages/NotificacoesPage';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'leads', label: 'Leads', icon: Users },
  { id: 'atendimentos', label: 'Atendimentos', icon: MessageSquare },
  { id: 'ligacoes', label: 'Ligações', icon: Phone },
  { id: 'orcamentos', label: 'Orçamentos', icon: FileText },
  { id: 'followup', label: 'Follow-up', icon: Clock },
  { id: 'campanhas', label: 'Campanhas', icon: Target },
  { id: 'vendas', label: 'Vendas', icon: Award },
  { id: 'notificacoes', label: 'Notificações', icon: Bell },
  { id: 'calendario', label: 'Calendário', icon: Calendar },
];

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [showMobileMore, setShowMobileMore] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeToast, setActiveToast] = useState<any | null>(null);

  // Initialize and check auth
  useEffect(() => {
    // Seed and check user session
    const u = base44.auth.getCurrentUser();
    if (u) {
      setCurrentUser(u);
    }

    // Sync state currentView with URL hashes if exists
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      const validViews = NAV_ITEMS.map(item => item.id);
      if (validViews.includes(hash)) {
        setCurrentView(hash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Run once on startup

    // Interval to recalculate critical alarms and sync unread badge counts
    const recalculateInterval = setInterval(() => {
      if (base44.auth.getCurrentUser()) {
        const metrics = getCriticalMetrics();
        setUnreadCount(metrics.totalPendencias);
      }
    }, 2500);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      clearInterval(recalculateInterval);
    };
  }, []);

  // Listen to custom CRM notification events
  useEffect(() => {
    const playChime = () => {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        // Tone 1
        const osc1 = audioCtx.createOscillator();
        const gain1 = audioCtx.createGain();
        osc1.connect(gain1);
        gain1.connect(audioCtx.destination);
        osc1.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        gain1.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
        osc1.start();
        osc1.stop(audioCtx.currentTime + 0.4);
        
        // Tone 2 (staggered slightly for dual-tone chime)
        setTimeout(() => {
          const osc2 = audioCtx.createOscillator();
          const gain2 = audioCtx.createGain();
          osc2.connect(gain2);
          gain2.connect(audioCtx.destination);
          osc2.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
          gain2.gain.setValueAtTime(0.08, audioCtx.currentTime);
          gain2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
          osc2.start();
          osc2.stop(audioCtx.currentTime + 0.5);
        }, 100);
      } catch (e) {
        // Suppress browser AudioContext errors gracefully
      }
    };

    const handleNotificationReceived = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setActiveToast(detail);
      playChime();
    };

    window.addEventListener('tony_crm_notification_received', handleNotificationReceived);
    return () => {
      window.removeEventListener('tony_crm_notification_received', handleNotificationReceived);
    };
  }, []);

  // Dismiss toast after 5 seconds
  useEffect(() => {
    if (activeToast) {
      const timer = setTimeout(() => {
        setActiveToast(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [activeToast]);

  const changeView = (viewId: string) => {
    setCurrentView(viewId);
    window.location.hash = viewId;
    setShowMobileMore(false);
  };

  const handleLogout = () => {
    base44.auth.logout();
    setCurrentUser(null);
  };

  // If user is not authenticated, block with LoginPage/RegPage
  if (!currentUser) {
    return (
      <AuthScreens 
        onLoginSuccess={() => {
          setCurrentUser(base44.auth.getCurrentUser());
          // Fetch initial metrics count on successful login
          const m = getCriticalMetrics();
          setUnreadCount(m.totalPendencias);
        }} 
      />
    );
  }

  // Render core views
  const renderActiveView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardPage />;
      case 'leads':
        return <LeadsPage />;
      case 'followup':
        return <FollowUpPage />;
      case 'calendario':
        return <CalendarioPage />;
      case 'atendimentos':
        return <AtendimentosPage />;
      case 'ligacoes':
        return <LigacoesPage />;
      case 'orcamentos':
        return <OrcamentosPage />;
      case 'campanhas':
        return <CampanhasPage />;
      case 'vendas':
        return <VendasPage />;
      case 'notificacoes':
        return <NotificacoesPage />;
      default:
        return <DashboardPage />;
    }
  };

  // Mobile Bottom bar main items (Desktop has all items in sidebar)
  const mobileCoreItems = NAV_ITEMS.filter(item => 
    ['dashboard', 'leads', 'followup', 'calendario'].includes(item.id)
  );

  const mobileExtraItems = NAV_ITEMS.filter(item => 
    !['dashboard', 'leads', 'followup', 'calendario'].includes(item.id)
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0b0c] text-neutral-200 select-none pb-16 md:pb-0">
      
      {/* HEADER BAR FIXED */}
      <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-neutral-900 bg-neutral-950 px-4 md:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-red-600 font-bold text-white text-base">
            T
          </div>
          <span className="font-bold tracking-tight text-white text-sm">Tony CRM</span>
          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] bg-red-650/10 text-red-500 font-semibold px-2 py-0.5 rounded border border-red-500/20 uppercase tracking-widest leading-none">
            <Sparkles className="h-3 w-3" /> Acabamentos
          </span>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-4">
          
          {/* Unread Critical notifications Bell trigger */}
          <button 
            onClick={() => changeView('notificacoes')}
            className="relative rounded-full p-2 text-neutral-400 hover:bg-neutral-900 hover:text-white transition"
            title="Ver Todas as Pendências Críticas"
          >
            <Bell className="h-5 w-5" />
            
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-650 text-[9px] font-bold text-white ring-2 ring-neutral-950 animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* User profile dropdown simulator */}
          <div className="flex items-center gap-2.5 border-l border-neutral-800 pl-4.5">
            <div className="text-right hidden sm:block">
              <span className="text-xs font-semibold text-white block leading-none">{currentUser.nome}</span>
              <span className="text-[10px] text-zinc-500 block mt-0.5">{currentUser.email}</span>
            </div>

            <button 
              onClick={handleLogout}
              className="rounded-lg bg-neutral-900/40 p-1.5 border border-neutral-900 text-neutral-400 hover:text-white hover:border-neutral-800 transition"
              title="Encerrar Sessão Corporativa"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>

        </div>
      </header>

      {/* PRIMARY WORKSPACE */}
      <div className="flex flex-1">
        
        {/* DESKTOP BAR FIXED - HIDDEN ON MOBILE */}
        <aside className="hidden md:flex w-52 flex-col border-r border-neutral-900 bg-neutral-950 p-3 shrink-0">
          <nav className="space-y-1 flex-1">
            {NAV_ITEMS.map(item => {
              const Icon = item.icon;
              const isSelected = currentView === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => changeView(item.id)}
                  className={`w-full flex items-center justify-between rounded-lg p-2.5 font-semibold text-xs transition cursor-pointer text-left ${
                    isSelected 
                      ? 'bg-red-650 text-white shadow-lg shadow-red-950/20' 
                      : 'text-neutral-450 hover:bg-neutral-900 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`h-4.5 w-4.5 ${isSelected ? 'text-white' : 'text-neutral-500'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.id === 'notificacoes' && unreadCount > 0 && (
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${isSelected ? 'bg-white text-red-600' : 'bg-red-600/15 text-red-500'}`}>
                      {unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="pt-2 border-t border-neutral-900/60 text-[10px] text-zinc-650 font-mono text-center">
            Tony CRM v2.1.0 • Prod
          </div>
        </aside>

        {/* WORKSPACE VIEW CONTENT AREA */}
        <main className="flex-1 overflow-x-hidden p-4 md:p-6 bg-radial from-neutral-920 to-neutral-950">
          <div className="mx-auto max-w-7xl">
            {renderActiveView()}
          </div>
        </main>

      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-neutral-900 bg-neutral-950 px-2 shadow-2xl">
        {mobileCoreItems.map(item => {
          const Icon = item.icon;
          const isSelected = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => changeView(item.id)}
              className={`flex flex-col items-center justify-center p-1 font-semibold text-[9px] cursor-pointer transition flex-1 ${
                isSelected ? 'text-red-500' : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <div className="relative">
                <Icon className="h-5 w-5 mb-0.5" />
                {item.id === 'followup' && unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-605 text-[8px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </div>
              <span>{item.label}</span>
            </button>
          );
        })}

        {/* "Mais" mobile options selector */}
        <button
          onClick={() => setShowMobileMore(true)}
          className={`flex flex-col items-center justify-center p-1 font-semibold text-[9px] cursor-pointer transition flex-1 ${
            showMobileMore ? 'text-red-500' : 'text-neutral-500'
          }`}
        >
          <MoreHorizontal className="h-5 w-5 mb-0.5" />
          <span>Mais</span>
        </button>
      </nav>

      {/* MOBILE OPTIONS MODAL DRAWER OVERLAY */}
      {showMobileMore && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-3 backdrop-blur-xs md:hidden animate-fade-in">
          <div className="w-full max-w-sm rounded-t-xl border border-neutral-850 bg-neutral-950 p-5 space-y-4 shadow-2xl relative">
            <button 
              onClick={() => setShowMobileMore(false)}
              className="absolute top-4 right-4 rounded-full p-2 text-neutral-400 hover:bg-neutral-800"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="font-bold text-white text-xs uppercase tracking-wider">Outros recursos e menus</h3>
            
            <div className="grid grid-cols-2 gap-2">
              {mobileExtraItems.map(item => {
                const Icon = item.icon;
                const isSelected = currentView === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      changeView(item.id);
                      setShowMobileMore(false);
                    }}
                    className={`flex items-center gap-2.5 p-3 rounded-lg border text-left font-semibold text-[11px] cursor-pointer transition ${
                      isSelected 
                        ? 'border-red-500 bg-red-500/10 text-red-400 font-bold' 
                        : 'border-neutral-900 bg-neutral-900/30 text-neutral-300 hover:border-neutral-800'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <p className="text-[10px] text-zinc-650 text-center uppercase tracking-widest pt-1">
              Tony CRM Acabamentos
            </p>
          </div>
        </div>
      )}

      {/* POP-UP TOAST DE NOTIFICAÇÃO DO SISTEMA (Opção 1) */}
      {activeToast && (
        <div className="fixed top-4 right-4 z-50 max-w-sm w-full bg-neutral-950/90 border border-amber-500/50 rounded-xl shadow-2xl p-4 flex gap-3 animate-fade-in backdrop-blur-md animate-slide-in">
          <div className="p-2 rounded-full bg-amber-500/15 text-amber-500 self-start">
            <Bell className="h-5 w-5 animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <h4 className="font-bold text-white text-xs truncate">{activeToast.titulo}</h4>
              <button onClick={() => setActiveToast(null)} className="text-neutral-500 hover:text-white ml-2 p-0.5 rounded cursor-pointer transition">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="text-neutral-300 text-[10.5px] mt-1 leading-relaxed">
              {activeToast.mensagem}
            </p>
            <div className="mt-2.5 flex justify-between items-center text-[9px] text-zinc-500">
              <span>Tony CRM • Notificação Ativa</span>
              <button 
                onClick={() => {
                  changeView('notificacoes');
                  setActiveToast(null);
                }} 
                className="text-amber-500 font-semibold hover:underline"
              >
                Ver Central
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

