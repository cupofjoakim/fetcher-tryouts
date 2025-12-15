import type { Metadata } from "next"
import { Providers } from "./providers"

export const metadata: Metadata = {
  title: "Todo App - Raw Fetch",
  description: "Todo app using raw fetch and TanStack Query",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
