// /** @type {import('tailwindcss').Config} */
// module.exports = {
//   content: ["./src/**/*.{html,js,jsx}", "./index.html"],
//   theme: {
//     extend: {},
//   },
//   plugins: [],
// };
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,jsx}", "./index.html"],
  theme: {
    extend: {
      colors: {
        primary: "#f97316",           // orange
        "primary-foreground": "#fff",
        foreground: "#1f2937",
        "muted-foreground": "#6b7280",
        border: "#e5e7eb",
        background: "#fff",
        card: "#fff",
        "content-bg": "#f3f4f6",     // light grey
        accent: "#f97316",
      },
      boxShadow: {
        row: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
      },
    },
  },
  plugins: [],
};