import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Sunlit Celestial (Light) base
        sunlit: {
          bg: '#F8F7FC',
          surface: '#FFFFFF',
          card: '#FFFFFF',
          border: 'rgba(30, 27, 75, 0.08)',
          primary: '#1E1B4B',
          secondary: '#475569',
          muted: '#94A3B8',
          violet: '#6D28D9',
          amber: '#B45309',
        },
        // Deep Space Dark base
        space: {
          bg: '#080811',
          surface: 'rgba(18, 16, 38, 0.7)',
          card: '#0D0C1D',
          border: 'rgba(255, 255, 255, 0.08)',
        },
        // Amber Celestial Gold
        celestial: {
          gold: '#FFD166',
          goldDark: '#E0A96D',
          violet: '#7B2CBF',
          cyan: '#4CC9F0',
        },
        // Text colors
        cosmic: {
          primary: '#F3F4F6',
          secondary: '#9CA3AF',
          muted: '#6B7280',
        },
        // Preserve existing theme tokens for backward compatibility
        dark: {
          bg: '#080811',
          surface: '#121026',
          accent: '#FFD166',
          text: '#F3F4F6',
          muted: '#9CA3AF',
        },
        golden: {
          bg: '#1a1508',
          surface: '#2a2310',
          accent: '#FFD166',
          text: '#f0e6cc',
          muted: '#a09060',
        },
        warm: {
          bg: '#2a1810',
          surface: '#3a2820',
          accent: '#E0A96D',
          text: '#f5e6d3',
          muted: '#b09880',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        serif: ['Cinzel', 'Cormorant Garamond', 'Playfair Display', 'serif'],
      },
      backgroundImage: {
        'cosmic-radial': 'radial-gradient(ellipse 80% 80% at 50% -20%, rgba(120, 40, 200, 0.18), rgba(255, 255, 255, 0))',
        'sunlit-radial': 'radial-gradient(ellipse 80% 80% at 50% -20%, rgba(109, 40, 217, 0.06), rgba(255, 255, 255, 0))',
      },
      boxShadow: {
        'glow-gold': '0 0 20px rgba(255, 209, 102, 0.3), 0 0 40px rgba(255, 209, 102, 0.1)',
        'glow-violet': '0 0 20px rgba(123, 44, 191, 0.3), 0 0 40px rgba(123, 44, 191, 0.1)',
        'glow-cyan': '0 0 20px rgba(76, 201, 240, 0.3), 0 0 40px rgba(76, 201, 240, 0.1)',
        'sunlit-soft': '0 10px 30px -10px rgba(109, 40, 217, 0.05), 0 2px 8px -2px rgba(0, 0, 0, 0.02)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-slow': 'pulseSlow 4s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(255, 209, 102, 0.3)' },
          '100%': { boxShadow: '0 0 25px rgba(255, 209, 102, 0.6)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseSlow: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};

export default config;