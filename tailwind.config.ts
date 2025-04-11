import type { Config } from "tailwindcss";
import typography from '@tailwindcss/typography';

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      screens: {
        sm: "576px",
        md: "768px",
        lg: "992px",
        xl: "1200px",
        xxl: "1400px",
        "3xl": "1600px",
        "4xl": "1800px",
      },
      colors: {
        n0: "#1D1E24",
        n30: "#EBECED",
        lightN30: "#373D4B",
        lightBg1: "#23262B",
        n100: "#7B8088",
        n200: "#6D717B",
        n300: "#5E636E",
        n400: "#525763",
        lightN400: "#C2C4C8",
        n500: "#434956",
        n700: "#262D3B",

        primaryColor: "rgb(244, 123, 32)",
        secondaryColor: "rgba(244, 123, 32, 0.8)",
        errorColor: "rgb(255, 86, 48)",
        warningColor: "rgb(255, 171, 0)",
        successColor: "rgb(34, 197, 94)",
        infoColor: "rgb(0, 184, 217)",
      },
      padding: {
        "25": "100px",
        "30": "120px",
        "15": "60px",
      },
      typography: (theme: (path: string) => string) => ({
        DEFAULT: {
          css: {
            color: theme('colors.gray.700'),
            a: {
              color: theme('colors.primaryColor'),
              '&:hover': {
                color: theme('colors.secondaryColor'),
              },
            },
            h1: {
              color: theme('colors.gray.800'),
              fontWeight: '700',
            },
            h2: {
              color: theme('colors.gray.800'),
              fontWeight: '600',
            },
            h3: {
              color: theme('colors.gray.800'),
              fontWeight: '600',
            },
            code: {
              color: theme('colors.indigo.500'),
              backgroundColor: theme('colors.gray.100'),
              padding: '0.2em 0.4em',
              borderRadius: '0.25rem',
              fontWeight: '400',
            },
          },
        },
        dark: {
          css: {
            color: theme('colors.gray.300'),
            a: {
              color: theme('colors.primaryColor'),
              '&:hover': {
                color: theme('colors.secondaryColor'),
              },
            },
            h1: {
              color: theme('colors.gray.200'),
            },
            h2: {
              color: theme('colors.gray.200'),
            },
            h3: {
              color: theme('colors.gray.200'),
            },
            code: {
              color: theme('colors.indigo.400'),
              backgroundColor: theme('colors.gray.800'),
            },
          },
        },
      }),
    },
  },
  plugins: [typography],
} satisfies Config;
