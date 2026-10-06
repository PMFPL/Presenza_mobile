// src/context/ThemeContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ══════════════════════════════════════════════════════════
// DARK THEME
// ══════════════════════════════════════════════════════════
export const DarkTheme = {
  mode: 'dark',
  colors: {
    // ── Core brand ──────────────────────────────────────
    primary: '#FACC15', // Yellow/Gold
    secondary: '#FEE440',
    accent: '#FFD700',

    // ── Semantic UI ──────────────────────────────────────
    success: '#10B981', // Emerald-500
    error: '#ff5656', // Red
    warning: '#F59E0B', // Amber-500
    info: '#3B82F6', // Blue-500
    disabled: '#76859a',

    // ── Extended palette ─────────────────────────────────
    purple: '#A855F7', // Purple-500
    indigo: '#6366F1', // Indigo-500
    teal: '#14B8A6', // Teal-500
    cyan: '#06B6D4', // Cyan-500
    rose: '#F43F5E', // Rose-500
    pink: '#EC4899', // Pink-500
    orange: '#F97316', // Orange-500
    lime: '#84CC16', // Lime-500

    // ── Neutrals / Greys ─────────────────────────────────
    neutral100: '#F3F4F6',
    neutral200: '#E5E7EB',
    neutral300: '#D1D5DB',
    neutral400: '#9CA3AF',
    neutral500: '#6B7280',
    neutral600: '#4B5563',
    neutral700: '#374151',
    neutral800: '#1F2937',
    neutral900: '#111827',

    // ── Backgrounds ──────────────────────────────────────
    background: '#0A1128',
    surface: 'rgb(38, 50, 86)',
    surfaceSolid: '#1C2541',
    surfaceRaised: '#243058', // slightly elevated surface
    cardBg: 'rgba(38, 50, 86, 0.66)',
    headerBg: '#1C2541',
    bottomNavBg: '#111827',
    inputBg: '#0A1128',
    overlayBg: 'rgba(0,0,0,0.7)',
    overlayLight: 'rgba(0,0,0,0.4)',
    shimmerBase: '#1C2541',
    shimmerHigh: '#243058',

    // ── Text ──────────────────────────────────────────────
    textPrimary: '#FFFFFF', // Primary text on dark backgrounds
    textSecondary: '#9CA3AF', // Secondary text on dark backgrounds
    textTertiary: '#6B7280', // Tertiary text on dark backgrounds
    textOnPrimary: '#0A1128', // Text on primary color (yellow) - dark for contrast
    textOnSuccess: '#FFFFFF', // Text on success color
    textOnError: '#FFFFFF', // Text on error color
    textOnWarning: '#FFFFFF', // Text on warning color
    textDark: '#0A1128', // For light backgrounds in dark mode (use sparingly)
    textLight: '#FFFFFF', // For dark backgrounds in dark mode
    textOnColor: '#FFFFFF', // Default text on colored buttons

    // ── Borders & Dividers ───────────────────────────────
    border: '#ffffff1f',
    borderMedium: '#ffffff35',
    borderStrong: '#ffffff60',
    shadow: '#000000',
    inputBorder: '#ffffff1f',
    divider: '#ffffff12',

    // ── Semantic tints (bg use) ───────────────────────────
    successBg: '#10B98118',
    errorBg: '#ff565618',
    warningBg: '#F59E0B15',
    infoBg: '#3B82F615',
    purpleBg: '#A855F715',
    tealBg: '#14B8A615',
    roseBg: '#F43F5E15',

    // ── Special elements ─────────────────────────────────
    otpBorder: '#68644e',
    icon: '#FEE440',
    iconTitle: '#CBD5E1',
    statusBar: 'light-content',
    topShadow: '#0b1425',
    bottomShadow: '#FACC15',
    separator: '#ffffff1f',
    highlight: '#FACC1533',

    // ── Leave type specific ───────────────────────────────
    leaveFullColor: '#FACC15', // primary — full day leave
    leaveHalfColor: '#F59E0B', // warning — half day leave
    leaveShortColor: '#3B82F6', // info — short leave
    leaveSickColor: '#3B82F6', // info — sick leave
    leaveEarnedColor: '#10B981', // success — earned leave
  },
};

// ══════════════════════════════════════════════════════════
// LIGHT THEME
// ══════════════════════════════════════════════════════════
export const LightTheme = {
  mode: 'light',
  colors: {
    // ── Core brand ──────────────────────────────────────
    primary: '#D97706', // Amber-600 (darker for contrast on white)
    secondary: '#F59E0B',
    accent: '#FBBF24',

    // ── Semantic UI ──────────────────────────────────────
    success: '#059669', // Emerald-600
    error: '#DC2626', // Red-600
    warning: '#D97706', // Amber-600
    info: '#2563EB', // Blue-600
    disabled: '#7d8a9c',

    // ── Extended palette ─────────────────────────────────
    purple: '#9333EA', // Purple-600
    indigo: '#4F46E5', // Indigo-600
    teal: '#0D9488', // Teal-600
    cyan: '#0891B2', // Cyan-600
    rose: '#E11D48', // Rose-600
    pink: '#DB2777', // Pink-600
    orange: '#EA580C', // Orange-600
    lime: '#65A30D', // Lime-600

    // ── Neutrals / Greys ─────────────────────────────────
    neutral100: '#F9FAFB',
    neutral200: '#F3F4F6',
    neutral300: '#E5E7EB',
    neutral400: '#D1D5DB',
    neutral500: '#9CA3AF',
    neutral600: '#6B7280',
    neutral700: '#4B5563',
    neutral800: '#374151',
    neutral900: '#111827',

    // ── Backgrounds ──────────────────────────────────────
    background: '#F1F5F9',
    surface: '#FFFFFF',
    surfaceSolid: '#FFFFFF',
    surfaceRaised: '#F8FAFC',
    cardBg: '#FFFFFF',
    headerBg: '#FFFFFF',
    bottomNavBg: '#FFFFFF',
    inputBg: '#FFFFFF',
    overlayBg: 'rgba(0,0,0,0.5)',
    overlayLight: 'rgba(0,0,0,0.25)',
    shimmerBase: '#E5E7EB',
    shimmerHigh: '#F3F4F6',

    // ── Text ──────────────────────────────────────────────
    textPrimary: '#0F172A', // Primary text on light backgrounds
    textSecondary: '#475569', // Secondary text on light backgrounds (adjusted for better contrast)
    textTertiary: '#64748B', // Tertiary text on light backgrounds
    textOnPrimary: '#FFFFFF', // Text on primary color (amber) - white for contrast
    textOnSuccess: '#FFFFFF', // Text on success color
    textOnError: '#FFFFFF', // Text on error color
    textOnWarning: '#FFFFFF', // Text on warning color
    textDark: '#0F172A', // For dark backgrounds in light mode
    textLight: '#FFFFFF', // For light backgrounds in light mode
    textOnColor: '#FFFFFF', // Default text on colored buttons

    // ── Borders & Dividers ───────────────────────────────
    border: '#E2E8F0',
    borderMedium: '#CBD5E1',
    borderStrong: '#94A3B8',
    shadow: '#94A3B8',
    inputBorder: '#CBD5E1',
    divider: '#F1F5F9',

    // ── Semantic tints (bg use) ───────────────────────────
    successBg: '#05966918',
    errorBg: '#DC262618',
    warningBg: '#D9770615',
    infoBg: '#2563EB15',
    purpleBg: '#9333EA15',
    tealBg: '#0D948815',
    roseBg: '#E11D4815',

    // ── Special elements ─────────────────────────────────
    otpBorder: '#D97706',
    icon: '#D97706',
    iconTitle: '#334155',
    statusBar: 'dark-content',
    topShadow: '#E2E8F0',
    bottomShadow: '#F59E0B',
    separator: '#E2E8F0',
    highlight: '#D9770633',

    // ── Leave type specific ───────────────────────────────
    leaveFullColor: '#D97706',
    leaveHalfColor: '#D97706',
    leaveShortColor: '#2563EB',
    leaveSickColor: '#2563EB',
    leaveEarnedColor: '#059669',
  },
};

// ══════════════════════════════════════════════════════════
// CONTEXT
// ══════════════════════════════════════════════════════════
const ThemeContext = createContext({
  theme: DarkTheme,
  toggleTheme: () => {},
  setTheme: () => {},
  isDark: true,
  themeMode: 'system',
});

export const ThemeProvider = ({ children }) => {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState('system');

  useEffect(() => {
    loadSavedTheme();
  }, []);

  const loadSavedTheme = async () => {
    try {
      const saved = await AsyncStorage.getItem('app_theme');
      if (saved && ['system', 'dark', 'light'].includes(saved)) {
        setThemeMode(saved);
      }
    } catch (e) {
      console.log('Theme load error:', e);
    }
  };

  const setTheme = async mode => {
    try {
      setThemeMode(mode);
      await AsyncStorage.setItem('app_theme', mode);
    } catch (e) {
      console.log('Theme save error:', e);
    }
  };

  const resolveTheme = () => {
    if (themeMode === 'system')
      return systemScheme === 'light' ? LightTheme : DarkTheme;
    return themeMode === 'light' ? LightTheme : DarkTheme;
  };

  const theme = resolveTheme();
  const isDark = theme.mode === 'dark';
  const toggleTheme = () => setTheme(isDark ? 'light' : 'dark');

  return (
    <ThemeContext.Provider
      value={{ theme, toggleTheme, isDark, setTheme, themeMode }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};

export default ThemeContext;