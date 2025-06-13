/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./layouts/**/*.{js,ts,jsx,tsx}",
    "./utils/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            fontSize: '14px',
            lineHeight: '1.6',
            color: '#374151', // gray-700
            maxWidth: 'none',
            h1: {
              fontSize: '18px',
              fontWeight: '400',
              color: '#111827', // gray-900
              marginTop: '0',
              marginBottom: '1.5rem',
            },
            h2: {
              fontSize: '14px',
              fontWeight: '400',
              color: '#111827', // gray-900
              marginTop: '2rem',
              marginBottom: '0.75rem',
            },
            h3: {
              fontSize: '14px',
              fontWeight: '400',
              color: '#111827', // gray-900
              marginTop: '1.5rem',
              marginBottom: '0.5rem',
            },
            p: {
              fontSize: '14px',
              marginTop: '0',
              marginBottom: '1rem',
            },
            a: {
              color: '#111827', // gray-900
              textDecoration: 'underline',
              fontWeight: '400',
              '&:hover': {
                color: '#4B5563', // gray-600
              },
            },
            strong: {
              fontWeight: '400',
              color: '#111827', // gray-900
            },
            ul: {
              marginTop: '1rem',
              marginBottom: '1rem',
            },
            li: {
              fontSize: '14px',
              marginTop: '0.25rem',
              marginBottom: '0.25rem',
            },
            hr: {
              borderColor: '#F3F4F6', // gray-100
              marginTop: '2rem',
              marginBottom: '2rem',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
