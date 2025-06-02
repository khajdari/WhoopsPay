import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, Shield, Bell, Eye } from "lucide-react";
import { useLocation } from "wouter";

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: true,
  });

  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    transactionHistory: false,
    twoFactorAuth: false,
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("PUT", "/api/auth/change-password", data);
    },
    onSuccess: () => {
      toast({
        title: "Password changed successfully!",
        description: "Your password has been updated.",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to change password",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("PUT", "/api/users/settings", data);
    },
    onSuccess: () => {
      toast({
        title: "Settings updated successfully!",
        description: "Your preferences have been saved.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update settings",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your new passwords match.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    changePasswordMutation.mutate({
      currentPassword,
      newPassword,
    });
  };

  const handleNotificationUpdate = (key: string, value: boolean) => {
    const newNotifications = { ...notifications, [key]: value };
    setNotifications(newNotifications);
    updateSettingsMutation.mutate({ notifications: newNotifications });
  };

  const handlePrivacyUpdate = (key: string, value: boolean) => {
    const newPrivacy = { ...privacy, [key]: value };
    setPrivacy(newPrivacy);
    updateSettingsMutation.mutate({ privacy: newPrivacy });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => setLocation("/")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
        </div>

        <div className="grid gap-6">
          {/* Security Settings */}
          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-blue-600" />
                <CardTitle>Security</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Change Password</h3>
                
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                  />
                </div>
                
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                </div>
                
                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  disabled={changePasswordMutation.isPending || !currentPassword || !newPassword || !confirmPassword}
                >
                  Update Password
                </Button>
              </form>

              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Two-Factor Authentication</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Switch
                    checked={privacy.twoFactorAuth}
                    onCheckedChange={(checked) => handlePrivacyUpdate("twoFactorAuth", checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-green-600" />
                <CardTitle>Notifications</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-gray-600">Receive transaction updates via email</p>
                </div>
                <Switch
                  checked={notifications.email}
                  onCheckedChange={(checked) => handleNotificationUpdate("email", checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-gray-600">Get push notifications for important updates</p>
                </div>
                <Switch
                  checked={notifications.push}
                  onCheckedChange={(checked) => handleNotificationUpdate("push", checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">SMS Notifications</p>
                  <p className="text-sm text-gray-600">Receive text messages for transactions</p>
                </div>
                <Switch
                  checked={notifications.sms}
                  onCheckedChange={(checked) => handleNotificationUpdate("sms", checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <div className="flex items-center space-x-2">
                <Eye className="w-5 h-5 text-purple-600" />
                <CardTitle>Privacy</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Profile Visibility</p>
                  <p className="text-sm text-gray-600">Allow others to find your profile</p>
                </div>
                <Switch
                  checked={privacy.profileVisible}
                  onCheckedChange={(checked) => handlePrivacyUpdate("profileVisible", checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Transaction History</p>
                  <p className="text-sm text-gray-600">Share transaction history with connected apps</p>
                </div>
                <Switch
                  checked={privacy.transactionHistory}
                  onCheckedChange={(checked) => handlePrivacyUpdate("transactionHistory", checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Delete Account</h3>
                  <p className="text-sm text-gray-600">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                </div>
                <Button variant="destructive" className="w-auto">
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}