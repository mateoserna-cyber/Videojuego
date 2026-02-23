import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const apiKey = process.env.ZAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ZAI_API_KEY no configurada en Vercel" }, { status: 500 });
  }
  try {
    const body = await req.json();
    const r = await fetch("https://open.bigmodel.cn/api/paas/v4/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });
    const data = await r.json();
    if (!r.ok) {
      console.error("Z.AI error:", data);
      return NextResponse.json({ error: data.error?.message || "Error Z.AI", detail: data }, { status: r.status });
    }
    return NextResponse.json(data);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("verify route error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
