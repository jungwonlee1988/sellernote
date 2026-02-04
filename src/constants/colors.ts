export const colors = {
  primary: {
    50: '#F5FAF3',
    100: '#E8F5E3',
    200: '#D0EBCA',
    300: '#B3DCA8',
    400: '#8FC87A',
    500: '#6AAF50',
    600: '#5A9A44',
    700: '#4A8038',
    800: '#3B662D',
    900: '#2C4D22',
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  red: {
    50: '#fef2f2',
    100: '#fee2e2',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
  },
  green: {
    50: '#f0fdf4',
    100: '#dcfce7',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
  },
  blue: {
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
  },
  yellow: {
    50: '#fefce8',
    100: '#fef9c3',
    500: '#eab308',
    600: '#ca8a04',
    700: '#a16207',
  },
} as const

export const brandColors = {
  primary: '#6AAF50',
  primaryHover: '#5A9A44',
  primaryLight: '#E8F5E3',
  primaryBg: '#F5FAF3',
  secondary: '#1f2937',
  text: {
    primary: '#1f2937',
    secondary: '#4b5563',
    muted: '#6b7280',
    light: '#9ca3af',
  },
  border: {
    default: '#e5e7eb',
    focus: '#6AAF50',
  },
} as const

export type Colors = typeof colors
export type BrandColors = typeof brandColors
