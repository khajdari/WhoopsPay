import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { AlertTriangle, FileText, Send } from "lucide-react";

interface IssueReportFormProps {
  onSubmitSuccess?: () => void;
}

export function IssueReportForm({ onSubmitSuccess }: IssueReportFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const submitIssueMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("/api/issues", "POST", data);
    },
    onSuccess: () => {
      toast({
        title: "Issue Report Submitted",
        description: "Your issue report has been submitted successfully. Our team will review it.",
      });
      
      // Reset form
      setTitle("");
      setDescription("");
      setCategory("");
      setPriority("");
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["/api/issues"] });
      
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    },
    onError: (error) => {
      toast({
        title: "Submission Failed",
        description: "Failed to submit issue report. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || !category || !priority) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    submitIssueMutation.mutate({
      title,
      description,
      category,
      priority,
    });
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "technical": return "🔧";
      case "payment": return "💳";
      case "security": return "🔒";
      case "account": return "👤";
      default: return "📝";
    }
  };

  const getPriorityColor = (pri: string) => {
    switch (pri) {
      case "critical": return "text-red-600 dark:text-red-400";
      case "high": return "text-orange-600 dark:text-orange-400";
      case "medium": return "text-yellow-600 dark:text-yellow-400";
      case "low": return "text-green-600 dark:text-green-400";
      default: return "text-gray-600 dark:text-gray-400";
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Submit Issue Report
        </CardTitle>
        <CardDescription>
          Report any issues, bugs, or concerns you encounter while using WhoopsPay
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Issue Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief description of the issue"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technical">
                    <span className="flex items-center gap-2">
                      🔧 Technical Issues
                    </span>
                  </SelectItem>
                  <SelectItem value="payment">
                    <span className="flex items-center gap-2">
                      💳 Payment Problems
                    </span>
                  </SelectItem>
                  <SelectItem value="security">
                    <span className="flex items-center gap-2">
                      🔒 Security Concerns
                    </span>
                  </SelectItem>
                  <SelectItem value="account">
                    <span className="flex items-center gap-2">
                      👤 Account Issues
                    </span>
                  </SelectItem>
                  <SelectItem value="other">
                    <span className="flex items-center gap-2">
                      📝 Other
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority *</Label>
              <Select value={priority} onValueChange={setPriority} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">
                    <span className="flex items-center gap-2 text-red-600 dark:text-red-400">
                      <AlertTriangle className="h-4 w-4" />
                      Critical
                    </span>
                  </SelectItem>
                  <SelectItem value="high">
                    <span className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                      High
                    </span>
                  </SelectItem>
                  <SelectItem value="medium">
                    <span className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                      Medium
                    </span>
                  </SelectItem>
                  <SelectItem value="low">
                    <span className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      Low
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Detailed Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please provide a detailed description of the issue, including steps to reproduce if applicable..."
              rows={6}
              required
            />
          </div>

          <div className="flex items-center justify-between pt-4">
            <div className="text-sm text-muted-foreground">
              * Required fields
            </div>
            <Button 
              type="submit" 
              disabled={submitIssueMutation.isPending}
              className="flex items-center gap-2"
            >
              {submitIssueMutation.isPending ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit Report
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}