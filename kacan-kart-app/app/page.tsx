"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import KacanKart, { CardTheme, THEME_NAMES } from "@/components/KacanKart";

// i.giphy.com doğrudan CDN bağlantılarıyla güncellenmiş GIF listesi
const POPULER_GIFLER = [
  { id: "1", name: "Sevimli Kedi 🐱", url: "https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3kzeXlybmJ3cGZzcG1mczlyN2M4bHJnYnl0bmt2Z3J1N3Uzb3lyaiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Lq0h93752f6J9tijrh/giphy.gif" },
  { id: "2", name: "Yalvaran Kedi 🥺", url: "https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHhhZms2ZjdrNnVpMmdhdTdwMnV0YXFlMHFyZHpvanlyOHB6dmRwZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/C831xsVq4JHNRqK33G/giphy.gif" },
  { id: "3", name: "Çiçek / Ayı 🌹", url: "https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExZndjNTRsdjI2cnQybndxeWNndmFnMG9tNG1wbDRlczNmNDVpdTVscSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/MDJ9IbxxvDUQM/giphy.gif" },
  { id: "4", name: "Dans Eden Kedi 🎉", url: "https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExMXZzaGsyand5cWN0dXlsNXNudGNhdGJmcnJicDVtdzRleGszc2FseSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/blSTtZehjAZ8I/giphy.gif" },
  { id: "5", name: "Kalp Sevgi 💖", url: "https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExbmRwY3Q5bjE4dHV0aWFjZmZ2NWszMWhocnhucWpsNmd5NWtsZDNxbCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/gDgte7IeEXyow/giphy.gif" },
  { id: "6", name: "Mutlu Ayı 🐻", url: "https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExZmsydWp5bnhpdWZuaHZvZzlyajd1ZXB0NnYza3A1dzRqNGtrNm14OSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/4Zo41lhzKt6iZ8xff9/giphy.gif" },
  { id: "7", name: "Kahve Keyfi ☕", url: "https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExaG45a3RneXZnZTNtd2g2OTNrMHpneHQwbGkzbTlzazhrODlrbGNxOSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/h3466M30mG73a/giphy.gif" },
  { id: "8", name: "Evet / Onay 👍", url: "https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExdWRmMG41b212amRyaXZiOTc0azM1cXAxdXByYzI2NzgxeGk3ZGlqdiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/g9582DNuQppxC/giphy.gif" },
  { id: "9", name: "Komik Kedi 😾", url: "https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExbDVqbm53bjcxdTFoNG4zaXlraWV5eTZ0MnIzeHZubzdtcmFscDRhdiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/CoDp6NnSmItoY/giphy.gif" },
  { id: "10", name: "Zafer Dansı 🕺", url: "https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExNmNudTFjZnphbXB3MGU4OWRkeTBndjZreTNodndocWNwbms2bnhpZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l3vRlT2k2L35Cnn5C/giphy.gif" },
];

function CardContent() {
  const searchParams = useSearchParams();

  // URL'den parametre çekme
  const urlUser = searchParams.get("u");
  const urlSoru = searchParams.get("s");
  const urlTheme = searchParams.get("t") as CardTheme | null;
  const urlGif = searchParams.get("gif");

  // Form Durumları
  const [step, setStep] = useState<"form" | "card">(
    urlUser || urlSoru ? "card" : "form"
  );
  const [targetUsername, setTargetUsername] = useState(urlUser || "Nurullah");
  const [soru, setSoru] = useState(urlSoru || "Benimle yemeğe çıkar mısın?");
  const [evetMetni, setEvetMetni] = useState(searchParams.get("e") || "Evet!");
  const [hayirMetni, setHayirMetni] = useState(searchParams.get("h") || "Hayır");
  const [selectedTheme, setSelectedTheme] = useState<CardTheme>(
    urlTheme || "escaping"
  );
  const [gifUrl, setGifUrl] = useState(urlGif || POPULER_GIFLER[0].url);

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

      {step === "form" ? (
        /* --- KART OLUŞTURMA FORMU & TEMA SEÇİMİ --- */
        <div className="relative z-10 w-full max-w-lg bg-slate-900/90 border border-slate-800 backdrop-blur-xl p-6 sm:p-8 rounded-[28px] text-white shadow-2xl space-y-5 my-8">
          <h2 className="text-xl font-bold text-center">🃏 Kaçan Kart Oluştur</h2>

          <div className="space-y-4 text-xs">
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

            {/* --- GIF SEÇİM ALANI --- */}
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Soru Üstü GIF Seçimi:</label>
              <div className="grid grid-cols-2 gap-2 mb-2 max-h-56 overflow-y-auto pr-1">
                {POPULER_GIFLER.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setGifUrl(g.url)}
                    className={`p-2 rounded-xl border text-left flex items-center gap-2 transition cursor-pointer ${
                      gifUrl === g.url
                        ? "border-indigo-500 bg-indigo-500/20 font-bold ring-1 ring-indigo-500"
                        : "border-slate-800 bg-slate-800/50 hover:bg-slate-800 text-slate-300"
                    }`}
                  >
                    <img
                      src={g.url}
                      alt={g.name}
                      className="w-10 h-10 rounded-lg object-contain bg-slate-950 flex-shrink-0"
                    />
                    <span className="truncate text-[11px]">{g.name}</span>
                  </button>
                ))}
              </div>
              
              <input
                type="url"
                placeholder="Veya özel GIF bağlantısı (URL) yapıştırın..."
                value={gifUrl}
                onChange={(e) => setGifUrl(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-[11px] focus:outline-none focus:border-indigo-500 transition"
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
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 font-bold rounded-xl text-sm transition shadow-lg shadow-indigo-600/30 cursor-pointer"
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
          gifUrl={gifUrl}
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