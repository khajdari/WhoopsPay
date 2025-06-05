import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nProvider } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Dashboard from "@/pages/dashboard";
import SendMoney from "@/pages/send-money";
import Transactions from "@/pages/transactions";
import Wallet from "@/pages/wallet";
import Admin from "@/pages/admin";
import Administration from "@/pages/administration";
import Profile from "@/pages/profile";
import Settings from "@/pages/settings";
import ExternalPayment from "@/pages/ExternalPayment";

// Empty component for admin users on restricted routes
function EmptyAdminRoute() {
  return <div className="min-h-screen"></div>;
}

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const isAdmin = user?.isAdmin;

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
          {/* Admin users only see content on /administration */}
          {isAdmin ? (
            <>
              <Route path="/administration" component={Administration} />
              <Route path="/" component={EmptyAdminRoute} />
              <Route path="/summary" component={EmptyAdminRoute} />
              <Route path="/transfer" component={EmptyAdminRoute} />
              <Route path="/transactions" component={EmptyAdminRoute} />
              <Route path="/money" component={EmptyAdminRoute} />
              <Route path="/admin" component={EmptyAdminRoute} />
              <Route path="/profile" component={EmptyAdminRoute} />
              <Route path="/account" component={EmptyAdminRoute} />
            </>
          ) : (
            /* Regular users see all content */
            <>
              <Route path="/" component={Dashboard} />
              <Route path="/summary" component={Dashboard} />
              <Route path="/transfer" component={SendMoney} />
              <Route path="/transactions" component={Transactions} />
              <Route path="/money" component={Wallet} />
              <Route path="/admin" component={Admin} />
              <Route path="/administration" component={Administration} />
              <Route path="/profile" component={Profile} />
              <Route path="/account" component={Settings} />
            </>
          )}
        </>
      )}
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
          <Router />
        </TooltipProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
}

export default App;
