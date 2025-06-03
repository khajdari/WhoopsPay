import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/header";
import { MobileNav } from "@/components/mobile-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, Database, FileText, Settings, AlertTriangle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Administration() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [expressLogs, setExpressLogs] = useState<string[]>([]);
  const [dbLogs, setDbLogs] = useState<string[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Check if user is admin
  useEffect(() => {
    if (!user?.isAdmin) {
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
      const expressResponse = await fetch('/api/admin/logs/express');
      const dbResponse = await fetch('/api/admin/logs/database');
      
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
              <h1 className="text-3xl font-bold text-gray-900">Administration Panel</h1>
              <p className="text-gray-600">System monitoring and API documentation</p>
            </div>
            <Badge variant="destructive" className="ml-auto">Admin Only</Badge>
          </div>
          
          <Alert className="border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-700">
              <strong>Warning:</strong> This panel contains sensitive system information and API documentation. Access is logged and monitored.
            </AlertDescription>
          </Alert>
        </div>

        {/* Admin Tabs */}
        <Tabs defaultValue="swagger" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="swagger" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              API Documentation
            </TabsTrigger>
            <TabsTrigger value="express" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Express Logs
            </TabsTrigger>
            <TabsTrigger value="database" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Database Logs
            </TabsTrigger>
          </TabsList>

          {/* Swagger API Documentation */}
          <TabsContent value="swagger">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  API Documentation (Swagger UI)
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
                <ScrollArea className="h-[500px] w-full border rounded-lg p-4 bg-gray-900 text-green-400 font-mono text-sm">
                  {expressLogs.length === 0 ? (
                    <div className="text-gray-500 text-center py-8">
                      No Express logs available. Logs will appear here as the server processes requests.
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {expressLogs.map((log, index) => (
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
                <ScrollArea className="h-[500px] w-full border rounded-lg p-4 bg-gray-900 text-blue-400 font-mono text-sm">
                  {dbLogs.length === 0 ? (
                    <div className="text-gray-500 text-center py-8">
                      No database logs available. SQL queries and database operations will appear here.
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {dbLogs.map((log, index) => (
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
        </Tabs>
      </main>
      
      <MobileNav />
    </div>
  );
}