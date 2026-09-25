"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

type KacanKartProps = {
  soru?: string;
  evetMetni?: string;
  hayirMetni?: string;
  gifUrl?: string;
};

const HAYIR_VARYASYONLARI = [
  "Emin misin?",
  "Bir daha düşün 👀",
  "Son şansın!",
  "Hadi ama...",
];

const GEC_KACIS_METINLERI = [
  "Yakalayamazsın ki!",
  "Hâlâ deniyor musun?",
  "Pes et artık!",
  "İmkansız 😄",
  "Boşuna uğraşma!",
];

const KONFETI_RENKLERI = ["#FF5D8F", "#FFD166", "#8B5CF6", "#FFF6ED"];

const HAYIR_MIN_OLCEK = 0.4;
const EVET_MAX_OLCEK = 2.3;

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
  soru = "Benimle yemeğe çıkar mısın?",
  evetMetni = "Evet!",
  hayirMetni = "Hayır",
  gifUrl,
}: KacanKartProps) {
  const playzoneRef = useRef<HTMLDivElement>(null);
  const hayirRef = useRef<HTMLButtonElement>(null);

  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [kacisSayisi, setKacisSayisi] = useState(0);
  const [basarili, setBasarili] = useState(false);
  const [gifHata, setGifHata] = useState(false);

  const gosterilenHayirMetni = useMemo(() => {
    if (kacisSayisi === 0) return hayirMetni;
    if (kacisSayisi < 5) {
      return HAYIR_VARYASYONLARI[(kacisSayisi - 1) % HAYIR_VARYASYONLARI.length];
    }
    return GEC_KACIS_METINLERI[(kacisSayisi - 5) % GEC_KACIS_METINLERI.length];
  }, [kacisSayisi, hayirMetni]);

  const hayirOlcek = Math.max(Math.pow(0.9, kacisSayisi), HAYIR_MIN_OLCEK);
  const evetOlcek = Math.min(Math.pow(1.15, kacisSayisi), EVET_MAX_OLCEK);

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
  }, [basarili]);

  const kac = useCallback(() => {
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
  }, []);

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

      <div className="relative z-10 w-full max-w-md rounded-[28px] bg-gece2/70 border border-white/10 backdrop-blur-xl shadow-yumusak px-7 py-10 sm:px-10 sm:py-12">
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
                    className="max-h-48 w-auto rounded-2xl object-cover border border-white/10"
                  />
                </div>
              )}

              <h1 className="font-baslik text-2xl sm:text-3xl leading-snug text-krem text-center text-balance">
                {soru}
              </h1>

              {kacisSayisi > 2 && (
                <p className="mt-3 text-center text-sm text-krem/60">
                  {kacisSayisi} kez kaçtı bile 🏃
                </p>
              )}

              <div
                ref={playzoneRef}
                className="relative mt-10 min-h-[180px] flex items-center justify-center gap-4"
              >
                <motion.button
                  type="button"
                  onClick={patlat}
                  animate={{ scale: evetOlcek }}
                  transition={{ type: "spring", stiffness: 260, damping: 16 }}
                  className="rounded-2xl bg-mercan px-7 py-3.5 font-baslik text-lg text-gece shadow-lg shadow-mercan/30"
                >
                  {evetMetni}
                </motion.button>

                <motion.button
                  ref={hayirRef}
                  type="button"
                  onMouseEnter={kac}
                  onClick={kac}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    kac();
                  }}
                  className={
                    pos
                      ? "absolute top-0 left-0 rounded-2xl bg-white/10 border border-white/20 px-7 py-3.5 font-baslik text-lg text-krem whitespace-nowrap"
                      : "rounded-2xl bg-white/10 border border-white/20 px-7 py-3.5 font-baslik text-lg text-krem whitespace-nowrap"
                  }
                  animate={{
                    x: pos ? pos.x : 0,
                    y: pos ? pos.y : 0,
                    scale: hayirOlcek,
                  }}
                  transition={{ type: "spring", stiffness: 320, damping: 18 }}
                >
                  {gosterilenHayirMetni}
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="basari"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="text-center"
            >
              <div className="text-5xl">🎉</div>
              <h2 className="font-baslik text-2xl sm:text-3xl text-krem mt-4">
                Harika, kabul edildi!
              </h2>
              <p className="mt-2 text-krem/70">
                Cevabın not edildi, şimdi organize etme zamanı.
              </p>
              <button
                type="button"
                onClick={patlat}
                className="mt-8 rounded-2xl bg-limon px-6 py-3 font-baslik text-gece hover:scale-105 active:scale-95 transition-transform"
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
