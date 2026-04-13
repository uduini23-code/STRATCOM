import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import {
  Image,
  Calendar,
  TrendingUp,
  Users,
  ArrowRight,
  Clock,
  MapPin,
  Play,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { EVENT_COLORS } from './AdminEventsPage';

export default function AdminDashboardPage() {
  const { updates, events } = useData();
  const { role, username } = useAuth();

  const upcomingEvents = events
    .filter((e) => {
      const targetDate = e.endDate ? new Date(e.endDate) : new Date(e.date);
      return targetDate >= new Date(new Date().toDateString());
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  const recentUpdates = updates.slice(0, 5);

  const thisMonthUpdates = updates.filter((u) => {
    const d = parseISO(u.createdAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const thisMonthEvents = events.filter((e) => {
    const d = parseISO(e.date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-accent">Dashboard</h1>
          {role === 'admin' && (
            <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
              Admin
            </span>
          )}
        </div>
        <p className="text-muted">Welcome back{username ? `, ${username}` : ''}! Here's an overview of your content.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: 'Total Updates',
            value: updates.length,
            icon: Image,
            color: 'text-primary',
            bg: 'bg-primary-bg',
            border: 'border-green-100',
          },
          {
            label: 'Total Events',
            value: events.length,
            icon: Calendar,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            border: 'border-blue-100',
          },
          {
            label: 'Updates This Month',
            value: thisMonthUpdates,
            icon: TrendingUp,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
            border: 'border-amber-100',
          },
          {
            label: 'Events This Month',
            value: thisMonthEvents,
            icon: Users,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
            border: 'border-purple-100',
          },
        ].map((stat, i) => (
          <div
            key={i}
            className={`p-5 rounded-xl border ${stat.border} ${stat.bg} animate-fade-in`}
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
            <p className="text-2xl font-bold text-accent">{stat.value}</p>
            <p className="text-xs text-muted mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 animate-fade-in">
        <Link
          to="/admin/updates"
          className="group flex items-center gap-4 p-5 bg-white rounded-xl border border-border hover:border-primary/30 hover:shadow-md transition-all"
        >
          <div className="w-12 h-12 bg-primary-bg rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
            <Image className="w-6 h-6 text-primary group-hover:text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-accent">Manage Updates</h3>
            <p className="text-sm text-muted">Add, edit, or remove photo/video updates</p>
          </div>
          <ArrowRight className="w-5 h-5 text-muted group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </Link>
        <Link
          to="/admin/events"
          className="group flex items-center gap-4 p-5 bg-white rounded-xl border border-border hover:border-primary/30 hover:shadow-md transition-all"
        >
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-600 transition-colors">
            <Calendar className="w-6 h-6 text-blue-600 group-hover:text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-accent">Manage Events</h3>
            <p className="text-sm text-muted">Add, edit, or remove calendar events</p>
          </div>
          <ArrowRight className="w-5 h-5 text-muted group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
        </Link>
      </div>

      {/* Recent Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Updates */}
        <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden animate-fade-in">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h3 className="font-bold text-accent flex items-center gap-2">
              <Play className="w-4 h-4 text-primary" />
              Recent Updates
            </h3>
            <Link to="/admin/updates" className="text-xs text-primary hover:underline">
              View All
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentUpdates.length === 0 ? (
              <p className="p-5 text-sm text-muted text-center">No updates yet</p>
            ) : (
              recentUpdates.map((update) => (
                <div key={update.id} className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors">
                  <img
                    src={update.thumbnail}
                    alt={update.title}
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=100&h=100&fit=crop';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-accent truncate">{update.title}</p>
                    <p className="text-xs text-muted">
                      {format(parseISO(update.createdAt), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden animate-fade-in" style={{ animationDelay: '100ms' }}>
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h3 className="font-bold text-accent flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              Upcoming Events
            </h3>
            <Link to="/admin/events" className="text-xs text-primary hover:underline">
              View All
            </Link>
          </div>
          <div className="divide-y divide-border">
            {upcomingEvents.length === 0 ? (
              <p className="p-5 text-sm text-muted text-center">No upcoming events</p>
            ) : (
              upcomingEvents.map((event) => (
                <div key={event.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-accent">{event.title}</p>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${EVENT_COLORS[event.eventType] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                      {event.eventType}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-1.5">
                    <span className="inline-flex items-center gap-1 text-xs text-muted">
                      <Clock className="w-3 h-3" />
                      {format(parseISO(event.date), 'MMM dd')}
                      {event.endDate && event.endDate !== event.date && ` - ${format(parseISO(event.endDate), 'MMM dd')}`}
                      {' '}at {event.time}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-muted">
                      <MapPin className="w-3 h-3" />
                      {event.venue}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
