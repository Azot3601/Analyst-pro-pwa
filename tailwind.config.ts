import type { Config } from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // «Тёплый архив на закате»: фиолет остаётся, но добавлен тёплый слой
        // (пергамент, янтарь, мох) для уютной фэнтези-атмосферы Златограда.
        ink: '#14121e',
        'ink-deep': '#0f0d18',
        graphite: '#1a1728',
        panel: '#221d34',
        line: '#322b46',
        electric: '#8b7bff', // основной акцент (мягкий фиолет вместо неон-циана)
        mentor: '#b3a4ff', // вторичный лиловый
        amber: '#ffce6a', // тёплый хайлайт / золото / XP
        gild: '#ffce6a', // семантический алиас «золото»
        ember: '#ff9d5c', // тёплая искра — празднования, огонёк
        parchment: '#f3e9d6', // кремовые «свитки» — реплики Софи, подсказки
        moss: '#6fcf97', // мягкий природный успех
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
        lift: '0 16px 40px -18px rgba(139, 123, 255, 0.35)',
        // «Лампа ловит край свитка»: приподнятая папка-пергамент.
        scroll: 'inset 0 1px 0 rgba(255,255,255,0.5), 0 18px 40px -22px rgba(15,13,24,0.8)'
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
        // Дисплейный шрифт только для заголовков-«хрома» (главы, ранги, имя Софи).
        display: ['"Fraunces Variable"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'SFMono-Regular', 'Consolas', 'monospace']
      },
      keyframes: {
        'fade-rise': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' }
        }
      },
      animation: {
        'fade-rise': 'fade-rise 0.35s ease both',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite'
      }
    }
  },
  plugins: []
} satisfies Config;
