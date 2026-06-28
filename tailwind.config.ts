import type { Config } from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Тёплая дружелюбная тёмная палитра (значения токенов обновлены,
        // имена сохранены — поэтому ребрендинг каскадом идёт по всему приложению).
        ink: '#14121e',
        graphite: '#1a1728',
        panel: '#221d34',
        line: '#322b46',
        electric: '#8b7bff', // основной акцент (мягкий фиолет вместо неон-циана)
        mentor: '#b3a4ff', // вторичный лиловый
        amber: '#ffce6a', // тёплый хайлайт / мотивация
        success: '#57d9a3',
        danger: '#ff7a93'
      },
      borderRadius: {
        // Чуть крупнее по всей шкале — интерфейс становится мягче и дружелюбнее.
        sm: '0.375rem',
        DEFAULT: '0.5rem',
        md: '0.625rem',
        lg: '0.875rem',
        xl: '1.1rem',
        '2xl': '1.4rem',
        '3xl': '1.75rem'
      },
      boxShadow: {
        glow: '0 0 60px rgba(139, 123, 255, 0.22)',
        panel: '0 24px 60px -28px rgba(8, 6, 20, 0.72)',
        soft: '0 10px 34px -16px rgba(8, 6, 20, 0.6)',
        lift: '0 16px 40px -18px rgba(139, 123, 255, 0.35)'
      },
      fontFamily: {
        sans: [
          '"Plus Jakarta Sans Variable"',
          'Inter',
          'ui-sans-serif',
          'system-ui',
          'Segoe UI',
          'Arial',
          'sans-serif'
        ],
        mono: ['"JetBrains Mono"', 'SFMono-Regular', 'Consolas', 'monospace']
      },
      keyframes: {
        'fade-rise': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      },
      animation: {
        'fade-rise': 'fade-rise 0.35s ease both'
      }
    }
  },
  plugins: []
} satisfies Config;
