/**
 * Footer Component - Global footer for all pages
 * 
 * Reusable footer component providing consistent branding and legal information
 * across all pages of the WhoopsPay application. Features multilingual support
 * and educational project context information.
 * 
 * Educational Security Features:
 * - Demonstrates consistent UI patterns across application
 * - Shows proper footer implementation for web applications
 * - Includes educational project disclaimer for security training
 */
import { useI18n } from "@/lib/i18n";

/**
 * Footer Component - Application-wide footer
 * 
 * Consistent footer displayed across all pages featuring:
 * - Educational project disclaimer and copyright information
 * - Multilingual support with i18n integration
 * - Professional styling consistent with application theme
 * - Proper semantic HTML structure for accessibility
 */
export function Footer() {
  const { t } = useI18n();
  
  // Generate build version with current date/time like Docker format
  const buildVersion = `1.0.0_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}_${new Date().toTimeString().slice(0, 8).replace(/:/g, '')}`;

  return (
    <footer className="bg-gray-800 text-gray-400 py-4 flex items-center">
      <div className="max-w-7xl mx-auto px-4 text-center w-full">
        <div className="space-y-1">
          <p className="text-sm">
            {t('footerText')}
          </p>
          <p className="text-xs">
            {t('footerLicense')}: {buildVersion}
          </p>
        </div>
      </div>
    </footer>
  );
}