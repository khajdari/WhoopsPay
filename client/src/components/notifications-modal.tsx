/**
 * Notifications Modal - Real-time notification center interface
 * 
 * Comprehensive notification management modal providing:
 * - Real-time notification display with categorization
 * - Money request approval and rejection controls
 * - Transaction notification history with timestamps
 * - Bulk operations for notification management
 * - Unread notification tracking and badges
 * 
 * Educational Security Features:
 * - Demonstrates notification security patterns
 * - Shows proper authorization for transaction actions
 * - Includes real-time data synchronization
 * 
 * VULNERABILITY NOTE: Notification access may lack proper user
 * authorization checks for educational security training purposes.
 */
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Check, X, CreditCard, DollarSign, Shield, ExternalLink } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from '@/lib/i18n';

/**
 * NotificationsModalProps Interface - Component properties
 * 
 * @property open - Modal visibility state
 * @property onOpenChange - Callback function to toggle modal visibility
 * @property onMarkAllRead - Callback function to mark all notifications as read
 * @property onClearAll - Callback function to clear all notifications
 */
interface NotificationsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMarkAllRead: () => void;
  onClearAll: () => void;
}

/**
 * NotificationsModal Component - Notification management center
 * 
 * Modal component that provides comprehensive notification management
 * including transaction approvals and real-time updates. Features include:
 * - Notification list with categorization and timestamps
 * - Money request approval/rejection workflows
 * - Bulk notification management operations
 * - Real-time notification synchronization
 * - Unread count tracking and display
 */
export function NotificationsModal({ open, onOpenChange, onMarkAllRead, onClearAll }: NotificationsModalProps) {
  const { notifications, unreadCount, markAllAsRead, clearAll } = useNotifications();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useI18n();

  const approveRequestMutation = useMutation({
    mutationFn: async (transactionId: number) => {
      return await apiRequest(`/api/transactions/${transactionId}/approve`, "POST", {});
    },
    onSuccess: () => {
      toast({
        title: "Request Approved",
        description: "The money request has been approved and processed.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to approve request",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const rejectRequestMutation = useMutation({
    mutationFn: async (transactionId: number) => {
      return await apiRequest(`/api/transactions/${transactionId}/reject`, "POST", {});
    },
    onSuccess: () => {
      toast({
        title: "Request Rejected",
        description: "The money request has been rejected.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to reject request",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleMarkAllRead = () => {
    markAllAsRead();
    onMarkAllRead();
  };

  const handleClearAll = () => {
    clearAll();
    onClearAll();
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            {t('notifications')}
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-auto">
                {unreadCount} {t('new')}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="max-h-96 overflow-y-auto space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>{t('noNotifications')}</p>
            </div>
          ) : (
            notifications.map((notification) => {
              const IconComponent = notification.icon;
              return (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border transition-colors ${
                    notification.read
                      ? "bg-gray-50 border-gray-200"
                      : "bg-blue-50 border-blue-200"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${notification.color}`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h4 className="text-sm font-medium text-gray-900">
                          {notification.title === "Payment Received" ? t('paymentReceived') : 
                           notification.title === "Money Request" ? t('moneyRequest') :
                           notification.title === "Request Approved" ? t('requestApproved') :
                           notification.title === "Request Rejected" ? t('requestRejected') :
                           notification.title}
                        </h4>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {/* Translate notification messages */}
                        {notification.message.includes("You received") ? (
                          <>
                            {t('youReceived')} {notification.message.match(/\$\d+/)?.[0] || notification.message.match(/¤\d+/)?.[0]} {t('from')} {notification.message.split(' from ')[1]}
                          </>
                        ) : (
                          notification.message
                        )}
                      </p>
                      
                      {/* Transaction Category Badge for External Payment Requests */}
                      {notification.type === "external_payment" && (
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className="bg-orange-100 text-orange-800 text-xs flex items-center gap-1">
                            <ExternalLink className="w-3 h-3" />
                            {t('offus')}
                          </Badge>
                        </div>
                      )}
                      
                      {/* Transaction Category Badge for Money Request and Payment */}
                      {(notification.type === "money_request" || notification.type === "payment") && (
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className="bg-blue-100 text-blue-800 text-xs flex items-center gap-1">
                            <CreditCard className="w-3 h-3" />
                            {t('onus')}
                          </Badge>
                        </div>
                      )}
                      
                      <p className="text-xs text-gray-400 mt-2">
                        {notification.time}
                      </p>
                      
                      {/* Money Request Action Buttons */}
                      {notification.type === "money_request" && !notification.read && notification.transactionId && (
                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            onClick={() => approveRequestMutation.mutate(notification.transactionId)}
                            disabled={approveRequestMutation.isPending}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Check className="w-3 h-3 mr-1" />
                            {t('approve')}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => rejectRequestMutation.mutate(notification.transactionId)}
                            disabled={rejectRequestMutation.isPending}
                            className="border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <X className="w-3 h-3 mr-1" />
                            {t('reject')}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        {notifications.length > 0 && (
          <div className="flex gap-2 pt-4 border-t">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={handleClearAll}
            >
              <X className="w-4 h-4 mr-2" />
              {t('clearAll')}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}