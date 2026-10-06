// src/hooks/useThemedStyles.js
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export const useThemedStyles = (styleCreator) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  
  const styles = styleCreator(theme, t);
  return styles;
};

export default useThemedStyles;