"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import KacanKart, { CardTheme, THEME_NAMES } from "@/components/KacanKart";
import AuthModal from "@/components/AuthModal";
import { supabase } from "@/utils/supabase";

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
];

function CardContent() {
  const searchParams = useSearchParams();
  const urlCardId = searchParams.get("id");

  // Eğer URL'de sadece ?id=... varsa bu net bir şekilde hedef kişinin açtığı paylaşımlı sayfadır.
  const isSharedView = Boolean(urlCardId);

  const [formStep, setFormStep] = useState<number>(isSharedView ? 4 : 1);
  const [selectedTheme, setSelectedTheme] = useState<CardTheme>("escaping");
  
  const [targetUsername, setTargetUsername] = useState("");
  const [fromUsername, setFromUsername] = useState("");
  
  const [soru, setSoru] = useState("Benimle yemeğe çıkar mısın?");
  const [yer, setYer] = useState("");
  const [tarih, setTarih] = useState("");
  const [zaman, setZaman] = useState("");
  const [gifUrl, setGifUrl] = useState(KOMIK_GIFLER[0].url);
  const [copied, setCopied] = useState(false);
  const [cardId, setCardId] = useState<string | null>(urlCardId);
  const [cardStatus, setCardStatus] = useState<string>("pending");

  const [user, setUser] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Paylaşılan linkteki ID ile kart bilgilerini veritabanından çekiyoruz
  useEffect(() => {
    async function fetchCard() {
      if (urlCardId) {
        const { data, error } = await supabase
          .from("cards")
          .select("*")
          .eq("id", urlCardId)
          .single();

        if (data && !error) {
          setTargetUsername(data.target_username || "");
          setFromUsername(data.from_username || "");
          setSoru(data.soru);
          setSelectedTheme(data.theme as CardTheme);
          setGifUrl(data.gif_url);
          if (data.yer) setYer(data.yer);
          if (data.tarih) setTarih(data.tarih);
          if (data.zaman) setZaman(data.zaman);
          setCardStatus(data.status);
        }
      }
    }
    fetchCard();
  }, [urlCardId]);

  const handleProceedToPreview = async () => {
    const { data, error } = await supabase
      .from("cards")
      .insert([
        {
          user_id: user ? user.id : null,
          from_username: fromUsername,
          target_username: targetUsername,
          soru,
          theme: selectedTheme,
          gif_url: gifUrl,
          yer,
          tarih,
          zaman,
          status: "pending",
        },
      ])
      .select()
      .single();

    if (error) {
      alert("Kart kaydedilirken bir hata oluştu: " + error.message);
      return;
    }

    if (data) {
      setCardId(data.id);
    }

    setFormStep(4);
  };

  // Paylaşım linki artık sadece güvenli ve temiz bir şekilde ?id=... içerecek
  const generateShareUrl = () => {
    if (typeof window === "undefined") return "";
    if (!cardId) return window.location.origin;
    return `${window.location.origin}/?id=${cardId}`;
  };

  const handleCopyLink = () => {
    const link = generateShareUrl();
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAcceptResponse = async () => {
    if (urlCardId) {
      await supabase
        .from("cards")
        .update({ status: "accepted" })
        .eq("id", urlCardId);
      setCardStatus("accepted");
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* SAĞ ÜST KÖŞE GİRİŞ / KULLANICI ALANI */}
      <div className="absolute top-5 right-5 z-20 flex items-center gap-3">
        {user ? (
          <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 backdrop-blur-md px-4 py-2 rounded-2xl text-white text-xs shadow-lg">
            <span className="text-slate-300 font-medium">{user.email}</span>
            <button
              onClick={() => supabase.auth.signOut()}
              className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/40 text-rose-400 font-bold rounded-xl transition cursor-pointer"
            >
              Çıkış
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl text-xs transition shadow-lg shadow-indigo-600/30 cursor-pointer"
          >
            Giriş Yap / Kayıt Ol
          </button>
        )}
      </div>

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
                    placeholder="Örn: Adın"
                    value={fromUsername}
                    onChange={(e) => setFromUsername(e.target.value)}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 text-sm transition"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1.5 font-medium">Hedef Kişinin Adı:</label>
                  <input
                    type="text"
                    placeholder="Örn: Onun Adı"
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
                  placeholder="Örn: Benimle yemeğe çıkar mısın?"
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
                {KOMIK_GIFLER.map((g) => (
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
                  onClick={handleProceedToPreview}
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
          {/* YALNIZCA KARTI OLUŞTURAN KİŞİ İÇİN (isSharedView false iken): Bağlantıyı Kopyala butonu */}
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

          {/* YALNIZCA KARTI ALAN HEDEF KİŞİ İÇİN (isSharedView true iken): Sadece "Sen de Kendi Kartını Oluştur" */}
          {isSharedView && (
            <div className="w-full bg-slate-900/90 border border-slate-800 backdrop-blur-xl p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-white shadow-xl">
              <span className="text-xs text-slate-300">💌 Bu soru sana özel olarak gönderildi!</span>
              <a
                href={window.location.origin}
                className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 font-bold rounded-xl text-xs transition shadow-lg shadow-indigo-600/30 text-center cursor-pointer"
              >
                ✨ Sen de Kendi Kartını Oluştur
              </a>
            </div>
          )}

          {cardStatus === "accepted" && (
            <div className="w-full bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl text-emerald-400 text-center text-sm font-bold shadow-xl">
              🎉 Harika! Bu karta zaten &quot;Evet&quot; denildi ve gönderene bildirildi!
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
              evetMetni="Evet!"
              hayirMetni="Hayır"
              gifUrl={gifUrl}
              theme={selectedTheme}
              onAccept={handleAcceptResponse}
            />
          </div>
        </div>
      )}

      {/* Auth Modal Bileşeni */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          setFormStep(4);
        }}
      />
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