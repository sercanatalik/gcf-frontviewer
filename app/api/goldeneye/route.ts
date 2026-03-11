import { NextRequest, NextResponse } from "next/server"

const GOLDENEYE_BASE =
  process.env.GOLDENEYE_URL || "http://goldeneye:3000"

export async function GET(request: NextRequest) {
  const tradeId = request.nextUrl.searchParams.get("tradeId")

  if (!tradeId) {
    return NextResponse.json(
      { error: "tradeId query parameter is required" },
      { status: 400 },
    )
  }

  if (!/^[a-zA-Z0-9_\-]+$/.test(tradeId)) {
    return NextResponse.json(
      { error: "Invalid tradeId" },
      { status: 400 },
    )
  }

  const VALID_MODELS = ["gem", "qml", "ucon"]
  const model = request.nextUrl.searchParams.get("model") || "gem"
  if (!VALID_MODELS.includes(model)) {
    return NextResponse.json(
      { error: `Invalid model. Must be one of: ${VALID_MODELS.join(", ")}` },
      { status: 400 },
    )
  }

  try {
    const res = await fetch(
      `${GOLDENEYE_BASE}/v2/trades?tradeid=${encodeURIComponent(tradeId)}&model=${model}`,
      { signal: AbortSignal.timeout(15_000) },
    )

    if (!res.ok) {
      return NextResponse.json(
        { error: `Goldeneye returned ${res.status}` },
        { status: res.status },
      )
    }

    const data = await res.json()

    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, max-age=30, s-maxage=30" },
    })
  } catch (error) {
    console.error("Goldeneye fetch error:", error)
    const message =
      error instanceof Error && error.name === "TimeoutError"
        ? "Goldeneye request timed out"
        : "Failed to reach Goldeneye"
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
