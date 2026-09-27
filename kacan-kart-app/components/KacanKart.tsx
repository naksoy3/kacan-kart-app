"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

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
  | "magnet"
  | "riddle"
  | "scratchpad";

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
  riddle: "🧩 Tema 11: Bulmacalı Hayır",
  scratchpad: "🎁 Tema 12: Sürpriz Kazı-Kazan",
};

export type KacanKartProps = {
  targetUsername?: string;
  sender?: string;
  soru?: string;
  evetMetni?: string;
  hayirMetni?: string;
  gifUrl?: string;
  mekan?: string;
  tarih?: string;
  saat?: string;
  theme?: CardTheme;
  onBack?: () => void;
  onAccept?: () => void | Promise<void>;
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
  "Hâlâ hayır mı diyorsun? 😿",
  "Kalbimi kırıyorsun amanın! 💘",
  "Bak valla küserim 😤",
  "İnat etme artık lütfen ✨",
  "Şaka yapıyorsun herhalde? 🙃",
  "Bence bir kez daha düşün 🌟",
  "Aslında evet demek istiyorsun 😉",
  "Hadi ama bu kadar olamaz! 🚁",
  "Pes ediyorum... Şaka şaka, EVET de! 🎉",
  "Tamam peki... ama yine de Evet de? 💖",
];

const RENKLI_EVET_BUTONLARI = [
  { metin: "Evet! 💖", renk: "bg-pink-500 hover:bg-pink-400 shadow-pink-500/30" },
  { metin: "Kesinlikle Evet! ✨", renk: "bg-purple-500 hover:bg-purple-400 shadow-purple-500/30" },
  { metin: "Tabii ki! 🥰", renk: "bg-indigo-500 hover:bg-indigo-400 shadow-indigo-500/30" },
  { metin: "Mükemmel Fikir! 🚀", renk: "bg-blue-500 hover:bg-blue-400 shadow-blue-500/30" },
  { metin: "Kaçırılmaz! 🌟", renk: "bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/30" },
  { metin: "Tabii ki de Evet! 🎈", renk: "bg-amber-500 hover:bg-amber-400 shadow-amber-500/30" },
  { metin: "Zaten bekliyordum! 🍕", renk: "bg-rose-500 hover:bg-rose-400 shadow-rose-500/30" },
  { metin: "Hemen şimdi! ✈️", renk: "bg-cyan-500 hover:bg-cyan-400 shadow-cyan-500/30" },
  { metin: "Bileti kaptım! 🎫", renk: "bg-violet-500 hover:bg-violet-400 shadow-violet-500/30" },
  { metin: "Sonuna kadar Evet! 👑", renk: "bg-fuchsia-500 hover:bg-fuchsia-400 shadow-fuchsia-500/30" },
];

const RIDDLES_LIST = [
  {
    soruMetni: "Gündüzleri ayaküstü dolaşırım, geceleri sırt üstü uyurum. Beni ne kadar ısıtırsan, o kadar terlerim.",
    ipucu: "Yaz günlerinin vazgeçilmez dostu..."
  },
  {
    soruMetni: "Uzaktan baktım bir taş, yanına vardım dört ayak bir baş.",
    ipucu: "Yavaş yürür ama yolu hep yarılar."
  },
  {
    soruMetni: "Çarşıdan aldım bir tane, eve geldim bin tane.",
    ipucu: "Kırmızı renkli, sulu ve çok tatlı."
  },
  {
    soruMetni: "Karşıdan baktım bir biçim, ağzı var dili yok, içindeki su içilmez hiç.",
    ipucu: "Masmavi dalgaları vardır."
  },
  {
    soruMetni: "Ağzı var odun yutar, bacası var duman tutar.",
    ipucu: "Kış gecelerinde ısıtır."
  },
  {
    soruMetni: "Uzun yassı, içine girilmez ama üstünde her şey taşınır.",
    ipucu: "Altında tekerlekleri vardır."
  },
  {
    soruMetni: "Kanadı var kuş değil, boynuzu var koç değil.",
    ipucu: "Gökyüzünde süzülür, insan taşır."
  },
  {
    soruMetni: "Biz biz idik, otuz iki kız idik, ezildik büzüldük, duvara dizildik.",
    ipucu: "Ağzımızın içinde yaşarlar."
  },
  {
    soruMetni: "Kuru kök üstünde yeşilbaş, dünyayı dolaşır yavaş yavaş.",
    ipucu: "Sırtında evini taşır."
  },
  {
    soruMetni: "Bir küçücük milcik, içi dolu kancık.",
    ipucu: "Dikiş dikerken en büyük yardımcımızdır."
  }
];

const YANLIS_CEVAP_MESAJLARI = [
  "Cevabın yanlış ama bilemesen de pes et ve Evet de! 🎉",
  "Çok yaklaştın ama yine de yanlış! Pes et ve Evet de! 😉",
  "Bunu doğru tahmin etmenin imkanı yok, en iyisi pes edip Evet de! 💖",
  "Hayır bu değil! Pes edip doğrudan Evet butonuna basmaya ne dersin? ✨",
  "Zekice bir tahmdi ama maalesef yanlış. Pes et ve Evet de! 🚀",
  "Bu bilmeceyi çözmek yerine kalbini açıp Evet de! 🥰"
];

const SCRATCH_MESSAGES = [
  "🌟 Harika enerjinle etrafındaki herkese ilham oluyorsun!",
  "🚀 Bugün karşına çıkan tüm engelleri aşacak güçtesin, kendine inan!",
  "🍀 Hayat senin gibi pozitif insanlarla çok daha güzel ve anlamlı.",
  "☕ Güzel bir kahve ve tatlı bir gülümseme bütün gününe iyi gelecek!",
  "✨ Etrafa saçtığın bu güzel neşe hiçbir zaman eksilmesin!",
  "🎨 Bugün kendi hikayenin en güzel sayfasını yazmaya ne dersin?",
  "🏆 Kararlılığın ve azminle başaramayacağın hiçbir şey yok!",
  "🎈 Küçük şeylerden mutlu olabildiğin için kalbin hep çok özel.",
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
    // Ses engellenirse sessizce geç
  }
}

export default function KacanKart({
  targetUsername = "Nurullah",
  sender,
  soru = "Benimle yemeğe çıkar mısın?",
  evetMetni = "Evet!",
  hayirMetni = "Hayır",
  gifUrl,
  mekan,
  tarih,
  saat,
  theme = "escaping",
  onBack,
  onAccept,
}: KacanKartProps) {
  const playzoneRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [kacisSayisi, setKacisSayisi] = useState(0);
  const [basarili, setBasarili] = useState(false);
  const [gifHata, setGifHata] = useState(false);
  const [copied, setCopied] = useState(false);

  const [isSwapped, setIsSwapped] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinError, setPinError] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const [shatterStage, setShatterStage] = useState(0);
  const [isMagnetActive, setIsMagnetActive] = useState(false);

  const [secilenBilmece, setSecilenBilmece] = useState<{ soruMetni: string; ipucu: string } | null>(null);
  const [riddleAnswer, setRiddleAnswer] = useState("");
  const [riddleFeedback, setRiddleFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (theme === "riddle") {
      const rastgeleIndex = Math.floor(Math.random() * RIDDLES_LIST.length);
      setSecilenBilmece(RIDDLES_LIST[rastgeleIndex]);
    }
  }, [theme]);

  useEffect(() => {
    if ((theme === "escaping" || theme === "teleporting") && playzoneRef.current) {
      const zoneRect = playzoneRef.current.getBoundingClientRect();
      const sideX = Math.min(zoneRect.width - 120, Math.max(90, zoneRect.width * 0.58));
      const sideY = Math.min(zoneRect.height - 40, Math.max(12, zoneRect.height * 0.38));
      setPos({ x: sideX, y: sideY });
    } else {
      setPos({ x: 0, y: 0 });
    }
  }, [theme]);

  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [scratchClicks, setScratchClicks] = useState(0);

  useEffect(() => {
    if (theme === "timer" && !basarili && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [theme, basarili, timeLeft]);

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
    if (sender) params.set("sender", sender);
    if (mekan) params.set("mekan", mekan);
    if (tarih) params.set("tarih", tarih);
    if (saat) params.set("saat", saat);

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
        // İptal edildi
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

    if (onAccept) {
      onAccept();
    }
  }, [onAccept]);

  const handleNoAction = useCallback(
    (type: "click" | "hover") => {
      if (theme === "escaping" || theme === "teleporting") {
        const zone = playzoneRef.current;
        if (!zone) return;

        const zoneRect = zone.getBoundingClientRect();
        const padding = 12;
        const btnWidth = 110;
        const btnHeight = 52;

        const maxX = Math.max(padding, zoneRect.width - btnWidth - padding);
        const maxY = Math.max(padding, zoneRect.height - btnHeight - padding);

        const yeniX = padding + Math.random() * (maxX - padding);
        const yeniY = padding + Math.random() * (maxY - padding);

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
        patlat();
      } else if (theme === "shattering" && type === "click") {
        setShatterStage((prev) => Math.min(prev + 1, 15));
      } else if (theme === "magnet") {
        setIsMagnetActive(true);
        setTimeout(() => {
          setIsMagnetActive(false);
        }, 750);
      }
    },
    [theme, patlat]
  );

  // İstediğin oranlar: Evet her kaçışta %8 büyür, Hayır her kaçışta %5 küçülür (minimum 0.35 ile tamamen kaybolmaz)
  const evetOlcek = 1 + kacisSayisi * 0.08;
  const hayirOlcek = Math.max(0.35, 1 - kacisSayisi * 0.05);

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

      <div className="relative z-10 w-full max-w-md rounded-[28px] bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-2xl px-7 py-8 sm:px-10 sm:py-10 text-slate-100 overflow-hidden">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white text-xs shadow-md">
              {targetUsername.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">
                @{targetUsername}&apos;a Özel Kart {sender ? `(${sender})` : ""}
              </h3>
              <p className="text-[10px] text-slate-400">{THEME_NAMES[theme]}</p>
            </div>
          </div>

          {onBack && (
            <button
              onClick={onBack}
              className="text-[11px] bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-xl transition border border-white/10 text-slate-300 cursor-pointer"
            >
              ← Değiştir
            </button>
          )}
        </div>

        {(mekan || tarih || saat) && (
          <div className="mb-4 p-3 bg-white/5 border border-white/10 rounded-xl text-xs space-y-1 text-slate-300">
            {mekan && <p>📍 <strong>Mekan:</strong> {mekan}</p>}
            {tarih && <p>📅 <strong>Tarih:</strong> {tarih}</p>}
            {saat && <p>⏰ <strong>Saat:</strong> {saat}</p>}
          </div>
        )}

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

              {theme === "timer" && (
                <div className="mt-3 text-center">
                  <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 py-1 px-3 rounded-full inline-block">
                    ⏳ Kalan Süre: {timeLeft}s
                  </span>
                </div>
              )}

              {theme === "riddle" && secilenBilmece && (
                <div className="mt-4 bg-indigo-950/40 border border-indigo-500/30 p-4 rounded-2xl text-center shadow-lg">
                  <p className="text-xs text-indigo-200 font-semibold leading-relaxed">
                    🧩 <strong className="text-white">Günün Bilmecesine Hoş Geldin:</strong> &quot;{secilenBilmece.soruMetni}&quot;
                    <span className="block text-[11px] text-amber-300 mt-1.5 font-normal">
                      💡 İpucu: {secilenBilmece.ipucu}
                    </span>
                  </p>
                  <div className="mt-3 flex gap-2 justify-center">
                    <input
                      type="text"
                      value={riddleAnswer}
                      onChange={(e) => setRiddleAnswer(e.target.value)}
                      placeholder="Cevabınız..."
                      className="bg-white/10 border border-white/20 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none w-40 text-center"
                    />
                    <button
                      onClick={() => {
                        const rastgeleMesaj = YANLIS_CEVAP_MESAJLARI[Math.floor(Math.random() * YANLIS_CEVAP_MESAJLARI.length)];
                        setRiddleFeedback(rastgeleMesaj);
                      }}
                      className="bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-xl text-xs font-bold text-white cursor-pointer transition"
                    >
                      Tahmin Et
                    </button>
                  </div>
                  {riddleFeedback && (
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      className="mt-3 p-2.5 bg-rose-500/20 border border-rose-500/40 rounded-xl text-[11px] text-rose-200 font-medium leading-snug"
                    >
                      ❌ {riddleFeedback}
                    </motion.div>
                  )}
                </div>
              )}

              {theme === "scratchpad" && (
                <motion.div 
                  onClick={() => {
                    setScratchClicks((prev) => prev + 1);
                    setCurrentMessageIndex((prev) => (prev + 1) % SCRATCH_MESSAGES.length);
                  }}
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  className="mt-5 bg-gradient-to-r from-amber-500/20 via-pink-500/20 to-purple-500/20 border-2 border-amber-400 p-5 rounded-2xl text-center cursor-pointer select-none shadow-[0_0_25px_rgba(251,191,36,0.35)] hover:shadow-[0_0_35px_rgba(236,72,153,0.5)] hover:border-pink-400 transition-all relative overflow-hidden group"
                >
                  <div className="absolute top-1.5 right-2.5 bg-gradient-to-r from-amber-400 to-pink-500 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-md uppercase tracking-wider animate-pulse">
                    Sürpriz #{scratchClicks + 1} / 8 ✨
                  </div>
                  <span className="text-3xl block mb-1 group-hover:scale-125 transition-transform duration-300">🎁💥</span>
                  <p className="text-xs font-extrabold text-amber-200 uppercase tracking-wider drop-shadow">
                    Günün Sürpriz Sözünü Açmak İçin Dokun!
                  </p>
                  <motion.p 
                    key={currentMessageIndex}
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="text-xs text-white mt-3 font-semibold leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-amber-400/30 shadow-inner"
                  >
                    {SCRATCH_MESSAGES[currentMessageIndex]}
                  </motion.p>
                  <p className="text-[10px] text-pink-300 mt-2 font-medium italic">
                    (Her tıklamada yeni ve motive edici harika bir söz keşfet!)
                  </p>
                </motion.div>
              )}

              {kacisSayisi > 2 && theme === "escaping" && (
                <p className="mt-3 text-center text-xs text-indigo-300">
                  {kacisSayisi} kez denendi 🏃
                </p>
              )}

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

              {/* Sınırları Koruyan Güvenli Alan */}
              <div
                ref={playzoneRef}
                className={`relative mt-8 h-32 w-full overflow-hidden rounded-2xl bg-white/5 border border-white/10 ${
                  evetOlcek > 1.8 ? "flex-col h-44" : isSwapped ? "flex-row-reverse" : "flex-row"
                } ${theme === "escaping" || theme === "teleporting" ? "flex items-center justify-center gap-3" : "justify-between"}`}
              >
                {theme === "reverse_psychology" ? (
                  <div className="grid grid-cols-2 gap-2 w-full max-h-32 overflow-y-auto pr-1">
                    {RENKLI_EVET_BUTONLARI.map((btn, idx) => (
                      <motion.button
                        key={idx}
                        type="button"
                        onClick={patlat}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`rounded-xl px-3 py-2 font-bold text-xs text-white shadow-md cursor-pointer ${btn.renk}`}
                      >
                        {btn.metin}
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  <>
                    <motion.button
                      type="button"
                      onClick={patlat}
                      animate={{ 
                        scale: evetOlcek,
                        x: theme === "magnet" && isMagnetActive ? 95 : 0,
                        zIndex: theme === "magnet" && isMagnetActive ? 30 : 10
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 18,
                      }}
                      className="rounded-2xl bg-emerald-500 hover:bg-emerald-400 px-6 py-3 font-bold text-sm sm:text-base text-slate-950 shadow-lg shadow-emerald-500/20 cursor-pointer z-10"
                    >
                      {evetMetni}
                    </motion.button>

                    {/* Hayır Butonu: Sınırlar içinde güvenle kaçar, her kaçışta %5 küçülür */}
                    {hayirOlcek > 0.1 && (
                      <motion.button
                        type="button"
                        onMouseEnter={() => handleNoAction("hover")}
                        onMouseMove={() => handleNoAction("hover")}
                        onClick={() => handleNoAction("click")}
                        style={{
                          position: theme === "escaping" || theme === "teleporting"
                            ? kacisSayisi > 0 ? "absolute" : "relative"
                            : "relative",
                          left: theme === "escaping" || theme === "teleporting" ? kacisSayisi > 0 ? `${pos.x}px` : undefined : undefined,
                          top: theme === "escaping" || theme === "teleporting" ? kacisSayisi > 0 ? `${pos.y}px` : undefined : undefined,
                        }}
                        className={`rounded-2xl px-5 py-3 font-semibold text-sm sm:text-base whitespace-nowrap shadow-md cursor-pointer transition-colors z-20 ${
                          theme === "shattering" && shatterStage > 0
                            ? "bg-rose-900/40 text-rose-200 border-2 border-dashed border-rose-400/80 shadow-[0_0_15px_rgba(244,63,94,0.4)] backdrop-blur-sm"
                            : "bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300"
                        }`}
                        animate={{
                          scale: hayirOlcek,
                          x: 0,
                          y: 0,
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 450,
                          damping: 15,
                        }}
                      >
                        <span>{gosterilenHayirMetni}</span>
                      </motion.button>
                    )}
                  </>
                )}
              </div>

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
                      className="px-4 py-1.5 bg-rose-600 text-white text-xs rounded-xl font-bold cursor-pointer"
                    >
                      Dene
                    </button>
                    <button
                      onClick={() => setShowPinModal(false)}
                      className="px-4 py-1.5 bg-white/10 text-xs text-slate-300 rounded-xl cursor-pointer"
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
                className="mt-6 rounded-2xl bg-indigo-500 hover:bg-indigo-400 px-6 py-2.5 font-bold text-xs text-white hover:scale-105 active:scale-95 transition-all shadow-lg shadow-indigo-500/25 cursor-pointer"
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