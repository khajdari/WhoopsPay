/**
 * User Settings Page - Account security and preference management
 * 
 * Provides comprehensive user settings management including:
 * - Password change functionality with current password verification
 * - Security settings and account preferences
 * - Form validation and secure password handling
 * - Toast notifications for user feedback
 * 
 * Educational Security Features:
 * - Demonstrates password change workflow
 * - Shows secure form handling for sensitive operations
 * - Includes client-side validation patterns
 * 
 * VULNERABILITY NOTE: Password changes may expose authentication
 * details through verbose error messages for educational purposes.
 */
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, Shield } from "lucide-react";
import { useLocation } from "wouter";

/**
 * Settings Component - User account settings management interface
 * 
 * Main settings page component that handles user account security
 * and preferences. Features include:
 * - Password change form with validation
 * - Security settings management
 * - Form state management for password updates
 * - Server communication for security changes
 * - Navigation controls for user experience
 */
export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  
  /**
   * Password Form State - Manages password change form fields
   * 
   * State variables for handling secure password updates:
   * - currentPassword: User's existing password for verification
   * - newPassword: New password to be set
   * - confirmPassword: Confirmation of new password for validation
   */
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  /**
   * Password Change Mutation - Server communication for password updates
   * 
   * Handles secure password change operations with proper validation.
   * Features:
   * - Current password verification before update
   * - Toast notifications for user feedback
   * - Form reset on successful change
   * - Error handling with descriptive messages
   * 
   * VULNERABILITY NOTE: Password changes may expose authentication
   * details through verbose error messages for educational purposes.
   */
  const changePasswordMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/auth/change-password", "PUT", data);
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

  /**
   * Password Change Handler - Process password change form submission
   * 
   * Handles form submission for password changes with client-side validation.
   * Validates password confirmation match before sending to server.
   * 
   * @param e - React form event object
   */
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
                  className="bg-whoopspay-blue hover:bg-whoopspay-darkblue text-white"
                  disabled={changePasswordMutation.isPending || !currentPassword || !newPassword || !confirmPassword}
                >
                  Update Password
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}