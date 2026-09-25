"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import KacanKart, { CardTheme, THEME_NAMES } from "@/components/KacanKart";

// Doğrudan çalışan güvenilir GIF listesi
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

  // URL Parametreleri
  const urlUser = searchParams.get("u");
  const urlSoru = searchParams.get("s");
  const urlTheme = searchParams.get("t") as CardTheme | null;
  const urlGif = searchParams.get("gif");

  // Form Aşamaları (1: Tema, 2: Detaylar, 3: GIF, 4: Önizleme & Paylaş)
  const [formStep, setFormStep] = useState<number>(urlUser || urlSoru ? 4 : 1);

  // Form Verileri
  const [selectedTheme, setSelectedTheme] = useState<CardTheme>(urlTheme || "escaping");
  const [targetUsername, setTargetUsername] = useState(urlUser || "Nurullah");
  const [soru, setSoru] = useState(urlSoru || "Benimle yemeğe çıkar mısın?");
  const [yer, setYer] = useState(searchParams.get("yer") || "");
  const [tarih, setTarih] = useState(searchParams.get("tarih") || "");
  const [zaman, setZaman] = useState(searchParams.get("zaman") || "");
  const [gifUrl, setGifUrl] = useState(urlGif || POPULER_GIFLER[0].url);
  const [copied, setCopied] = useState(false);

  // Paylaşım Linki Oluşturma
  const generateShareUrl = () => {
    if (typeof window === "undefined") return "";
    const params = new URLSearchParams();
    if (targetUsername) params.set("u", targetUsername);
    if (soru) params.set("s", soru);
    if (selectedTheme) params.set("t", selectedTheme);
    if (gifUrl) params.set("gif", gifUrl);
    if (yer) params.set("yer", yer);
    if (tarih) params.set("tarih", tarih);
    if (zaman) params.set("zaman", zaman);

    return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  };

  const handleCopyLink = () => {
    const link = generateShareUrl();
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* ADIM 1, 2 VE 3 İÇİN KONTROL FORMU */}
      {formStep < 4 && (
        <div className="relative z-10 w-full max-w-lg bg-slate-900/90 border border-slate-800 backdrop-blur-xl p-6 sm:p-8 rounded-[28px] text-white shadow-2xl space-y-6 my-8">
          {/* Başlık ve Adım Göstergesi */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">🃏 Kaçan Kart Oluştur</h2>
            <div className="flex justify-center gap-2 pt-2">
              {[1, 2, 3, 4].map((stepNum) => (
                <div
                  key={stepNum}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    formStep === stepNum
                      ? "w-8 bg-indigo-500"
                      : formStep > stepNum
                      ? "w-2 bg-indigo-400/50"
                      : "w-2 bg-slate-700"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* ADIM 1: TEMA SEÇİMİ (KARE KARTLAR) */}
          {formStep === 1 && (
            <div className="space-y-4">
              <label className="block text-slate-300 font-medium text-sm text-center">
                1. Adım: Kart Temasını Seçin
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(Object.keys(THEME_NAMES) as CardTheme[]).map((themeKey) => (
                  <button
                    key={themeKey}
                    type="button"
                    onClick={() => setSelectedTheme(themeKey)}
                    className={`aspect-square rounded-2xl border p-4 flex flex-col items-center justify-center text-center transition cursor-pointer relative overflow-hidden ${
                      selectedTheme === themeKey
                        ? "border-indigo-500 bg-indigo-500/20 ring-2 ring-indigo-500 font-bold"
                        : "border-slate-800 bg-slate-800/40 hover:bg-slate-800 text-slate-300"
                    }`}
                  >
                    <span className="text-3xl mb-2">🎨</span>
                    <span className="text-xs font-semibold">{THEME_NAMES[themeKey]}</span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setFormStep(2)}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 font-bold rounded-xl text-sm transition shadow-lg shadow-indigo-600/30 cursor-pointer mt-4"
              >
                Devam Et: Detayları Gir ➡️
              </button>
            </div>
          )}

          {/* ADIM 2: MANUEL DETAYLAR */}
          {formStep === 2 && (
            <div className="space-y-4 text-xs">
              <label className="block text-slate-300 font-medium text-sm text-center mb-2">
                2. Adım: Soru ve Detaylar
              </label>
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

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Yer:</label>
                  <input
                    type="text"
                    placeholder="Örn: Kadıköy"
                    value={yer}
                    onChange={(e) => setYer(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Tarih:</label>
                  <input
                    type="text"
                    placeholder="Örn: Cuma"
                    value={tarih}
                    onChange={(e) => setTarih(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Zaman:</label>
                  <input
                    type="text"
                    placeholder="Örn: 20:00"
                    value={zaman}
                    onChange={(e) => setZaman(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setFormStep(1)}
                  className="w-1/3 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-sm transition cursor-pointer"
                >
                  ⬅️ Geri
                </button>
                <button
                  onClick={() => setFormStep(3)}
                  className="w-2/3 py-3 bg-indigo-600 hover:bg-indigo-500 font-bold rounded-xl text-sm transition shadow-lg shadow-indigo-600/30 cursor-pointer"
                >
                  Devam Et: GIF Seç ➡️
                </button>
              </div>
            </div>
          )}

          {/* ADIM 3: GIF SEÇİMİ */}
          {formStep === 3 && (
            <div className="space-y-4">
              <label className="block text-slate-300 font-medium text-sm text-center">
                3. Adım: GIF Seçin
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
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

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setFormStep(2)}
                  className="w-1/3 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-sm transition cursor-pointer"
                >
                  ⬅️ Geri
                </button>
                <button
                  onClick={() => setFormStep(4)}
                  className="w-2/3 py-3 bg-indigo-600 hover:bg-indigo-500 font-bold rounded-xl text-sm transition shadow-lg shadow-indigo-600/30 cursor-pointer"
                >
                  Önizle & Paylaş 🚀
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ADIM 4: DOĞRUDAN CANLI ÖNİZLEME VEYA PAYLAŞIM EKRANI */}
      {formStep === 4 && (
        <div className="w-full max-w-xl flex flex-col items-center gap-6 my-6 z-10">
          {/* Üst Paylaşım Barı */}
          <div className="w-full bg-slate-900/90 border border-slate-800 backdrop-blur-xl p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-white shadow-xl">
            <button
              onClick={() => setFormStep(3)}
              className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              ✏️ Düzenlemeye Dön
            </button>
            <button
              onClick={handleCopyLink}
              className={`w-full sm:w-auto px-6 py-2.5 font-bold rounded-xl text-xs transition cursor-pointer shadow-lg ${
                copied
                  ? "bg-emerald-600 text-white shadow-emerald-600/30"
                  : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30"
              }`}
            >
              {copied ? "✅ Link Kopyalandı!" : "🔗 Bağlantıyı Kopyala & Paylaş"}
            </button>
          </div>

          {/* Canlı Kart Bileşeni */}
          <div className="w-full flex justify-center">
            <KacanKart
              targetUsername={targetUsername}
              soru={soru}
              evetMetni={searchParams.get("e") || "Evet!"}
              hayirMetni={searchParams.get("h") || "Hayır"}
              gifUrl={gifUrl}
              theme={selectedTheme}
            />
          </div>
        </div>
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