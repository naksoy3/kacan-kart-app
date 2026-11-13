import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

type CardRecord = {
  id?: string;
  soru?: unknown;
  question?: unknown;
  from_username?: unknown;
  creator_name?: unknown;
  target_username?: unknown;
};

type SupabaseWebhookPayload = {
  type?: string;
  schema?: string;
  table?: string;
  record?: CardRecord | null;
};

function safeText(value: unknown, fallback: string) {
  if (typeof value !== "string") return fallback;
  const normalized = value.trim();
  return normalized ? normalized.slice(0, 1500) : fallback;
}

function matchesSecret(provided: string, expected: string) {
  const providedHash = createHash("sha256").update(provided).digest();
  const expectedHash = createHash("sha256").update(expected).digest();
  return timingSafeEqual(providedHash, expectedHash);
}

export async function POST(request: Request) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET;

  if (!botToken || !chatId || !webhookSecret) {
    return NextResponse.json({ error: "Telegram ayarları eksik" }, { status: 500 });
  }

  const authorization = request.headers.get("authorization") || "";
  const providedSecret = authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : request.headers.get("x-webhook-secret") || "";

  if (!matchesSecret(providedSecret, webhookSecret)) {
    return NextResponse.json({ error: "Yetkisiz istek" }, { status: 401 });
  }

  try {
    const payload = await request.json() as SupabaseWebhookPayload;
    if (
      (payload.type && payload.type !== "INSERT") ||
      (payload.schema && payload.schema !== "public") ||
      (payload.table && payload.table !== "cards")
    ) {
      return NextResponse.json({ error: "Desteklenmeyen webhook olayı" }, { status: 400 });
    }

    const newRecord = payload.record;
    if (!newRecord || typeof newRecord !== "object") {
      return NextResponse.json({ error: "Kart kaydı bulunamadı" }, { status: 400 });
    }

    const question = safeText(newRecord.soru ?? newRecord.question, "Belirtilmemiş");
    const creator = safeText(newRecord.from_username ?? newRecord.creator_name, "Anonim");
    const target = safeText(newRecord.target_username, "Belirtilmemiş");
    const message = `🚀 Yeni Kart Oluşturuldu!\n\nSoru: ${question}\nYapan: ${creator}\nHedef: ${target}`;

    let telegramResponse: Response;
    try {
      telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text: message }),
        cache: "no-store",
      });
    } catch {
      return NextResponse.json({ error: "Telegram sunucusuna ulaşılamadı" }, { status: 502 });
    }

    const telegramResult = await telegramResponse.json().catch(() => null) as { ok?: boolean } | null;
    if (!telegramResponse.ok || !telegramResult?.ok) {
      return NextResponse.json({ error: "Telegram mesajı gönderilemedi" }, { status: 502 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: "Webhook isteği işlenemedi" }, { status: 400 });
  }
}
