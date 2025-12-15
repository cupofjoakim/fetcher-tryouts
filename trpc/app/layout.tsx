import type { Metadata } from "next"
import { Providers } from "./providers"

export const metadata: Metadata = {
  title: "Todo App - tRPC",
  description: "Todo app using tRPC and TanStack Query",
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
