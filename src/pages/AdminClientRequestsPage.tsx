import { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useToast } from '../components/Toast';
import { ClientRequest, DepartmentType, EventType, RequestType } from '../types';
import { Calendar, Clock, MapPin, User, Mail, FileText, CheckCircle, X, Send } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function AdminClientRequestsPage() {
  const { clientRequests, updateClientRequest, addEvent } = useData();
  const { showToast } = useToast();
  const [selectedRequest, setSelectedRequest] = useState<ClientRequest | null>(null);
  const [form, setForm] = useState<Partial<ClientRequest>>({});

  const pendingRequests = clientRequests.filter(r => r.status === 'pending_scosec');

  const openReview = (request: ClientRequest) => {
    setSelectedRequest(request);
    setForm({
      title: request.title,
      department: request.department,
      eventType: request.eventType,
      requestType: request.requestType,
      date: request.date,
      startTime: request.startTime,
      endTime: request.endTime,
      venue: request.venue,
      description: request.description,
    });
  };

  const closeReview = () => {
    setSelectedRequest(null);
    setForm({});
  };

  const handleSubmitToSCODIR = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    if (!form.title?.trim() || !form.date || !form.startTime || !form.endTime) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    if (form.department === 'Multimedia' && !form.venue?.trim()) {
      showToast('Please provide a venue for Multimedia requests', 'error');
      return;
    }

    // 1. Create the event as pending for SCODIR
    const eventData = {
      title: form.title,
      department: form.department as DepartmentType,
      eventType: form.eventType as EventType,
      requestType: form.requestType as RequestType,
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      venue: form.venue || '',
      description: `Client Request from: ${selectedRequest.clientName} (${selectedRequest.clientEmail})\n\n${form.description || ''}`,
      status: 'pending' as const, // Goes to SCODIR
      assignedTo: [],
      attachments: []
    };

    addEvent(eventData as any);

    // 2. Update the client request status
    updateClientRequest(selectedRequest.id, { status: 'submitted_to_scodir' });
    
    showToast('Request submitted to SCODIR for approval!', 'success');
    closeReview();
  };

  const handleReject = () => {
    if (!selectedRequest) return;
    if (window.confirm('Are you sure you want to reject this client request?')) {
      updateClientRequest(selectedRequest.id, { status: 'rejected_by_scosec' });
      showToast('Client request rejected', 'success');
      closeReview();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-accent">Client Requests</h1>
        <p className="text-muted mt-1">Review and modify Google Form submissions before sending to SCODIR</p>
      </div>

      {pendingRequests.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-border animate-fade-in">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <p className="text-lg font-medium text-accent mb-1">All caught up!</p>
          <p className="text-muted text-sm">No pending client requests to review.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {pendingRequests.map((request, i) => (
            <div
              key={request.id}
              className="bg-white p-6 rounded-xl border border-border hover:border-primary/30 transition-all animate-fade-in flex flex-col md:flex-row gap-6 justify-between items-start md:items-center"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-accent text-lg">{request.title}</h3>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                    {request.department}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" />
                    {request.clientName}
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary" />
                    {request.clientEmail}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    {format(parseISO(request.date), 'MMM dd, yyyy')}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    {request.startTime} - {request.endTime}
                  </div>
                </div>
              </div>

              <button
                onClick={() => openReview(request)}
                className="w-full md:w-auto px-6 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors"
              >
                Review & Modify
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-border px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h2 className="text-xl font-bold text-accent">Review Request</h2>
                <p className="text-sm text-muted">Modify details before submitting to SCODIR</p>
              </div>
              <button onClick={closeReview} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-muted" />
              </button>
            </div>

            <form onSubmit={handleSubmitToSCODIR} className="p-6 space-y-6">
              {/* Client Info (Read Only) */}
              <div className="bg-gray-50 p-4 rounded-xl border border-border space-y-2">
                <h3 className="text-sm font-semibold text-accent mb-3">Client Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted block text-xs uppercase tracking-wider font-semibold mb-1">Name</span>
                    <span className="font-medium">{selectedRequest.clientName}</span>
                  </div>
                  <div>
                    <span className="text-muted block text-xs uppercase tracking-wider font-semibold mb-1">Email</span>
                    <span className="font-medium">{selectedRequest.clientEmail}</span>
                  </div>
                </div>
              </div>

              {/* Editable Event Details */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-accent mb-1.5">Event Title *</label>
                  <input
                    type="text"
                    value={form.title || ''}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-accent mb-1.5">Department *</label>
                    <select
                      value={form.department || 'Multimedia'}
                      onChange={(e) => setForm({ ...form, department: e.target.value as DepartmentType })}
                      className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white"
                    >
                      <option value="Multimedia">Multimedia</option>
                      <option value="Graphics">Graphics</option>
                      <option value="Others">Others</option>
                    </select>
                  </div>

                  {form.department === 'Multimedia' || form.department === 'Others' ? (
                    <div>
                      <label className="block text-sm font-medium text-accent mb-1.5">
                        {form.department === 'Others' ? 'Event Type *' : 'Event Type *'}
                      </label>
                      <select
                        value={form.eventType || 'PROJECT'}
                        onChange={(e) => setForm({ ...form, eventType: e.target.value as EventType })}
                        className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white"
                      >
                        <option value="ADMIN COVERAGE">Admin Coverage</option>
                        <option value="STUDENT COVERAGE">Student Coverage</option>
                        <option value="PROJECT">Project</option>
                        <option value="CAPACITY BUILDING">Capacity Building</option>
                        <option value="Others">Others</option>
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-accent mb-1.5">Request Type *</label>
                      <select
                        value={form.requestType || 'Design Request'}
                        onChange={(e) => setForm({ ...form, requestType: e.target.value as RequestType })}
                        className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white"
                      >
                        <option value="Design Request">Design Request</option>
                        <option value="Pubmat Checking">Pubmat Checking</option>
                        <option value="Approval">Approval</option>
                      </select>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-accent mb-1.5">Date *</label>
                    <input
                      type="date"
                      value={form.date || ''}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-accent mb-1.5">Start Time *</label>
                    <input
                      type="time"
                      value={form.startTime || ''}
                      onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-accent mb-1.5">End Time *</label>
                    <input
                      type="time"
                      value={form.endTime || ''}
                      onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                  </div>
                </div>

                {form.department === 'Multimedia' && (
                  <div>
                    <label className="block text-sm font-medium text-accent mb-1.5">Venue *</label>
                    <input
                      type="text"
                      value={form.venue || ''}
                      onChange={(e) => setForm({ ...form, venue: e.target.value })}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-accent mb-1.5">Description</label>
                  <textarea
                    value={form.description || ''}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-border">
                <button
                  type="button"
                  onClick={handleReject}
                  className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Reject Request
                </button>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={closeReview}
                    className="px-4 py-2 text-sm font-medium text-accent hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-6 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    Submit to SCODIR
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
