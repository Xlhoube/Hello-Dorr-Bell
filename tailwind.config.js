/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Se necessário, as cores base já foram injetadas nos componentes Tailwind
            }
        },
    },
    plugins: [],
}
