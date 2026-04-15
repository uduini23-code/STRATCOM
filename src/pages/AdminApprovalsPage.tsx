import { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useToast } from '../components/Toast';
import { CalendarEvent } from '../types';
import {
  CheckCircle,
  XCircle,
  Calendar,
  Clock,
  MapPin,
  Users as UsersIcon,
  Paperclip,
  X,
  Tag
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { EVENT_COLORS } from './AdminEventsPage';

const ASSIGNABLE_USERS = [
  { id: 'Kyla', name: 'Kyla', email: 'kcmartinez@dlsud.edu.ph' },
  { id: 'Erron', name: 'Erron', email: 'scomultimedia@dlsud.edu.ph' },
  { id: 'Rue', name: 'Rue', email: 'scographics@dlsud.edu.ph' },
  { id: 'Angie', name: 'Angie', email: 'wochui@dlsud.edu.ph' },
  { id: 'Carmila', name: 'Carmila', email: 'scosecretary@dlsud.edu.ph' },
  { id: 'Jojo', name: 'Jojo', email: 'jpromerosa@dlsud.edu.ph' },
  { id: 'Pjohn', name: 'Pjohn', email: 'cbcatapang@dlsud.edu.ph' },
  { id: 'Amvher', name: 'Amvher', email: 'aapamaran@dlsud.edu.ph' },
  { id: 'Zak', name: 'Zak', email: 'zmperiodico@dlsud.edu.ph' },
  { id: 'Ysh', name: 'Ysh', email: 'ecsanjose@dlsud.edu.ph' },
];

export default function AdminApprovalsPage() {
  const { events, editEvent } = useData();
  const { showToast } = useToast();
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [assignedTo, setAssignedTo] = useState<string[]>([]);

  const pendingEvents = events.filter(e => e.status === 'pending');

  const openReview = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setAssignedTo(event.assignedTo || []);
  };

  const closeReview = () => {
    setSelectedEvent(null);
    setAssignedTo([]);
  };

  const handleApprove = async () => {
    if (!selectedEvent) return;

    const updatedEvent = {
      ...selectedEvent,
      status: 'approved' as const,
      assignedTo,
    };

    editEvent(selectedEvent.id, updatedEvent);
    showToast('Event approved and added to calendar!', 'success');

    // Send email notifications to assigned users
    if (assignedTo.length > 0) {
      const greetingText = updatedEvent.department === 'Graphics' ? 'You have a request.' : 'You have been assigned to an event.';
      const isMultiDay = !!(updatedEvent.endDate && updatedEvent.endDate !== updatedEvent.date);
      
      for (const userId of assignedTo) {
        const user = ASSIGNABLE_USERS.find(u => u.id === userId);
        if (user) {
          try {
            await fetch('/api/send-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                to: user.email,
                subject: `Event Assignment: ${updatedEvent.department === 'Multimedia' ? updatedEvent.eventType : updatedEvent.requestType}`,
                text: `Hello ${user.name},\n\n${greetingText}\n\nEvent: ${updatedEvent.title}\nDate: ${updatedEvent.date} ${isMultiDay && updatedEvent.endDate ? `to ${updatedEvent.endDate}` : ''}\nTime: ${updatedEvent.time}\nVenue: ${updatedEvent.venue}\nDescription: ${updatedEvent.description}\n\nThank you.`,
                html: `
                  <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #16a34a;">${updatedEvent.title}</h2>
                    <p>Hello <strong>${user.name}</strong>,</p>
                    <p>${greetingText}</p>
                    <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                      <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Department:</strong></td>
                        <td style="padding: 8px; border-bottom: 1px solid #eee;">${updatedEvent.department}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Type:</strong></td>
                        <td style="padding: 8px; border-bottom: 1px solid #eee;">${updatedEvent.department === 'Multimedia' ? updatedEvent.eventType : updatedEvent.requestType}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Date:</strong></td>
                        <td style="padding: 8px; border-bottom: 1px solid #eee;">${updatedEvent.date} ${isMultiDay && updatedEvent.endDate ? `to ${updatedEvent.endDate}` : ''}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Time:</strong></td>
                        <td style="padding: 8px; border-bottom: 1px solid #eee;">${updatedEvent.time}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Venue:</strong></td>
                        <td style="padding: 8px; border-bottom: 1px solid #eee;">${updatedEvent.venue || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Description:</strong></td>
                        <td style="padding: 8px; border-bottom: 1px solid #eee;">${updatedEvent.description || 'N/A'}</td>
                      </tr>
                    </table>
                  </div>
                `,
                attachments: updatedEvent.attachments
              })
            });
          } catch (error) {
            console.error('Failed to send email:', error);
          }
        }
      }
    }

    closeReview();
  };

  const handleReject = () => {
    if (!selectedEvent) return;
    editEvent(selectedEvent.id, { ...selectedEvent, status: 'rejected' });
    showToast('Event rejected.', 'error');
    closeReview();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-accent">Event Approvals</h1>
        <p className="text-muted mt-1">Review and approve events submitted by SCOSEC</p>
      </div>

      {pendingEvents.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-border animate-fade-in">
          <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-lg font-medium text-accent mb-1">All caught up!</p>
          <p className="text-muted text-sm">There are no pending events to review.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pendingEvents.map((event, i) => (
            <div
              key={event.id}
              className="bg-white p-5 rounded-xl border border-yellow-200 shadow-sm hover:shadow-md transition-all animate-fade-in flex flex-col"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-accent text-lg line-clamp-1">{event.title}</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-yellow-100 text-yellow-800 border-yellow-200 flex-shrink-0 ml-2">
                  Pending
                </span>
              </div>
              
              <div className="space-y-2 mb-4 flex-1">
                <div className="flex items-center gap-2 text-sm text-muted">
                  <Tag className="w-4 h-4 text-primary" />
                  <span>{event.department} - {event.department === 'Multimedia' ? event.eventType : event.requestType}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span>{format(parseISO(event.date), 'MMM dd, yyyy')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>{event.time}</span>
                </div>
              </div>

              <button
                onClick={() => openReview(event)}
                className="w-full py-2 rounded-lg bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors"
              >
                Review Details
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {selectedEvent && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={closeReview}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full animate-scale-in overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-lg font-bold text-accent">Review Event</h2>
              <button
                onClick={closeReview}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div>
                <h3 className="text-xl font-bold text-accent mb-2">{selectedEvent.title}</h3>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold border bg-gray-100 text-gray-800 border-gray-200">
                    {selectedEvent.department}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${selectedEvent.eventType ? (EVENT_COLORS[selectedEvent.eventType] || 'bg-gray-100 text-gray-800 border-gray-200') : 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                    {selectedEvent.department === 'Multimedia' ? selectedEvent.eventType : selectedEvent.requestType}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-muted mb-1">Date</p>
                  <p className="text-sm font-medium text-accent flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-primary" />
                    {format(parseISO(selectedEvent.date), 'MMM dd, yyyy')}
                    {selectedEvent.endDate && selectedEvent.endDate !== selectedEvent.date && ` - ${format(parseISO(selectedEvent.endDate), 'MMM dd, yyyy')}`}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted mb-1">Time</p>
                  <p className="text-sm font-medium text-accent flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-primary" />
                    {selectedEvent.time}
                  </p>
                </div>
                {selectedEvent.venue && (
                  <div className="col-span-2">
                    <p className="text-xs font-medium text-muted mb-1">Venue</p>
                    <p className="text-sm font-medium text-accent flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-primary" />
                      {selectedEvent.venue}
                    </p>
                  </div>
                )}
              </div>

              {selectedEvent.description && (
                <div>
                  <p className="text-xs font-medium text-muted mb-1">Description</p>
                  <p className="text-sm text-accent whitespace-pre-wrap bg-gray-50 p-3 rounded-xl border border-border">
                    {selectedEvent.description}
                  </p>
                </div>
              )}

              {selectedEvent.attachments && selectedEvent.attachments.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted mb-1">Attachments</p>
                  <div className="space-y-2">
                    {selectedEvent.attachments.map((file, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-border">
                        <Paperclip className="w-4 h-4 text-muted flex-shrink-0" />
                        <span className="text-sm text-accent truncate">{file.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Assign To (SCODIR can assign/re-assign) */}
              <div className="pt-4 border-t border-border">
                <label className="block text-sm font-medium text-accent mb-1.5">
                  <UsersIcon className="w-3.5 h-3.5 inline mr-1.5" />
                  Assign To (Required for Approval)
                </label>
                <div className="relative">
                  <select
                    multiple
                    value={assignedTo}
                    onChange={(e) => {
                      const values = Array.from(e.target.selectedOptions, option => option.value);
                      setAssignedTo(values);
                    }}
                    className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-white h-[120px]"
                  >
                    {ASSIGNABLE_USERS.filter(u => selectedEvent.department === 'Graphics' ? (u.name === 'Zak' || u.name === 'Pjohn') : true).map(user => (
                      <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                  </select>
                  <p className="text-[10px] text-muted mt-1">Hold Ctrl/Cmd to select multiple</p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-border flex gap-3 bg-gray-50">
              <button
                onClick={handleReject}
                className="flex-1 py-2.5 rounded-xl bg-white border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition-all flex items-center justify-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Reject
              </button>
              <button
                onClick={handleApprove}
                className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all shadow-md shadow-green-500/20 flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
