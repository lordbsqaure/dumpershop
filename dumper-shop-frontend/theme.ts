import { createTheme } from '@mantine/core';

export const theme = createTheme({
  primaryColor: 'purple',
  colors: {
    purple: [
      '#f3e5f5',
      '#e1bee7',
      '#ce93d8',
      '#ba68c8',
      '#ab47bc',
      '#9c27b0',
      '#8e24aa',
      '#7b1fa2',
      '#6a1b9a',
      '#4a148c',
    ],
  },
  defaultRadius: 'md',
  spacing: {
    xs: '8px',
    sm: '12px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  fontFamily: 'Inter, sans-serif',
  headings: {
    fontFamily: 'Inter, sans-serif',
  },
  shadows: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 3px rgba(0, 0, 0, 0.24)',
    md: '0 4px 6px rgba(0, 0, 0, 0.07), 0 1px 3px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
  },
});
