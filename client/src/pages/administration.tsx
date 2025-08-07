/**
 * WhoopsPay Administration Page - OWASP Vulnerability Training
 * 
 * WARNING: This component contains intentional security vulnerabilities for educational purposes.
 * 
 * OWASP Top 10 Vulnerabilities Demonstrated:
 * - A01: Broken Access Control (Client-side admin privilege checking)
 * - A03: Injection (XSS through unvalidated log data)
 * - A04: Insecure Design (Admin functions exposed to frontend)
 * - A05: Security Misconfiguration (Excessive admin permissions)
 * - A09: Security Logging and Monitoring Failures (Logs exposed to client)
 * 
 * API Security Top 10 Vulnerabilities:
 * - API5: Broken Function Level Authorization (Admin functions without proper validation)
 * - API8: Security Misconfiguration (Administrative endpoints exposed)
 * - API9: Improper Inventory Management (Admin APIs accessible)
 * 
 * Administrative Security Vulnerabilities:
 * - Admin status verified client-side only (easily bypassed)
 * - System logs and monitoring data exposed to frontend
 * - Administrative functions accessible through client manipulation
 * - Real-time system information leaked to unauthorized users
 * - Database logs containing sensitive information exposed
 * 
 * Educational Vulnerabilities Include:
 * - Client-side admin privilege escalation
 * - Sensitive system logs exposed to browser
 * - Administrative API endpoints accessible without proper server-side validation
 * - System monitoring data leaked to client-side
 * - Database management functions exposed through client interface
 * 
 * NEVER use this code in production environments!
 */
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/lib/i18n";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { MobileNav } from "@/components/mobile-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Shield, Database, FileText, Settings, AlertTriangle, RefreshCw, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DatabaseManagement } from "@/components/admin/DatabaseManagement";

/**
 * Administration Component - System administration interface
 * 
 * Main administrative dashboard that provides system management capabilities.
 * Features include:
 * - Live server and database log streaming
 * - Administrative privilege verification
 * - Real-time system monitoring and refresh controls
 * - Organized tabbed interface for different admin functions
 * - Authentication-based access control
 */
export default function Administration() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useI18n();
  const [expressLogs, setExpressLogs] = useState<string[]>([]);
  const [dbLogs, setDbLogs] = useState<string[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [expressSearchTerm, setExpressSearchTerm] = useState("");
  const [dbSearchTerm, setDbSearchTerm] = useState("");

  // Check if user is admin
  useEffect(() => {
    if (user && !user.isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  // Fetch logs
  const fetchLogs = async () => {
    try {
      const expressResponse = await fetch('/api/admin/logs/express', { 
        credentials: 'include' 
      });
      const dbResponse = await fetch('/api/admin/logs/database', { 
        credentials: 'include' 
      });
      
      if (expressResponse.ok) {
        const expressData = await expressResponse.json();
        setExpressLogs(expressData.logs || []);
      }
      
      if (dbResponse.ok) {
        const dbData = await dbResponse.json();
        setDbLogs(dbData.logs || []);
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    }
  };

  // Filter logs based on search terms
  const filteredExpressLogs = expressLogs.filter(log => 
    log.toLowerCase().includes(expressSearchTerm.toLowerCase())
  );
  
  const filteredDbLogs = dbLogs.filter(log => 
    log.toLowerCase().includes(dbSearchTerm.toLowerCase())
  );

  // Auto-refresh logs
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchLogs, 5000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  // Initial load
  useEffect(() => {
    fetchLogs();
  }, []);

  // Redirect if not admin
  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8 mobile-nav-spacing">
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              <strong>Access Denied:</strong> Administrator privileges required to access this page.
            </AlertDescription>
          </Alert>
        </main>
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 mobile-nav-spacing">
        {/* Admin Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-8 w-8 text-red-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('administrationPanel')}</h1>
              <p className="text-gray-600">{t('systemMonitoringApi')}</p>
            </div>
            <Badge variant="destructive" className="ml-auto">Admin Only</Badge>
          </div>
          
          <Alert className="border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-700">
              {t('sensitiveInfoWarning')}
            </AlertDescription>
          </Alert>
        </div>

        {/* Admin Tabs */}
        <Tabs defaultValue="swagger" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="swagger" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              {t('apiDocumentation')}
            </TabsTrigger>
            <TabsTrigger value="express" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              {t('expressLogs')}
            </TabsTrigger>
            <TabsTrigger value="database" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              {t('databaseLogs')}
            </TabsTrigger>
            <TabsTrigger value="db-management" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              {t('dbManagement')}
            </TabsTrigger>
          </TabsList>

          {/* Swagger API Documentation */}
          <TabsContent value="swagger">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  {t('apiDocumentationSwagger')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[600px] border rounded-lg overflow-hidden">
                  <iframe
                    src="/api-docs"
                    className="w-full h-full"
                    title="Swagger API Documentation"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Express Logs */}
          <TabsContent value="express">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Express Server Logs
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAutoRefresh(!autoRefresh)}
                    className={autoRefresh ? "bg-green-50 border-green-200" : ""}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
                    Auto Refresh
                  </Button>
                  <Button variant="outline" size="sm" onClick={fetchLogs}>
                    Refresh Now
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-4">
                  <Search className="w-4 h-4 text-gray-500" />
                  <Input
                    placeholder="Search express logs..."
                    value={expressSearchTerm}
                    onChange={(e) => setExpressSearchTerm(e.target.value)}
                    className="flex-1"
                  />
                </div>
                <ScrollArea className="h-[500px] w-full border rounded-lg p-4 bg-gray-900 text-green-400 font-mono text-sm">
                  {filteredExpressLogs.length === 0 ? (
                    <div className="text-gray-500 text-center py-8">
                      {expressSearchTerm ? 'No logs match your search.' : 'No Express logs available. Logs will appear here as the server processes requests.'}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {filteredExpressLogs.map((log, index) => (
                        <div key={index} className="whitespace-pre-wrap">
                          {log}
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Database Logs */}
          <TabsContent value="database">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Database Query Logs
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAutoRefresh(!autoRefresh)}
                    className={autoRefresh ? "bg-green-50 border-green-200" : ""}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
                    Auto Refresh
                  </Button>
                  <Button variant="outline" size="sm" onClick={fetchLogs}>
                    Refresh Now
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-4">
                  <Search className="w-4 h-4 text-gray-500" />
                  <Input
                    placeholder="Search database logs..."
                    value={dbSearchTerm}
                    onChange={(e) => setDbSearchTerm(e.target.value)}
                    className="flex-1"
                  />
                </div>
                <ScrollArea className="h-[500px] w-full border rounded-lg p-4 bg-gray-900 text-blue-400 font-mono text-sm">
                  {filteredDbLogs.length === 0 ? (
                    <div className="text-gray-500 text-center py-8">
                      {dbSearchTerm ? 'No logs match your search.' : 'No database logs available. SQL queries and database operations will appear here.'}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {filteredDbLogs.map((log, index) => (
                        <div key={index} className="whitespace-pre-wrap">
                          {log}
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Database Management */}
          <TabsContent value="db-management">
            <DatabaseManagement />
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
      
      <MobileNav />
    </div>
  );
}