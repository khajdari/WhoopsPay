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

  return (
    <footer className="bg-gray-800 text-gray-400 h-16 flex items-center">
      <div className="max-w-7xl mx-auto px-4 text-center w-full">
        <p className="text-sm">
          {t('footerText')}
        </p>
      </div>
    </footer>
  );
}