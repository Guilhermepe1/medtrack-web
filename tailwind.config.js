/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          teal:   '#00C9A7',
          blue:   '#2B7FD4',
          navy:   '#1A2A6C',
          light:  '#F4F8FC',
          muted:  '#6B8CB0',
          border: '#E0EAF5',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #00C9A7, #2B7FD4)',
        'navy-gradient':  'linear-gradient(180deg, #1A2A6C, #1A4A7A)',
      },
    },
  },
  plugins: [],
}
