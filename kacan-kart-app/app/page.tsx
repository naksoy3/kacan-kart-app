"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState, useMemo } from "react";
import KacanKart, { CardTheme } from "@/components/KacanKart";

function CardContent() {
  const searchParams = useSearchParams();

  // URL'den dinamik parametreleri oku (Varsayılan değerlerle birlikte)
  const targetUsername = searchParams.get("u") || "Nurullah";
  const soru = searchParams.get("s") || "Benimle yemeğe çıkar mısın?";
  const evetMetni = searchParams.get("e") || "Evet!";
  const hayirMetni = searchParams.get("h") || "Hayır";
  const themeParam = (searchParams.get("t") as CardTheme) || "escaping";
  const gifUrl = searchParams.get("gif") || undefined;

  const [selectedTheme, setSelectedTheme] = useState<CardTheme>(themeParam);

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Arka plan süslemeleri */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

      <KacanKart
        targetUsername={targetUsername}
        soru={soru}
        evetMetni={evetMetni}
        hayirMetni={hayirMetni}
        gifUrl={gifUrl}
        theme={selectedTheme}
      />
    </main>
  );
}

export default function CardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white text-sm">
          Kart Yükleniyor... ✨
        </div>
      }
    >
      <CardContent />
    </Suspense>
  );
}