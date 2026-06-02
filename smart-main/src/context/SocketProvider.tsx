"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

type SocketContextType = {
  socket: Socket | null;
  isConnected: boolean;
  logs: any[];
  alerts: any[];
  unreadNotifications: number;
};

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    const socketInstance = io('http://localhost:3000', {
      path: '/socket.io/',
      transports: ['polling', 'websocket'],
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });


    socketInstance.on('connect', () => {
      console.log('Socket connected', socketInstance.id);
      // expose for debugging
      try { (window as any).__SOCKET = socketInstance; } catch (e) {}
      socketInstance.emit('join-logs');
      socketInstance.emit('join-alerts');
      setIsConnected(true);
    });

    socketInstance.on('connect_error', (err: any) => {
      console.error('Socket connect_error', err);
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    // Listen for live logs
    socketInstance.on('liveLog', (newLog: any) => {
      console.log('liveLog received - isArray?', Array.isArray(newLog));
      if (Array.isArray(newLog)) {
        console.log('Initial liveLog array, length=', newLog.length);
        // Backend may send initial array of logs
        setLogs(newLog.slice(0, 50));
      } else {
        console.log('Single liveLog item:', newLog && newLog._id);
        setLogs(prev => [newLog, ...prev.slice(0, 49)]); // Keep last 50
      }
    });

    // Listen for new alerts
    socketInstance.on('newAlert', (newAlert: any) => {
      console.log('newAlert received - isArray?', Array.isArray(newAlert));
      if (Array.isArray(newAlert)) {
        console.log('Initial newAlert array, length=', newAlert.length);
        setAlerts(newAlert.slice(0, 50));
      } else {
        console.log('Single newAlert item:', newAlert && newAlert._id);
        setAlerts(prev => [newAlert, ...prev.slice(0, 49)]);
        if (newAlert.severity !== 'active') {
          setUnreadNotifications(prev => prev + 1);
        }
      }
    });

    // Debug: server ack for simulated logs
    socketInstance.on('simulated-log', (log: any) => {
      console.log('Received simulated-log ack from server', log);
      setLogs(prev => [log, ...prev.slice(0, 49)]);
    });

    // Update unread count
    socketInstance.on('unreadCount', (count: number) => {
      setUnreadNotifications(count);
    });

    setSocket(socketInstance);

    return () => {
      if (socketInstance && socketInstance.connected) {
        socketInstance.close();
      }
    };
  }, []);


  return (
    <SocketContext.Provider value={{ socket, isConnected, logs, alerts, unreadNotifications }}>
      {children}
    </SocketContext.Provider>
  );

}

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
}

