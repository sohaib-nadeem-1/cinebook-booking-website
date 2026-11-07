/** Tokens lifted from the Stitch "Cinematic Luxe" screens so the build matches them 1:1. */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'surface-bright': '#373940', tertiary: '#c0c6de', 'surface-container': '#1e1f26',
        'on-tertiary-container': '#faf8ff', 'surface-tint': '#ffb4aa', primary: '#ffb4aa',
        'tertiary-fixed': '#dce1fb', 'secondary-container': '#ee9800', 'tertiary-container': '#6c7288',
        'outline-variant': '#5e3f3b', 'error-container': '#93000a', 'on-secondary': '#472a00',
        'surface-container-lowest': '#0c0e14', 'inverse-surface': '#e2e2eb', surface: '#111319',
        'inverse-primary': '#c0000c', error: '#ffb4ab', 'on-primary-container': '#fff7f6',
        'on-surface-variant': '#e9bcb6', 'surface-container-high': '#282a30', secondary: '#ffb95f',
        outline: '#af8782', 'on-surface': '#e2e2eb', 'primary-container': '#e50914',
        background: '#111319', 'surface-variant': '#33343b', 'on-secondary-container': '#5b3800',
        'surface-container-low': '#191b22', 'on-primary': '#690003', 'surface-dim': '#111319',
        'surface-container-highest': '#33343b', 'on-error-container': '#ffdad6', 'on-error': '#690005',
        // Design-system hairlines / tiers (DESIGN.md)
        hairline: '#2C344A', crimson: '#E50914', gold: '#F59E0B',
      },
      borderRadius: { DEFAULT: '0.25rem', lg: '0.5rem', xl: '0.75rem', '2xl': '1rem', '3xl': '1.5rem', full: '9999px' },
      spacing: {
        'space-xl': '2.5rem', 'space-sm': '0.5rem', gutter: '1.5rem', 'margin-mobile': '1rem',
        'space-lg': '1.5rem', 'space-md': '1rem', 'space-xs': '0.25rem', 'gutter-mobile': '0.75rem', margin: '2.5rem',
      },
      fontFamily: {
        headline: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-hero': ['56px', { lineHeight: '64px', letterSpacing: '-0.03em', fontWeight: '800' }],
        'display-hero-mobile': ['36px', { lineHeight: '44px', letterSpacing: '-0.02em', fontWeight: '800' }],
        'headline-lg': ['36px', { lineHeight: '44px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'headline-lg-mobile': ['28px', { lineHeight: '36px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'headline-md': ['24px', { lineHeight: '32px', letterSpacing: '-0.015em', fontWeight: '600' }],
        'headline-sm': ['20px', { lineHeight: '28px', letterSpacing: '-0.01em', fontWeight: '600' }],
        'title-md': ['16px', { lineHeight: '24px', fontWeight: '600' }],
        'body-lg': ['18px', { lineHeight: '28px', fontWeight: '400' }],
        'body-md': ['15px', { lineHeight: '22px', fontWeight: '400' }],
        'body-sm': ['13px', { lineHeight: '18px', letterSpacing: '0.01em', fontWeight: '400' }],
        'label-md': ['14px', { lineHeight: '20px', letterSpacing: '0.01em', fontWeight: '500' }],
        'label-sm': ['12px', { lineHeight: '16px', letterSpacing: '0.03em', fontWeight: '600' }],
      },
      boxShadow: {
        glow: '0 4px 14px rgba(229,9,20,0.35)',
        'glow-lg': '0 6px 20px rgba(229,9,20,0.5)',
        card: '0 4px 20px -2px rgba(0,0,0,0.6)',
        'card-hover': '0 12px 32px -4px rgba(0,0,0,0.75)',
        modal: '0 24px 48px -12px rgba(0,0,0,0.9)',
      },
      keyframes: {
        'toast-in': { from: { opacity: 0, transform: 'translateY(8px) scale(.98)' }, to: { opacity: 1, transform: 'none' } },
        'fade-in': { from: { opacity: 0 }, to: { opacity: 1 } },
        'sheet-up': { from: { transform: 'translateY(24px)', opacity: 0 }, to: { transform: 'none', opacity: 1 } },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
      },
      animation: {
        'toast-in': 'toast-in .22s ease-out', 'fade-in': 'fade-in .18s ease-out',
        'sheet-up': 'sheet-up .22s ease-out',
      },
    },
  },
  plugins: [],
};
