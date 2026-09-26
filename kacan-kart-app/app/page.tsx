"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import KacanKart, { CardTheme, THEME_NAMES } from "@/components/KacanKart";

// Ekran görüntülerinde kesin olarak çalışan, patlamayan ve yüklenen garanti GIF listesi
const GARANTI_GIFLER = [
  { id: "1", url: "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExOHp1eXoxbXFqbWpmc3N3ajltYjJjNHlzMWp2aDRnbnF2dyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3og0IPxX0076jQQfLy/giphy.gif" },
  { id: "2", url: "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExeWZseWNraGN3anY0bW5qczFqaHBndWhkZHl5Zm9sNHNxbXl3eGZtbyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3oKIPnAiaMCws8nOsE/giphy.gif" },
  { id: "3", url: "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExbXN2bWc5Nnh2dm1sZXp3cmh2bWN2cW1oam53Z3Zwb2d4cnJ5YiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3ohhwkKBcReYyFczX4/giphy.gif" },
  { id: "4", url: "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExZXQ2MXZrbW52N25vN2cwbDhzMHV2aGR6Y3I2ZXp1M2l5aWp5OHZkMiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0HlRnAWXxn0MhOBK/giphy.gif" },
  { id: "5", url: "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExOHN3eHhhdWExOWc3NDhwbWV5dnF2NHFkZmU5OG14bzFxbG9qamV3bm90djRreSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3oz8xLd9DJq2l2VFtu/giphy.gif" },
  { id: "6", url: "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExNTl3ZXp0OHUycW56aGhmZmVobTFqbmdxMjNmbmVtdnF5bWwzdWZvNyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3oriO0OEd9QIDdllqo/giphy.gif" },
  { id: "7", url: "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExOXV3ODg2YmR1ZnhwM3p6aXljNGprcWhuaTN1c2prY3g3YXR2cDZoeiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/26BRv0ThflsHCqDrG/giphy.gif" },
  { id: "8", url: "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExd2R4bXp3aHRwb3N6bXh2aDNubXFsdjM5dnh2bWc5Nnh2dm1sZXp3ciZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3oEjI6SIIHBdRxXI40/giphy.gif" },
  { id: "9", url: "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExY3g1aXlscDV1MXF3a2M2b29oNWc0NTV4OWV1aGhwbzFveTZobXptbiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3og0IKu5T5T57T0p1S/giphy.gif" },
  { id: "10", url: "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExaGZvdTZ1bm52bHNrZDFwcnN6Y3phcmk5bWc5Nnh2dm1sZXp3cmh2bWN2cW1oam53ZyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7TKsQ8gMsMFCAkJy/giphy.gif" },
  { id: "11", url: "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHBuajZ5YnB2NXd4NTRpZjY2aGNyMjh3eTJvZXEzdG1vYW53eDR3MCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/10WbLg5W0Y0aQM/giphy.gif" },
  { id: "12", url: "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExOWl1bnlsaW55OHY3am92NnMzazR6dTBtNjN2aW5xdTFqZnkybml3bSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7TKoWnz4vQCIbjQY/giphy.gif" },
  { id: "13", url: "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExMWk3amFqZ24wMTR4bnlsZWk4cnV3amJmOWE3Mm9tZXQ0YTR3ZWNlZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/MDJ9IbxxvDUQM/giphy.gif" },
  { id: "14", url: "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExbXpsbmYzdjV3OGF0NnRtYm16NWhsY2Rocm13YjV0cW1oam53MGV3ZyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0HlvtIPzPdt2usKs/giphy.gif" },
  { id: "15", url: "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExbnZrcW55anZ3ajZpcG5jYmp4MXZ5YThrdDNvazNqM3N5bTF3aW12cyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/26u4v38A1m9sYyU9a/giphy.gif" },
  { id: "16", url: "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExbW51anplMXB5OHZzNWVxdWhqaDNyOXR0OHQzaWhrM3N5bTF3aW12cyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7bu3hJkZ9IYaYvKM/giphy.gif" },
  { id: "17", url: "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExbzI0OWZrbXZoNnprbHNwYXJ2b3RrcjR4MnJ1anFvOHJ4cmptY2V3cyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/5vkW42Z57tYn6/giphy.gif" },
  { id: "18", url: "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExcm52Nm50bXJ0bnNsdjM5dnh2bWc5Nnh2dm1sZXp3cmh2bWN2cW1oam53ZyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/L1QnWsvHcJ7fxJUSmn/giphy.gif" },
  { id: "19", url: "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExZ2p1bWc5Nnh2dm1sZXp3cmh2bWN2cW1oam53Z3Zwb2d4cnJ5YiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3ohs4w0MAmNV3k5arC/giphy.gif" },
  { id: "20", url: "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExN3RjMWtzYnhwOGZubm5rdWd5OWw1NWJjZXJ5dGk2bmZ2cGx2OWg3bSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/YoWOI8zGZq73DMKnjN/giphy.gif" }
];

function CardContent() {
  const searchParams = useSearchParams();

  const urlUser = searchParams.get("u");
  const urlSoru = searchParams.get("s");
  const urlTheme = searchParams.get("t") as CardTheme | null;
  const urlGif = searchParams.get("gif");

  const [formStep, setFormStep] = useState<number>(urlUser || urlSoru ? 4 : 1);
  const [selectedTheme, setSelectedTheme] = useState<CardTheme>(urlTheme || "escaping");
  const [targetUsername, setTargetUsername] = useState(urlUser || "Nurullah");
  const [soru, setSoru] = useState(urlSoru || "Benimle yemeğe çıkar mısın?");
  const [yer, setYer] = useState(searchParams.get("yer") || "");
  const [tarih, setTarih] = useState(searchParams.get("tarih") || "");
  const [zaman, setZaman] = useState(searchParams.get("zaman") || "");
  const [gifUrl, setGifUrl] = useState(urlGif || GARANTI_GIFLER[0].url);
  const [copied, setCopied] = useState(false);

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

      {formStep < 4 && (
        <div className="relative z-10 w-full max-w-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl p-8 sm:p-10 rounded-[32px] text-white shadow-2xl space-y-8 my-8">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-extrabold tracking-tight">🃏 Kaçan Kart Oluştur</h2>
            <div className="flex justify-center gap-2 pt-1">
              {[1, 2, 3, 4].map((stepNum) => (
                <div
                  key={stepNum}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    formStep === stepNum
                      ? "w-10 bg-indigo-500"
                      : formStep > stepNum
                      ? "w-2.5 bg-indigo-400/50"
                      : "w-2.5 bg-slate-700"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* ADIM 1: TEMA */}
          {formStep === 1 && (
            <div className="space-y-6">
              <label className="block text-slate-300 font-medium text-base text-center">
                1. Adım: Kart Temasını Seçin
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {(Object.keys(THEME_NAMES) as CardTheme[]).map((themeKey) => (
                  <button
                    key={themeKey}
                    type="button"
                    onClick={() => setSelectedTheme(themeKey)}
                    className={`aspect-square rounded-2xl border p-5 flex flex-col items-center justify-center text-center transition cursor-pointer relative overflow-hidden ${
                      selectedTheme === themeKey
                        ? "border-indigo-500 bg-indigo-500/20 ring-2 ring-indigo-500 font-bold shadow-lg shadow-indigo-500/10"
                        : "border-slate-800 bg-slate-800/40 hover:bg-slate-800 text-slate-300"
                    }`}
                  >
                    <span className="text-4xl mb-3">🎨</span>
                    <span className="text-sm font-semibold">{THEME_NAMES[themeKey]}</span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setFormStep(2)}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 font-bold rounded-xl text-base transition shadow-lg shadow-indigo-600/30 cursor-pointer mt-4"
              >
                Devam Et: Detayları Gir ➡️
              </button>
            </div>
          )}

          {/* ADIM 2: DETAYLAR */}
          {formStep === 2 && (
            <div className="space-y-5 text-sm">
              <label className="block text-slate-300 font-medium text-base text-center mb-2">
                2. Adım: Soru ve Detaylar
              </label>
              <div>
                <label className="block text-slate-400 mb-1.5 font-medium">Hedef Kişinin Adı:</label>
                <input
                  type="text"
                  value={targetUsername}
                  onChange={(e) => setTargetUsername(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 text-sm transition"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1.5 font-medium">Sormak İstediğin Soru:</label>
                <input
                  type="text"
                  value={soru}
                  onChange={(e) => setSoru(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 text-sm transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1.5 font-medium">Yer:</label>
                  <input
                    type="text"
                    placeholder="Örn: Kadıköy"
                    value={yer}
                    onChange={(e) => setYer(e.target.value)}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-indigo-500 text-sm transition"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1.5 font-medium">Tarih:</label>
                  <input
                    type="text"
                    placeholder="Örn: Cuma"
                    value={tarih}
                    onChange={(e) => setTarih(e.target.value)}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-indigo-500 text-sm transition"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1.5 font-medium">Zaman:</label>
                  <input
                    type="text"
                    placeholder="Örn: 20:00"
                    value={zaman}
                    onChange={(e) => setZaman(e.target.value)}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-indigo-500 text-sm transition"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  onClick={() => setFormStep(1)}
                  className="w-1/3 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-sm transition cursor-pointer"
                >
                  ⬅️ Geri
                </button>
                <button
                  onClick={() => setFormStep(3)}
                  className="w-2/3 py-3.5 bg-indigo-600 hover:bg-indigo-500 font-bold rounded-xl text-sm transition shadow-lg shadow-indigo-600/30 cursor-pointer"
                >
                  Devam Et: GIF Seç ➡️
                </button>
              </div>
            </div>
          )}

          {/* ADIM 3: ÇALIŞAN GARANTİ GIFLER */}
          {formStep === 3 && (
            <div className="space-y-6">
              <label className="block text-slate-300 font-medium text-base text-center">
                3. Adım: Sorunsuz Çalışan GIF Seçin ({GARANTI_GIFLER.length} Seçenek)
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-h-80 overflow-y-auto pr-1">
                {GARANTI_GIFLER.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setGifUrl(g.url)}
                    className={`p-3 rounded-2xl border flex items-center justify-center transition cursor-pointer aspect-square ${
                      gifUrl === g.url
                        ? "border-indigo-500 bg-indigo-500/20 ring-2 ring-indigo-500 shadow-lg shadow-indigo-500/20"
                        : "border-slate-800 bg-slate-800/50 hover:bg-slate-800"
                    }`}
                  >
                    <img
                      src={g.url}
                      alt=""
                      className="w-full h-full rounded-xl object-contain bg-slate-950 pointer-events-none"
                    />
                  </button>
                ))}
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  onClick={() => setFormStep(2)}
                  className="w-1/3 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-sm transition cursor-pointer"
                >
                  ⬅️ Geri
                </button>
                <button
                  onClick={() => setFormStep(4)}
                  className="w-2/3 py-3.5 bg-indigo-600 hover:bg-indigo-500 font-bold rounded-xl text-sm transition shadow-lg shadow-indigo-600/30 cursor-pointer"
                >
                  Önizle & Paylaş 🚀
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ADIM 4: ÖNİZLEME */}
      {formStep === 4 && (
        <div className="w-full max-w-2xl flex flex-col items-center gap-6 my-6 z-10">
          <div className="w-full bg-slate-900/90 border border-slate-800 backdrop-blur-xl p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-white shadow-xl">
            <button
              onClick={() => setFormStep(3)}
              className="w-full sm:w-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              ✏️ Düzenlemeye Dön
            </button>
            <button
              onClick={handleCopyLink}
              className={`w-full sm:w-auto px-6 py-3 font-bold rounded-xl text-xs transition cursor-pointer shadow-lg ${
                copied
                  ? "bg-emerald-600 text-white shadow-emerald-600/30"
                  : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30"
              }`}
            >
              {copied ? "✅ Link Kopyalandı!" : "🔗 Bağlantıyı Kopyala & Paylaş"}
            </button>
          </div>

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