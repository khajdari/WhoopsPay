/**
 * Login Page - User authentication interface with external payment integration
 * 
 * Comprehensive authentication page providing:
 * - Username/password login form with validation
 * - External payment request handling from integrated applications
 * - Automatic redirection after successful authentication
 * - Payment modal integration for cross-platform transactions
 * - Session management and authentication state tracking
 * 
 * Educational Security Features:
 * - Demonstrates authentication form patterns
 * - Shows external payment integration vulnerabilities
 * - Includes session handling and redirect logic
 * 
 * VULNERABILITY NOTE: Authentication may lack proper rate limiting
 * and password complexity requirements for educational purposes.
 */
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { CreditCard } from "lucide-react";
import { useState, useEffect } from "react";
import { ExternalPaymentModal } from "@/components/external-payment-modal";
import { Layout } from "@/components/layout";
import { useI18n } from "@/lib/i18n";
import { LanguageSelector } from "@/components/language-selector";
import { ArrowLeft } from "lucide-react";

/**
 * Login Form Validation Schema - Input validation rules
 * 
 * Defines validation requirements for user authentication:
 * - Username: Required field with minimum length
 * - Password: Required field with basic validation
 * 
 * VULNERABILITY NOTE: Lacks proper password complexity requirements.
 */
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

/**
 * LoginForm Type - Form data structure
 */
type LoginForm = z.infer<typeof loginSchema>;

/**
 * Login Component - Authentication interface with payment integration
 * 
 * Main login page that handles user authentication and external payment
 * requests from integrated applications. Features include:
 * - Form-based authentication with validation
 * - External payment request detection and handling
 * - Auto-redirect after successful login
 * - Test account integration for demonstration
 * - Real-time form validation and error display
 * 
 * VULNERABILITY FEATURES:
 * - Exposes test accounts for easy demonstration access
 * - Basic authentication without advanced security measures
 * - External payment integration with minimal validation
 */
export default function Login() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [showExternalPaymentModal, setShowExternalPaymentModal] = useState(false);
  const [externalPaymentData, setExternalPaymentData] = useState<any>(null);
  const { t } = useI18n();

  // Fetch test accounts for development
  const { data: testAccounts } = useQuery({
    queryKey: ["/api/test-accounts"],
    retry: false,
  });

  // Check for external payment requests on page load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const external = urlParams.get('external');
    const amount = urlParams.get('amount');
    const currency = urlParams.get('currency');
    const description = urlParams.get('description');
    const returnUrl = urlParams.get('returnUrl');

    if (external === 'true' && amount && currency) {
      const paymentData = {
        amount: parseFloat(amount),
        currency,
        description: description || 'External Payment',
        returnUrl: returnUrl || 'http://localhost:3000'
      };
      setExternalPaymentData(paymentData);
      setShowExternalPaymentModal(true);
    }
  }, []);

  /**
   * Login Form Configuration - React Hook Form setup
   * 
   * Configures form handling with Zod validation resolver
   * and default empty values for username/password fields.
   */
  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginForm) => {
      return await apiRequest("/api/login", "POST", data);
    },
    onSuccess: async () => {
      toast({
        title: "Login successful",
        description: "Welcome back to WhoopsPay!",
      });
      
      // Wait for the authentication state to be properly updated
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      // Small delay to ensure auth state is updated
      setTimeout(async () => {
        try {
          const user = await apiRequest("/api/auth/user", "GET");
          if (user && (user as any).isAdmin) {
            setLocation("/administration");
          } else {
            setLocation("/dashboard");
          }
        } catch (error) {
          setLocation("/dashboard");
        }
      }, 100);
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: LoginForm) => {
    loginMutation.mutate(data);
  };

  const fillTestAccount = (username: string, password: string) => {
    loginForm.setValue('username', username);
    loginForm.setValue('password', password);
  };

  return (
    <Layout showHeader={false} showFooter={false} showMobileNav={false}>
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex items-center justify-center space-x-2">
              <CreditCard className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold whoopspay-blue">WhoopsPay</h1>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">{t('signInTitle')}</CardTitle>
            <CardDescription>{t('welcomeBack')}</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Discrete Test Account Autofill */}
            {testAccounts && Array.isArray(testAccounts) && testAccounts.length > 0 && (
              <div className="mb-4 pb-4 border-b border-gray-200">
                <p className="text-xs text-gray-500 mb-2">Demo accounts for testing:</p>
                <div className="flex flex-wrap gap-1">
                  {testAccounts.map((account: any) => {
                    const passwords: { [key: string]: string } = {
                      "@admin_maria": "admin2024",
                      "@sarah_wilson": "sarah123", 
                      "@james_chen": "james2024",
                      "@elena_kowalski": "elena456"
                    };
                    return (
                      <button
                        key={account.id}
                        type="button"
                        onClick={() => fillTestAccount(account.id, passwords[account.id] || 'password123')}
                        className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 border"
                        title={`Click to autofill: ${account.id} (password: ${passwords[account.id]})`}
                      >
                        {account.id}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <form onSubmit={loginForm.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">{t('username')}</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder={t('enterUsername')}
                  {...loginForm.register("username")}
                />
                {loginForm.formState.errors.username && (
                  <p className="text-sm text-red-600">
                    {loginForm.formState.errors.username.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t('password')}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={t('enterPassword')}
                  {...loginForm.register("password")}
                />
                {loginForm.formState.errors.password && (
                  <p className="text-sm text-red-600">
                    {loginForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? t('loggingIn') : t('signInTitle')}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-3">
              <p className="text-sm text-gray-600">
                {t('dontHaveAccount')}{" "}
                <Link
                  href="/signup"
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  {t('signUpHere')}
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

            {showExternalPaymentModal && (
              <Alert className="mt-4">
                <AlertDescription>
                  External payment request detected. Please complete authentication to process the payment.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* External Payment Modal */}
        <ExternalPaymentModal 
          isOpen={showExternalPaymentModal}
          onClose={() => setShowExternalPaymentModal(false)}
          paymentData={externalPaymentData}
        />
      </div>
    </Layout>
  );
}