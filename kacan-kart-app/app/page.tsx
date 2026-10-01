"use client";

import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import KacanKart, { CardTheme, THEME_NAMES } from "@/components/KacanKart";
import { supabase } from "@/utils/supabase";

const LocationPicker = dynamic(() => import("@/components/LocationPicker"), {
  ssr: false,
  loading: () => <div className="h-64 animate-pulse rounded-xl border border-slate-700 bg-slate-800" />,
});

// Local SVG expressions based on the supplied illustration set; 10 expressions x 5 palettes.
const emojiSvg = (expression: number, palette: number) => {
  const colors = [
    ["#FFD93D", "#FF9F1C"], ["#FF6B6B", "#EE5253"], ["#6BCB77", "#4D96FF"],
    ["#A66CFF", "#845EC2"], ["#FF9EAA", "#FF6F91"],
  ][palette];
  const face = [
    '<path d="M26 40 Q35 30 44 40 M56 40 Q65 30 74 40" fill="none" stroke="#2b2b2b" stroke-width="4" stroke-linecap="round"/><path d="M30 65 Q50 85 70 65" fill="#2b2b2b"/>',
    '<circle cx="35" cy="42" r="6" fill="#2b2b2b"/><path d="M58 42 Q65 36 72 42" fill="none" stroke="#2b2b2b" stroke-width="4" stroke-linecap="round"/><path d="M30 60 Q50 75 70 60" fill="#2b2b2b"/>',
    '<path d="M35 38 C24 28 16 42 35 55 L50 64 L65 55 C84 42 76 28 65 38 L50 48 Z" fill="#ff3366"/><path d="M35 70 Q50 78 65 70" fill="none" stroke="#2b2b2b" stroke-width="3"/>',
    '<path d="M26 40 Q35 30 44 40 M56 40 Q65 30 74 40" fill="none" stroke="#2b2b2b" stroke-width="4"/><path d="M30 60 Q50 70 70 60 L55 78 Q50 82 45 78 Z" fill="#ff3366"/>',
    '<circle cx="35" cy="42" r="8" fill="#2b2b2b"/><circle cx="65" cy="42" r="8" fill="#2b2b2b"/><circle cx="37" cy="40" r="2.5" fill="#fff"/><circle cx="67" cy="40" r="2.5" fill="#fff"/><circle cx="50" cy="65" r="8" fill="#2b2b2b"/>',
    '<rect x="22" y="34" width="24" height="14" rx="4" fill="#111"/><rect x="54" y="34" width="24" height="14" rx="4" fill="#111"/><path d="M46 40 H54 M30 65 Q50 75 70 65" fill="none" stroke="#2b2b2b" stroke-width="4"/>',
    '<path d="M28 42 Q35 37 42 42 M58 42 Q65 37 72 42" fill="none" stroke="#2b2b2b" stroke-width="4"/><path d="M45 65 Q50 72 55 65 Q50 70 45 65" fill="#2b2b2b"/>',
    '<circle cx="35" cy="42" r="7" fill="none" stroke="#2b2b2b" stroke-width="3"/><circle cx="35" cy="42" r="3" fill="#2b2b2b"/><circle cx="65" cy="42" r="7" fill="none" stroke="#2b2b2b" stroke-width="3"/><circle cx="65" cy="42" r="3" fill="#2b2b2b"/><path d="M35 68 Q50 60 65 68" fill="none" stroke="#2b2b2b" stroke-width="3"/>',
    '<path d="M8 0 L10 7 18 7 12 11 14 19 8 14 2 19 4 11 -2 7 6 7 Z" fill="#FFD700" transform="translate(27 33)"/><path d="M8 0 L10 7 18 7 12 11 14 19 8 14 2 19 4 11 -2 7 6 7 Z" fill="#FFD700" transform="translate(57 33)"/><path d="M35 65 Q50 75 65 65" fill="none" stroke="#2b2b2b" stroke-width="3"/>',
    '<path d="M28 43 Q35 46 42 43 M58 43 Q65 46 72 43" fill="none" stroke="#2b2b2b" stroke-width="4"/><path d="M35 68 Q50 65 65 68" fill="none" stroke="#2b2b2b" stroke-width="3"/>',
  ][expression];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${colors[0]}"/><stop offset="1" stop-color="${colors[1]}"/></linearGradient></defs><circle cx="50" cy="50" r="46" fill="url(#g)" stroke="#00000022" stroke-width="2"/><g>${face}</g></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

const ESKI_GIFLER = [
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

const YENI_SVG_GIFLER = Array.from({ length: 50 }, (_, index) => ({
  id: `svg-${index + 1}`,
  url: emojiSvg(index % 10, Math.floor(index / 10)),
}));

const KOMIK_GIFLER = [...ESKI_GIFLER, ...YENI_SVG_GIFLER];

function CardContent() {
  const searchParams = useSearchParams();

  const urlCardId = searchParams.get("id");
  const urlUser = searchParams.get("u");
  const urlFrom = searchParams.get("f") || searchParams.get("sender") || searchParams.get("gonderen");
  const urlSoru = searchParams.get("s");
  const urlTheme = searchParams.get("t") as CardTheme | null;
  const urlGif = searchParams.get("gif");

  const isSharedView = Boolean(urlCardId || urlUser || urlSoru);

  const urlStep = Number(searchParams.get("step"));
  const initialStep = !isSharedView && urlStep >= 1 && urlStep <= 4 ? urlStep : 1;
  const [formStep, setFormStep] = useState<number>(isSharedView ? 4 : initialStep);
  const [selectedTheme, setSelectedTheme] = useState<CardTheme>(urlTheme || "escaping");
  
  const [targetUsername, setTargetUsername] = useState(urlUser || "");
  const [fromUsername, setFromUsername] = useState(urlFrom || "");
  
  const [soru, setSoru] = useState(urlSoru || "Benimle yemeğe çıkar mısın?");
  const [yer, setYer] = useState(searchParams.get("yer") || searchParams.get("mekan") || "");
  const [tarih, setTarih] = useState(searchParams.get("tarih") || "");
  const [tarihISO, setTarihISO] = useState(() => {
    const value = searchParams.get("tarih") || "";
    return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : "";
  });
  const [zaman, setZaman] = useState(searchParams.get("zaman") || searchParams.get("saat") || "");
  const [zamanISO, setZamanISO] = useState(() => {
    const value = searchParams.get("zaman") || searchParams.get("saat") || "";
    return /^\d{2}:\d{2}$/.test(value) ? value : "";
  });
  const [gifUrl, setGifUrl] = useState(urlGif || KOMIK_GIFLER[0].url);
  const [copied, setCopied] = useState(false);
  const [cardId, setCardId] = useState<string | null>(urlCardId);
  const [cardStatus, setCardStatus] = useState<string>("pending");
  const [loadingCard, setLoadingCard] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // Auth States
  const [user, setUser] = useState<any>(null);

  const goToStep = (step: number) => {
    if (isSharedView) return;

    const params = new URLSearchParams(window.location.search);
    if (step === 1) {
      params.delete("step");
    } else {
      params.set("step", String(step));
    }

    const query = params.toString();
    window.history.pushState(
      { step },
      "",
      `${window.location.pathname}${query ? `?${query}` : ""}`
    );
    setFormStep(step);
  };

  useEffect(() => {
    if (isSharedView) return;

    const handlePopState = () => {
      const step = Number(new URLSearchParams(window.location.search).get("step"));
      setFormStep(step >= 1 && step <= 4 ? step : 1);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isSharedView]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const sessionUser = session?.user ?? null;
      setUser(sessionUser);
      if (!isSharedView && sessionUser) {
        setFromUsername(
          sessionUser.user_metadata?.full_name ||
          sessionUser.user_metadata?.username ||
          ""
        );
      }
    }).finally(() => setAuthLoading(false));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!isSharedView && session?.user) {
        setFromUsername(
          session.user.user_metadata?.full_name ||
          session.user.user_metadata?.username ||
          ""
        );
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Paylaşılan linkte cardId varsa veritabanından çek
  useEffect(() => {
    async function fetchCard() {
      if (urlCardId) {
        setLoadingCard(true);
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
        setLoadingCard(false);
      }
    }
    fetchCard();
  }, [urlCardId]);

  const [kirikGifIdleri, setKirikGifIdleri] = useState<string[]>([]);
  const gosterilecekGifler = KOMIK_GIFLER.filter((g) => !kirikGifIdleri.includes(g.id));

  const handleGifError = (id: string) => {
    setKirikGifIdleri((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const handleProceedToPreview = async () => {
    if (previewLoading) return;
    setPreviewLoading(true);
    setPreviewError(null);

    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      const activeSession = sessionData.session;
      const activeUser = activeSession?.user || user;
      if (!activeUser || !activeSession?.access_token) {
        setPreviewError("Kart oluşturmak ve bildirim alabilmek için önce profil oluşturup giriş yapmalısın.");
        return;
      }
      setUser(activeUser);

      if (!cardId) {
        const response = await fetch("/api/cards", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${activeSession.access_token}`,
          },
          body: JSON.stringify({
            from_username: fromUsername,
            target_username: targetUsername,
            soru,
            theme: selectedTheme,
            gif_url: gifUrl,
            yer,
            tarih,
            zaman,
          }),
        });
        const responseText = await response.text();
        let result: { id?: string; error?: string };
        try {
          result = JSON.parse(responseText);
        } catch {
          result = { error: responseText.slice(0, 400) || "Sunucudan boş yanıt geldi." };
        }
        if (!response.ok) {
          setPreviewError(`Kart kaydedilemedi, kısa paylaşım bağlantısı oluşturulamadı: ${result.error || response.statusText}`);
          return;
        }
        if (!result.id) {
          setPreviewError(`Kart kaydedildi yanıtı geçersiz: ${result.error || "Kart kimliği alınamadı."}`);
          return;
        }
        setCardId(result.id);
      }

      goToStep(4);
    } catch (error) {
      setPreviewError(`Kart kaydı başarısız: ${error instanceof Error ? error.message : "Beklenmeyen hata"}`);
    } finally {
      setPreviewLoading(false);
    }
  };

  // URL'ye mekan ve saat parametrelerini de güvenli şekilde ekledik
  const generateShareUrl = () => {
    if (typeof window === "undefined") return "";
    if (cardId) {
      return `${window.location.origin}/k/card/${encodeURIComponent(cardId)}`;
    }
    return "";
  };

  const handleCopyLink = () => {
    const link = generateShareUrl();
    if (!link) {
      setPreviewError("Kısa paylaşım linki oluşturulamadı. Kartı tekrar kaydetmeyi dene.");
      return;
    }
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAcceptResponse = async () => {
    if (urlCardId) {
      const { error: updateError } = await supabase
        .from("cards")
        .update({ status: "accepted" })
        .eq("id", urlCardId);

      if (!updateError) {
        const { error: notificationError } = await supabase.rpc("notify_card_accepted", { p_card_id: urlCardId });
        if (notificationError) {
          console.error("Bildirim oluşturulamadı:", notificationError.message);
        }
      }
      setCardStatus("accepted");
    }
  };

  if (loadingCard) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <p className="animate-pulse text-lg">Kart yükleniyor...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

      {!isSharedView && formStep < 4 && (
        <div className="relative z-10 w-full max-w-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl p-8 sm:p-10 rounded-[32px] text-white shadow-2xl space-y-8 my-8">
          <div className="text-center space-y-3">
            <h2 className="flex items-center justify-center gap-3 text-3xl font-extrabold tracking-tight">
              <img src="/icon.png" alt="Cardasks" className="h-9 w-9 rounded-lg object-cover" />
              <span>Soru Oluştur</span>
            </h2>
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
                onClick={() => goToStep(2)}
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
                    placeholder="Profil adın"
                    value={fromUsername}
                    readOnly
                    className="w-full cursor-not-allowed rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 text-slate-300 outline-none text-sm"
                  />
                  <p className="mt-1 text-[11px] text-slate-500">Gönderici adı profilinden alınır.</p>
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

              <div>
                <label className="mb-1.5 block font-medium text-slate-400">Buluşma konumu:</label>
                <LocationPicker value={yer} onChange={setYer} />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-slate-400 mb-1.5 font-medium">Tarih:</label>
                  <input
                    type="date"
                    value={tarihISO}
                    onChange={(event) => {
                      const value = event.target.value;
                      setTarihISO(value);
                      if (!value) {
                        setTarih("");
                        return;
                      }
                      const [year, month, day] = value.split("-").map(Number);
                      const selectedDate = new Date(year, month - 1, day);
                      setTarih(selectedDate.toLocaleDateString("tr-TR", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      }));
                    }}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-indigo-500 text-sm transition"
                  />
                  {tarih && <p className="mt-1.5 text-[11px] capitalize text-indigo-300">{tarih}</p>}
                </div>
                <div>
                  <label className="block text-slate-400 mb-1.5 font-medium">Zaman:</label>
                  <div className="flex items-center gap-2">
                    <select
                      aria-label="Saat"
                      value={zamanISO ? zamanISO.split(":")[0] : ""}
                      onChange={(event) => {
                        const minutes = zamanISO ? zamanISO.split(":")[1] : "00";
                        const value = event.target.value ? `${event.target.value}:${minutes}` : "";
                        setZamanISO(value);
                        setZaman(value);
                      }}
                      className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2.5 text-sm text-white outline-none transition focus:border-indigo-500"
                    >
                      <option value="">Saat</option>
                      {Array.from({ length: 24 }, (_, hour) => String(hour).padStart(2, "0")).map((hour) => (
                        <option key={hour} value={hour}>{hour}</option>
                      ))}
                    </select>
                    <span className="text-slate-400">:</span>
                    <select
                      aria-label="Dakika"
                      value={zamanISO ? zamanISO.split(":")[1] : ""}
                      onChange={(event) => {
                        const hour = zamanISO ? zamanISO.split(":")[0] : "00";
                        const value = event.target.value ? `${hour}:${event.target.value}` : "";
                        setZamanISO(value);
                        setZaman(value);
                      }}
                      className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2.5 text-sm text-white outline-none transition focus:border-indigo-500"
                    >
                      <option value="">Dakika</option>
                      {Array.from({ length: 60 }, (_, minute) => String(minute).padStart(2, "0")).map((minute) => (
                        <option key={minute} value={minute}>{minute}</option>
                      ))}
                    </select>
                  </div>
                  {zamanISO && <p className="mt-1.5 text-[11px] text-indigo-300">Seçilen saat: {zamanISO}</p>}
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  onClick={() => goToStep(1)}
                  className="w-1/3 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-sm transition cursor-pointer"
                >
                  ⬅️ Geri
                </button>
                <button
                  onClick={() => goToStep(3)}
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
                  onClick={() => goToStep(2)}
                  className="w-1/3 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-sm transition cursor-pointer"
                >
                  ⬅️ Geri
                </button>
                <button
                  onClick={handleProceedToPreview}
                  disabled={previewLoading}
                  className="w-2/3 py-3.5 bg-indigo-600 hover:bg-indigo-500 font-bold rounded-xl text-sm transition shadow-lg shadow-indigo-600/30 cursor-pointer disabled:opacity-50"
                >
                  {previewLoading ? "Hazırlanıyor..." : "Önizle & Paylaş 🚀"}
                </button>
              </div>
              {previewError && (
                <p className="mt-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-center text-xs text-rose-300">
                  {previewError}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ADIM 4: ÖNİZLEME VEYA PAYLAŞILAN KİŞİNİN EKRANI */}
      {(formStep === 4 || isSharedView) && (
        <div className="w-full max-w-2xl flex flex-col items-center gap-6 my-6 z-10">
          {!isSharedView && (
            <div className="w-full bg-slate-900/90 border border-slate-800 backdrop-blur-xl p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-white shadow-xl">
              <button
                onClick={() => goToStep(3)}
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

          {cardStatus === "accepted" && (
            <div className="w-full bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl text-emerald-400 text-center text-sm font-bold shadow-xl">
              🎉 Harika! Bu karta zaten &quot;Evet&quot; denildi ve gönderene bildirildi!
            </div>
          )}

          {previewError && !isSharedView && (
            <p className="w-full rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-center text-xs text-amber-300">
              {previewError}
            </p>
          )}

          <div className="w-full flex flex-col items-center gap-2">
            {fromUsername && targetUsername && (
              <p className="text-indigo-300 font-bold text-base sm:text-lg tracking-wide text-center">
                ✨ {fromUsername}, {targetUsername}&apos;ye soruyor:
              </p>
            )}
            
            {/* Mekan, tarih, saat hem yer/zaman hem mekan/saat parametreleriyle garantiye alındı */}
            <KacanKart
              targetUsername={targetUsername}
              sender={fromUsername}
              soru={soru}
              evetMetni={searchParams.get("e") || "Evet!"}
              hayirMetni={searchParams.get("h") || "Hayır"}
              gifUrl={gifUrl}
              theme={selectedTheme}
              shareUrl={cardId ? `/k/card/${encodeURIComponent(cardId)}` : undefined}
              mekan={yer || searchParams.get("mekan") || searchParams.get("yer") || ""}
              tarih={tarih || searchParams.get("tarih") || ""}
              saat={zaman || searchParams.get("saat") || searchParams.get("zaman") || ""}
              showShareButton={!isSharedView}
              onAccept={handleAcceptResponse}
            />
          </div>
        </div>
      )}

    </main>
  );
}

export default function CardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Yükleniyor...</div>}>
      <CardContent />
    </Suspense>
  );
}