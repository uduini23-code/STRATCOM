import { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Clock,
  Calendar as CalendarIcon,
  X,
  Paperclip,
} from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  parseISO,
  addMonths,
  subMonths,
  getDay,
  isToday,
} from 'date-fns';
import { CalendarEvent, EventType } from '../types';
import { EVENT_COLORS } from './AdminEventsPage';

export default function CalendarPage() {
  const { events, loading } = useData();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDay = getDay(monthStart);

  const eventsByDate = useMemo(() => {
    const map: Record<string, (CalendarEvent | null)[]> = {};
    
    const sortedEvents = [...events].sort((a, b) => {
      const aStart = new Date(a.date).getTime();
      const bStart = new Date(b.date).getTime();
      if (aStart !== bStart) return aStart - bStart;
      
      const aEnd = a.endDate ? new Date(a.endDate).getTime() : aStart;
      const bEnd = b.endDate ? new Date(b.endDate).getTime() : bStart;
      const aDuration = aEnd - aStart;
      const bDuration = bEnd - bStart;
      if (aDuration !== bDuration) return bDuration - aDuration;
      
      return a.title.localeCompare(b.title);
    });

    sortedEvents.forEach((event) => {
      try {
        const start = parseISO(event.date);
        const end = event.endDate ? parseISO(event.endDate) : start;
        
        const days = end < start ? [start] : eachDayOfInterval({ start, end });
        
        let slot = 0;
        let slotFound = false;
        while (!slotFound) {
          let isAvailable = true;
          for (const day of days) {
            const key = format(day, 'yyyy-MM-dd');
            if (map[key] && map[key][slot]) {
              isAvailable = false;
              break;
            }
          }
          if (isAvailable) {
            slotFound = true;
          } else {
            slot++;
          }
        }

        days.forEach(day => {
          const key = format(day, 'yyyy-MM-dd');
          if (!map[key]) map[key] = [];
          while (map[key].length <= slot) {
            map[key].push(null);
          }
          map[key][slot] = event;
        });
      } catch (e) {
        const key = event.date;
        if (!map[key]) map[key] = [];
        map[key].push(event);
      }
    });
    return map;
  }, [events]);

  const upcomingEvents = useMemo(() => {
    return events
      .filter((e) => {
        const targetDate = e.endDate ? new Date(e.endDate) : new Date(e.date);
        return targetDate >= new Date(new Date().toDateString());
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);
  }, [events]);

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="skeleton h-10 w-48 rounded-lg mb-6" />
        <div className="skeleton h-[500px] rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-accent mb-2">Events Calendar</h1>
        <p className="text-muted">View all scheduled events and activities</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-3 animate-fade-in">
          <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
            {/* Month Navigation */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <button
                onClick={prevMonth}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-muted hover:text-accent"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-bold text-accent">
                {format(currentMonth, 'MMMM yyyy')}
              </h2>
              <button
                onClick={nextMonth}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-muted hover:text-accent"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 border-b border-border">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="py-3 text-center text-xs font-semibold text-muted uppercase tracking-wider">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7">
              {/* Empty cells for days before month start */}
              {Array.from({ length: startDay }).map((_, i) => (
                <div key={`empty-${i}`} className="min-h-[100px] border-b border-r border-border bg-gray-50/50" />
              ))}

              {/* Day cells */}
              {daysInMonth.map((day) => {
                const dateKey = format(day, 'yyyy-MM-dd');
                const dayEvents = eventsByDate[dateKey] || [];
                const today = isToday(day);
                
                const visibleSlots = dayEvents.slice(0, 3);
                const hiddenEventsCount = dayEvents.slice(3).filter(e => e !== null).length;

                return (
                  <div
                    key={dateKey}
                    className={`min-h-[100px] border-b border-r border-border flex flex-col transition-colors ${
                      !isSameMonth(day, currentMonth) ? 'bg-gray-50/50' : ''
                    } ${today ? 'bg-primary-bg' : 'hover:bg-gray-50'}`}
                  >
                    <div className="pt-1.5 px-1.5 flex items-center justify-between mb-1">
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium ${
                          today
                            ? 'bg-primary text-white'
                            : isSameMonth(day, currentMonth)
                            ? 'text-accent'
                            : 'text-gray-300'
                        }`}
                      >
                        {format(day, 'd')}
                      </span>
                    </div>
                    <div className="flex-1 flex flex-col gap-0.5 pb-1.5">
                      {visibleSlots.map((event, idx) => {
                        if (!event) {
                          return <div key={`empty-${dateKey}-${idx}`} className="h-[22px]" />;
                        }
                        
                        const isStart = dateKey === event.date;
                        const isEnd = !event.endDate || dateKey === event.endDate;
                        
                        let shapeClasses = 'rounded mx-1.5';
                        if (isStart && !isEnd) {
                          shapeClasses = 'rounded-l rounded-r-none ml-1.5 mr-[-1px] relative z-10';
                        } else if (!isStart && isEnd) {
                          shapeClasses = 'rounded-r rounded-l-none mr-1.5 ml-0';
                        } else if (!isStart && !isEnd) {
                          shapeClasses = 'rounded-none mx-[-1px] relative z-10';
                        }

                        const colorClass = event.eventType ? (EVENT_COLORS[event.eventType] || 'bg-gray-100 text-gray-800') : 'bg-gray-100 text-gray-800';
                        const chipClass = colorClass.split(' ').filter(c => c.startsWith('bg-') || c.startsWith('text-')).join(' ');

                        return (
                          <button
                            key={`${event.id}-${dateKey}`}
                            onClick={() => setSelectedEvent(event)}
                            className={`text-left text-[11px] px-1.5 py-0.5 h-[22px] transition-colors truncate font-medium ${chipClass} ${shapeClasses} hover:opacity-80`}
                          >
                            {isStart || getDay(day) === 0 || day.getDate() === 1 ? event.title : '\u00A0'}
                          </button>
                        );
                      })}
                      {hiddenEventsCount > 0 && (
                        <span className="text-[10px] text-muted pl-1.5 font-medium">+{hiddenEventsCount} more</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar - Upcoming Events */}
        <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
          <div className="bg-white rounded-2xl border border-border shadow-sm p-5 sticky top-24">
            <h3 className="font-bold text-accent mb-4 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-primary" />
              Upcoming Events
            </h3>
            {upcomingEvents.length === 0 ? (
              <p className="text-sm text-muted text-center py-8">No upcoming events</p>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.map((event) => {
                  const colorClass = event.eventType ? (EVENT_COLORS[event.eventType] || 'bg-gray-100 text-gray-800 border-gray-200') : 'bg-gray-100 text-gray-800 border-gray-200';
                  return (
                    <button
                      key={event.id}
                      onClick={() => setSelectedEvent(event)}
                      className={`w-full text-left p-3 rounded-xl border hover:opacity-80 transition-all group ${colorClass}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-semibold truncate">
                          {event.title}
                        </p>
                        <span className="text-[9px] font-bold uppercase tracking-wider opacity-80 whitespace-nowrap ml-2">
                          {event.department === 'For MultiMedia' ? event.eventType : event.requestType}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-1.5 text-xs opacity-80">
                        <CalendarIcon className="w-3 h-3" />
                        {format(parseISO(event.date), 'MMM dd, yyyy')}
                        {event.endDate && event.endDate !== event.date && ` - ${format(parseISO(event.endDate), 'MMM dd, yyyy')}`}
                      </div>
                      <div className="flex items-center gap-1 mt-0.5 text-xs opacity-80">
                        <Clock className="w-3 h-3" />
                        {event.time}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-scale-in overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`p-6 text-white ${
              selectedEvent.eventType === 'ADMIN COVERAGE' ? 'bg-blue-600' :
              selectedEvent.eventType === 'STUDENT COVERAGE' ? 'bg-pink-600' :
              selectedEvent.eventType === 'PROJECT' ? 'bg-violet-600' :
              selectedEvent.eventType === 'CAPACITY BUILDING' ? 'bg-amber-700' :
              'bg-primary'
            }`}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold">{selectedEvent.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {selectedEvent.department && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white">
                        {selectedEvent.department}
                      </span>
                    )}
                    <p className="text-white/90 text-sm font-medium">
                      {selectedEvent.department === 'For MultiMedia' ? selectedEvent.eventType : selectedEvent.requestType}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="p-1 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <CalendarIcon className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted uppercase tracking-wider font-semibold">Date</p>
                  <p className="text-accent font-medium">
                    {format(parseISO(selectedEvent.date), 'EEEE, MMMM dd, yyyy')}
                    {selectedEvent.endDate && selectedEvent.endDate !== selectedEvent.date && ` - ${format(parseISO(selectedEvent.endDate), 'EEEE, MMMM dd, yyyy')}`}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted uppercase tracking-wider font-semibold">Time</p>
                  <p className="text-accent font-medium">{selectedEvent.time}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted uppercase tracking-wider font-semibold">Venue</p>
                  <p className="text-accent font-medium">{selectedEvent.venue}</p>
                </div>
              </div>
              {selectedEvent.description && (
                <div className="pt-3 border-t border-border">
                  <p className="text-sm text-muted leading-relaxed">{selectedEvent.description}</p>
                </div>
              )}
              {selectedEvent.attachments && selectedEvent.attachments.length > 0 && (
                <div className="pt-3 border-t border-border">
                  <p className="text-xs text-muted uppercase tracking-wider font-semibold mb-2">Attachments</p>
                  <div className="space-y-2">
                    {selectedEvent.attachments.map((file, i) => (
                      <a
                        key={i}
                        href={file.data}
                        download={file.name}
                        className="flex items-center gap-2 p-2 rounded-lg border border-border hover:bg-gray-50 transition-colors"
                      >
                        <Paperclip className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="text-sm text-accent truncate flex-1">{file.name}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
