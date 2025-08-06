import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  XCircle, 
  User, 
  Calendar,
  Tag,
  MessageSquare,
  Edit,
  UserCheck,
  Eye,
  Filter
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
  ipAddress?: string;
  userAgent?: string;
}

export function AdminIssueMonitor() {
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [editingIssue, setEditingIssue] = useState<IssueReport | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const { toast } = useToast();
  const { t } = useI18n();
  const queryClient = useQueryClient();

  const { data: issues = [], isLoading } = useQuery({
    queryKey: ["/api/admin/issues"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: number; status: string; notes?: string }) => {
      return apiRequest(`/api/admin/issues/${id}/status`, "PUT", { status, adminNotes: notes });
    },
    onSuccess: () => {
      toast({
        title: "Status Updated",
        description: "Issue report status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/issues"] });
      setEditingIssue(null);
      setNewStatus("");
      setAdminNotes("");
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update issue status. Please try again.",
        variant: "destructive",
      });
    },
  });

  const assignIssueMutation = useMutation({
    mutationFn: async ({ id, assignedTo }: { id: number; assignedTo: string }) => {
      return apiRequest(`/api/admin/issues/${id}/assign`, "PUT", { assignedTo });
    },
    onSuccess: () => {
      toast({
        title: "Issue Assigned",
        description: "Issue has been assigned successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/issues"] });
      setAssignedTo("");
    },
    onError: () => {
      toast({
        title: "Assignment Failed",
        description: "Failed to assign issue. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge variant="destructive" className="flex items-center gap-1"><AlertTriangle className="h-3 w-3" />Open</Badge>;
      case "in_progress":
        return <Badge variant="default" className="flex items-center gap-1"><Clock className="h-3 w-3" />In Progress</Badge>;
      case "resolved":
        return <Badge variant="outline" className="flex items-center gap-1 text-green-600"><CheckCircle className="h-3 w-3" />Resolved</Badge>;
      case "closed":
        return <Badge variant="secondary" className="flex items-center gap-1"><XCircle className="h-3 w-3" />Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "critical":
        return <Badge className="bg-red-600 text-white">Critical</Badge>;
      case "high":
        return <Badge className="bg-orange-600 text-white">High</Badge>;
      case "medium":
        return <Badge className="bg-yellow-600 text-white">Medium</Badge>;
      case "low":
        return <Badge className="bg-green-600 text-white">Low</Badge>;
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

  const filteredIssues = issues.filter((issue: IssueReport) => {
    if (selectedStatus !== "all" && issue.status !== selectedStatus) return false;
    if (selectedPriority !== "all" && issue.priority !== selectedPriority) return false;
    if (selectedCategory !== "all" && issue.category !== selectedCategory) return false;
    return true;
  });

  const handleStatusUpdate = () => {
    if (editingIssue && newStatus) {
      updateStatusMutation.mutate({
        id: editingIssue.id,
        status: newStatus,
        notes: adminNotes || undefined,
      });
    }
  };

  const handleAssignIssue = (issueId: number) => {
    if (assignedTo) {
      assignIssueMutation.mutate({ id: issueId, assignedTo });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          {t('issueReportsMonitor')}
        </CardTitle>
        <CardDescription>
          {t('monitorManageIssueReports')}
        </CardDescription>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-2 pt-4">
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder={t('allStatus')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allStatus')}</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedPriority} onValueChange={setSelectedPriority}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder={t('allPriority')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allPriority')}</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder={t('allCategories')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allCategories')}</SelectItem>
              <SelectItem value="technical">Technical</SelectItem>
              <SelectItem value="payment">Payment</SelectItem>
              <SelectItem value="security">Security</SelectItem>
              <SelectItem value="account">Account</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {filteredIssues.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{t('noIssueReportsFound')}</p>
          </div>
        ) : (
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {filteredIssues.map((issue: IssueReport) => (
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
                        <User className="h-3 w-3" />
                        {issue.userId}
                      </div>
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
                          <UserCheck className="h-3 w-3" />
                          {issue.assignedTo}
                        </div>
                      )}
                    </div>

                    {issue.adminNotes && (
                      <div className="bg-muted p-2 rounded text-sm mb-3">
                        <strong>Admin Notes:</strong> {issue.adminNotes}
                      </div>
                    )}

                    <div className="flex items-center gap-2">
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
                              Issue report details and management
                            </DialogDescription>
                          </DialogHeader>
                          <ScrollArea className="max-h-[400px]">
                            <div className="space-y-4">
                              <div>
                                <Label>Description</Label>
                                <p className="text-sm mt-1 p-3 bg-muted rounded">{issue.description}</p>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Status</Label>
                                  <div className="mt-1">{getStatusBadge(issue.status)}</div>
                                </div>
                                <div>
                                  <Label>Priority</Label>
                                  <div className="mt-1">{getPriorityBadge(issue.priority)}</div>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Submitted by</Label>
                                  <p className="text-sm mt-1">{issue.userId}</p>
                                </div>
                                <div>
                                  <Label>Created</Label>
                                  <p className="text-sm mt-1">{formatDate(issue.createdAt)}</p>
                                </div>
                              </div>
                              {issue.assignedTo && (
                                <div>
                                  <Label>Assigned to</Label>
                                  <p className="text-sm mt-1">{issue.assignedTo}</p>
                                </div>
                              )}
                              {issue.adminNotes && (
                                <div>
                                  <Label>Admin Notes</Label>
                                  <p className="text-sm mt-1 p-3 bg-muted rounded">{issue.adminNotes}</p>
                                </div>
                              )}
                            </div>
                          </ScrollArea>
                        </DialogContent>
                      </Dialog>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex items-center gap-1"
                            onClick={() => {
                              setEditingIssue(issue);
                              setNewStatus(issue.status);
                              setAdminNotes(issue.adminNotes || "");
                            }}
                          >
                            <Edit className="h-3 w-3" />
                            Update Status
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Update Issue Status</DialogTitle>
                            <DialogDescription>
                              Update the status and add admin notes for issue #{issue.id}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="status">Status</Label>
                              <Select value={newStatus} onValueChange={setNewStatus}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="open">Open</SelectItem>
                                  <SelectItem value="in_progress">In Progress</SelectItem>
                                  <SelectItem value="resolved">Resolved</SelectItem>
                                  <SelectItem value="closed">Closed</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="notes">Admin Notes</Label>
                              <Textarea
                                id="notes"
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                placeholder="Add notes about the resolution or actions taken..."
                                rows={3}
                              />
                            </div>
                            <Button 
                              onClick={handleStatusUpdate}
                              disabled={updateStatusMutation.isPending}
                              className="w-full"
                            >
                              {updateStatusMutation.isPending ? "Updating..." : "Update Status"}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>

                      {!issue.assignedTo && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="flex items-center gap-1">
                              <UserCheck className="h-3 w-3" />
                              Assign
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Assign Issue</DialogTitle>
                              <DialogDescription>
                                Assign issue #{issue.id} to an administrator
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="assignTo">Assign to</Label>
                                <Input
                                  id="assignTo"
                                  value={assignedTo}
                                  onChange={(e) => setAssignedTo(e.target.value)}
                                  placeholder="Enter admin username or ID"
                                />
                              </div>
                              <Button 
                                onClick={() => handleAssignIssue(issue.id)}
                                disabled={assignIssueMutation.isPending || !assignedTo}
                                className="w-full"
                              >
                                {assignIssueMutation.isPending ? "Assigning..." : "Assign Issue"}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}