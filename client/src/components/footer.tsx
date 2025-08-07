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
    <footer className="bg-gray-800 text-white py-4 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center">
          <p className="text-gray-400">
            {t('footerText')}
          </p>
        </div>
      </div>
    </footer>
  );
}