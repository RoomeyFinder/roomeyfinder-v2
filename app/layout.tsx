import type { Metadata } from "next";
import type { Viewport } from "next";
import localFont from "next/font/local";
import { ThemeProvider } from "next-themes";
import { brand } from "@/lib/brand";
import { InterestRealtimeProvider } from "@/components/interest-realtime-provider";
import { ToastProvider } from "@/components/toast-provider";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(brand.url),
  title: "Find a Roommate | Roommate Finder for Students & Professionals",
  description: brand.description,
  keywords:
    "roommate, living situation, housing, accommodation, room, finder, room finder, roomie, roomey, room, nigeria, apartment, flatmate, housemate, shared living, student housing, professional housing, rental, affordable housing, roommate matching, house sharing, flat sharing, co-living, shared apartment, shared room, rental listings, accommodation search, housing search, roommate wanted, room for rent, shared home",
  robots: "index, follow",
  icons: [
    { url: "/favicon.ico", sizes: "64x64" },
    { url: "/icon.ico", sizes: "64x64" },
  ],
  openGraph: {
    title: "Find a Roommate | RoomeyFinder - Nigeria's #1 Roommate Matching Service",
    description: "We make finding your perfect living situation one less hassle.",
    url: brand.url,
    siteName: brand.name,
    images: [
      {
        url: "/images/logo.png",
        width: 364,
        height: 357,
        alt: "RoomeyFinder Logo",
      },
    ],
    locale: "en_NG",
    alternateLocale: ["en_US"],
    type: "website",
  },
  twitter: {
    title: "RoomeyFinder",
    description: "We make finding your perfect living situation one less hassle.",
    site: "roomeyfinder",
    creator: "exploitenomah",
    images: ["/images/logo.png"],
  },
  verification: {
    google: "CMjgKjsziclrkIOp9eyalVvYqfl5uOQ4IxOsEvkbI5M",
  },
  alternates: {
    canonical: brand.url,
    languages: {
      "en-NG": brand.url,
      "en-US": `${brand.url}/us`,
    },
  },
};

export const viewport: Viewport = {
  themeColor: brand.colors.black[500],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

const proximaNova = localFont({
  src: "./ProximaNova.otf",
  variable: "--font-proxima-nova",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${proximaNova.className} ${proximaNova.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <InterestRealtimeProvider>
            {children}
            <ToastProvider />
          </InterestRealtimeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
