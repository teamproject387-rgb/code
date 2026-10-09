/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#07090E',
          card: '#0D111D',
          cardHover: '#13182A',
          border: 'rgba(255, 255, 255, 0.08)',
          glowBlue: '#3B82F6',
          glowPurple: '#8B5CF6',
          glowCyan: '#06B6D4',
          glowEmerald: '#10B981',
          glowRose: '#F43F5E',
        }
      },
      boxShadow: {
        'neon-blue': '0 0 25px -5px rgba(59, 130, 246, 0.5)',
        'neon-purple': '0 0 25px -5px rgba(139, 92, 246, 0.5)',
        'neon-cyan': '0 0 25px -5px rgba(6, 182, 212, 0.5)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      fontFamily: {
        mono: ['Fira Code', 'JetBrains Mono', 'Consolas', 'monospace'],
      }
    },
  },
  plugins: [],
}
