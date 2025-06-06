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
 * - Payment modal integration for cross-platform flows
 * - Automatic redirection after successful login
 * - Session management and state synchronization
 */
export default function Login() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [showExternalPaymentModal, setShowExternalPaymentModal] = useState(false);
  const [externalPaymentData, setExternalPaymentData] = useState<any>(null);

  // Fetch test accounts from database for autofill
  const { data: testAccounts } = useQuery({
    queryKey: ["/api/test-accounts"],
    retry: false,
  });

  // Check for external payment request on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const redirect = urlParams.get('redirect');
    const transactionId = urlParams.get('transactionId');
    const amount = urlParams.get('amount');
    const description = urlParams.get('description');
    const returnUrl = urlParams.get('returnUrl');
    const cancelUrl = urlParams.get('cancelUrl');
    
    const from = urlParams.get('from');
    
    if (redirect === 'payment') {
      let paymentData;
      
      if (from) {
        // Extract payment data from the 'from' URL
        const fromUrl = decodeURIComponent(from);
        const fromParams = new URLSearchParams(fromUrl.split('?')[1] || '');
        paymentData = {
          transactionId: fromUrl.split('/').pop()?.split('?')[0] || '',
          amount: fromParams.get('amount'),
          description: fromParams.get('description'),
          returnUrl: fromParams.get('returnUrl'),
          cancelUrl: fromParams.get('cancelUrl'),
          originalUrl: from
        };
      } else if (transactionId && amount) {
        // Direct payment parameters in login URL
        paymentData = {
          transactionId,
          amount,
          description,
          returnUrl,
          cancelUrl,
          // Create the payment URL to redirect to after login (without returnUrl to prevent redirect back to Juice Shop)
          originalUrl: `/external-payment/${transactionId}`
        };
      }
      
      if (paymentData) {
        setExternalPaymentData(paymentData);
      }
    }
    
    // Legacy external payment check
    const isExternal = urlParams.get('external');
    if (isExternal) {
      const paymentData = sessionStorage.getItem('externalPayment');
      if (paymentData) {
        setExternalPaymentData(JSON.parse(paymentData));
      }
    }
  }, []);

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
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      // Check if this is an external payment flow
      if (externalPaymentData) {
        console.log('External payment data detected:', externalPaymentData);
        
        // If we have the original URL, redirect back to it
        if (externalPaymentData.originalUrl) {
          console.log('Redirecting to payment page:', externalPaymentData.originalUrl);
          window.location.href = externalPaymentData.originalUrl;
          return;
        } else {
          // Fallback to showing modal for legacy flow
          console.log('Showing payment modal as fallback');
          setShowExternalPaymentModal(true);
          return;
        }
      }
      
      // Normal login flow - check if admin
      try {
        const user = await apiRequest("/api/auth/user", "GET");
        if (user && (user as any).isAdmin) {
          setLocation("/administration");
        } else {
          setLocation("/dashboard");
        }
      } catch (error) {
        // Fallback to dashboard page if user fetch fails
        setLocation("/dashboard");
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onLogin = (data: LoginForm) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex items-center justify-center space-x-2">
            <CreditCard className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold whoopspay-blue">WhoopsPay</h1>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Sign In</CardTitle>
          <CardDescription>Welcome back to WhoopsPay</CardDescription>
        </CardHeader>
        <CardContent>

          
          <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                {...loginForm.register("username")}
                placeholder="Enter your username"
              />
              {loginForm.formState.errors.username && (
                <p className="text-sm text-red-600">
                  {loginForm.formState.errors.username.message}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...loginForm.register("password")}
                placeholder="Enter your password"
              />
              {loginForm.formState.errors.password && (
                <p className="text-sm text-red-600">
                  {loginForm.formState.errors.password.message}
                </p>
              )}
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Logging in..." : "Sign In"}
            </Button>
          </form>



          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link href="/signup">
                <span className="text-blue-600 hover:text-blue-500 font-medium cursor-pointer">
                  Create one
                </span>
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* External Payment Modal */}
      <ExternalPaymentModal 
        isOpen={showExternalPaymentModal}
        onClose={() => setShowExternalPaymentModal(false)}
        paymentData={externalPaymentData}
      />
    </div>
  );
}