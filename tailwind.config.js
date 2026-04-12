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
            pre: {
              backgroundColor: '#F9FAFB', // gray-50
              color: '#1F2937', // gray-800
              borderRadius: '0.5rem',
              padding: '1rem',
              overflowX: 'auto',
              fontSize: '13px',
              lineHeight: '1.7',
              border: '1px solid #E5E7EB', // gray-200
              marginTop: '1rem',
              marginBottom: '1rem',
            },
            code: {
              backgroundColor: '#F3F4F6', // gray-100
              color: '#1F2937', // gray-800
              borderRadius: '0.25rem',
              padding: '0.125rem 0.375rem',
              fontWeight: '400',
              fontSize: '13px',
              '&::before': { content: 'none' },
              '&::after': { content: 'none' },
            },
            'pre code': {
              backgroundColor: 'transparent',
              borderRadius: '0',
              padding: '0',
              color: 'inherit',
              fontSize: 'inherit',
              '&::before': { content: 'none' },
              '&::after': { content: 'none' },
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
