/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./resources/**/*.blade.php",
    "./resources/**/*.js",
    "./resources/**/*.jsx",
    "./resources/**/*.vue",
  ],
  theme: {
    extend: {
      // PRD Color Palette
      colors: {
        primary: {
          DEFAULT: '#1E40AF', // Primary Blue
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
        },
        secondary: {
          DEFAULT: '#7C3AED', // Purple
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
        },
        accent: {
          DEFAULT: '#F59E0B', // Amber
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
        },
        success: {
          DEFAULT: '#10B981',
          50: '#ECFDF5',
          100: '#D1FAE5',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
        },
        error: {
          DEFAULT: '#EF4444',
          50: '#FEF2F2',
          100: '#FEE2E2',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
        },
        warning: {
          DEFAULT: '#F59E0B',
          50: '#FFFBEB',
          100: '#FEF3C7',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
        },
        info: {
          DEFAULT: '#3B82F6',
          50: '#EFF6FF',
          100: '#DBEAFE',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
        },
      },
      backgroundColor: {
        background: '#FFFFFF',
        surface: '#F9FAFB',
      },
      borderColor: {
        DEFAULT: '#E5E7EB',
        border: '#E5E7EB',
      },
      textColor: {
        primary: '#111827',
        secondary: '#6B7280',
      },
      // PRD Typography System
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        // H1: 2.5rem (40px)
        'h1': ['2.5rem', { lineHeight: '1.2', fontWeight: '700' }],
        // H2: 2rem (32px)
        'h2': ['2rem', { lineHeight: '1.25', fontWeight: '700' }],
        // H3: 1.5rem (24px)
        'h3': ['1.5rem', { lineHeight: '1.33', fontWeight: '700' }],
        // Body: 1rem (16px)
        'body': ['1rem', { lineHeight: '1.5', fontWeight: '400' }],
        // Small: 0.875rem (14px)
        'small': ['0.875rem', { lineHeight: '1.43', fontWeight: '400' }],
      },
      // PRD Spacing System (4px baseline grid)
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
        '2xl': '48px',
        '3xl': '64px',
      },
      maxWidth: {
        'container': '1280px',
      },
      // Animation and transitions
      transitionDuration: {
        'DEFAULT': '200ms',
      },
      // Border radius
      borderRadius: {
        'DEFAULT': '8px',
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
      },
      aspectRatio: {
        'video': '9 / 16',
      },
    },
  },
  plugins: [],
}
