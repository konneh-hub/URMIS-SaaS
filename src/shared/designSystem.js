export const designTokens = {
  colors: {
    primary: '#2563eb',
    secondary: '#0f172a',
    surface: '#ffffff',
    background: '#f8fafc',
    border: '#e2e8f0',
    text: '#0f172a',
    mutedText: '#64748b',
    success: '#16a34a',
    warning: '#d97706',
    danger: '#dc2626',
  },
  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
  },
  radius: {
    sm: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.5rem',
  },
  shadows: {
    card: '0 10px 30px rgba(15, 23, 42, 0.08)',
    elevated: '0 20px 45px rgba(15, 23, 42, 0.12)',
  },
  breakpoints: {
    xs: '0px',
    sm: '480px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
};

export function applyDesignTokens() {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const tokens = designTokens.colors;
  root.style.setProperty('--color-primary', tokens.primary);
  root.style.setProperty('--color-secondary', tokens.secondary);
  root.style.setProperty('--color-surface', tokens.surface);
  root.style.setProperty('--color-background', tokens.background);
  root.style.setProperty('--color-border', tokens.border);
  root.style.setProperty('--color-text', tokens.text);
  root.style.setProperty('--color-muted-text', tokens.mutedText);
  root.style.setProperty('--color-success', tokens.success);
  root.style.setProperty('--color-warning', tokens.warning);
  root.style.setProperty('--color-danger', tokens.danger);
  root.style.setProperty('--shadow-card', designTokens.shadows.card);
  root.style.setProperty('--shadow-elevated', designTokens.shadows.elevated);
}
