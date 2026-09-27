"use client";

import { useSearchParams } from "next/navigation";
import KacanKart from "@/components/KacanKart";

export default function HomePage() {
  const searchParams = useSearchParams();

  // URL'den parametreleri çekiyoruz
  const targetUsername = searchParams.get("u") || "Nurullah";
  const sender = searchParams.get("sender") || searchParams.get("gonderen") || "Gönderen";
  const soru = searchParams.get("s") || "Benimle yemeğe çıkar mısın?";
  const evetMetni = searchParams.get("e") || "Evet!";
  const hayirMetni = searchParams.get("h") || "Hayır";
  const gifUrl = searchParams.get("gif") || undefined;
  const theme = (searchParams.get("t") as any) || "escaping";
  
  // Yer, Zaman ve Tarih parametreleri
  const mekan = searchParams.get("mekan") || searchParams.get("yer") || undefined;
  const tarih = searchParams.get("tarih") || undefined;
  const saat = searchParams.get("saat") || searchParams.get("zaman") || undefined;

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <KacanKart
        targetUsername={targetUsername}
        sender={sender}
        soru={soru}
        evetMetni={evetMetni}
        hayirMetni={hayirMetni}
        gifUrl={gifUrl}
        theme={theme}
        mekan={mekan}
        tarih={tarih}
        saat={saat}
      />
    </main>
  );
}