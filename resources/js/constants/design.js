/**
 * Design System Constants
 * Based on PRD Design Guidelines
 *
 * This file contains all design tokens for consistent theming
 * across the React application.
 */

// PRD Color Palette
export const COLORS = {
  // Primary Colors (Blue)
  primary: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#1E40AF', // Main primary color
    700: '#1E3A8A',
    800: '#1E3A8A',
    900: '#1E3A8A',
    DEFAULT: '#1E40AF',
  },

  // Secondary Colors (Purple)
  secondary: {
    50: '#F5F3FF',
    100: '#EDE9FE',
    200: '#DDD6FE',
    300: '#C4B5FD',
    400: '#A78BFA',
    500: '#8B5CF6',
    600: '#7C3AED', // Main secondary color
    700: '#6D28D9',
    800: '#5B21B6',
    900: '#4C1D95',
    DEFAULT: '#7C3AED',
  },

  // Accent Colors (Amber)
  accent: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B', // Main accent color
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
    DEFAULT: '#F59E0B',
  },

  // Status Colors
  success: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    500: '#10B981',
    600: '#059669',
    700: '#047857',
    DEFAULT: '#10B981',
  },

  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
    DEFAULT: '#EF4444',
  },

  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    DEFAULT: '#F59E0B',
  },

  info: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    DEFAULT: '#3B82F6',
  },

  // Neutral Colors
  neutral: {
    background: '#FFFFFF',
    surface: '#F9FAFB',
    border: '#E5E7EB',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
  },
};

// PRD Spacing System (4px baseline grid)
export const SPACING = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
};

// PRD Typography Scale
export const TYPOGRAPHY = {
  // Font Families
  fontFamily: {
    sans: 'Inter, ui-sans-serif, system-ui, sans-serif',
    mono: 'JetBrains Mono, ui-monospace, monospace',
  },

  // Font Sizes
  fontSize: {
    h1: '2.5rem',      // 40px
    h2: '2rem',        // 32px
    h3: '1.5rem',      // 24px
    body: '1rem',      // 16px
    small: '0.875rem', // 14px
  },

  // Line Heights
  lineHeight: {
    h1: '1.2',
    h2: '1.25',
    h3: '1.33',
    body: '1.5',
    small: '1.43',
  },

  // Font Weights
  fontWeight: {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
};

// Breakpoints (Mobile-First)
export const BREAKPOINTS = {
  xs: '320px',   // Mobile small
  sm: '640px',   // Mobile
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Desktop large
  '2xl': '1536px', // Desktop XL
};

// Border Radius
export const BORDER_RADIUS = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  full: '9999px',
};

// Shadows
export const SHADOWS = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
};

// Z-Index Scale
export const Z_INDEX = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
};

// Transitions
export const TRANSITIONS = {
  duration: {
    fast: '150ms',
    base: '200ms',
    slow: '300ms',
    slower: '500ms',
  },

  timing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
};

// Container Max Width
export const CONTAINER = {
  maxWidth: '1280px',
  padding: {
    mobile: SPACING.md,
    desktop: SPACING.lg,
  },
};

// Common component sizes
export const SIZES = {
  button: {
    sm: { height: '32px', padding: `${SPACING.sm} ${SPACING.md}` },
    md: { height: '40px', padding: `${SPACING.md} ${SPACING.lg}` },
    lg: { height: '48px', padding: `${SPACING.md} ${SPACING.xl}` },
  },

  input: {
    sm: { height: '32px', padding: `${SPACING.sm} ${SPACING.md}` },
    md: { height: '40px', padding: `${SPACING.md} ${SPACING.md}` },
    lg: { height: '48px', padding: `${SPACING.md} ${SPACING.md}` },
  },
};

// Export all as default for convenience
export default {
  COLORS,
  SPACING,
  TYPOGRAPHY,
  BREAKPOINTS,
  BORDER_RADIUS,
  SHADOWS,
  Z_INDEX,
  TRANSITIONS,
  CONTAINER,
  SIZES,
};
