/**
 * Language Selector Component - Internationalization controls
 * 
 * Provides language selection interface supporting multiple locales:
 * - English (UK) - Primary interface language
 * - Greek (Greece) - Secondary interface language
 * - Visual language indicators with flag icons
 * - Current language highlighting and selection state
 * - Integration with i18n translation system
 * 
 * Educational Security Features:
 * - Demonstrates internationalization patterns
 * - Shows language preference handling
 * - Includes locale-specific formatting
 * 
 * VULNERABILITY NOTE: Language preferences may be stored without
 * proper validation for educational security training purposes.
 */
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useI18n, type Language } from "@/lib/i18n";

/**
 * LanguageSelector Component - Locale selection interface
 * 
 * Component that provides language selection functionality for the
 * application's internationalization system. Features include:
 * - Dropdown menu with available languages
 * - Current language highlighting
 * - Flag icons for visual identification
 * - Integration with translation system
 * - Persistent language preference storage
 */
export function LanguageSelector() {
  const { language, setLanguage, t } = useI18n();

  const languages = [
    { code: 'en-GB' as Language, name: 'English (UK)', flag: '🇬🇧' },
    { code: 'el-GR' as Language, name: 'Ελληνικά', flag: '🇬🇷' }
  ];

  const currentLanguage = languages.find(lang => lang.code === language) || languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-10 px-2 flex items-center justify-center">
          <span 
            className="block text-center" 
            style={{ 
              fontSize: '18px', 
              lineHeight: '1',
              fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif'
            }}
          >
            {currentLanguage.flag}
          </span>
          <span className="sr-only">{t('changeLanguage')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`flex items-center gap-2 ${
              language === lang.code ? 'bg-gray-100' : ''
            }`}
          >
            <span className="text-lg">{lang.flag}</span>
            <span className="flex-1">{lang.name}</span>
            {language === lang.code && (
              <span className="text-xs text-blue-600">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}