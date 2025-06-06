/**
 * Notifications Hook - Real-time notification management system
 * 
 * Comprehensive notification system providing:
 * - Real-time notification fetching and display
 * - Local and database notification synchronization
 * - Transaction-based notification generation
 * - Read/unread status management
 * - Bulk notification operations (mark all read, clear all)
 * 
 * Educational Security Features:
 * - Demonstrates proper state management for notifications
 * - Shows real-time data synchronization patterns
 * - Includes notification permission handling
 * 
 * VULNERABILITY NOTE: Notifications may expose sensitive transaction
 * information without proper access control for educational purposes.
 */
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DollarSign, CreditCard, Shield } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

/**
 * Notification Interface - Notification data structure
 * 
 * Defines the structure for notification objects used throughout
 * the application for consistent data handling.
 */
interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon: any;
  color: string;
  createdAt?: string;
}

/**
 * useNotifications Hook - Notification management functionality
 * 
 * Custom React hook that provides comprehensive notification management
 * including real-time updates, local state management, and server
 * synchronization. Features include:
 * - Database and local notification combination
 * - Real-time notification polling
 * - Transaction-specific notification generation
 * - Bulk operations for notification management
 * - Unread count tracking and display
 */
export function useNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [localNotifications, setLocalNotifications] = useState<Notification[]>([]);

  // Fetch notifications from database
  const { data: dbNotifications = [] } = useQuery({
    queryKey: ["/api/notifications", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await fetch(`/api/notifications?userId=${user.id}`);
      if (!response.ok) return [];
      const data = await response.json();
      
      // Transform database notifications to match our interface
      return data.map((notif: any) => ({
        id: notif.id,
        type: notif.type,
        title: notif.title,
        message: notif.message,
        time: new Date(notif.createdAt).toLocaleString(),
        read: notif.read,
        icon: DollarSign,
        color: notif.type === "payment" ? "text-green-600 bg-green-100" : "text-blue-600 bg-blue-100",
        transactionId: notif.transactionId
      }));
    },
    enabled: !!user?.id,
    refetchInterval: 5000, // Refresh every 5 seconds to get new notifications
  });

  // Combine database and local notifications
  const notifications = [...localNotifications, ...dbNotifications];
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) return;
      return await apiRequest("/api/notifications/mark-all-read", "PUT", { userId: user.id });
    },
    onSuccess: () => {
      setLocalNotifications([]);
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    }
  });

  const clearAllMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) return;
      return await apiRequest("/api/notifications", "DELETE", { userId: user.id });
    },
    onSuccess: () => {
      setLocalNotifications([]);
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    }
  });

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

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const newNotification = {
      ...notification,
      id: Date.now(),
    };
    setLocalNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (id: number) => {
    setLocalNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setLocalNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    markAllAsReadMutation.mutate();
  };

  const clearAll = () => {
    setLocalNotifications([]);
    clearAllMutation.mutate();
  };

  return {
    notifications,
    addNotification,
    addTransactionNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    unreadCount,
  };
}