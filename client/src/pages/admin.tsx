/**
 * Admin Page - Administrative dashboard with intentional vulnerabilities
 * 
 * Comprehensive administrative interface demonstrating security vulnerabilities:
 * - Unrestricted access to all user data and transactions
 * - Sensitive information display without proper authorization
 * - Client-side data filtering exposing all records
 * - Toggle controls for showing/hiding sensitive information
 * - Transaction monitoring and user management capabilities
 * 
 * Educational Security Features:
 * - Demonstrates broken access control vulnerabilities
 * - Shows improper data exposure patterns
 * - Includes client-side security bypass examples
 * 
 * VULNERABILITY NOTE: This page intentionally lacks proper access control
 * and exposes sensitive data for educational security training purposes.
 */
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/lib/i18n";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminIssueMonitor } from "@/components/AdminIssueMonitor";
import { Eye, EyeOff } from "lucide-react";

/**
 * Admin Component - Administrative dashboard interface
 * 
 * Main administrative page that provides system oversight capabilities.
 * Features include:
 * - Complete user database access and display
 * - Transaction history monitoring across all users
 * - Sensitive data visibility controls
 * - Vulnerable data exposure patterns for training
 * - Real-time data synchronization and updates
 */
export default function Admin() {
  const [showSensitive, setShowSensitive] = useState(false);
  const { t } = useI18n();

  const { data: users, isLoading } = useQuery({
    queryKey: ['/api/users'], // VULNERABLE: No access control
  });

  const { data: transactions } = useQuery({
    queryKey: ['/api/transactions/all'], // VULNERABLE: Access all transactions
  });

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('systemHealthDashboard')}
          </h1>
          <p className="text-gray-600">
            {t('systemOverview')}
          </p>
          <div className="mt-4">
            <Button
              onClick={() => setShowSensitive(!showSensitive)}
              variant="outline"
              className="mr-4"
            >
              {showSensitive ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
              {showSensitive ? "Hide" : "Show"} Sensitive Data
            </Button>
            <Badge variant="destructive">
              ⚠️ VULNERABLE: Unprotected admin functionality
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Users Overview */}
          <Card>
            <CardHeader>
              <CardTitle>All Users ({users?.length || 0})</CardTitle>
              <CardDescription>
                Including mock users with intentional vulnerabilities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users?.map((user: any) => (
                  <div key={user.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">
                        {user.firstName} {user.lastName}
                      </h3>
                      {user.id.startsWith('mock_') && (
                        <Badge variant="secondary">Mock User</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      ID: {user.id} | Email: {user.email}
                    </p>
                    {user.balance && (
                      <p className="text-sm font-medium text-green-600">
                        Balance: ${user.balance}
                      </p>
                    )}
                    
                    {showSensitive && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                        <p className="text-xs font-medium text-red-800 mb-2">
                          VULNERABLE: Unencrypted Sensitive Data
                        </p>
                        {user.ssn && (
                          <p className="text-xs text-red-700">SSN: {user.ssn}</p>
                        )}
                        {user.bankAccount && (
                          <p className="text-xs text-red-700">Bank: {user.bankAccount}</p>
                        )}
                        {user.creditCard && (
                          <p className="text-xs text-red-700">Card: {user.creditCard}</p>
                        )}
                        {user.password && (
                          <p className="text-xs text-red-700">Password: {user.password}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Issue Reports Monitor */}
          <AdminIssueMonitor />
        </div>

        <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Security Vulnerabilities Demonstrated
          </h3>
          <ul className="text-sm text-red-700 space-y-1">
            <li>• No authentication required to access this admin panel</li>
            <li>• Sensitive data (SSN, bank accounts, passwords) stored unencrypted</li>
            <li>• XSS payloads in transaction descriptions</li>
            <li>• Direct access to all user data without authorization</li>
            <li>• Plain text passwords visible</li>
          </ul>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}