// /** @type {import('tailwindcss').Config} */
// export default {
//   darkMode: 'class',
//   content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
//   theme: {
//     extend: {
//       colors: {
//         brand: {
//           50:'#eff6ff',100:'#dbeafe',200:'#bfdbfe',300:'#93c5fd',400:'#60a5fa',
//           500:'#3b82f6',600:'#2563eb',700:'#1d4ed8',800:'#1e40af',900:'#1e3a8a',
//         },
//       },
//       boxShadow: {
//         card: '0 8px 24px rgba(2, 6, 23, 0.06)',
//         hover: '0 16px 40px rgba(2, 6, 23, 0.10)',
//       },
//     },
//   },
//   plugins: [],
// };

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'],
      },
      colors: {
        brand: {
          50:'#eef2ff',100:'#e0e7ff',200:'#c7d2fe',300:'#a5b4fc',400:'#818cf8',
          500:'#6366f1',600:'#4f46e5',700:'#4338ca',800:'#3730a3',900:'#312e81',
        },
      },
      boxShadow: {
        card: '0 10px 24px rgba(2, 6, 23, 0.06)',
        hover: '0 16px 40px rgba(2, 6, 23, 0.10)',
      },
    },
  },
  plugins: [],
};