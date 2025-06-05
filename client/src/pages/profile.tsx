/**
 * User Profile Management Page - Personal information and account settings
 * 
 * Provides comprehensive user profile management functionality including:
 * - View and edit personal information (name, email, address, etc.)
 * - Secure profile update with server-side validation
 * - Real-time form state management and error handling
 * - Navigation integration with authentication context
 * 
 * Educational Security Features:
 * - Demonstrates proper form validation and user input handling
 * - Shows secure API communication for profile updates
 * - Includes error boundary handling for failed operations
 * 
 * VULNERABILITY NOTE: Profile updates may expose sensitive information
 * through verbose error messages for educational purposes.
 */
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, Edit2, Save } from "lucide-react";
import { useLocation } from "wouter";

/**
 * Profile Component - User account management interface
 * 
 * Main profile page component that handles user account information
 * display and editing. Features include:
 * - Toggle between view and edit modes
 * - Form state management for profile updates
 * - Server communication for data persistence
 * - Toast notifications for user feedback
 * - Navigation controls for user experience
 */
export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  // Component state management
  const [isEditing, setIsEditing] = useState(false);
  
  /**
   * Form Data State - User profile information
   * 
   * Manages the editable form state for user profile updates.
   * Initialized with current user data or empty strings as fallbacks.
   */
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    address: user?.address || "",
    nationality: user?.nationality || "",
    gender: user?.gender || "",
  });

  /**
   * Profile Update Mutation - Server communication for profile changes
   * 
   * Handles API communication for updating user profile information.
   * Features:
   * - Optimistic UI updates through cache invalidation
   * - Toast notifications for user feedback
   * - Error handling with descriptive messages
   * 
   * VULNERABILITY NOTE: Profile updates may expose user data through
   * verbose error messages for educational purposes.
   */
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("PUT", `/api/users/${user?.id}/profile`, data);
    },
    onSuccess: () => {
      toast({
        title: "Profile updated successfully!",
        description: "Your changes have been saved.",
      });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update profile",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  /**
   * Form Submit Handler - Process profile update submission
   * 
   * Handles form submission for profile updates by preventing default
   * browser behavior and triggering the mutation with current form data.
   * 
   * @param e - React form event object
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  /**
   * Cancel Edit Handler - Reset form state and exit edit mode
   * 
   * Restores form data to original user values and exits edit mode.
   * Provides user with ability to discard unsaved changes.
   */
  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      address: user?.address || "",
      nationality: user?.nationality || "",
      gender: user?.gender || "",
    });
    setIsEditing(false);
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
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        </div>

        <div className="grid gap-6">
          {/* Profile Information */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Personal Information</CardTitle>
              {!isEditing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="bg-whoopspay-blue hover:bg-whoopspay-darkblue text-white"
                    onClick={handleSubmit}
                    disabled={updateProfileMutation.isPending}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-xl">
                    {user?.firstName?.[0] || "U"}{user?.lastName?.[0] || ""}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </h3>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="123 Main St, City, Country"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="nationality">Nationality</Label>
                    <Input
                      id="nationality"
                      value={formData.nationality}
                      onChange={(e) => setFormData(prev => ({ ...prev, nationality: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="American"
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <Input
                      id="gender"
                      value={formData.gender}
                      onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="Male/Female/Other"
                    />
                  </div>
                </div>

              </form>
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-sm font-medium text-gray-500">User ID</Label>
                  <p className="mt-1 text-sm text-gray-900">{user?.id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Account Created</Label>
                  <p className="mt-1 text-sm text-gray-900">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}