"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import KacanKart, { CardTheme, THEME_NAMES } from "@/components/KacanKart";
import AuthModal from "@/components/AuthModal";
import { supabase } from "@/utils/supabase";

// Wikimedia Commons'tan lisansı doğrulanabilen komik ve açık lisanslı GIF'ler.
const KOMIK_GIFLER = [
  { id: "101", url: "https://upload.wikimedia.org/wikipedia/commons/6/6d/Do_not_be_a_Richard.gif" },
  { id: "102", url: "https://upload.wikimedia.org/wikipedia/commons/0/02/Nord2.gif" },
  { id: "103", url: "https://upload.wikimedia.org/wikipedia/commons/0/04/Ramsau-extra%2BF16.gif" },
  { id: "104", url: "https://upload.wikimedia.org/wikipedia/commons/8/87/Papaj.gif" },
  { id: "105", url: "https://upload.wikimedia.org/wikipedia/commons/5/5c/Pie_in_the_face.gif" },
  { id: "106", url: "https://upload.wikimedia.org/wikipedia/commons/2/23/SphericalCow2.gif" },
  { id: "107", url: "https://upload.wikimedia.org/wikipedia/commons/f/fd/Wikiswing.gif" },
  { id: "108", url: "https://upload.wikimedia.org/wikipedia/commons/8/8f/ZitronenErdBaer_02.gif" },
  { id: "109", url: "https://upload.wikimedia.org/wikipedia/commons/1/13/Animated_Awesome_Face_smiley.gif" },
  { id: "110", url: "https://upload.wikimedia.org/wikipedia/commons/5/54/Animated_GIF_from_the_1906_HPFF_by_Blackton.gif" },
  { id: "111", url: "https://upload.wikimedia.org/wikipedia/commons/8/81/Cat_funny_gif.gif" },
  { id: "112", url: "https://upload.wikimedia.org/wikipedia/commons/e/ec/Lichess_funny.gif" },
  { id: "113", url: "https://upload.wikimedia.org/wikipedia/commons/f/f6/Lichess_funny_II.gif" },
  { id: "114", url: "https://upload.wikimedia.org/wikipedia/commons/2/2d/American_cube.gif" },
  { id: "115", url: "https://upload.wikimedia.org/wikipedia/commons/6/6c/Bouncywikilogo.gif" },
  { id: "116", url: "https://upload.wikimedia.org/wikipedia/commons/9/98/New-Bouncywikilogo.gif" },
  { id: "117", url: "https://upload.wikimedia.org/wikipedia/commons/8/8c/Logo_de_Chever%C3%ADsimo.gif" },
  { id: "118", url: "https://upload.wikimedia.org/wikipedia/commons/4/4c/Jimmy_Wales_Wikipedia_Donation_Follow-up_-_%22Donated_yet%3F_...._Just_checking...%22.gif" },
  { id: "119", url: "https://upload.wikimedia.org/wikipedia/commons/e/ee/Ambigram-8-eight-math-2-1-5-rotation-mirror-high-resolution.gif" },
  { id: "120", url: "https://upload.wikimedia.org/wikipedia/commons/2/2a/The_Malice_of_Humor_-_Are_These_Things_Really_Funny%3F_If_Not%2C_Why_Do_We_Laugh_At_Them%3F.gif" },
  { id: "121", url: "https://upload.wikimedia.org/wikipedia/commons/a/ae/Art_Cinema.gif" },
  { id: "122", url: "https://upload.wikimedia.org/wikipedia/commons/a/a6/Fred_Ott_Sneeze_1894_remastered.gif" },
  { id: "123", url: "https://upload.wikimedia.org/wikipedia/commons/1/1b/Call-cuckoo.gif" },
  { id: "124", url: "https://upload.wikimedia.org/wikipedia/commons/8/8e/Wild_and_woolly.gif" },
  { id: "125", url: "https://upload.wikimedia.org/wikipedia/commons/2/2b/Sex_madness.gif" },
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
  const [zaman, setZaman] = useState(searchParams.get("zaman") || searchParams.get("saat") || "");
  const [gifUrl, setGifUrl] = useState(urlGif || KOMIK_GIFLER[0].url);
  const [copied, setCopied] = useState(false);
  const [cardId, setCardId] = useState<string | null>(urlCardId);
  const [cardStatus, setCardStatus] = useState<string>("pending");
  const [loadingCard, setLoadingCard] = useState<boolean>(false);

  // Auth States
  const [user, setUser] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

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
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
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
    if (!cardId) {
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
    }

    goToStep(4);
  };

  // URL'ye mekan ve saat parametrelerini de güvenli şekilde ekledik
  const generateShareUrl = () => {
    if (typeof window === "undefined") return "";
    if (cardId) {
      return `${window.location.origin}/k/card/${encodeURIComponent(cardId)}`;
    }

    const params = new URLSearchParams();
    if (targetUsername) params.set("u", targetUsername);
    if (fromUsername) params.set("f", fromUsername);
    if (soru) params.set("s", soru);
    if (selectedTheme) params.set("t", selectedTheme);
    if (gifUrl) params.set("gif", gifUrl);
    if (yer) {
      params.set("yer", yer);
      params.set("mekan", yer);
    }
    if (tarih) params.set("tarih", tarih);
    if (zaman) {
      params.set("zaman", zaman);
      params.set("saat", zaman);
    }

    return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
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

      {/* SAĞ ÜST KÖŞE GİRİŞ / KULLANICI ALANI */}
      <div className="absolute top-5 right-5 z-20 flex items-center gap-3">
        {user ? (
          <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 backdrop-blur-md px-4 py-2 rounded-2xl text-white text-xs shadow-lg">
            <div
              title={user.user_metadata?.full_name || user.user_metadata?.username || "Profil"}
              className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-indigo-400/50 bg-gradient-to-tr from-indigo-500 to-purple-500 text-sm font-bold text-white"
            >
              {user.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt="Profil fotoğrafı"
                  className="h-full w-full object-cover"
                />
              ) : (
                (user.user_metadata?.full_name || user.user_metadata?.username || "P").charAt(0).toUpperCase()
              )}
            </div>
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
              mekan={yer || searchParams.get("mekan") || searchParams.get("yer") || ""}
              tarih={tarih || searchParams.get("tarih") || ""}
              saat={zaman || searchParams.get("saat") || searchParams.get("zaman") || ""}
              showShareButton={!isSharedView}
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
          goToStep(4);
        }}
      />
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