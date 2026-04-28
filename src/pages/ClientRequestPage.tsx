import { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useToast } from '../components/Toast';
import { DepartmentType, EventType, RequestType } from '../types';
import { Send, CheckCircle } from 'lucide-react';

export default function ClientRequestPage() {
  const { addClientRequest } = useData();
  const { showToast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    clientName: '',
    clientEmail: '',
    title: '',
    department: 'Multimedia' as DepartmentType,
    eventType: 'PROJECT' as EventType,
    requestType: 'Design Request' as RequestType,
    date: '',
    startTime: '',
    endTime: '',
    venue: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.clientName || !form.clientEmail || !form.title || !form.date || !form.startTime || !form.endTime) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    if (form.department === 'Multimedia' && !form.venue) {
      showToast('Please provide a venue for Multimedia requests', 'error');
      return;
    }

    addClientRequest({
      clientName: form.clientName,
      clientEmail: form.clientEmail,
      title: form.title,
      department: form.department,
      eventType: form.department === 'Multimedia' ? form.eventType : undefined,
      requestType: form.department === 'Graphics' ? form.requestType : undefined,
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      venue: form.venue,
      description: form.description,
    });

    setSubmitted(true);
    showToast('Request submitted successfully!', 'success');
  };

  if (submitted) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-white rounded-2xl border border-border p-12 text-center animate-fade-in shadow-sm">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-accent mb-4">Request Submitted!</h2>
          <p className="text-lg text-muted mb-8 max-w-lg mx-auto">
            Thank you for submitting your request. The Strategic Communications Office (SCOSEC) will review your request shortly.
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setForm({
                clientName: '',
                clientEmail: '',
                title: '',
                department: 'Multimedia',
                eventType: 'PROJECT',
                requestType: 'Design Request',
                date: '',
                startTime: '',
                endTime: '',
                venue: '',
                description: '',
              });
            }}
            className="px-8 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors"
          >
            Submit Another Request
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-accent mb-3">Request Event Coverage</h1>
        <p className="text-muted text-lg">Submit your request for multimedia coverage or graphics design.</p>
      </div>

      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Client Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-accent border-b border-border pb-2">Your Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-accent mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    value={form.clientName}
                    onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-accent mb-1.5">Email Address *</label>
                  <input
                    type="email"
                    value={form.clientEmail}
                    onChange={(e) => setForm({ ...form, clientEmail: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    placeholder="john@example.com"
                  />
                </div>
              </div>
            </div>

            {/* Event Details */}
            <div className="space-y-4 pt-4">
              <h2 className="text-lg font-semibold text-accent border-b border-border pb-2">Event Details</h2>
              
              <div>
                <label className="block text-sm font-medium text-accent mb-1.5">Event Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  placeholder="e.g., Annual Tech Symposium"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-accent mb-1.5">Department *</label>
                  <select
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value as DepartmentType })}
                    className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white"
                  >
                    <option value="Multimedia">Multimedia (Photo/Video)</option>
                    <option value="Graphics">Graphics (Design)</option>
                    <option value="Others">Others</option>
                  </select>
                </div>

                {form.department === 'Multimedia' || form.department === 'Others' ? (
                  <div>
                    <label className="block text-sm font-medium text-accent mb-1.5">
                      {form.department === 'Others' ? 'Event Type *' : 'Event Type *'}
                    </label>
                    <select
                      value={form.eventType}
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
                      value={form.requestType}
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-accent mb-1.5">Date *</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-accent mb-1.5">Start Time *</label>
                  <input
                    type="time"
                    value={form.startTime}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-accent mb-1.5">End Time *</label>
                  <input
                    type="time"
                    value={form.endTime}
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
                    value={form.venue}
                    onChange={(e) => setForm({ ...form, venue: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    placeholder="Where will the event take place?"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-accent mb-1.5">Additional Details</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                  placeholder="Any specific requirements or details we should know about?"
                />
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-all shadow-lg shadow-green-500/25 hover:shadow-green-500/40"
              >
                <Send className="w-5 h-5" />
                Submit Request
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
