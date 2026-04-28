import { Link } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { ArrowRight, Calendar, Image as ImageIcon, Play, Clock, MapPin, Shield } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { EVENT_COLORS } from './AdminEventsPage';

export default function HomePage() {
  const { updates, events, loading } = useData();

  const latestUpdates = updates.slice(0, 3);
  const upcomingEvents = events
    .filter((e) => {
      const targetDate = e.endDate ? new Date(e.endDate) : new Date(e.date);
      return targetDate >= new Date(new Date().toDateString());
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        <div className="skeleton h-96 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-64 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-accent via-gray-900 to-gray-800">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,_#16a34a_0%,_transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,_#16a34a_0%,_transparent_40%)]" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative">
          <div className="max-w-3xl animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 mb-6">
              <Shield className="w-3.5 h-3.5 text-primary-light" />
              <span className="text-xs font-semibold text-primary-light uppercase tracking-wider">Official Portal</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Strategic <span className="text-primary-light">Communications</span> Office
            </h1>
            <p className="text-lg md:text-xl text-gray-300 leading-relaxed mb-8 max-w-2xl">
              Your centralized hub for official updates, media content, and event management. 
              Stay informed with the latest communications and upcoming events.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/updates"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark transition-all shadow-lg shadow-green-500/25 hover:shadow-green-500/40"
              >
                <ImageIcon className="w-5 h-5" />
                View Updates
              </Link>
              <Link
                to="/calendar"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/20 transition-all border border-white/20"
              >
                <Calendar className="w-5 h-5" />
                View Calendar
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Updates', value: updates.length, icon: ImageIcon },
            { label: 'Upcoming Events', value: upcomingEvents.length, icon: Calendar },
            { label: 'This Month', value: updates.filter(u => {
              const d = parseISO(u.createdAt);
              const now = new Date();
              return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            }).length, icon: Clock },
            { label: 'Media Posts', value: updates.length, icon: Play },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-5 shadow-md border border-border animate-fade-in"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <stat.icon className="w-5 h-5 text-primary mb-2" />
              <p className="text-2xl font-bold text-accent">{stat.value}</p>
              <p className="text-xs text-muted mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Latest Updates */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-accent">Latest Updates</h2>
            <p className="text-muted mt-1">Recent photo and video updates</p>
          </div>
          <Link
            to="/updates"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {latestUpdates.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-border">
            <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-muted">No updates yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {latestUpdates.map((update, i) => (
              <a
                key={update.id}
                href={update.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-white rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={update.thumbnail}
                    alt={update.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=250&fit=crop';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="w-12 h-12 text-white drop-shadow-lg" />
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-accent group-hover:text-primary transition-colors line-clamp-2 mb-2">
                    {update.title}
                  </h3>
                  {update.description && (
                    <p className="text-sm text-muted line-clamp-2">{update.description}</p>
                  )}
                  <p className="text-xs text-muted mt-3">
                    {format(parseISO(update.createdAt), 'MMM dd, yyyy')}
                  </p>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>

      {/* Upcoming Events */}
      <section className="bg-white border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-accent">Upcoming Events</h2>
              <p className="text-muted mt-1">Mark your calendar</p>
            </div>
            <Link
              to="/calendar"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
            >
              View Calendar <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {upcomingEvents.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-2xl border border-border">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-muted">No upcoming events scheduled.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingEvents.map((event, i) => (
                <div
                  key={event.id}
                  className="flex flex-col sm:flex-row gap-4 sm:items-center p-5 rounded-xl border border-border hover:border-primary/30 hover:bg-primary-bg/30 transition-all animate-fade-in"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="flex-shrink-0 w-16 h-16 bg-primary-bg rounded-xl flex flex-col items-center justify-center border border-green-100">
                    <span className="text-lg font-bold text-primary leading-none">
                      {format(parseISO(event.date), 'dd')}
                      {event.endDate && event.endDate !== event.date && (
                        <span className="text-sm">-{format(parseISO(event.endDate), 'dd')}</span>
                      )}
                    </span>
                    <span className="text-[10px] font-semibold text-primary/70 uppercase">
                      {format(parseISO(event.date), 'MMM')}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-accent">{event.title}</h3>
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
                    </div>
                    <div className="flex flex-wrap gap-3 mt-1.5">
                      <span className="inline-flex items-center gap-1 text-xs text-muted">
                        <Clock className="w-3.5 h-3.5" />
                        {event.startTime} - {event.endTime}
                      </span>
                      {event.venue && (
                        <span className="inline-flex items-center gap-1 text-xs text-muted">
                          <MapPin className="w-3.5 h-3.5" />
                          {event.venue}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-accent text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold">Strategic Communications Office</span>
            </div>
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} All rights reserved. Official government portal.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
