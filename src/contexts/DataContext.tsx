import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { Update, CalendarEvent, AppNotification } from '../types';

interface DataContextType {
  updates: Update[];
  events: CalendarEvent[];
  notifications: AppNotification[];
  addUpdate: (update: Omit<Update, 'id' | 'createdAt' | 'updatedAt'>) => void;
  editUpdate: (id: string, update: Partial<Update>) => void;
  deleteUpdate: (id: string) => void;
  addEvent: (event: Omit<CalendarEvent, 'id' | 'createdAt'>) => void;
  editEvent: (id: string, event: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  loading: boolean;
}

const DataContext = createContext<DataContextType | null>(null);

const SEED_UPDATES: Update[] = [
  {
    id: '1',
    title: 'Annual Communications Summit 2024',
    description: 'Highlights from our annual summit featuring keynote speakers and workshops on strategic messaging.',
    thumbnail: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=250&fit=crop',
    link: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    createdAt: '2024-11-15T10:00:00Z',
    updatedAt: '2024-11-15T10:00:00Z',
  },
  {
    id: '2',
    title: 'Community Outreach Program Launch',
    description: 'Our team launched a new community outreach initiative to strengthen public engagement.',
    thumbnail: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=400&h=250&fit=crop',
    link: 'https://drive.google.com/file/d/example',
    createdAt: '2024-11-10T14:30:00Z',
    updatedAt: '2024-11-10T14:30:00Z',
  },
  {
    id: '3',
    title: 'Digital Media Training Workshop',
    description: 'Staff participated in an intensive digital media training workshop to enhance communication skills.',
    thumbnail: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=400&h=250&fit=crop',
    link: 'https://www.facebook.com/example',
    createdAt: '2024-11-05T09:00:00Z',
    updatedAt: '2024-11-05T09:00:00Z',
  },
  {
    id: '4',
    title: 'Press Conference: New Policy Announcement',
    description: 'Official press conference announcing new strategic communications policy framework.',
    thumbnail: 'https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?w=400&h=250&fit=crop',
    link: 'https://www.youtube.com/watch?v=example',
    createdAt: '2024-10-28T16:00:00Z',
    updatedAt: '2024-10-28T16:00:00Z',
  },
];

const SEED_EVENTS: CalendarEvent[] = [
  {
    id: '1',
    title: 'Strategic Planning Meeting',
    date: '2025-01-15',
    time: '09:00',
    venue: 'Conference Room A, Main Building',
    description: 'Quarterly strategic planning session for the communications team.',
    createdAt: '2024-11-01T08:00:00Z',
    eventType: 'ADMIN COVERAGE',
  },
  {
    id: '2',
    title: 'Media Relations Workshop',
    date: '2025-01-22',
    time: '14:00',
    venue: 'Training Center, Floor 3',
    description: 'Hands-on workshop for improving media relations and press handling.',
    createdAt: '2024-11-01T08:00:00Z',
    eventType: 'CAPACITY BUILDING',
  },
  {
    id: '3',
    title: 'Annual Report Presentation',
    date: '2025-02-05',
    time: '10:00',
    venue: 'Grand Hall, City Convention Center',
    description: 'Presentation of the annual communications report to stakeholders.',
    createdAt: '2024-11-01T08:00:00Z',
    eventType: 'PROJECT',
  },
  {
    id: '4',
    title: 'Public Engagement Forum',
    date: '2025-02-18',
    time: '13:00',
    venue: 'Community Center, Downtown',
    description: 'Open forum for public feedback on communication initiatives.',
    createdAt: '2024-11-01T08:00:00Z',
    eventType: 'STUDENT COVERAGE',
  },
];

export function DataProvider({ children }: { children: ReactNode }) {
  const [updates, setUpdates] = useState<Update[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUpdates = localStorage.getItem('sco_updates');
    const savedEvents = localStorage.getItem('sco_events');
    const savedNotifications = localStorage.getItem('sco_notifications');

    if (savedUpdates) {
      setUpdates(JSON.parse(savedUpdates));
    } else {
      setUpdates(SEED_UPDATES);
      localStorage.setItem('sco_updates', JSON.stringify(SEED_UPDATES));
    }

    if (savedEvents) {
      setEvents(JSON.parse(savedEvents));
    } else {
      setEvents(SEED_EVENTS);
      localStorage.setItem('sco_events', JSON.stringify(SEED_EVENTS));
    }

    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    }

    setLoading(false);
  }, []);

  const saveUpdates = useCallback((newUpdates: Update[]) => {
    setUpdates(newUpdates);
    localStorage.setItem('sco_updates', JSON.stringify(newUpdates));
  }, []);

  const saveEvents = useCallback((newEvents: CalendarEvent[]) => {
    setEvents(newEvents);
    localStorage.setItem('sco_events', JSON.stringify(newEvents));
  }, []);

  const saveNotifications = useCallback((newNotifications: AppNotification[]) => {
    setNotifications(newNotifications);
    localStorage.setItem('sco_notifications', JSON.stringify(newNotifications));
  }, []);

  const addNotification = useCallback((notif: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => {
    const newNotif: AppNotification = {
      ...notif,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      read: false,
    };
    setNotifications(prev => {
      const updated = [newNotif, ...prev];
      localStorage.setItem('sco_notifications', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const markNotificationAsRead = useCallback((id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      localStorage.setItem('sco_notifications', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      localStorage.setItem('sco_notifications', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const addUpdate = useCallback((update: Omit<Update, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newUpdate: Update = {
      ...update,
      id: Date.now().toString(),
      createdAt: now,
      updatedAt: now,
    };
    saveUpdates([newUpdate, ...updates]);
    addNotification({
      message: `New update added: ${update.title}`,
      link: '/updates'
    });
  }, [updates, saveUpdates, addNotification]);

  const editUpdate = useCallback((id: string, partial: Partial<Update>) => {
    saveUpdates(
      updates.map((u) =>
        u.id === id ? { ...u, ...partial, updatedAt: new Date().toISOString() } : u
      )
    );
  }, [updates, saveUpdates]);

  const deleteUpdate = useCallback((id: string) => {
    saveUpdates(updates.filter((u) => u.id !== id));
  }, [updates, saveUpdates]);

  const addEvent = useCallback((event: Omit<CalendarEvent, 'id' | 'createdAt'>) => {
    const newEvent: CalendarEvent = {
      ...event,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    saveEvents([...events, newEvent]);
    addNotification({
      message: `New event added: ${event.title}`,
      link: '/calendar'
    });
  }, [events, saveEvents, addNotification]);

  const editEvent = useCallback((id: string, partial: Partial<CalendarEvent>) => {
    saveEvents(events.map((e) => (e.id === id ? { ...e, ...partial } : e)));
  }, [events, saveEvents]);

  const deleteEvent = useCallback((id: string) => {
    saveEvents(events.filter((e) => e.id !== id));
  }, [events, saveEvents]);

  return (
    <DataContext.Provider
      value={{
        updates,
        events,
        notifications,
        addUpdate,
        editUpdate,
        deleteUpdate,
        addEvent,
        editEvent,
        deleteEvent,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        loading,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
