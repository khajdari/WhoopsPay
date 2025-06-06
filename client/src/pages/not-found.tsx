/**
 * Not Found Page - 404 error handling interface
 * 
 * Error page displayed when users navigate to non-existent routes:
 * - Clear error messaging with visual indicators
 * - User-friendly explanation of the situation
 * - Centered layout with consistent branding
 * - Accessible design with proper contrast
 * - Development-friendly error information
 * 
 * Educational Security Features:
 * - Demonstrates proper error page design
 * - Shows secure error handling patterns
 * - Includes user experience considerations
 * 
 * VULNERABILITY NOTE: May expose routing information
 * for educational security training purposes.
 */
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Layout } from "@/components/layout";

/**
 * NotFound Component - 404 error page interface
 * 
 * Handles navigation to non-existent routes with user-friendly
 * error presentation. Features include:
 * - Clear 404 error messaging with visual icon
 * - Developer-friendly debugging information
 * - Centered card layout for focused attention
 * - Consistent styling with application theme
 * - Accessible design with proper semantic structure
 */
export default function NotFound() {
  return (
    <Layout showHeader={false} showMobileNav={false}>
      <div className="flex-1 w-full flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="flex mb-4 gap-2">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <h1 className="text-2xl font-bold text-gray-900">404 Page Not Found</h1>
            </div>

            <p className="mt-4 text-sm text-gray-600">
              Did you forget to add the page to the router?
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
