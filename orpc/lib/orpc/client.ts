import { createORPCClient } from "@orpc/client"
import { RPCLink } from "@orpc/client/fetch"
import { createTanstackQueryUtils } from "@orpc/tanstack-query"
import type { RouterClient } from "@orpc/server"
import type { Router } from "./router"

export type Client = RouterClient<Router>

export function createClient(): Client {
  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/rpc`
      : "http://localhost:3000/rpc"

  const link = new RPCLink({ url })
  return createORPCClient<Client>(link)
}

export function createORPCUtils(client: Client) {
  return createTanstackQueryUtils(client)
}

export type ORPCUtils = ReturnType<typeof createORPCUtils>
