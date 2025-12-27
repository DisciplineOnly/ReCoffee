/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                serif: ['Playfair Display', 'serif'],
            },
            colors: {
                'brand-primary': '#BF2645',
                'brand-secondary': '#017DC7',
                'brand-accent': '#9B5440',
            }
        },
    },
    plugins: [],
}
