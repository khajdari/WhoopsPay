import { useState } from "react";
import { DollarSign, CreditCard, Shield } from "lucide-react";

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon: any;
  color: string;
}

const initialNotifications: Notification[] = [];

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const newNotification = {
      ...notification,
      id: Date.now(),
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  return {
    notifications,
    unreadCount,
    markAllAsRead,
    clearAll,
    addNotification
  };
}