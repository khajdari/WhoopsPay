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
      return response.json();
    },
    enabled: !!user?.id,
  });

  // Combine database and local notifications
  const notifications = [...localNotifications, ...dbNotifications];
  const unreadCount = notifications.filter(n => !n.read).length;

  const createNotificationMutation = useMutation({
    mutationFn: async (notification: any) => {
      return await apiRequest("POST", "/api/notifications", notification);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    }
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("PUT", "/api/notifications/mark-all-read", { userId: user?.id });
    },
    onSuccess: () => {
      setLocalNotifications([]);
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    }
  });

  const clearAllMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("DELETE", "/api/notifications", { userId: user?.id });
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

    // Also save to database if user is logged in
    if (user?.id) {
      createNotificationMutation.mutate({
        userId: user.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        read: false
      });
    }
  };

  const markAllAsRead = () => {
    setLocalNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
    if (user?.id) {
      markAllAsReadMutation.mutate();
    }
  };

  const clearAll = () => {
    setLocalNotifications([]);
    if (user?.id) {
      clearAllMutation.mutate();
    }
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