/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app/**/*.{vue,js,ts,jsx,tsx}',
    './components/**/*.{vue,js,ts,jsx,tsx}',
    './layouts/**/*.{vue,js,ts,jsx,tsx}',
    './pages/**/*.{vue,js,ts,jsx,tsx}',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4a90e2',
        selected: '#5a9a94',
        warning: '#e6a23c',
        basebg: '#FFF5C9',
        container: '#FEBC6E',
        tagbg: '#fceb96',
      },
      borderWidth: {
        3: '3px',
      },
      maxWidth: {
        '420': '420px',
      },
    },
  },
  plugins: [],
}
