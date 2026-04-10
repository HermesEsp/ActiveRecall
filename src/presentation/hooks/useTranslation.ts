import { useUserStore } from '../../application/store/useUserStore';
import { translations } from '../../translations';

export function useTranslation() {
  const language = useUserStore((state) => state.user.language);
  const t = translations[language] || translations.en;
  
  return { t, language };
}
