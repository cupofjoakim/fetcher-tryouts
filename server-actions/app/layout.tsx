import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Todo App - Server Actions",
  description: "Todo app using Next.js Server Actions",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
