import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSocket } from './SocketContext';
import api from '../services/api';
import useAuth from '../hooks/useAuth';

const PresenceContext = createContext(null);

export const PresenceProvider = ({ children }) => {
  const { socket } = useSocket();
  const { user } = useAuth();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (!user) {
      setUsers([]);
      return;
    }

    const loadUsers = async () => {
      try {
        const res = await api.get('/auth/users');
        setUsers(res.data.data.users || []);
      } catch (err) {
        console.error('Failed to load user directory presence:', err);
      }
    };
    loadUsers();
  }, [user]);

  useEffect(() => {
    if (!socket) return;

    socket.on('userOnline', ({ userId }) => {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isOnline: true } : u))
      );
    });

    socket.on('userOffline', ({ userId, lastSeen }) => {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isOnline: false, lastSeen } : u))
      );
    });

    return () => {
      socket.off('userOnline');
      socket.off('userOffline');
    };
  }, [socket]);

  const isUserOnline = (userId) => {
    const found = users.find((u) => u.id === userId);
    return found ? found.isOnline : false;
  };

  const getOnlineMembers = () => {
    return users.filter((u) => u.isOnline && u.id !== user?.id);
  };

  return (
    <PresenceContext.Provider value={{ directoryUsers: users, isUserOnline, getOnlineMembers }}>
      {children}
    </PresenceContext.Provider>
  );
};

export const usePresence = () => {
  const context = useContext(PresenceContext);
  return context;
};

export default PresenceContext;
