import type { Config } from 'tailwindcss'

const config: Config = {
    content: [
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './lib/**/*.{js,ts,jsx,tsx,mdx}',
        './hooks/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#f97316',
                    hover: '#ea6c0a',
                    light: '#fff7ed',
                    dark: '#c2510a',
                },
                brand: {
                    base: '#0f1117',
                    surface: '#1a1d27',
                    elevated: '#22263a',
                    input: '#1e2130',
                    border: '#2e3347',
                    strong: '#404666',
                },
            },
            fontFamily: {
                sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
            },
            boxShadow: {
                'glow': '0 0 24px rgba(249,115,22,0.25)',
            },
        },
    },
    plugins: [],
}

export default config
