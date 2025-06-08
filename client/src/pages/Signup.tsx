/**
 * Signup Page - User registration interface
 * 
 * Comprehensive user registration page providing:
 * - Multi-field registration form with validation
 * - Real-time form validation and error handling
 * - Account creation with automatic authentication
 * - Welcome messaging and redirect to main application
 * - Integration with authentication system
 * 
 * Educational Security Features:
 * - Demonstrates user registration patterns
 * - Shows form validation and input sanitization
 * - Includes basic password requirements
 * 
 * VULNERABILITY NOTE: Registration may lack proper email verification
 * and advanced security measures for educational purposes.
 */
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { CreditCard, ArrowLeft } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { LanguageSelector } from "@/components/language-selector";

/**
 * Registration Form Validation Schema - Input validation rules
 * 
 * Defines validation requirements for user registration:
 * - Username: Minimum 3 characters
 * - Email: Valid email format
 * - Password: Minimum 6 characters
 * - First/Last Name: Required fields
 * 
 * VULNERABILITY NOTE: Basic validation without advanced security checks.
 */
const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

/**
 * RegisterForm Type - Form data structure
 */
type RegisterForm = z.infer<typeof registerSchema>;

/**
 * Signup Component - User registration interface
 * 
 * Main registration page that handles new user account creation.
 * Features include:
 * - Comprehensive registration form with validation
 * - Real-time input validation and error display
 * - Account creation with automatic login
 * - Success messaging and application redirect
 * - Integration with authentication system
 */
export default function Signup() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useI18n();

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      firstName: "",
      lastName: "",
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterForm) => {
      return await apiRequest("/api/register", "POST", data);
    },
    onSuccess: () => {
      toast({
        title: "Registration successful",
        description: "Welcome to WhoopsPay!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      window.location.href = "/";
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onRegister = (data: RegisterForm) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex items-center justify-center space-x-2">
            <CreditCard className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold whoopspay-blue">WhoopsPay</h1>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">{t('signUpTitle')}</CardTitle>
          <CardDescription>{t('createAccount')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">{t('firstName')}</Label>
                <Input
                  id="firstName"
                  type="text"
                  {...registerForm.register("firstName")}
                  placeholder={t('enterFirstName')}
                />
                {registerForm.formState.errors.firstName && (
                  <p className="text-sm text-red-600">
                    {registerForm.formState.errors.firstName.message}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName">{t('lastName')}</Label>
                <Input
                  id="lastName"
                  type="text"
                  {...registerForm.register("lastName")}
                  placeholder={t('enterLastName')}
                />
                {registerForm.formState.errors.lastName && (
                  <p className="text-sm text-red-600">
                    {registerForm.formState.errors.lastName.message}
                  </p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="username">{t('username')}</Label>
              <Input
                id="username"
                type="text"
                {...registerForm.register("username")}
                placeholder={t('enterUsername')}
              />
              {registerForm.formState.errors.username && (
                <p className="text-sm text-red-600">
                  {registerForm.formState.errors.username.message}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">{t('email')}</Label>
              <Input
                id="email"
                type="email"
                {...registerForm.register("email")}
                placeholder={t('enterEmail')}
              />
              {registerForm.formState.errors.email && (
                <p className="text-sm text-red-600">
                  {registerForm.formState.errors.email.message}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">{t('password')}</Label>
              <Input
                id="password"
                type="password"
                {...registerForm.register("password")}
                placeholder={t('choosePassword')}
              />
              {registerForm.formState.errors.password && (
                <p className="text-sm text-red-600">
                  {registerForm.formState.errors.password.message}
                </p>
              )}
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? t('creatingAccount') : t('createAccount')}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <p className="text-sm text-gray-600">
              {t('alreadyHaveAccount')}{" "}
              <Link href="/login">
                <span className="text-blue-600 hover:text-blue-500 font-medium cursor-pointer">
                  {t('signInTitle')}
                </span>
              </Link>
            </p>
            
            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
              <Link href="/" className="flex items-center text-sm text-gray-600 hover:text-gray-800">
                <ArrowLeft className="h-4 w-4 mr-1" />
                {t('returnToHome')}
              </Link>
              <LanguageSelector />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}