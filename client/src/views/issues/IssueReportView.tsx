import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, 
  FileText, 
  Clock, 
  CheckCircle,
  XCircle,
  MessageSquare,
  User,
  Calendar,
  Filter,
  Search,
  Plus,
  Eye,
  UserCheck
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { apiRequest } from "../../lib/queryClient";

interface IssueReport {
  id: number;
  userId: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  adminNotes?: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

interface IssueReportViewProps {
  mode?: 'user' | 'admin';
  showCreateForm?: boolean;
}

export function IssueReportView({ 
  mode = 'user',
  showCreateForm = true 
}: IssueReportViewProps) {
  const { user } = useAuth();
  
  // State management
  const [issues, setIssues] = useState<IssueReport[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<IssueReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium'
  });
  
  // Filter state
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    priority: '',
    search: ''
  });
  
  // Admin state
  const [selectedIssue, setSelectedIssue] = useState<IssueReport | null>(null);
  const [adminAction, setAdminAction] = useState({
    status: '',
    adminNotes: '',
    assignedTo: ''
  });

  // Issue categories and priorities
  const categories = [
    'payment_issue',
    'transaction_problem', 
    'account_access',
    'security_concern',
    'feature_request',
    'bug_report',
    'other'
  ];
  
  const priorities = [
    { value: 'low', label: 'Low', color: 'text-green-400 border-green-400' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-400 border-yellow-400' },
    { value: 'high', label: 'High', color: 'text-orange-400 border-orange-400' },
    { value: 'urgent', label: 'Urgent', color: 'text-red-400 border-red-400' }
  ];
  
  const statuses = [
    { value: 'open', label: 'Open', color: 'text-blue-400 border-blue-400' },
    { value: 'in_progress', label: 'In Progress', color: 'text-yellow-400 border-yellow-400' },
    { value: 'resolved', label: 'Resolved', color: 'text-green-400 border-green-400' },
    { value: 'closed', label: 'Closed', color: 'text-gray-400 border-gray-400' }
  ];

  // Load issues
  const loadIssues = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const endpoint = mode === 'admin' ? '/api/admin/issues' : '/api/issues';
      const response = await apiRequest(endpoint, 'GET');
      
      setIssues(response);
      setFilteredIssues(response);
    } catch (err: any) {
      setError(err.message || 'Failed to load issues');
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  const applyFilters = () => {
    let filtered = [...issues];
    
    if (filters.status) {
      filtered = filtered.filter(issue => issue.status === filters.status);
    }
    
    if (filters.category) {
      filtered = filtered.filter(issue => issue.category === filters.category);
    }
    
    if (filters.priority) {
      filtered = filtered.filter(issue => issue.priority === filters.priority);
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(issue => 
        issue.title.toLowerCase().includes(searchLower) ||
        issue.description.toLowerCase().includes(searchLower)
      );
    }
    
    setFilteredIssues(filtered);
  };

  // Handle form input changes
  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  // Handle filter changes
  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  // Validate form
  const validateForm = () => {
    const errors: string[] = [];
    
    if (!formData.title.trim()) {
      errors.push('Title is required');
    }
    
    if (!formData.description.trim()) {
      errors.push('Description is required');
    }
    
    if (!formData.category) {
      errors.push('Category is required');
    }
    
    return errors;
  };

  // Submit new issue
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await apiRequest('/api/issues', 'POST', formData);
      
      setSuccess('Issue report submitted successfully');
      setFormData({
        title: '',
        description: '',
        category: '',
        priority: 'medium'
      });
      setShowForm(false);
      loadIssues();
    } catch (err: any) {
      setError(err.message || 'Failed to submit issue');
    } finally {
      setLoading(false);
    }
  };

  // Admin: Update issue status
  const handleAdminUpdate = async (issueId: number) => {
    if (!selectedIssue) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await apiRequest(`/api/admin/issues/${issueId}/status`, 'PUT', {
        status: adminAction.status || selectedIssue.status,
        adminNotes: adminAction.adminNotes
      });
      
      if (adminAction.assignedTo) {
        await apiRequest(`/api/admin/issues/${issueId}/assign`, 'PUT', {
          assignedTo: adminAction.assignedTo
        });
      }
      
      setSuccess('Issue updated successfully');
      setSelectedIssue(null);
      setAdminAction({ status: '', adminNotes: '', assignedTo: '' });
      loadIssues();
    } catch (err: any) {
      setError(err.message || 'Failed to update issue');
    } finally {
      setLoading(false);
    }
  };

  // Format category for display
  const formatCategory = (category: string) => {
    return category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    return priorities.find(p => p.value === priority)?.color || 'text-gray-400 border-gray-400';
  };

  // Get status color
  const getStatusColor = (status: string) => {
    return statuses.find(s => s.value === status)?.color || 'text-gray-400 border-gray-400';
  };

  useEffect(() => {
    loadIssues();
  }, [mode]);

  useEffect(() => {
    applyFilters();
  }, [filters, issues]);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-yellow-400 flex items-center">
              <AlertTriangle className="w-8 h-8 mr-3" />
              {mode === 'admin' ? 'Issue Management' : 'Support Issues'}
            </h1>
            <p className="text-gray-400 mt-2">
              {mode === 'admin' 
                ? 'Manage and resolve user issue reports'
                : 'Report issues and track their resolution status'
              }
            </p>
          </div>
          
          {mode === 'user' && showCreateForm && (
            <Button
              onClick={() => setShowForm(true)}
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-medium"
            >
              <Plus className="w-4 h-4 mr-2" />
              Report Issue
            </Button>
          )}
        </div>

        {/* Create Issue Form */}
        {showForm && mode === 'user' && (
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-yellow-400">Report New Issue</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Issue Title
                  </label>
                  <Input
                    value={formData.title}
                    onChange={(e) => handleFormChange('title', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                    placeholder="Brief description of the issue"
                    maxLength={100}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Category
                    </label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => handleFormChange('category', value)}
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {formatCategory(category)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Priority
                    </label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) => handleFormChange('priority', value)}
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        {priorities.map((priority) => (
                          <SelectItem key={priority.value} value={priority.value}>
                            {priority.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Detailed Description
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => handleFormChange('description', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white min-h-[120px]"
                    placeholder="Please provide detailed information about the issue..."
                    maxLength={1000}
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-400/50 rounded-md">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span className="text-red-400 text-sm">{error}</span>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    type="button"
                    onClick={() => setShowForm(false)}
                    variant="outline"
                    className="flex-1 border-gray-600 text-white hover:bg-gray-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black font-medium"
                  >
                    {loading ? 'Submitting...' : 'Submit Issue'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-yellow-400 flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white pl-10"
                    placeholder="Search issues..."
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Status
                </label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => handleFilterChange('status', value)}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="">All statuses</SelectItem>
                    {statuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Category
                </label>
                <Select
                  value={filters.category}
                  onValueChange={(value) => handleFilterChange('category', value)}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="">All categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {formatCategory(category)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Priority
                </label>
                <Select
                  value={filters.priority}
                  onValueChange={(value) => handleFilterChange('priority', value)}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue placeholder="All priorities" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="">All priorities</SelectItem>
                    {priorities.map((priority) => (
                      <SelectItem key={priority.value} value={priority.value}>
                        {priority.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Success/Error Messages */}
        {success && (
          <div className="flex items-center gap-2 p-3 bg-green-900/20 border border-green-400/50 rounded-md">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-green-400 text-sm">{success}</span>
          </div>
        )}

        {error && !loading && (
          <div className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-400/50 rounded-md">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-red-400 text-sm">{error}</span>
          </div>
        )}

        {/* Issues List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Loading issues...</p>
            </div>
          ) : filteredIssues.length === 0 ? (
            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="p-8 text-center">
                <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No issues found</p>
                {mode === 'user' && (
                  <p className="text-gray-500 text-sm mt-2">
                    Start by reporting your first issue
                  </p>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredIssues.map((issue) => (
              <Card key={issue.id} className="bg-gray-900 border-gray-700 hover:border-gray-600 transition-colors">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{issue.title}</h3>
                        <Badge variant="outline" className={getPriorityColor(issue.priority)}>
                          {priorities.find(p => p.value === issue.priority)?.label}
                        </Badge>
                        <Badge variant="outline" className={getStatusColor(issue.status)}>
                          {statuses.find(s => s.value === issue.status)?.label}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-300 mb-3 line-clamp-2">{issue.description}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {formatCategory(issue.category)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(issue.createdAt).toLocaleDateString()}
                        </span>
                        {mode === 'admin' && (
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-4 h-4" />
                            {issue.userId}
                          </span>
                        )}
                        {issue.assignedTo && (
                          <span className="flex items-center gap-1">
                            <UserCheck className="w-4 h-4" />
                            Assigned to: {issue.assignedTo}
                          </span>
                        )}
                      </div>
                      
                      {issue.adminNotes && (
                        <div className="mt-3 p-3 bg-blue-900/20 border border-blue-400/50 rounded-md">
                          <p className="text-blue-400 text-sm font-medium mb-1">Admin Notes:</p>
                          <p className="text-blue-300 text-sm">{issue.adminNotes}</p>
                        </div>
                      )}
                    </div>
                    
                    {mode === 'admin' && (
                      <div className="ml-4">
                        <Button
                          onClick={() => setSelectedIssue(issue)}
                          className="bg-yellow-400 hover:bg-yellow-500 text-black"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Manage
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Admin Management Modal */}
        {selectedIssue && mode === 'admin' && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="bg-gray-900 border-gray-700 w-full max-w-2xl">
              <CardHeader>
                <CardTitle className="text-yellow-400">Manage Issue #{selectedIssue.id}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-white font-medium">{selectedIssue.title}</h4>
                  <p className="text-gray-300 mt-1">{selectedIssue.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Update Status
                    </label>
                    <Select
                      value={adminAction.status || selectedIssue.status}
                      onValueChange={(value) => setAdminAction(prev => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        {statuses.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Assign To
                    </label>
                    <Input
                      value={adminAction.assignedTo}
                      onChange={(e) => setAdminAction(prev => ({ ...prev, assignedTo: e.target.value }))}
                      className="bg-gray-800 border-gray-600 text-white"
                      placeholder="Admin username"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Admin Notes
                  </label>
                  <Textarea
                    value={adminAction.adminNotes}
                    onChange={(e) => setAdminAction(prev => ({ ...prev, adminNotes: e.target.value }))}
                    className="bg-gray-800 border-gray-600 text-white"
                    placeholder="Add notes about resolution or next steps..."
                    rows={3}
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => setSelectedIssue(null)}
                    variant="outline"
                    className="flex-1 border-gray-600 text-white hover:bg-gray-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => handleAdminUpdate(selectedIssue.id)}
                    disabled={loading}
                    className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black font-medium"
                  >
                    {loading ? 'Updating...' : 'Update Issue'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}