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

  const addTransactionNotification = (type: 'sent' | 'received', amount: string, otherUser: string) => {
    const notification = type === 'sent' 
      ? {
          type: "payment",
          title: "Payment Sent",
          message: `You sent $${amount} to ${otherUser}`,
          time: "Just now",
          read: false,
          icon: DollarSign,
          color: "text-blue-600 bg-blue-100"
        }
      : {
          type: "payment", 
          title: "Payment Received",
          message: `You received $${amount} from ${otherUser}`,
          time: "Just now",
          read: false,
          icon: DollarSign,
          color: "text-green-600 bg-green-100"
        };
    
    addNotification(notification);
  };

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
    addNotification,
    addTransactionNotification
  };
}