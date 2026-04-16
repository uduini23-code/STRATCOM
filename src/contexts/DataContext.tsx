import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { Update, CalendarEvent, AppNotification, ClientRequest } from '../types';
import { db } from '../firebase';
import { collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

interface DataContextType {
  updates: Update[];
  events: CalendarEvent[];
  notifications: AppNotification[];
  clientRequests: ClientRequest[];
  addUpdate: (update: Omit<Update, 'id' | 'createdAt' | 'updatedAt'>) => void;
  editUpdate: (id: string, update: Partial<Update>) => void;
  deleteUpdate: (id: string) => void;
  addEvent: (event: Omit<CalendarEvent, 'id' | 'createdAt'>) => void;
  editEvent: (id: string, event: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;
  addClientRequest: (request: Omit<ClientRequest, 'id' | 'createdAt' | 'status'>) => void;
  updateClientRequest: (id: string, partial: Partial<ClientRequest>) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  loading: boolean;
}

const DataContext = createContext<DataContextType | null>(null);

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: 'custom-frontend-auth',
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [updates, setUpdates] = useState<Update[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [clientRequests, setClientRequests] = useState<ClientRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubUpdates = onSnapshot(collection(db, 'updates'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Update));
      setUpdates(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'updates'));

    const unsubEvents = onSnapshot(collection(db, 'events'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CalendarEvent));
      setEvents(data);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'events'));

    const unsubNotifications = onSnapshot(collection(db, 'notifications'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AppNotification));
      setNotifications(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'notifications'));

    const unsubClientRequests = onSnapshot(collection(db, 'clientRequests'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ClientRequest));
      setClientRequests(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'clientRequests'));

    return () => {
      unsubUpdates();
      unsubEvents();
      unsubNotifications();
      unsubClientRequests();
    };
  }, []);

  const addNotification = useCallback(async (notif: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => {
    try {
      const id = Date.now().toString();
      const newNotif = {
        ...notif,
        createdAt: new Date().toISOString(),
        read: false,
      };
      await setDoc(doc(db, 'notifications', id), newNotif);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'notifications');
    }
  }, []);

  const markNotificationAsRead = useCallback(async (id: string) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `notifications/${id}`);
    }
  }, []);

  const markAllNotificationsAsRead = useCallback(async () => {
    try {
      const unread = notifications.filter(n => !n.read);
      for (const n of unread) {
        await updateDoc(doc(db, 'notifications', n.id), { read: true });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'notifications');
    }
  }, [notifications]);

  const addUpdate = useCallback(async (update: Omit<Update, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const id = Date.now().toString();
      const now = new Date().toISOString();
      const newUpdate = {
        ...update,
        createdAt: now,
        updatedAt: now,
      };
      await setDoc(doc(db, 'updates', id), newUpdate);
      await addNotification({
        message: `New update added: ${update.title}`,
        link: '/updates'
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'updates');
    }
  }, [addNotification]);

  const editUpdate = useCallback(async (id: string, partial: Partial<Update>) => {
    try {
      await updateDoc(doc(db, 'updates', id), {
        ...partial,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `updates/${id}`);
    }
  }, []);

  const deleteUpdate = useCallback(async (id: string) => {
    try {
      await deleteDoc(doc(db, 'updates', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `updates/${id}`);
    }
  }, []);

  const addEvent = useCallback(async (event: Omit<CalendarEvent, 'id' | 'createdAt'>) => {
    try {
      const id = Date.now().toString();
      const newEvent = {
        ...event,
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'events', id), newEvent);
      await addNotification({
        message: `New event added: ${event.title}`,
        link: '/calendar'
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'events');
    }
  }, [addNotification]);

  const editEvent = useCallback(async (id: string, partial: Partial<CalendarEvent>) => {
    try {
      await updateDoc(doc(db, 'events', id), partial);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `events/${id}`);
    }
  }, []);

  const deleteEvent = useCallback(async (id: string) => {
    try {
      await deleteDoc(doc(db, 'events', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `events/${id}`);
    }
  }, []);

  const updateClientRequest = useCallback(async (id: string, partial: Partial<ClientRequest>) => {
    try {
      await updateDoc(doc(db, 'clientRequests', id), partial);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `clientRequests/${id}`);
    }
  }, []);

  const addClientRequest = useCallback(async (request: Omit<ClientRequest, 'id' | 'createdAt' | 'status'>) => {
    try {
      const id = Date.now().toString();
      const newRequest = {
        ...request,
        status: 'pending_scosec',
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'clientRequests', id), newRequest);
      await addNotification({
        message: `New client request from ${request.clientName}`,
        link: '/admin/client-requests'
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'clientRequests');
    }
  }, [addNotification]);

  return (
    <DataContext.Provider
      value={{
        updates,
        events,
        notifications,
        clientRequests,
        addUpdate,
        editUpdate,
        deleteUpdate,
        addEvent,
        editEvent,
        deleteEvent,
        addClientRequest,
        updateClientRequest,
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
