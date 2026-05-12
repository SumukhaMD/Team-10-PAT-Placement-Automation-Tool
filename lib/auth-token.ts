export type TokenClaims = {
  userId?: string | number
  email?: string
  name?: string
  role?: string
  exp?: number
}

export function decodeToken(token: string | null): TokenClaims | null {
  if (!token) return null

  try {
    const [, payload] = token.split(".")
    if (!payload) return null

    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/")
    return JSON.parse(Buffer.from(normalizedPayload, "base64").toString("utf8")) as TokenClaims
  } catch {
    return null
  }
}
