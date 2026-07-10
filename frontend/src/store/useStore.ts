import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';

interface User {
  id: string;
  email: string;
  role: 'user' | 'admin';
  profile?: {
    name?: string;
    avatar?: string;
  };
}

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

interface AppState {
  token: string | null;
  user: User | null;
  socket: Socket | null;
  notifications: Notification[];
  activeTab: string;
  
  // Actions
  login: (token: string, user: User) => void;
  logout: () => void;
  setActiveTab: (tab: string) => void;
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
  connectSocket: (userId: string) => void;
  disconnectSocket: () => void;
}

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

export const useStore = create<AppState>((set, get) => ({
  token: localStorage.getItem('aegis_token'),
  user: localStorage.getItem('aegis_user') ? JSON.parse(localStorage.getItem('aegis_user')!) : null,
  socket: null,
  notifications: [],
  activeTab: 'dashboard',

  login: (token, user) => {
    localStorage.setItem('aegis_token', token);
    localStorage.setItem('aegis_user', JSON.stringify(user));
    set({ token, user, activeTab: 'dashboard' });
    get().connectSocket(user.id);
  },

  logout: () => {
    localStorage.removeItem('aegis_token');
    localStorage.removeItem('aegis_user');
    get().disconnectSocket();
    set({ token: null, user: null, activeTab: 'dashboard', notifications: [] });
  },

  setActiveTab: (activeTab) => set({ activeTab }),

  setNotifications: (notifications) => set({ notifications }),

  addNotification: (notification) => set((state) => ({
    notifications: [notification, ...state.notifications]
  })),

  markAsRead: (id) => set((state) => ({
    notifications: state.notifications.map((n) =>
      n._id === id ? { ...n, read: true } : n
    )
  })),

  connectSocket: (userId) => {
    const existingSocket = get().socket;
    if (existingSocket) return;

    const socket = io(SERVER_URL);
    socket.emit('join', userId);

    socket.on('notification', (notif: any) => {
      // Create a temporary ID if _id doesn't exist
      const newNotif: Notification = {
        _id: notif._id || Math.random().toString(36).substring(7),
        title: notif.title,
        message: notif.message,
        type: notif.type || 'info',
        read: false,
        createdAt: new Date().toISOString()
      };
      
      set((state) => ({
        notifications: [newNotif, ...state.notifications]
      }));
    });

    set({ socket });
  },

  disconnectSocket: () => {
    const socket = get().socket;
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  }
}));
