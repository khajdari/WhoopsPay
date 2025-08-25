import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/lib/i18n";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { IssueReportForm } from "@/components/IssueReportForm";
import { AdminIssueMonitor } from "@/components/AdminIssueMonitor";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Calendar,
  Tag,
  Plus,
  Eye
} from "lucide-react";

interface IssueReport {
  id: number;
  userId: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  assignedTo?: string;
  adminNotes?: string;
  createdAt: number;
  updatedAt: number;
  resolvedAt?: number;
}

export default function IssueReporting() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [showForm, setShowForm] = useState(false);

  const { data: userIssues = [], isLoading } = useQuery<IssueReport[]>({
    queryKey: ["/api/issues/user"],
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge variant="destructive" className="flex items-center gap-1"><AlertTriangle className="h-3 w-3" />{t('statusOpen')}</Badge>;
      case "in_progress":
        return <Badge variant="default" className="flex items-center gap-1"><Clock className="h-3 w-3" />{t('statusInProgress')}</Badge>;
      case "resolved":
        return <Badge variant="outline" className="flex items-center gap-1 text-green-600"><CheckCircle className="h-3 w-3" />{t('statusResolved')}</Badge>;
      case "closed":
        return <Badge variant="secondary" className="flex items-center gap-1"><XCircle className="h-3 w-3" />{t('statusClosed')}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "critical":
        return <Badge className="bg-red-600 text-white">{t('priorityCritical')}</Badge>;
      case "high":
        return <Badge className="bg-orange-600 text-white">{t('priorityHigh')}</Badge>;
      case "medium":
        return <Badge className="bg-yellow-600 text-white">{t('priorityMedium')}</Badge>;
      case "low":
        return <Badge className="bg-green-600 text-white">{t('priorityLow')}</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "technical": return "🔧";
      case "payment": return "💳";
      case "security": return "🔒";
      case "account": return "👤";
      default: return "📝";
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const groupedIssues = {
    open: userIssues?.filter((issue: IssueReport) => issue.status === "open") || [],
    in_progress: userIssues?.filter((issue: IssueReport) => issue.status === "in_progress") || [],
    resolved: userIssues?.filter((issue: IssueReport) => issue.status === "resolved") || [],
    closed: userIssues?.filter((issue: IssueReport) => issue.status === "closed") || [],
  };

  // If admin, show AdminIssueMonitor component instead of regular user interface
  if (user?.isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        
        <div className="max-w-6xl mx-auto p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {t('issues.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t('admin.userManagement')}
            </p>
          </div>
          
          <AdminIssueMonitor />
        </div>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
{t('issueReportingCenter')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('submitTrackIssues')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Submit New Issue */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  {t('submitNewIssue')}
                </CardTitle>
                <CardDescription>
                  {t('reportProblems')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog open={showForm} onOpenChange={setShowForm}>
                  <DialogTrigger asChild>
                    <Button className="w-full flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      {t('createIssueReport')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[90vh]">
                    <DialogHeader>
                      <DialogTitle>{t('submitIssueReport')}</DialogTitle>
                      <DialogDescription>
                        {t('detailedInformation')}
                      </DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="max-h-[calc(90vh-120px)]">
                      <IssueReportForm onSubmitSuccess={() => setShowForm(false)} />
                    </ScrollArea>
                  </DialogContent>
                </Dialog>
                
                {/* Quick Stats */}
                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{t('openIssues')}</span>
                    <Badge variant="destructive">{groupedIssues.open.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{t('statusInProgress')}</span>
                    <Badge variant="default">{groupedIssues.in_progress.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{t('statusResolved')}</span>
                    <Badge variant="outline" className="text-green-600">{groupedIssues.resolved.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{t('totalIssues')}</span>
                    <Badge variant="secondary">{userIssues?.length || 0}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Issue List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {t('yourIssueReports')}
                </CardTitle>
                <CardDescription>
                  {t('trackIssueStatus')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  </div>
                ) : !userIssues || userIssues.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>{t('noIssueReports')}</p>
                    <p className="text-sm">{t('createFirstIssue')}</p>
                  </div>
                ) : (
                  <Tabs defaultValue="all" className="w-full">
                    <TabsList className="grid w-full grid-cols-5">
                      <TabsTrigger value="all">All ({userIssues?.length || 0})</TabsTrigger>
                      <TabsTrigger value="open">Open ({groupedIssues.open.length})</TabsTrigger>
                      <TabsTrigger value="in_progress">In Progress ({groupedIssues.in_progress.length})</TabsTrigger>
                      <TabsTrigger value="resolved">Resolved ({groupedIssues.resolved.length})</TabsTrigger>
                      <TabsTrigger value="closed">Closed ({groupedIssues.closed.length})</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="all">
                      <IssueList issues={userIssues || []} getStatusBadge={getStatusBadge} getPriorityBadge={getPriorityBadge} getCategoryIcon={getCategoryIcon} formatDate={formatDate} />
                    </TabsContent>
                    <TabsContent value="open">
                      <IssueList issues={groupedIssues.open} getStatusBadge={getStatusBadge} getPriorityBadge={getPriorityBadge} getCategoryIcon={getCategoryIcon} formatDate={formatDate} />
                    </TabsContent>
                    <TabsContent value="in_progress">
                      <IssueList issues={groupedIssues.in_progress} getStatusBadge={getStatusBadge} getPriorityBadge={getPriorityBadge} getCategoryIcon={getCategoryIcon} formatDate={formatDate} />
                    </TabsContent>
                    <TabsContent value="resolved">
                      <IssueList issues={groupedIssues.resolved} getStatusBadge={getStatusBadge} getPriorityBadge={getPriorityBadge} getCategoryIcon={getCategoryIcon} formatDate={formatDate} />
                    </TabsContent>
                    <TabsContent value="closed">
                      <IssueList issues={groupedIssues.closed} getStatusBadge={getStatusBadge} getPriorityBadge={getPriorityBadge} getCategoryIcon={getCategoryIcon} formatDate={formatDate} />
                    </TabsContent>
                  </Tabs>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

interface IssueListProps {
  issues: IssueReport[];
  getStatusBadge: (status: string) => JSX.Element;
  getPriorityBadge: (priority: string) => JSX.Element;
  getCategoryIcon: (category: string) => string;
  formatDate: (timestamp: number) => string;
}

function IssueList({ issues, getStatusBadge, getPriorityBadge, getCategoryIcon, formatDate }: IssueListProps) {
  if (issues.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No issues found in this category.</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[500px]">
      <div className="space-y-4 mt-4">
        {issues.map((issue: IssueReport) => (
          <Card key={issue.id} className="border-l-4 border-l-primary">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getCategoryIcon(issue.category)}</span>
                  <h4 className="font-semibold">{issue.title}</h4>
                  <Badge variant="outline">#{issue.id}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(issue.status)}
                  {getPriorityBadge(issue.priority)}
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {issue.description}
              </p>

              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(issue.createdAt)}
                </div>
                <div className="flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  {issue.category}
                </div>
                {issue.assignedTo && (
                  <div className="flex items-center gap-1">
                    <span>Assigned to: {issue.assignedTo}</span>
                  </div>
                )}
              </div>

              {issue.adminNotes && (
                <div className="bg-muted p-2 rounded text-sm mb-3">
                  <strong>Admin Notes:</strong> {issue.adminNotes}
                </div>
              )}

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    View Details
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <span>{getCategoryIcon(issue.category)}</span>
                      {issue.title}
                      <Badge variant="outline">#{issue.id}</Badge>
                    </DialogTitle>
                    <DialogDescription>
                      Issue report details and current status
                    </DialogDescription>
                  </DialogHeader>
                  <ScrollArea className="max-h-[400px]">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Description</h4>
                        <p className="text-sm p-3 bg-muted rounded">{issue.description}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold mb-1">Status</h4>
                          {getStatusBadge(issue.status)}
                        </div>
                        <div>
                          <h4 className="font-semibold mb-1">Priority</h4>
                          {getPriorityBadge(issue.priority)}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold mb-1">Category</h4>
                          <p className="text-sm">{issue.category}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-1">Created</h4>
                          <p className="text-sm">{formatDate(issue.createdAt)}</p>
                        </div>
                      </div>
                      {issue.assignedTo && (
                        <div>
                          <h4 className="font-semibold mb-1">Assigned to</h4>
                          <p className="text-sm">{issue.assignedTo}</p>
                        </div>
                      )}
                      {issue.adminNotes && (
                        <div>
                          <h4 className="font-semibold mb-1">Admin Notes</h4>
                          <p className="text-sm p-3 bg-muted rounded">{issue.adminNotes}</p>
                        </div>
                      )}
                      {issue.resolvedAt && (
                        <div>
                          <h4 className="font-semibold mb-1">Resolved</h4>
                          <p className="text-sm">{formatDate(issue.resolvedAt)}</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}