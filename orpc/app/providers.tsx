"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState, createContext, useContext, useMemo } from "react"
import { createClient, createORPCUtils, type ORPCUtils } from "@/lib/orpc/client"

const ORPCContext = createContext<ORPCUtils | null>(null)

export function useORPC() {
  const ctx = useContext(ORPCContext)
  if (!ctx) throw new Error("useORPC must be used within Providers")
  return ctx
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())
  const orpc = useMemo(() => {
    const client = createClient()
    return createORPCUtils(client)
  }, [])

  return (
    <ORPCContext.Provider value={orpc}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ORPCContext.Provider>
  )
}
