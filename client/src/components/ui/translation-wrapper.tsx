import { useI18n } from "@/lib/i18n";

interface TranslationWrapperProps {
  children: (t: (key: string) => string) => React.ReactNode;
}

export function TranslationWrapper({ children }: TranslationWrapperProps) {
  const { t } = useI18n();
  
  const safeT = (key: string) => {
    try {
      return t(key as any);
    } catch (error) {
      // Fallback to key if translation doesn't exist
      return key;
    }
  };

  return <>{children(safeT)}</>;
}