export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const authorization = request.headers.get("authorization");

  if (!supabaseUrl || !anonKey) {
    return Response.json({ error: "Supabase yapılandırması eksik." }, { status: 500 });
  }

  if (!authorization?.startsWith("Bearer ")) {
    return Response.json({ error: "Kart oluşturmak için giriş yapmalısın." }, { status: 401 });
  }

  try {
    const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { apikey: anonKey, Authorization: authorization },
      cache: "no-store",
    });
    if (!userResponse.ok) {
      return Response.json({ error: "Oturum doğrulanamadı. Çıkış yapıp yeniden giriş yap." }, { status: 401 });
    }

    const user = await userResponse.json();
    const input = await request.json();
    const card = {
      user_id: user.id,
      from_username: String(input.from_username || user.user_metadata?.full_name || user.user_metadata?.username || ""),
      target_username: String(input.target_username || ""),
      soru: String(input.soru || ""),
      theme: String(input.theme || "escaping"),
      gif_url: String(input.gif_url || ""),
      yer: input.yer ? String(input.yer) : null,
      tarih: input.tarih ? String(input.tarih) : null,
      zaman: input.zaman ? String(input.zaman) : null,
      status: "pending",
    };

    if (!card.from_username || !card.target_username || !card.soru || !card.gif_url) {
      return Response.json({ error: "Kart için gerekli alanlar eksik." }, { status: 400 });
    }

    const insertResponse = await fetch(`${supabaseUrl}/rest/v1/cards?select=id`, {
      method: "POST",
      headers: {
        apikey: anonKey,
        Authorization: authorization,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(card),
      cache: "no-store",
    });

    const responseText = await insertResponse.text();
    if (!insertResponse.ok) {
      return Response.json(
        { error: `Kart veritabanına kaydedilemedi (${insertResponse.status}): ${responseText}` },
        { status: insertResponse.status }
      );
    }

    const rows = JSON.parse(responseText) as Array<{ id: string }>;
    if (!rows[0]?.id) {
      return Response.json({ error: "Kart kaydedildi ancak kimliği alınamadı." }, { status: 502 });
    }

    return Response.json({ id: rows[0].id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bilinmeyen sunucu hatası";
    return Response.json({ error: `Kart kayıt isteği başarısız: ${message}` }, { status: 502 });
  }
}
