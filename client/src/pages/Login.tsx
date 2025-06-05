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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { CreditCard } from "lucide-react";
import { useState, useEffect } from "react";
import { ExternalPaymentModal } from "@/components/external-payment-modal";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [showExternalPaymentModal, setShowExternalPaymentModal] = useState(false);
  const [externalPaymentData, setExternalPaymentData] = useState<any>(null);

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
          // Create the payment URL to redirect to after login
          originalUrl: `/external-payment/${transactionId}?amount=${amount}&description=${encodeURIComponent(description || '')}&returnUrl=${encodeURIComponent(returnUrl || '')}&cancelUrl=${encodeURIComponent(cancelUrl || '')}`
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
          <div className="mb-4">
            <Alert>
              <AlertDescription>
                <strong>Demo Accounts:</strong><br />
                • Username: <code>jdoe</code>, Password: <code>password123</code><br />
                • Username: <code>admin</code>, Password: <code>admin123</code>
              </AlertDescription>
            </Alert>
          </div>
          
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

          {/* Demo Accounts Section */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Demo Accounts (Click to auto-fill)</h3>
            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full text-left justify-start"
                onClick={() => {
                  loginForm.setValue("username", "jdoe");
                  loginForm.setValue("password", "password123");
                }}
              >
                <div className="flex flex-col items-start">
                  <span className="font-medium">Regular User</span>
                  <span className="text-xs text-gray-500">Username: jdoe | Password: password123</span>
                </div>
              </Button>
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full text-left justify-start"
                onClick={() => {
                  loginForm.setValue("username", "admin");
                  loginForm.setValue("password", "admin123");
                }}
              >
                <div className="flex flex-col items-start">
                  <span className="font-medium">Admin User</span>
                  <span className="text-xs text-gray-500">Username: admin | Password: admin123</span>
                </div>
              </Button>
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full text-left justify-start"
                onClick={() => {
                  loginForm.setValue("username", "moderator");
                  loginForm.setValue("password", "mod123");
                }}
              >
                <div className="flex flex-col items-start">
                  <span className="font-medium">Moderator User</span>
                  <span className="text-xs text-gray-500">Username: moderator | Password: mod123</span>
                </div>
              </Button>
            </div>
          </div>

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