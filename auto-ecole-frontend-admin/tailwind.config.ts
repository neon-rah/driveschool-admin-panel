/** @type {import('tailwindcss').Config} */

const flowbite = require("flowbite-react/tailwind");
module.exports = {
    content: [
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {},
    },
    plugins: [
        flowbite.plugin(),
    ],
};