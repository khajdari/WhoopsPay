import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Check, X, CreditCard, DollarSign, Shield } from "lucide-react";

interface NotificationsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NotificationsModal({ open, onOpenChange }: NotificationsModalProps) {
  const [notifications] = useState([
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
      title: "Login from New Device",
      message: "New login detected from Chrome on Windows",
      time: "1 hour ago",
      read: false,
      icon: Shield,
      color: "text-orange-600 bg-orange-100"
    },
    {
      id: 3,
      type: "payment",
      title: "Payment Sent",
      message: "You sent $25.00 to Coffee Shop Downtown",
      time: "3 hours ago",
      read: true,
      icon: CreditCard,
      color: "text-blue-600 bg-blue-100"
    },
    {
      id: 4,
      type: "payment",
      title: "Money Request",
      message: "Sarah requested $30.00 for dinner",
      time: "1 day ago",
      read: true,
      icon: DollarSign,
      color: "text-purple-600 bg-purple-100"
    },
    {
      id: 5,
      type: "security",
      title: "Password Changed",
      message: "Your password was successfully updated",
      time: "2 days ago",
      read: true,
      icon: Shield,
      color: "text-green-600 bg-green-100"
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-auto">
                {unreadCount} new
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.map((notification) => {
              const Icon = notification.icon;
              return (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border transition-colors ${
                    notification.read 
                      ? "bg-gray-50 border-gray-200" 
                      : "bg-white border-blue-200"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`rounded-full p-2 ${notification.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {notification.time}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="font-medium">No notifications</p>
              <p className="text-sm mt-1">You're all caught up!</p>
            </div>
          )}
        </div>
        
        {notifications.length > 0 && (
          <div className="flex gap-2 pt-4 border-t">
            <Button variant="outline" size="sm" className="flex-1">
              <Check className="w-4 h-4 mr-2" />
              Mark all as read
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <X className="w-4 h-4 mr-2" />
              Clear all
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}