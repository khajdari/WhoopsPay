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

const initialNotifications: Notification[] = [
  {
    id: 1,
    type: "payment",
    title: "Payment Received",
    message: "You received $50.00 from John Doe",
    time: "2 minutes ago",
    read: false,
    icon: DollarSign,
    color: "text-green-600 bg-green-100"
  },
  {
    id: 2,
    type: "security",
    title: "Security Alert",
    message: "New login detected from unknown device",
    time: "1 hour ago",
    read: false,
    icon: Shield,
    color: "text-red-600 bg-red-100"
  },
  {
    id: 3,
    type: "card",
    title: "Card Added",
    message: "New payment method was added to your account",
    time: "3 hours ago",
    read: true,
    icon: CreditCard,
    color: "text-blue-600 bg-blue-100"
  },
  {
    id: 4,
    type: "payment",
    title: "Payment Sent",
    message: "You sent $25.00 to Emma Wilson",
    time: "1 day ago",
    read: true,
    icon: DollarSign,
    color: "text-green-600 bg-green-100"
  }
];

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