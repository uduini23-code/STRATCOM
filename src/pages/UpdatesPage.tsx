import { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { Search, Play, ExternalLink, Grid3X3, List, Calendar, Filter } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function UpdatesPage() {
  const { updates, loading } = useData();
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  const filteredUpdates = useMemo(() => {
    let result = updates.filter(
      (u) =>
        u.title.toLowerCase().includes(search.toLowerCase()) ||
        u.description.toLowerCase().includes(search.toLowerCase())
    );

    result.sort((a, b) => {
      const dateA = parseISO(a.createdAt).getTime();
      const dateB = parseISO(b.createdAt).getTime();
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [updates, search, sortBy]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="skeleton h-10 w-48 rounded-lg mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="skeleton h-72 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-accent mb-2">Updates</h1>
        <p className="text-muted">Browse all photo and video updates</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8 animate-fade-in">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search updates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}
              className="appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
            <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
          </div>
          <div className="flex rounded-xl border border-border overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2.5 transition-colors ${
                viewMode === 'grid' ? 'bg-primary text-white' : 'bg-white text-muted hover:bg-gray-50'
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2.5 transition-colors border-l border-border ${
                viewMode === 'list' ? 'bg-primary text-white' : 'bg-white text-muted hover:bg-gray-50'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-muted mb-4">
        Showing {filteredUpdates.length} of {updates.length} updates
      </p>

      {/* Content */}
      {filteredUpdates.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-border animate-fade-in">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-lg font-medium text-accent mb-1">No updates found</p>
          <p className="text-muted text-sm">Try adjusting your search or filters</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUpdates.map((update, i) => (
            <a
              key={update.id}
              href={update.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${i * 50}ms` }}
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
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                    <Play className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ExternalLink className="w-5 h-5 text-white drop-shadow-lg" />
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-accent group-hover:text-primary transition-colors line-clamp-2">
                    {update.title}
                  </h3>
                  {update.category && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-primary-bg text-primary whitespace-nowrap flex-shrink-0">
                      {update.category}
                    </span>
                  )}
                </div>
                {update.description && (
                  <p className="text-sm text-muted line-clamp-2 mb-3">{update.description}</p>
                )}
                <div className="flex items-center gap-1.5 text-xs text-muted">
                  <Calendar className="w-3.5 h-3.5" />
                  {format(parseISO(update.createdAt), 'MMM dd, yyyy')}
                </div>
              </div>
            </a>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredUpdates.map((update, i) => (
            <a
              key={update.id}
              href={update.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col sm:flex-row gap-4 bg-white rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="relative sm:w-48 flex-shrink-0 aspect-video sm:aspect-auto overflow-hidden">
                <img
                  src={update.thumbnail}
                  alt={update.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=250&fit=crop';
                  }}
                />
              </div>
              <div className="flex-1 p-4 sm:p-5 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-accent group-hover:text-primary transition-colors">
                    {update.title}
                  </h3>
                  {update.category && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-primary-bg text-primary whitespace-nowrap">
                      {update.category}
                    </span>
                  )}
                </div>
                {update.description && (
                  <p className="text-sm text-muted line-clamp-2 mb-2">{update.description}</p>
                )}
                <div className="flex items-center gap-3 text-xs text-muted">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {format(parseISO(update.createdAt), 'MMM dd, yyyy')}
                  </span>
                  <span className="flex items-center gap-1">
                    <ExternalLink className="w-3.5 h-3.5" />
                    View Link
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
