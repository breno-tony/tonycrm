import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  Check, 
  User, 
  Tag, 
  Sparkles,
  Award,
  Trash2
} from 'lucide-react';
import { Evento, EventoCor } from '../../types';
import { base44, CURRENT_MOCK_TIME } from '../../lib/base44';
import EventoModal from '../EventoModal';
import DeleteConfirmModal from '../DeleteConfirmModal';

const COLOR_MAP: Record<EventoCor, string> = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  red: 'bg-red-500',
  yellow: 'bg-yellow-500',
  purple: 'bg-purple-500',
  orange: 'bg-orange-500'
};

const TEXT_COLOR_MAP: Record<EventoCor, string> = {
  blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  green: 'text-green-400 bg-green-500/10 border-green-500/20',
  red: 'text-red-400 bg-red-500/10 border-red-500/20',
  yellow: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  orange: 'text-orange-400 bg-orange-500/10 border-orange-500/20'
};

export default function CalendarioPage() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(4); // 4 = May (0-indexed)
  const [selectedDayString, setSelectedDayString] = useState<string>('2026-05-22'); // default to mock system today

  // Modal control
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<Evento | undefined>(undefined);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDeleteAllEventos = () => {
    localStorage.removeItem('tony_crm_eventos');
    loadEventos();
  };

  const loadEventos = () => {
    setEventos(base44.db.eventos.list());
  };

  useEffect(() => {
    loadEventos();
  }, []);

  const MONTH_NAMES = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const DAYS_OF_WEEK = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // Calculate grid days for monthly view
  const getDaysInMonthGrid = () => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
    const prevMonthTotalDays = new Date(currentYear, currentMonth, 0).getDate();

    const daysList: { dayNum: number; isCurrentMonth: boolean; isoDateString: string }[] = [];

    // Prior month overflow
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = prevMonthTotalDays - i;
      const m = currentMonth === 0 ? 11 : currentMonth - 1;
      const y = currentMonth === 0 ? currentYear - 1 : currentYear;
      const mStr = String(m + 1).padStart(2, '0');
      const dStr = String(dayNum).padStart(2, '0');
      daysList.push({
        dayNum,
        isCurrentMonth: false,
        isoDateString: `${y}-${mStr}-${dStr}`
      });
    }

    // Active month days
    for (let d = 1; d <= totalDays; d++) {
      const mStr = String(currentMonth + 1).padStart(2, '0');
      const dStr = String(d).padStart(2, '0');
      daysList.push({
        dayNum: d,
        isCurrentMonth: true,
        isoDateString: `${currentYear}-${mStr}-${dStr}`
      });
    }

    // Next month overflow filler
    const remainingSlots = 42 - daysList.length;
    for (let n = 1; n <= remainingSlots; n++) {
      const m = currentMonth === 11 ? 0 : currentMonth + 1;
      const y = currentMonth === 11 ? currentYear + 1 : currentYear;
      const mStr = String(m + 1).padStart(2, '0');
      const dStr = String(n).padStart(2, '0');
      daysList.push({
        dayNum: n,
        isCurrentMonth: false,
        isoDateString: `${y}-${mStr}-${dStr}`
      });
    }

    return daysList;
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const daysGrid = getDaysInMonthGrid();

  // Selected Day specific events
  const selectedDayEvents = eventos.filter(evt => {
    try {
      const evtDay = evt.data_inicio.split('T')[0];
      return evtDay === selectedDayString;
    } catch (e) {
      return false;
    }
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in text-xs">
      {/* Calendar Grid Section */}
      <div className="lg:col-span-2 rounded-xl border border-neutral-900 bg-neutral-900/10 p-5 space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-red-500" />
            <h3 className="font-semibold text-white text-sm">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </h3>
          </div>
          
          <div className="flex gap-2.5 items-center">
            {eventos.length > 0 && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="rounded bg-red-950/15 hover:bg-red-900/15 border border-red-950/30 text-red-400 px-2.5 py-1 font-semibold text-[10px] flex items-center gap-1 transition"
                title="Limpar todos os compromissos agendados"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Limpar Agenda</span>
              </button>
            )}

            <button 
              onClick={handlePrevMonth} 
              className="rounded bg-neutral-850 hover:bg-neutral-800 p-1.5 text-neutral-300"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button 
              onClick={() => {
                const sysToday = new Date(CURRENT_MOCK_TIME);
                setCurrentYear(sysToday.getFullYear());
                setCurrentMonth(sysToday.getMonth());
                setSelectedDayString(CURRENT_MOCK_TIME.split('T')[0]);
              }}
              className="rounded bg-neutral-850 hover:bg-neutral-800 px-3 py-1 font-semibold text-neutral-300 text-[10px]"
            >
              Hoje
            </button>
            <button 
              onClick={handleNextMonth} 
              className="rounded bg-neutral-850 hover:bg-neutral-800 p-1.5 text-neutral-300"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 gap-1 text-center font-bold text-neutral-500 text-[10px] select-none border-b border-neutral-900 pb-2">
          {DAYS_OF_WEEK.map(d => (
            <div key={d}>{d}</div>
          ))}
        </div>

        {/* Calendar Day Slots */}
        <div className="grid grid-cols-7 gap-1.5 pt-1">
          {daysGrid.map((item, index) => {
            const hasEvents = eventos.some(e => e.data_inicio.split('T')[0] === item.isoDateString);
            const isSelected = selectedDayString === item.isoDateString;
            const isRealToday = item.isoDateString === CURRENT_MOCK_TIME.split('T')[0];

            return (
              <button
                key={index}
                onClick={() => setSelectedDayString(item.isoDateString)}
                className={`min-h-16 rounded-lg p-1.5 transition text-left flex flex-col justify-between border cursor-pointer ${
                  isSelected 
                    ? 'bg-red-950/25 border-red-500/80 text-white' 
                    : item.isCurrentMonth
                      ? 'bg-neutral-950/40 border-neutral-900 text-neutral-200 hover:border-neutral-700'
                      : 'bg-neutral-950/10 border-neutral-950/20 text-neutral-600 hover:border-neutral-800'
                } ${isRealToday && 'ring-1 ring-red-500/50'}`}
              >
                <div className="flex justify-between items-center w-full">
                  <span className={`font-semibold ${isRealToday ? 'text-red-500 font-bold' : ''}`}>
                    {item.dayNum}
                  </span>
                  {hasEvents && (
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                  )}
                </div>

                {/* Event text preview inline (Up to 2 items if space) */}
                <div className="mt-1 space-y-0.5 max-h-8 overflow-hidden hidden sm:block">
                  {eventos
                    .filter(e => e.data_inicio.split('T')[0] === item.isoDateString)
                    .slice(0, 2)
                    .map(e => (
                      <div 
                        key={e.id}
                        className={`text-[8px] truncate px-1 rounded-sm border ${COLOR_MAP[e.cor]} bg-opacity-10 text-white`}
                        style={{ borderLeftColor: COLOR_MAP[e.cor] }}
                      >
                        {e.titulo}
                      </div>
                    ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Appointment Sidebar */}
      <div className="rounded-xl border border-neutral-900 bg-neutral-900/10 p-5 space-y-4 flex flex-col justify-stretch">
        <div className="flex justify-between items-center border-b border-neutral-900 pb-3">
          <div>
            <h4 className="font-semibold text-white text-xs">Compromissos do Dia</h4>
            <p className="text-zinc-500 text-[10px]">
              {new Date(selectedDayString + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          
          <button
            onClick={() => {
              setEventToEdit(undefined);
              setShowEventModal(true);
            }}
            className="rounded-full bg-red-650 hover:bg-red-650/80 p-2 text-white"
            title="Novo compromisso para este dia"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 max-h-[450px] pr-1">
          {selectedDayEvents.length > 0 ? (
            selectedDayEvents.map(evt => (
              <div 
                key={evt.id} 
                onClick={() => {
                  setEventToEdit(evt);
                  setShowEventModal(true);
                }}
                className={`rounded-lg p-3 bg-neutral-950/60 hover:bg-neutral-950 border border-l-4 cursor-pointer transition flex justify-between items-start ${TEXT_COLOR_MAP[evt.cor]}`}
                style={{ borderLeftColor: evt.cor }}
              >
                <div className="space-y-1 text-zinc-300">
                  <div className="font-semibold text-white text-xs flex items-center gap-1">
                    {evt.titulo}
                    {evt.concluido && <Check className="h-3.5 w-3.5 text-green-400" />}
                  </div>
                  
                  {evt.descricao && <p className="text-[11px] text-zinc-500 line-clamp-2">"{evt.descricao}"</p>}
                  
                  <div className="flex items-center gap-3 text-[10px] text-neutral-500 font-mono mt-1">
                    <span className="flex items-center gap-0.5">
                      <Clock className="h-3 w-3" />
                      {evt.dia_inteiro ? 'Dia Inteiro' : new Date(evt.data_inicio).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                    </span>
                    
                    <span className="bg-neutral-800 px-1.5 py-0.5 rounded text-[9px] font-semibold text-neutral-300 uppercase tracking-wider">{evt.tipo}</span>
                  </div>

                  {evt.lead_nome && (
                    <div className="text-[10px] text-neutral-400 mt-2 flex items-center gap-1 bg-neutral-900/50 p-1 rounded max-w-fit">
                      <User className="h-3 w-3 text-red-400" />
                      <span>Lead: {evt.lead_nome}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-zinc-600">
              <CalendarIcon className="mx-auto mb-2 h-8 w-8 text-neutral-700" />
              <p>Nenhum compromisso agendado para esta data.</p>
            </div>
          )}
        </div>
      </div>

      {showEventModal && (
        <EventoModal
          eventToEdit={eventToEdit}
          selectedDate={selectedDayString}
          onClose={() => {
            setShowEventModal(false);
            setEventToEdit(undefined);
          }}
          onSuccess={loadEventos}
        />
      )}

      {showDeleteModal && (
        <DeleteConfirmModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteAllEventos}
          title="Limpar Todos os Compromissos"
          description={`Essa operação é irreversível e removerá permanentemente todos os ${eventos.length} agendamentos de compromissos da sua agenda/calendário.`}
        />
      )}
    </div>
  );
}
