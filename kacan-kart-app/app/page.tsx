"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import KacanKart, { CardTheme, THEME_NAMES } from "@/components/KacanKart";

// Gerçek, doğrulanmış Giphy ID'leri
const KOMIK_GIFLER = [
  { id: "1", url: "https://media.giphy.com/media/cFdHXXm5GhJsc/giphy.gif" },
  { id: "2", url: "https://media.giphy.com/media/5JjLO6t0lNvLq/giphy.gif" },
  { id: "3", url: "https://media.giphy.com/media/ZmdIZ8K4fKEEM/giphy.gif" },
  { id: "4", url: "https://media.giphy.com/media/lKXEBR8m1jWso/giphy.gif" },
  { id: "5", url: "https://media.giphy.com/media/PjplWH49v1FS0/giphy.gif" },
  { id: "6", url: "https://media.giphy.com/media/SyVyFtBTTVb5m/giphy.gif" },
  { id: "7", url: "https://media.giphy.com/media/LWqQ5glpSMjny/giphy.gif" },
  { id: "8", url: "https://media.giphy.com/media/l396Dat26yQOdfWgw/giphy.gif" },
  { id: "9", url: "https://media.giphy.com/media/zetsDd1oSNd96/giphy.gif" },
  { id: "10", url: "https://media.giphy.com/media/F6PFPjc3K0CPe/giphy.gif" },
  { id: "11", url: "https://media.giphy.com/media/L0GJP0ZxdnVbW/giphy.gif" },
  { id: "12", url: "https://media.giphy.com/media/26ufbLWPFHkhwXcpW/giphy.gif" },
  { id: "13", url: "https://media.giphy.com/media/r3jTnU6iEwpbO/giphy.gif" },
  { id: "14", url: "https://media.giphy.com/media/6Xbr4pVmJW4wM/giphy.gif" },
  { id: "15", url: "https://media.giphy.com/media/FPmzkXGFVhp2U/giphy.gif" },
  { id: "16", url: "https://media.giphy.com/media/p3yU7Rno2PvvW/giphy.gif" },
  { id: "17", url: "https://media.giphy.com/media/vbBmb51klyyB2/giphy.gif" },
  { id: "18", url: "https://media.giphy.com/media/ZAfpXz6fGrlYY/giphy.gif" },
  { id: "19", url: "https://media.giphy.com/media/3oGRFvVyUdGBZeQiAw/giphy.gif" },
  { id: "20", url: "https://media.giphy.com/media/NJbeypFZCHj2g/giphy.gif" },
  { id: "21", url: "https://media.giphy.com/media/WpNO2ZXjhJ85y/giphy.gif" },
  { id: "22", url: "https://media.giphy.com/media/xaw15bdmMEkgg/giphy.gif" },
  { id: "23", url: "https://media.giphy.com/media/tLwQSHQo6hjTa/giphy.gif" },
  { id: "24", url: "https://media.giphy.com/media/3dcoLqDDjd9pC/giphy.gif" },
  { id: "25", url: "https://media.giphy.com/media/QFfs8ubyDkluo/giphy.gif" },
  { id: "26", url: "https://media.giphy.com/media/10hYVVSPrSpZS0/giphy.gif" },
  { id: "27", url: "https://media.giphy.com/media/EYJz9cfMa7WAU/giphy.gif" },
  { id: "28", url: "https://media.giphy.com/media/Q21vzIHyTtmaQ/giphy.gif" },
  { id: "29", url: "https://media.giphy.com/media/pzmUOeqhzJTck/giphy.gif" },
  { id: "30", url: "https://media.giphy.com/media/G6kt1Gb4Luxy0/giphy.gif" },
  { id: "31", url: "https://media.giphy.com/media/13wjHxAz6B6E9i/giphy.gif" },
  { id: "32", url: "https://media.giphy.com/media/ANbbM3IzH9Tna/giphy.gif" },
  { id: "33", url: "https://media.giphy.com/media/EQ5I7NF4BDYA/giphy.gif" },
  { id: "34", url: "https://media.giphy.com/media/L7gHewOS8GOWY/giphy.gif" },
  { id: "35", url: "https://media.giphy.com/media/nO16UrmQh7khW/giphy.gif" },
  { id: "36", url: "https://media.giphy.com/media/eGuk6gQM3Q29W/giphy.gif" },
  { id: "37", url: "https://media.giphy.com/media/8dpPMMlxmDEJO/giphy.gif" },
  { id: "38", url: "https://media.giphy.com/media/5ox090BjCB8ME/giphy.gif" },
  { id: "39", url: "https://media.giphy.com/media/Hzm8c1eMSq3CM/giphy.gif" },
  { id: "40", url: "https://media.giphy.com/media/2APlzZshLu3LO/giphy.gif" },
  { id: "41", url: "https://media.giphy.com/media/dgygjvNe7jckw/giphy.gif" },
  { id: "42", url: "https://media.giphy.com/media/5g0mypSSPupO0/giphy.gif" },
  { id: "43", url: "https://media.giphy.com/media/10JmxORlA6dEFW/giphy.gif" },
  { id: "44", url: "https://media.giphy.com/media/FjfMN9MwuqvJe/giphy.gif" },
  { id: "45", url: "https://media.giphy.com/media/l0ExpaDR2IOTB2dAQ/giphy.gif" },
  { id: "46", url: "https://media.giphy.com/media/GGJcBeeYN4q2I/giphy.gif" },
  { id: "47", url: "https://media.giphy.com/media/Fml0fgAxVx1eM/giphy.gif" },
  { id: "48", url: "https://media.giphy.com/media/1ofR3QioNy264/giphy.gif" },
  { id: "49", url: "https://media.giphy.com/media/KyWQ96Lu2QCRi/giphy.gif" },
  { id: "50", url: "https://media.giphy.com/media/ToMjGpKniGqRNLGBrhu/giphy.gif" },
  { id: "51", url: "https://media.giphy.com/media/tcGxgQGmE2d2w/giphy.gif" },
  { id: "52", url: "https://media.giphy.com/media/MIkhb8isTV2uc/giphy.gif" },
  { id: "53", url: "https://media.giphy.com/media/AmK9GILSa4zsI/giphy.gif" },
  { id: "54", url: "https://media.giphy.com/media/SeHUUxzIsCga4/giphy.gif" },
  { id: "55", url: "https://media.giphy.com/media/118O4ZJYDByaoE/giphy.gif" },
  { id: "56", url: "https://media.giphy.com/media/29jhb6s7LjWUg/giphy.gif" },
  { id: "57", url: "https://media.giphy.com/media/EvWx1BeeRyyJi/giphy.gif" },
  { id: "58", url: "https://media.giphy.com/media/13uDde6AxxDW5G/giphy.gif" },
  { id: "59", url: "https://media.giphy.com/media/vxbSchlbqBIis/giphy.gif" },
  { id: "60", url: "https://media.giphy.com/media/oaWZcKvDo8JBS/giphy.gif" },
  { id: "61", url: "https://media.giphy.com/media/kmzID1Fn7MSOY/giphy.gif" },
  { id: "62", url: "https://media.giphy.com/media/qEpDaeeyIiNMI/giphy.gif" },
  { id: "63", url: "https://media.giphy.com/media/143AbsYXyOK2ME/giphy.gif" },
  { id: "64", url: "https://media.giphy.com/media/qygzgFH2BXmhi/giphy.gif" },
  { id: "65", url: "https://media.giphy.com/media/DliKKjgkxmQo0/giphy.gif" },
  { id: "66", url: "https://media.giphy.com/media/D7Qzw12q9s8Tu/giphy.gif" },
  { id: "67", url: "https://media.giphy.com/media/jAe22Ec5iICCk/giphy.gif" },
  { id: "68", url: "https://media.giphy.com/media/iOS6z7r6ZhZOE/giphy.gif" },
  { id: "69", url: "https://media.giphy.com/media/ciqSxn4GaWlHO/giphy.gif" },
  { id: "70", url: "https://media.giphy.com/media/f4E0TH9flrfuE/giphy.gif" },
];

function CardContent() {
  const searchParams = useSearchParams();

  const urlUser = searchParams.get("u");
  const urlFrom = searchParams.get("f");
  const urlSoru = searchParams.get("s");
  const urlTheme = searchParams.get("t") as CardTheme | null;
  const urlGif = searchParams.get("gif");

  const isSharedView = Boolean(urlUser || urlSoru);

  const [formStep, setFormStep] = useState<number>(isSharedView ? 4 : 1);
  const [selectedTheme, setSelectedTheme] = useState<CardTheme>(urlTheme || "escaping");
  const [targetUsername, setTargetUsername] = useState(urlUser || "Nisa");
  const [fromUsername, setFromUsername] = useState(urlFrom || "Nurullah");
  const [soru, setSoru] = useState(urlSoru || "Benimle yemeğe çıkar mısın?");
  const [yer, setYer] = useState(searchParams.get("yer") || "");
  const [tarih, setTarih] = useState(searchParams.get("tarih") || "");
  const [zaman, setZaman] = useState(searchParams.get("zaman") || "");
  const [gifUrl, setGifUrl] = useState(urlGif || KOMIK_GIFLER[0].url);
  const [copied, setCopied] = useState(false);

  const [kirikGifIdleri, setKirikGifIdleri] = useState<string[]>([]);
  const gosterilecekGifler = KOMIK_GIFLER.filter((g) => !kirikGifIdleri.includes(g.id));

  const handleGifError = (id: string) => {
    setKirikGifIdleri((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const generateShareUrl = () => {
    if (typeof window === "undefined") return "";
    const params = new URLSearchParams();
    if (targetUsername) params.set("u", targetUsername);
    if (fromUsername) params.set("f", fromUsername);
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

      {!isSharedView && formStep < 4 && (
        <div className="relative z-10 w-full max-w-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl p-8 sm:p-10 rounded-[32px] text-white shadow-2xl space-y-8 my-8">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-extrabold tracking-tight">🃏 Soru Oluştur</h2>
            <div className="flex justify-center gap-2 pt-1">
              {[1, 2, 3].map((stepNum) => (
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1.5 font-medium">Gönderen Kişinin Adı:</label>
                  <input
                    type="text"
                    value={fromUsername}
                    onChange={(e) => setFromUsername(e.target.value)}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 text-sm transition"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1.5 font-medium">Hedef Kişinin Adı:</label>
                  <input
                    type="text"
                    value={targetUsername}
                    onChange={(e) => setTargetUsername(e.target.value)}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 text-sm transition"
                  />
                </div>
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

          {/* ADIM 3: KOMİK GIFLER */}
          {formStep === 3 && (
            <div className="space-y-6">
              <label className="block text-slate-300 font-medium text-base text-center">
                3. Adım: Bir GIF Seçin
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-h-80 overflow-y-auto pr-1">
                {gosterilecekGifler.map((g) => (
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
                      loading="lazy"
                      onError={() => handleGifError(g.id)}
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

      {/* ADIM 4: ÖNİZLEME VEYA PAYLAŞILAN KİŞİNİN EKRANI */}
      {(formStep === 4 || isSharedView) && (
        <div className="w-full max-w-2xl flex flex-col items-center gap-6 my-6 z-10">
          {/* Kartı oluşturan kişi kendi önizlemesindeyse link kopyalama paneli görünür. */}
          {!isSharedView && (
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
          )}

          {/* Hedef kişi linke tıkladığında, bu kartı değiştiremez ama anasayfaya dönüp kendi kartını oluşturabilir */}
          {isSharedView && (
            <div className="w-full bg-slate-900/90 border border-slate-800 backdrop-blur-xl p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-white shadow-xl">
              <span className="text-xs text-slate-300">💌 Bu soru sana özel olarak gönderildi!</span>
              <a
                href={window.location.pathname}
                className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 font-bold rounded-xl text-xs transition shadow-lg shadow-indigo-600/30 text-center cursor-pointer"
              >
                ✨ Sen de Kendi Kartını Oluştur
              </a>
            </div>
          )}

          <div className="w-full flex flex-col items-center gap-2">
            {fromUsername && targetUsername && (
              <p className="text-indigo-400 font-bold text-sm tracking-wide">
                ✨ {fromUsername}, {targetUsername}&apos;ye soruyor:
              </p>
            )}
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