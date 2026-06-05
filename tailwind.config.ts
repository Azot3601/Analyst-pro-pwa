import type { Config } from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#08111f',
        graphite: '#101a2b',
        panel: '#121e31',
        line: '#243149',
        electric: '#6ee7f9',
        mentor: '#9b8cff',
        amber: '#f6c453',
        success: '#5ee0a2',
        danger: '#ff7b91'
      },
      boxShadow: {
        glow: '0 0 48px rgba(110, 231, 249, 0.16)',
        panel: '0 18px 60px rgba(2, 6, 23, 0.34)'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Arial', 'sans-serif'],
        mono: ['JetBrains Mono', 'SFMono-Regular', 'Consolas', 'monospace']
      }
    }
  },
  plugins: []
} satisfies Config;
