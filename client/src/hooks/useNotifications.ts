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
import { DollarSign, CreditCard, Shield, ExternalLink, Check, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/lib/i18n";

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
  const { t } = useLanguage();
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
      return data.map((notif: any) => {
        const getIconAndColor = (type: string) => {
          switch(type) {
            case "external_payment":
              return {
                icon: ExternalLink,
                color: "bg-orange-100 text-orange-600"
              };
            case "money_request":
              return {
                icon: CreditCard,
                color: "bg-green-100 text-green-600"
              };
            case "money_request_approved":
              return {
                icon: Check,
                color: "bg-green-100 text-green-600"
              };
            case "money_request_rejected":
              return {
                icon: X,
                color: "bg-red-100 text-red-600"
              };
            case "payment":
              return {
                icon: DollarSign,
                color: "bg-blue-100 text-blue-600"
              };
            default:
              return {
                icon: DollarSign,
                color: "bg-gray-100 text-gray-600"
              };
          }
        };
        
        const { icon, color } = getIconAndColor(notif.type);
        
        // Translate notification titles and messages
        const translateNotificationText = (title: string, message: string) => {
          // Translate notification titles
          if (title === "External Payment Request") {
            title = t('notificationExternalPaymentRequest');
          } else if (title === "Money Request Approved") {
            title = t('moneyRequestApproved');
          } else if (title === "Payment Received") {
            title = t('paymentReceived');
          } else if (title === "Payment Sent") {
            title = t('paymentSent');
          }
          
          // Translate payment request messages 
          const paymentRequestPattern = /^Payment request from (.+) for ¤(.+)$/;
          const match = message.match(paymentRequestPattern);
          if (match) {
            const [, source, amount] = match;
            const template = t('paymentRequestFromSource');
            message = template.replace('{{source}}', source).replace('{{amount}}', amount);
          }

          // Translate approval messages like "Maria approved your request for ¤100 for: Project bonus payment"
          const approvalPattern = /^(.+) approved your request for ¤([0-9.]+)(.*)$/;
          const approvalMatch = message.match(approvalPattern);
          if (approvalMatch) {
            const [, approver, amount, description] = approvalMatch;
            const template = t('approvedYourRequestMessage');
            message = template.replace('{{approver}}', approver).replace('{{amount}}', amount).replace('{{description}}', description);
          }

          // Translate payment received messages like "You received ¤100 from Maria for: Project bonus payment"
          const receivedPattern = /^You received ¤([0-9.]+) from (.+)(.*)$/;
          const receivedMatch = message.match(receivedPattern);
          if (receivedMatch) {
            const [, amount, sender, description] = receivedMatch;
            const template = t('youReceivedMessage');
            message = template.replace('{{amount}}', amount).replace('{{sender}}', sender).replace('{{description}}', description);
          }

          // Translate payment sent messages like "You sent ¤100 to Maria for: Project bonus payment"  
          const sentPattern = /^You sent ¤([0-9.]+) to (.+)(.*)$/;
          const sentMatch = message.match(sentPattern);
          if (sentMatch) {
            const [, amount, recipient, description] = sentMatch;
            const template = t('youSentMessage');
            message = template.replace('{{amount}}', amount).replace('{{recipient}}', recipient).replace('{{description}}', description);
          }
          
          return { title, message };
        };
        
        const { title: translatedTitle, message: translatedMessage } = translateNotificationText(notif.title, notif.message);
        
        return {
          id: notif.id,
          type: notif.type,
          title: translatedTitle,
          message: translatedMessage,
          time: new Date(notif.createdAt).toLocaleString(),
          read: notif.read,
          icon: icon,
          color: color,
          transactionId: notif.transactionId
        };
      });
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
          message: `You sent ¤${amount} to ${otherUser}`,
          time: "Just now",
          read: false,
          icon: DollarSign,
          color: "text-blue-600 bg-blue-100"
        }
      : {
          type: "payment", 
          title: "Payment Received",
          message: `You received ¤${amount} from ${otherUser}`,
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