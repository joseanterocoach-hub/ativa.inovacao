import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redis, TERR_KEY } from "@/lib/redis";

// GET — buscar todos os territórios
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  try {
    const data = await redis.get(TERR_KEY);
    return NextResponse.json(data || {});
  } catch (e) {
    return NextResponse.json({});
  }
}

// POST — salvar territórios (payload completo)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  try {
    const body = await req.json();
    await redis.set(TERR_KEY, body);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Erro ao salvar" }, { status: 500 });
  }
}
