import type { Metadata } from "next"
import "@fontsource-variable/google-sans-flex/wght.css"
import "./globals.css"

export const metadata: Metadata = {
  title: "AMISTAD",
  description: "Local dashboard for saved Amistad job searches.",
}

const themeScript = `
  (() => {
    const storedTheme = window.localStorage.getItem("amistad-theme");
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const theme = storedTheme === "dark" || storedTheme === "light" ? storedTheme : systemTheme;
    document.documentElement.dataset.theme = theme;
  })();
`

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  )
}
