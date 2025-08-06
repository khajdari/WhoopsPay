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
import { useI18n } from "@/lib/i18n";
import { Footer } from "@/components/footer";
import { MobileNav } from "@/components/mobile-nav";

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
  const { t } = useI18n();
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
        title: t('passwordChangedSuccess'),
        description: t('passwordChangedDesc'),
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (error: Error) => {
      toast({
        title: t('passwordChangeError'),
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
        title: t('passwordsDontMatch'),
        description: t('passwordsDontMatchDesc'),
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: t('passwordTooShort'),
        description: t('passwordTooShortDesc'),
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
{t('backToDashboard')}
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">{t('accountSettings')}</h1>
        </div>

        <div className="grid gap-6">
          {/* Security Settings */}
          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-blue-600" />
                <CardTitle>{t('security')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">{t('changePassword')}</h3>
                
                <div>
                  <Label htmlFor="currentPassword">{t('currentPassword')}</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder={t('enterCurrentPassword')}
                  />
                </div>
                
                <div>
                  <Label htmlFor="newPassword">{t('newPassword')}</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={t('enterNewPassword')}
                  />
                </div>
                
                <div>
                  <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t('confirmNewPassword')}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="bg-whoopspay-blue hover:bg-whoopspay-darkblue text-white"
                  disabled={changePasswordMutation.isPending || !currentPassword || !newPassword || !confirmPassword}
                >
{t('updatePassword')}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <MobileNav />
      <Footer />
    </div>
  );
}