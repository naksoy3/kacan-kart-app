"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

// 1. Temalar ve Tip Tanımları
export type CardTheme =
  | "escaping"
  | "persuasive"
  | "shrinking"
  | "role_reversal"
  | "teleporting"
  | "pin_code"
  | "timer"
  | "reverse_psychology"
  | "shattering"
  | "magnet";

export const THEME_NAMES: Record<CardTheme, string> = {
  escaping: "🎯 Tema 1: Kaçan Hayır",
  persuasive: "💬 Tema 2: Israrcı Cevaplar",
  shrinking: "🔍 Tema 3: Küçülen Buton",
  role_reversal: "🔀 Tema 4: Yer Değiştiren",
  teleporting: "⚡ Tema 5: Işınlanan Buton",
  pin_code: "🔒 Tema 6: Şifreli Hayır",
  timer: "⏳ Tema 7: Geri Sayımlı",
  reverse_psychology: "🪞 Tema 8: Ters Psikoloji",
  shattering: "💥 Tema 9: Parçalanan Buton",
  magnet: "🧲 Tema 10: Mıknatıs Evet",
};

export type KacanKartProps = {
  targetUsername?: string;
  soru?: string;
  evetMetni?: string;
  hayirMetni?: string;
  gifUrl?: string;
  theme?: CardTheme;
  onBack?: () => void;
};

const PERSUASIVE_STEPS = [
  "Hayır ❌",
  "Emin misin? 🧐",
  "Son kararın mı? 🥺",
  "Gerçekten mi? 💔",
  "Bir daha düşün bence... 💭",
  "Lütfen ama yaa! 🙏",
  "Bak üzülürüm ama 😢",
  "Sana kurabiye alırım? 🍪",
  "Bunu yapamazsın! 🙈",
  "Kırdın beni... 💥",
  "Tamam peki... ama yine de Evet de? ✨",
];

const KONFETI_RENKLERI = ["#FF5D8F", "#FFD166", "#8B5CF6", "#10B981"];

function kutlamaSesiCal() {
  try {
    const AudioCtxClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtxClass) return;

    const ctx = new AudioCtxClass();
    const notalar = [523.25, 659.25, 783.99, 1046.5];

    notalar.forEach((frekans, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const baslangic = ctx.currentTime + i * 0.09;

      osc.type = "sine";
      osc.frequency.value = frekans;

      gain.gain.setValueAtTime(0, baslangic);
      gain.gain.linearRampToValueAtTime(0.2, baslangic + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, baslangic + 0.35);

      osc.connect(gain).connect(ctx.destination);
      osc.start(baslangic);
      osc.stop(baslangic + 0.4);
    });

    setTimeout(() => ctx.close(), 1000);
  } catch {
    // Tarayıcı sesi engellerse sessizce geç
  }
}

export default function KacanKart({
  targetUsername = "Nurullah",
  soru = "Benimle yemeğe çıkar mısın?",
  evetMetni = "Evet!",
  hayirMetni = "Hayır",
  gifUrl,
  theme = "escaping",
  onBack,
}: KacanKartProps) {
  const playzoneRef = useRef<HTMLDivElement>(null);
  const hayirRef = useRef<HTMLButtonElement>(null);

  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [kacisSayisi, setKacisSayisi] = useState(0);
  const [basarili, setBasarili] = useState(false);
  const [gifHata, setGifHata] = useState(false);
  const [copied, setCopied] = useState(false);

  // Özel Tema Durumları
  const [isSwapped, setIsSwapped] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinError, setPinError] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const [shatterStage, setShatterStage] = useState(0);

  // Tema 7 (Timer) Sayacı
  useEffect(() => {
    if (theme === "timer" && !basarili && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [theme, basarili, timeLeft]);

  // Dinamik Link Paylaşım Fonksiyonu
  const handleShare = async () => {
    const baseUrl = window.location.origin + window.location.pathname;
    const params = new URLSearchParams({
      u: targetUsername,
      s: soru,
      e: evetMetni,
      h: hayirMetni,
      t: theme,
    });

    if (gifUrl) params.set("gif", gifUrl);

    const shareUrl = `${baseUrl}?${params.toString()}`;

    const shareData = {
      title: `${targetUsername} sana bir kart gönderdi! 🃏`,
      text: `"${soru}" - Bakalım ne cevap vereceksin? 😉`,
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // Kullanıcı paylaşımı iptal etti
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const patlat = useCallback(() => {
    const uc = (parti: Parameters<typeof confetti>[0]) =>
      confetti({
        particleCount: 90,
        spread: 75,
        startVelocity: 45,
        colors: KONFETI_RENKLERI,
        origin: { y: 0.65 },
        ...parti,
      });

    uc({ angle: 60, origin: { x: 0.15, y: 0.7 } });
    uc({ angle: 120, origin: { x: 0.85, y: 0.7 } });
    setTimeout(
      () => uc({ angle: 90, origin: { x: 0.5, y: 0.55 }, particleCount: 140 }),
      150
    );

    kutlamaSesiCal();
    setBasarili(true);
  }, []);

  const handleNoAction = useCallback(
    (type: "click" | "hover") => {
      if (theme === "escaping" || theme === "teleporting") {
        const zone = playzoneRef.current;
        const btn = hayirRef.current;
        if (!zone || !btn) return;

        const zoneRect = zone.getBoundingClientRect();
        const btnRect = btn.getBoundingClientRect();

        const maxX = Math.max(zoneRect.width - btnRect.width, 0);
        const maxY = Math.max(zoneRect.height - btnRect.height, 0);

        const yeniX = Math.random() * maxX;
        const yeniY = Math.random() * maxY;

        setPos({ x: yeniX, y: yeniY });
        setKacisSayisi((n) => n + 1);
      } else if (theme === "persuasive" && type === "click") {
        setKacisSayisi((n) => n + 1);
      } else if (theme === "shrinking" && type === "click") {
        setKacisSayisi((n) => n + 1);
      } else if (theme === "role_reversal" && type === "hover") {
        setIsSwapped((prev) => !prev);
      } else if (theme === "pin_code" && type === "click") {
        setShowPinModal(true);
      } else if (theme === "reverse_psychology" && type === "click") {
        patlat(); // Ters psikoloji: Hayır aslında Evet demektir!
      } else if (theme === "shattering" && type === "click") {
        setShatterStage((prev) => prev + 1);
      } else if (theme === "magnet" && type === "hover") {
        patlat();
      }
    },
    [theme, patlat]
  );

  const evetOlcek =
    theme === "persuasive"
      ? Math.min(1 + kacisSayisi * 0.15, 2.2)
      : theme === "shrinking"
      ? Math.min(1 + kacisSayisi * 0.25, 2.5)
      : 1;

  const hayirOlcek =
    theme === "shrinking" ? Math.max(0, 1 - kacisSayisi * 0.2) : 1;

  const gosterilenHayirMetni = useMemo(() => {
    if (theme === "persuasive") {
      return PERSUASIVE_STEPS[
        Math.min(kacisSayisi, PERSUASIVE_STEPS.length - 1)
      ];
    }
    if (theme === "reverse_psychology") return "Kesinlikle Evet! 😉";
    return hayirMetni;
  }, [theme, kacisSayisi, hayirMetni]);

  const parcaciklar = useMemo(() => {
    const emojiler = ["🎉", "✨", "💫", "🎊", "💖"];
    return Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      sol: Math.random() * 100,
      gecikme: Math.random() * 2.5,
      sure: 3.5 + Math.random() * 3,
      emoji: emojiler[i % emojiler.length],
      boyut: 18 + Math.random() * 16,
    }));
  }, []);

  return (
    <>
      <AnimatePresence>
        {basarili && (
          <motion.div
            key="kutlama-arkaplan"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-0 overflow-hidden pointer-events-none"
          >
            <motion.div
              className="absolute inset-0 opacity-40 blur-3xl"
              style={{
                background:
                  "conic-gradient(from 0deg, #FF5D8F, #FFD166, #8B5CF6, #FF5D8F)",
              }}
              animate={{ filter: ["hue-rotate(0deg)", "hue-rotate(360deg)"] }}
              transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
            />
            {parcaciklar.map((p) => (
              <motion.span
                key={p.id}
                className="absolute bottom-[-10%]"
                style={{ left: `${p.sol}%`, fontSize: p.boyut }}
                initial={{ y: 0, opacity: 0, rotate: 0 }}
                animate={{ y: "-120vh", opacity: [0, 1, 1, 0], rotate: 360 }}
                transition={{
                  duration: p.sure,
                  delay: p.gecikme,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                {p.emoji}
              </motion.span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 w-full max-w-md rounded-[28px] bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-2xl px-7 py-8 sm:px-10 sm:py-10 text-slate-100">
        {/* Üst Bilgi Başlığı */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white text-xs shadow-md">
              {targetUsername.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">
                @{targetUsername}'a Özel Kart
              </h3>
              <p className="text-[10px] text-slate-400">{THEME_NAMES[theme]}</p>
            </div>
          </div>

          {onBack && (
            <button
              onClick={onBack}
              className="text-[11px] bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-xl transition border border-white/10 text-slate-300"
            >
              ← Değiştir
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {!basarili ? (
            <motion.div
              key="soru"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {gifUrl && !gifHata && (
                <div className="mb-6 flex justify-center">
                  <img
                    src={gifUrl}
                    alt=""
                    loading="lazy"
                    onError={() => setGifHata(true)}
                    className="max-h-40 w-auto rounded-2xl object-cover border border-white/10 shadow-lg"
                  />
                </div>
              )}

              <h1 className="font-extrabold text-xl sm:text-2xl leading-snug text-white text-center text-balance">
                {soru}
              </h1>

              {/* Tema 7: Timer Göstergesi */}
              {theme === "timer" && (
                <div className="mt-3 text-center">
                  <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 py-1 px-3 rounded-full inline-block">
                    ⏳ Kalan Süre: {timeLeft}s
                  </span>
                </div>
              )}

              {kacisSayisi > 2 && theme === "escaping" && (
                <p className="mt-3 text-center text-xs text-indigo-300">
                  {kacisSayisi} kez kaçtı bile 🏃
                </p>
              )}

              {/* Link Paylaşım Butonu */}
              <div className="mt-4 flex justify-center">
                <button
                  onClick={handleShare}
                  type="button"
                  className="px-4 py-2 bg-indigo-600/80 hover:bg-indigo-500 text-white font-medium rounded-xl shadow-lg transition-all flex items-center gap-1.5 text-xs border border-indigo-400/30 cursor-pointer"
                >
                  <span>
                    {copied ? "✓ Link Kopyalandı!" : "🔗 Arkadaşına Link At"}
                  </span>
                </button>
              </div>

              {/* Etkileşim Alanı */}
              <div
                ref={playzoneRef}
                className={`relative mt-8 min-h-[160px] flex items-center justify-center gap-4 ${
                  isSwapped ? "flex-row-reverse" : "flex-row"
                }`}
              >
                {/* EVET BUTONU */}
                <motion.button
                  type="button"
                  onClick={patlat}
                  animate={{ scale: evetOlcek }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 16,
                  }}
                  className="rounded-2xl bg-emerald-500 hover:bg-emerald-400 px-7 py-3.5 font-bold text-base text-slate-950 shadow-lg shadow-emerald-500/20 z-10 cursor-pointer"
                >
                  {evetMetni}
                </motion.button>

                {/* HAYIR BUTONU */}
                {hayirOlcek > 0 &&
                  !(theme === "timer" && timeLeft === 0) &&
                  !(theme === "shattering" && shatterStage >= 3) && (
                    <motion.button
                      ref={hayirRef}
                      type="button"
                      onMouseEnter={() => handleNoAction("hover")}
                      onClick={() => handleNoAction("click")}
                      onTouchStart={(e) => {
                        e.preventDefault();
                        handleNoAction("click");
                      }}
                      className={
                        (theme === "escaping" || theme === "teleporting") && pos
                          ? "absolute top-0 left-0 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 px-6 py-3.5 font-semibold text-base text-rose-300 whitespace-nowrap shadow-md"
                          : `rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 px-6 py-3.5 font-semibold text-base text-rose-300 whitespace-nowrap shadow-md ${
                              theme === "shattering" && shatterStage === 1
                                ? "border-dashed opacity-80"
                                : theme === "shattering" && shatterStage === 2
                                ? "line-through opacity-50 scale-90"
                                : ""
                            }`
                      }
                      animate={{
                        x:
                          (theme === "escaping" || theme === "teleporting") &&
                          pos
                            ? pos.x
                            : 0,
                        y:
                          (theme === "escaping" || theme === "teleporting") &&
                          pos
                            ? pos.y
                            : 0,
                        scale: hayirOlcek,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 320,
                        damping: 18,
                      }}
                    >
                      {gosterilenHayirMetni}
                    </motion.button>
                  )}
              </div>

              {/* Tema 6: Şifre Modalı */}
              {showPinModal && (
                <div className="absolute inset-0 bg-slate-950/95 rounded-[28px] p-6 flex flex-col items-center justify-center gap-3 z-30 animate-in fade-in">
                  <span className="text-3xl">🔒</span>
                  <h4 className="text-sm font-bold text-white">
                    Hayır Demek İçin Şifre Girin
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Bu işlem yetkilendirme gerektirir!
                  </p>
                  <input
                    type="password"
                    placeholder="Şifreniz..."
                    className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-center text-xs focus:outline-none text-white"
                  />
                  {pinError && (
                    <p className="text-[10px] text-rose-400">
                      Hatalı Şifre! (Erişim Engellendi)
                    </p>
                  )}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setPinError(true)}
                      className="px-4 py-1.5 bg-rose-600 text-white text-xs rounded-xl font-bold"
                    >
                      Dene
                    </button>
                    <button
                      onClick={() => setShowPinModal(false)}
                      className="px-4 py-1.5 bg-white/10 text-xs text-slate-300 rounded-xl"
                    >
                      Vazgeç (Evet De)
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="basari"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="text-center py-4"
            >
              <div className="text-5xl">🎉</div>
              <h2 className="font-black text-2xl text-white mt-4">
                Harika, kabul edildi! ❤️
              </h2>
              <p className="mt-2 text-xs text-slate-400">
                Cevabın kaydedildi, harika bir tercih!
              </p>
              <button
                type="button"
                onClick={patlat}
                className="mt-6 rounded-2xl bg-indigo-500 hover:bg-indigo-400 px-6 py-2.5 font-bold text-xs text-white hover:scale-105 active:scale-95 transition-all shadow-lg shadow-indigo-500/25"
              >
                Tekrar kutla 🎊
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}