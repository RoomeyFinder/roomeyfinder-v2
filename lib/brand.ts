export const brand = {
  name: "RoomeyFinder",
  url: "https://roomeyfinder.com",
  description:
    "Discover the best roommate matching service to find your perfect shared accommodation. Start your roommate search today.",
  colors: {
    white: {
      main: "#FFFFFF",
      100: "#F1F1F1",
      200: "#F4F4F4",
      300: "#F8F8F8",
      400: "#F9F9F9",
      500: "#EEEEEE",
      600: "#E5E5E5",
    },
    brand: {
      main: "#3A86FF",
      500: "#3A86FF",
      10: "#3A86FF1A",
      25: "#3A86FF40",
      50: "#3A86FF80",
      100: "#5DB8EA",
    },
    green: {
      main: "#009A49",
      50: "#49C3A733",
      100: "#49C3A7",
    },
    red: {
      main: "#FE251B",
      50: "#FF00004D",
    },
    gray: {
      main: "#707070",
      100: "#A1A1A1",
      200: "#D9D9D9",
      300: "#5C5F62",
    },
    black: {
      500: "#222222",
    },
  },
  fontFamily:
    'Proxima Nova, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
  breakpoints: {
    sm: "40em",
    md: "62em",
    lg: "74em",
    xl: "100em",
    "2xl": "120em",
  },
  radii: {
    button: "1rem",
    input: "1.2rem",
  },
} as const;
