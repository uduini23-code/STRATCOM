import { useState, useRef } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import { CalendarEvent, EventType, DepartmentType, RequestType } from '../types';
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Calendar,
  Clock,
  MapPin,
  FileText,
  Search,
  Tag,
  Users as UsersIcon,
  Briefcase,
  Paperclip,
  Upload,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

export const EVENT_COLORS: Record<EventType, string> = {
  'ADMIN COVERAGE': 'bg-blue-100 text-blue-800 border-blue-200',
  'STUDENT COVERAGE': 'bg-pink-100 text-pink-800 border-pink-200',
  'PROJECT': 'bg-violet-100 text-violet-800 border-violet-200',
  'CAPACITY BUILDING': 'bg-amber-100 text-amber-900 border-amber-200',
};

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

export default function AdminEventsPage() {
  const { events, addEvent, editEvent, deleteEvent } = useData();
  const { showToast } = useToast();
  const { canApproveEvents } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [isMultiDay, setIsMultiDay] = useState(false);

  const [form, setForm] = useState<{
    title: string;
    date: string;
    endDate: string;
    time: string;
    venue: string;
    description: string;
    department: DepartmentType;
    eventType: EventType;
    requestType: RequestType;
    assignedTo: string[];
    attachments: { name: string; data: string }[];
  }>({
    title: '',
    date: '',
    endDate: '',
    time: '',
    venue: '',
    description: '',
    department: 'For MultiMedia',
    eventType: 'ADMIN COVERAGE',
    requestType: 'Design Request',
    assignedTo: [],
    attachments: [],
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const ext = file.name.split('.').pop()?.toLowerCase();
      return ['pdf', 'png', 'jpeg', 'jpg', 'ppt', 'pptx', 'psd'].includes(ext || '');
    });

    if (validFiles.length !== files.length) {
      showToast('Some files were rejected. Only PDF, PNG, JPEG, PPT, and PSD are allowed.', 'error');
    }

    validFiles.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        showToast(`File ${file.name} is too large (max 5MB)`, 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm(prev => ({
          ...prev,
          attachments: [...prev.attachments, { name: file.name, data: reader.result as string }]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAttachment = (index: number) => {
    setForm(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const filteredEvents = events
    .filter(
      (e) =>
        e.title.toLowerCase().includes(search.toLowerCase()) ||
        e.venue.toLowerCase().includes(search.toLowerCase()) ||
        e.eventType.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const openCreate = () => {
    setEditingEvent(null);
    setIsMultiDay(false);
    setForm({ 
      title: '', date: '', endDate: '', time: '', venue: '', description: '', 
      department: 'Multimedia', eventType: 'ADMIN COVERAGE', requestType: 'Design Request', 
      assignedTo: [], attachments: [] 
    });
    setModalOpen(true);
  };

  const openEdit = (event: CalendarEvent) => {
    setEditingEvent(event);
    setIsMultiDay(!!event.endDate && event.endDate !== event.date);
    setForm({
      title: event.title,
      date: event.date,
      endDate: event.endDate || '',
      time: event.time,
      venue: event.venue,
      description: event.description,
      department: event.department || 'Multimedia',
      eventType: event.eventType || 'ADMIN COVERAGE',
      requestType: event.requestType || 'Design Request',
      assignedTo: event.assignedTo || [],
      attachments: event.attachments || [],
    });
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setEditingEvent(null);
    setForm({ 
      title: '', date: '', endDate: '', time: '', venue: '', description: '', 
      department: 'Multimedia', eventType: 'ADMIN COVERAGE', requestType: 'Design Request', 
      assignedTo: [], attachments: [] 
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.date || !form.time) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    if (form.department === 'Multimedia' && !form.venue.trim()) {
      showToast('Please provide a venue', 'error');
      return;
    }

    if (form.department === 'Graphics' && form.assignedTo.length === 0) {
      showToast('Please assign at least one person', 'error');
      return;
    }
    
    if (isMultiDay && form.endDate && new Date(form.endDate) < new Date(form.date)) {
      showToast('End date cannot be before start date', 'error');
      return;
    }

    const eventData = {
      ...form,
      endDate: isMultiDay && form.endDate ? form.endDate : undefined,
      status: canApproveEvents ? 'approved' : 'pending',
    };

    if (editingEvent) {
      editEvent(editingEvent.id, eventData);
      showToast('Event updated successfully!', 'success');
    } else {
      addEvent(eventData as any);
      showToast(canApproveEvents ? 'Event created successfully!' : 'Event submitted for approval!', 'success');
      
      // Send email notifications only if approved immediately, or maybe wait for approval?
      // Let's send emails only if it's approved, or if we want to notify assignees. 
      // Since SCOSEC doesn't assign for Multimedia, and Graphics has Zak/Pjohn, let's send if assignedTo > 0
      if (form.assignedTo.length > 0 && canApproveEvents) {
        const greetingText = form.department === 'Graphics' ? 'You have a request.' : 'You have been assigned to an event.';
        
        for (const userId of form.assignedTo) {
          const user = ASSIGNABLE_USERS.find(u => u.id === userId);
          if (user) {
            try {
              const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  to: user.email,
                  subject: `Event Assignment: ${form.department === 'Multimedia' ? form.eventType : form.requestType}`,
                  text: `Hello ${user.name},\n\n${greetingText}\n\nEvent: ${form.title}\nDate: ${form.date} ${isMultiDay && form.endDate ? `to ${form.endDate}` : ''}\nTime: ${form.time}\nVenue: ${form.venue}\nDescription: ${form.description}\n\nThank you.`,
                  html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                      <h2 style="color: #16a34a;">${form.title}</h2>
                      <p>Hello <strong>${user.name}</strong>,</p>
                      <p>${greetingText}</p>
                      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                        <tr>
                          <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Department:</strong></td>
                          <td style="padding: 8px; border-bottom: 1px solid #eee;">${form.department}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Type:</strong></td>
                          <td style="padding: 8px; border-bottom: 1px solid #eee;">${form.department === 'Multimedia' ? form.eventType : form.requestType}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Date:</strong></td>
                          <td style="padding: 8px; border-bottom: 1px solid #eee;">${form.date} ${isMultiDay && form.endDate ? `to ${form.endDate}` : ''}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Time:</strong></td>
                          <td style="padding: 8px; border-bottom: 1px solid #eee;">${form.time}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Venue:</strong></td>
                          <td style="padding: 8px; border-bottom: 1px solid #eee;">${form.venue}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Description:</strong></td>
                          <td style="padding: 8px; border-bottom: 1px solid #eee;">${form.description || 'N/A'}</td>
                        </tr>
                      </table>
                    </div>
                  `,
                  attachments: form.attachments
                })
              });
              
              if (response.ok) {
                showToast(`Email sent to ${user.name}`, 'success');
              } else {
                const errorData = await response.json();
                console.error('Email error:', errorData);
                showToast(`Failed to send email to ${user.name}: ${errorData.error || 'Check SMTP config'}`, 'error');
              }
            } catch (error) {
              console.error('Failed to send email:', error);
              showToast(`Failed to send email to ${user.name}`, 'error');
            }
          }
        }
      }
    }
    handleClose();
  };

  const handleDelete = (id: string) => {
    deleteEvent(id);
    setDeleteConfirm(null);
    showToast('Event deleted successfully', 'success');
  };

  const isUpcoming = (dateStr: string, endDateStr?: string) => {
    const targetDate = endDateStr ? new Date(endDateStr) : new Date(dateStr);
    return targetDate >= new Date(new Date().toDateString());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-accent">Manage Events</h1>
          <p className="text-muted mt-1">Add, edit, or remove calendar events</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark transition-all shadow-md shadow-green-500/20"
        >
          <Plus className="w-4 h-4" />
          Add Event
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6 animate-fade-in">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input
          type="text"
          placeholder="Search events..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        />
      </div>

      {/* Events List */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-border animate-fade-in">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-lg font-medium text-accent mb-1">
            {search ? 'No events match your search' : 'No events yet'}
          </p>
          <p className="text-muted text-sm mb-4">
            {search ? 'Try adjusting your search' : 'Click "Add Event" to create your first event'}
          </p>
          {!search && (
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Event
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEvents.map((event, i) => (
            <div
              key={event.id}
              className={`bg-white rounded-xl border overflow-hidden shadow-sm hover:shadow-md transition-all animate-fade-in ${
                isUpcoming(event.date, event.endDate)
                  ? 'border-border'
                  : 'border-border/50 opacity-75'
              }`}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex flex-col sm:flex-row">
                {/* Date badge */}
                <div className="sm:w-24 flex-shrink-0 bg-primary-bg flex items-center justify-center p-4 border-b sm:border-b-0 sm:border-r border-green-100">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary leading-none">
                      {format(parseISO(event.date), 'dd')}
                    </p>
                    <p className="text-xs font-semibold text-primary/70 uppercase mt-1">
                      {format(parseISO(event.date), 'MMM yyyy')}
                    </p>
                    {!isUpcoming(event.date, event.endDate) && (
                      <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-200 text-gray-500">
                        Past
                      </span>
                    )}
                  </div>
                </div>

                {/* Event details */}
                <div className="flex-1 p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-accent text-lg">{event.title}</h3>
                        {event.department && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-gray-100 text-gray-800 border-gray-200">
                            {event.department}
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${event.eventType ? (EVENT_COLORS[event.eventType] || 'bg-gray-100 text-gray-800 border-gray-200') : 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                          {event.department === 'Multimedia' ? event.eventType : event.requestType}
                        </span>
                        {event.status === 'pending' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-yellow-100 text-yellow-800 border-yellow-200">
                            Pending Approval
                          </span>
                        )}
                        {event.status === 'rejected' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-red-100 text-red-800 border-red-200">
                            Rejected
                          </span>
                        )}
                      </div>
                      {event.description && (
                        <p className="text-sm text-muted mt-1 line-clamp-2">{event.description}</p>
                      )}
                      <div className="flex flex-wrap gap-4 mt-3">
                        <span className="inline-flex items-center gap-1.5 text-sm text-muted">
                          <Calendar className="w-4 h-4 text-primary" />
                          {format(parseISO(event.date), 'MMM dd, yyyy')}
                          {event.endDate && event.endDate !== event.date && ` - ${format(parseISO(event.endDate), 'MMM dd, yyyy')}`}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-sm text-muted">
                          <Clock className="w-4 h-4 text-primary" />
                          {event.time}
                        </span>
                        {event.venue && (
                          <span className="inline-flex items-center gap-1.5 text-sm text-muted">
                            <MapPin className="w-4 h-4 text-primary" />
                            {event.venue}
                          </span>
                        )}
                        {event.attachments && event.attachments.length > 0 && (
                          <span className="inline-flex items-center gap-1.5 text-sm text-muted">
                            <Paperclip className="w-4 h-4 text-primary" />
                            {event.attachments.length} attachment(s)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 sm:flex-shrink-0">
                      <button
                        onClick={() => openEdit(event)}
                        className="p-2 rounded-lg text-muted hover:text-primary hover:bg-primary-bg transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      {deleteConfirm === event.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(event.id)}
                            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(event.id)}
                          className="p-2 rounded-lg text-muted hover:text-red-500 hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={handleClose}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full animate-scale-in overflow-hidden max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-lg font-bold text-accent">
                {editingEvent ? 'Edit Event' : 'Add New Event'}
              </h2>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-accent mb-1.5">
                  <Briefcase className="w-3.5 h-3.5 inline mr-1.5" />
                  Department *
                </label>
                <select
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value as DepartmentType, assignedTo: [] })}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-white"
                >
                  <option value="Multimedia">Multimedia</option>
                  <option value="Graphics">Graphics</option>
                </select>
              </div>

              {/* Title & Event/Request Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-accent mb-1.5">
                    <FileText className="w-3.5 h-3.5 inline mr-1.5" />
                    Event Title *
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g., Strategic Planning Meeting"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-accent mb-1.5">
                    <Tag className="w-3.5 h-3.5 inline mr-1.5" />
                    {form.department === 'Multimedia' ? 'Event Type *' : 'Request Type *'}
                  </label>
                  {form.department === 'Multimedia' ? (
                    <select
                      value={form.eventType}
                      onChange={(e) => setForm({ ...form, eventType: e.target.value as EventType })}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-white"
                    >
                      <option value="ADMIN COVERAGE">ADMIN COVERAGE</option>
                      <option value="STUDENT COVERAGE">STUDENT COVERAGE</option>
                      <option value="PROJECT">PROJECT</option>
                      <option value="CAPACITY BUILDING">CAPACITY BUILDING</option>
                    </select>
                  ) : (
                    <select
                      value={form.requestType}
                      onChange={(e) => setForm({ ...form, requestType: e.target.value as RequestType })}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-white"
                    >
                      <option value="Design Request">Design Request</option>
                      <option value="Pubmat Checking">Pubmat Checking</option>
                      <option value="Approval">Approval</option>
                    </select>
                  )}
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-accent cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isMultiDay}
                      onChange={(e) => setIsMultiDay(e.target.checked)}
                      className="rounded border-border text-primary focus:ring-primary/30"
                    />
                    Multi-day event
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-accent mb-1.5">
                    <Calendar className="w-3.5 h-3.5 inline mr-1.5" />
                    {isMultiDay ? 'Start Date *' : 'Date *'}
                  </label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>
                {isMultiDay && (
                  <div>
                    <label className="block text-sm font-medium text-accent mb-1.5">
                      <Calendar className="w-3.5 h-3.5 inline mr-1.5" />
                      End Date *
                    </label>
                    <input
                      type="date"
                      value={form.endDate}
                      onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                      required={isMultiDay}
                      min={form.date}
                      className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    />
                  </div>
                )}
                <div className={isMultiDay ? 'sm:col-span-2' : ''}>
                  <label className="block text-sm font-medium text-accent mb-1.5">
                    <Clock className="w-3.5 h-3.5 inline mr-1.5" />
                    Time *
                  </label>
                  <input
                    type="time"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>
              </div>

              {/* Venue & Assigned To */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {form.department === 'Multimedia' && (
                  <div>
                    <label className="block text-sm font-medium text-accent mb-1.5">
                      <MapPin className="w-3.5 h-3.5 inline mr-1.5" />
                      Venue / Location *
                    </label>
                    <input
                      type="text"
                      value={form.venue}
                      onChange={(e) => setForm({ ...form, venue: e.target.value })}
                      placeholder="e.g., Conference Room A, Main Building"
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    />
                  </div>
                )}
                {form.department === 'Graphics' && (
                  <div>
                    <label className="block text-sm font-medium text-accent mb-1.5">
                      <UsersIcon className="w-3.5 h-3.5 inline mr-1.5" />
                      Assign To *
                    </label>
                    <div className="relative">
                      <select
                        multiple
                        value={form.assignedTo}
                        onChange={(e) => {
                          const values = Array.from(e.target.selectedOptions, option => option.value);
                          setForm({ ...form, assignedTo: values });
                        }}
                        className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-white h-[46px]"
                      >
                        {ASSIGNABLE_USERS.filter(u => u.name === 'Zak' || u.name === 'Pjohn').map(user => (
                          <option key={user.id} value={user.id}>{user.name}</option>
                        ))}
                      </select>
                      <p className="text-[10px] text-muted mt-1">Hold Ctrl/Cmd to select multiple</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-accent mb-1.5">
                  Description (optional)
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Additional details about the event..."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
                />
              </div>

              {/* Attachments */}
              <div>
                <label className="block text-sm font-medium text-accent mb-1.5">
                  <Paperclip className="w-3.5 h-3.5 inline mr-1.5" />
                  Attachments (optional)
                </label>
                <div 
                  className="w-full border-2 border-dashed border-border hover:bg-gray-50 rounded-xl p-4 text-center cursor-pointer transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".pdf,.png,.jpeg,.jpg,.ppt,.pptx,.psd"
                    multiple
                    className="hidden"
                  />
                  <Upload className="w-6 h-6 text-muted mx-auto mb-2" />
                  <p className="text-sm text-accent font-medium">Click to upload files</p>
                  <p className="text-xs text-muted mt-1">PDF, PNG, JPEG, PPT, PSD (Max 5MB each)</p>
                </div>
                {form.attachments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {form.attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-border">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <Paperclip className="w-4 h-4 text-muted flex-shrink-0" />
                          <span className="text-sm text-accent truncate">{file.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAttachment(index)}
                          className="p-1 text-muted hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-muted hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all shadow-md shadow-green-500/20"
                >
                  {editingEvent ? 'Save Changes' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
