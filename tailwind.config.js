/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Override text colors to ensure they're black
        primary: '#000000',
        secondary: '#000000',
        accent: '#f8f8f8',
        muted: '#000000',
        'muted-foreground': '#000000',
        
        // Input colors
        input: '#000000',
        'input-border': '#000000',
        
        // Foreground colors for various states
        foreground: '#000000',
        'primary-foreground': '#000000',
        'secondary-foreground': '#000000',
        'accent-foreground': '#000000',
        'destructive-foreground': '#000000',
        
        // Form colors
        label: '#000000',
        ring: '#000000',
      },
      textColor: {
        DEFAULT: '#000000',
        primary: '#000000',
        secondary: '#000000',
        muted: '#000000',
        accent: '#000000',
      },
    },
  },
  plugins: [],
}; 