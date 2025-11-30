/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
      },
    },
  },
  plugins: [],
  safelist: [
    'dark:bg-purple-800',
    'dark:text-white',
    'dark:bg-gray-800',
    'dark:bg-gray-900',
    'dark:text-gray-100',
    'dark:text-gray-400',
    'dark:border-gray-700',
    'dark:border-gray-600',
    'dark:hover:bg-gray-700',
    'dark:hover:text-white',
  ]
}