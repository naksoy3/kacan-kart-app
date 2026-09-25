"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import KacanKart, { CardTheme, THEME_NAMES } from "@/components/KacanKart";

function CardContent() {
  const searchParams = useSearchParams();

  // URL'den parametre gelip gelmediğini kontrol et
  const urlUser = searchParams.get("u");
  const urlSoru = searchParams.get("s");
  const urlTheme = searchParams.get("t") as CardTheme | null;

  // Form Durumları (Hazır link yoksa kullanıcının dolduracağı alanlar)
  const [step, setStep] = useState<"form" | "card">(urlUser || urlSoru ? "card" : "form");
  const [targetUsername, setTargetUsername] = useState(urlUser || "Nurullah");
  const [soru, setSoru] = useState(urlSoru || "Benimle yemeğe çıkar mısın?");
  const [evetMetni, setEvetMetni] = useState(searchParams.get("e") || "Evet!");
  const [hayirMetni, setHayirMetni] = useState(searchParams.get("h") || "Hayır");
  const [selectedTheme, setSelectedTheme] = useState<CardTheme>(urlTheme || "escaping");

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

      {step === "form" ? (
        /* --- KART OLUŞTURMA FORMU & TEMA SEÇİMİ --- */
        <div className="relative z-10 w-full max-w-lg bg-slate-900/90 border border-slate-800 backdrop-blur-xl p-6 sm:p-8 rounded-[28px] text-white shadow-2xl space-y-5">
          <h2 className="text-xl font-bold text-center">🃏 Kaçan Kart Oluştur</h2>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Hedef Kişinin Adı:</label>
              <input
                type="text"
                value={targetUsername}
                onChange={(e) => setTargetUsername(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Sormak İstediğin Soru:</label>
              <input
                type="text"
                value={soru}
                onChange={(e) => setSoru(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Tema Seçimi:</label>
              <select
                value={selectedTheme}
                onChange={(e) => setSelectedTheme(e.target.value as CardTheme)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              >
                {Object.entries(THEME_NAMES).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={() => setStep("card")}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 font-bold rounded-xl text-sm transition shadow-lg shadow-indigo-600/30"
          >
            Kartı Önizle & Önizlemeye Geç ✨
          </button>
        </div>
      ) : (
        /* --- KART ÖNİZLEME & CANLI KART --- */
        <KacanKart
          targetUsername={targetUsername}
          soru={soru}
          evetMetni={evetMetni}
          hayirMetni={hayirMetni}
          theme={selectedTheme}
          onBack={() => setStep("form")}
        />
      )}
    </main>
  );
}

export default function CardPage() {
  return (
    <Suspense fallback={<div className="text-white text-center">Yükleniyor...</div>}>
      <CardContent />
    </Suspense>
  );
}