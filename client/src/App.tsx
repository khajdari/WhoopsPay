/**
 * WhoopsPay Main Application - React Frontend Entry Point
 * 
 * Comprehensive payment platform with security training features.
 * Implements routing, authentication, internationalization, and UI providers.
 * Designed for educational cybersecurity training with OWASP vulnerabilities.
 */
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nProvider } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";

// Page components for unauthenticated users
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";

// Page components for authenticated users
import Dashboard from "@/pages/dashboard";
import SendMoney from "@/pages/send-money";
import Transactions from "@/pages/transactions";
import Wallet from "@/pages/wallet";
import Admin from "@/pages/admin";
import Administration from "@/pages/administration";
import Profile from "@/pages/profile";
import Settings from "@/pages/settings";
import IssueReporting from "@/pages/IssueReporting";

// Special-purpose components
import ExternalPayment from "@/pages/ExternalPayment";
import PaymentProcessing from "@/pages/payment-processing";
import { RedirectHandler } from "@/components/RedirectHandler";

/**
 * Router Component - Application routing logic with authentication
 * 
 * Separates routes based on authentication status:
 * - Unauthenticated: Landing, Login, Signup pages
 * - Authenticated: Full dashboard and financial management features
 * - Special routes: External payment handling for Juice Shop integration
 */
function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <>
          <Route path="/login" component={Login} />
          <Route path="/signup" component={Signup} />
          <Route path="/" component={Landing} />
        </>
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/summary" component={Dashboard} />
          <Route path="/transfer" component={SendMoney} />
          <Route path="/transactions" component={Transactions} />
          <Route path="/money" component={Wallet} />
          <Route path="/admin" component={Admin} />
          <Route path="/administration" component={Administration} />
          <Route path="/profile" component={Profile} />
          <Route path="/account" component={Settings} />
          <Route path="/issues" component={IssueReporting} />
        </>
      )}

      <Route path="/payment-processing" component={PaymentProcessing} />
      <Route path="/external-payment/:transactionId" component={ExternalPayment} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <TooltipProvider>
          <Toaster />
          <RedirectHandler />
          <Router />
        </TooltipProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
}

export default App;
