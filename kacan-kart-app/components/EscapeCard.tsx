"use client";

import React, { useState, useRef, useEffect } from "react";

// 1. Kart Etkileşim Temaları (10 Adet)
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

// 2. Renk Paletleri
export interface ColorPalette {
  id: string;
  name: string;
  bg: string;
  cardBg: string;
  text: string;
  primaryBtn: string;
}

export const COLOR_PALETTES: ColorPalette[] = [
  {
    id: "neon-night",
    name: "Neon Gece 🌙",
    bg: "from-slate-950 via-purple-950 to-slate-950",
    cardBg: "bg-slate-900/90 border-slate-800",
    text: "text-slate-100",
    primaryBtn: "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-emerald-500/30",
  },
  {
    id: "romantic-pink",
    name: "Romantik Pembe 💖",
    bg: "from-pink-950 via-rose-950 to-slate-950",
    cardBg: "bg-rose-950/80 border-rose-800/50",
    text: "text-rose-100",
    primaryBtn: "bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white shadow-rose-500/30",
  },
  {
    id: "pastel-amber",
    name: "Sıcak Amber ☕",
    bg: "from-amber-950 via-orange-950 to-slate-950",
    cardBg: "bg-amber-950/80 border-amber-800/50",
    text: "text-amber-100",
    primaryBtn: "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-amber-500/30",
  },
  {
    id: "dark-minimal",
    name: "Dark Minimal 🖤",
    bg: "from-zinc-950 via-neutral-900 to-zinc-950",
    cardBg: "bg-zinc-900/90 border-zinc-800",
    text: "text-zinc-100",
    primaryBtn: "bg-gradient-to-r from-zinc-100 to-zinc-300 hover:from-white hover:to-zinc-200 text-zinc-900 shadow-zinc-500/20",
  },
];

// 3. Popüler Reaksiyon GIF'leri
export interface ReactionMedia {
  id: string;
  label: string;
  url: string;
}

export const POPULAR_MEDIA: ReactionMedia[] = [
  {
    id: "cat-please",
    label: "Yalvaran Kedi",
    url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOHp1OWRwbnpzMms5M29tYnlsa2p4MXltOHZibjI4aHN1Y3YzaWc3NSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Cmr1OMJ2FN0B2/giphy.gif",
  },
  {
    id: "bear-hug",
    label: "Sevimli Ayı",
    url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbnFlOXBpdmdycW5oZmpmdDFsNXNweXdyNDg3aWVvdjdrNWJsdnhmOCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Gf3AUz3eBNbTW/giphy.gif",
  },
  {
    id: "coffee-dance",
    label: "Kahve Dansı",
    url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYmtxdXZoYmExYzdyZmV0MXhndmJ5OWJycDlyZ3kxaHF2Nm9xbjBybCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/TDfO13V48S3fE3JInC/giphy.gif",
  },
  {
    id: "pepe-pray",
    label: "Dua Eden Pepe",
    url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYnJzcXdmcGNzeThxbmtpYndub3A4NXJubmtlZGF1amN6M2tzZ3M2eCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/julfDJLBiE2na/giphy.gif",
  },
];

interface EscapeCardProps {
  targetUsername?: string;
  initialQuestion?: string;
  theme?: CardTheme;
  onBack?: () => void;
}

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

export default function EscapeCard({
  targetUsername = "Nurullah",
  initialQuestion = "",
  theme = "escaping",
  onBack,
}: EscapeCardProps) {
  const [questionText, setQuestionText] = useState(initialQuestion);
  const [eventLocation, setEventLocation] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");

  const [selectedPalette, setSelectedPalette] = useState<ColorPalette>(COLOR_PALETTES[0]);
  const [selectedMedia, setSelectedMedia] = useState<ReactionMedia | null>(POPULAR_MEDIA[0]);

  const [stepIndex, setStepIndex] = useState(0);
  const [clickCount, setClickCount] = useState(0);
  const [isSwapped, setIsSwapped] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);
  const [isSent, setIsSent] = useState(!!initialQuestion);
  const [noButtonPos, setNoButtonPos] = useState<{ top: string; left: string } | null>(null);

  // Yeni Temalar İçin Özel Durumlar
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinError, setPinError] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const [shatterStage, setShatterStage] = useState(0); // 0: Normal, 1: Çatlak, 2: Ağır Çatlak, 3: Patladı

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Geri Sayım Teması İçin Timer
  useEffect(() => {
    if (theme === "timer" && isSent && !isAccepted && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [theme, isSent, isAccepted, timeLeft]);

  // Kutlama Sesi
  const playVictorySound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const notes = [261.63, 329.63, 392.0, 523.25];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
        gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.1);
        osc.stop(ctx.currentTime + i * 0.1 + 0.3);
      });
    } catch {
      // Audio engellenirse sessiz devam et
    }
  };

  // Konfeti Motoru
  const triggerConfetti = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const colors = ["#f43f5e", "#ec4899", "#d946ef", "#a855f7", "#6366f1", "#3b82f6", "#10b981", "#f59e0b"];
    const particles: Array<{
      x: number;
      y: number;
      size: number;
      color: string;
      vx: number;
      vy: number;
      rot: number;
      vRot: number;
    }> = [];

    for (let i = 0; i < 90; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2 + 30,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 0.7) * 14,
        rot: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 10,
      });
    }

    let opacity = 1;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      opacity -= 0.008;

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.25;
        p.rot += p.vRot;

        ctx.save();
        ctx.globalAlpha = Math.max(0, opacity);
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });

      if (opacity > 0) {
        requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    render();
  };

  const handleNoInteraction = (type: "click" | "hover") => {
    if (theme === "escaping" && type === "click") {
      const randomTop = Math.floor(Math.random() * 60 + 20) + "%";
      const randomLeft = Math.floor(Math.random() * 60 + 20) + "%";
      setNoButtonPos({ top: randomTop, left: randomLeft });
    } else if (theme === "persuasive" && type === "click") {
      setStepIndex((prev) => (prev + 1 < PERSUASIVE_STEPS.length ? prev + 1 : prev));
    } else if (theme === "shrinking" && type === "click") {
      setClickCount((prev) => prev + 1);
    } else if (theme === "role_reversal" && type === "hover") {
      setIsSwapped((prev) => !prev);
    } else if (theme === "teleporting" && type === "hover") {
      const randomTop = Math.floor(Math.random() * 70 + 15) + "%";
      const randomLeft = Math.floor(Math.random() * 70 + 15) + "%";
      setNoButtonPos({ top: randomTop, left: randomLeft });
    } else if (theme === "pin_code" && type === "click") {
      setShowPinModal(true);
    } else if (theme === "reverse_psychology" && type === "click") {
      handleYes(); // "Hayır" aslında "Evet"tir!
    } else if (theme === "shattering" && type === "click") {
      setShatterStage((prev) => prev + 1);
    }
  };

  const handleYes = () => {
    setIsAccepted(true);
    playVictorySound();
    setTimeout(() => {
      triggerConfetti();
    }, 50);
  };

  const handleSendQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) return;
    setIsSent(true);
  };

  const yesButtonScale =
    theme === "persuasive"
      ? 1 + stepIndex * 0.12
      : theme === "shrinking"
      ? 1 + clickCount * 0.25
      : 1;

  const noButtonScale = theme === "shrinking" ? Math.max(0, 1 - clickCount * 0.2) : 1;
  const hasEventDetails = eventLocation.trim() || eventDate || eventTime;

  return (
    <div className="w-full max-w-lg mx-auto space-y-6">
      {/* ANA KART EKRANI */}
      <div
        className={`w-full border rounded-3xl p-6 md:p-8 shadow-2xl ${selectedPalette.cardBg} ${selectedPalette.text} relative min-h-[480px] flex flex-col justify-between overflow-hidden transition-all duration-300`}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none z-50 w-full h-full"
        />

        {/* Üst Bilgi */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white text-lg shadow-md">
              {targetUsername.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-sm font-bold">@{targetUsername}'a Özel Kart</h3>
              <p className="text-[11px] opacity-70">{THEME_NAMES[theme]}</p>
            </div>
          </div>

          {onBack && (
            <button
              onClick={onBack}
              className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl transition border border-white/10"
            >
              ← Tema Değiştir
            </button>
          )}
        </div>

        {/* 1. ADIM: Soru Oluşturma Formu */}
        {!isSent ? (
          <form onSubmit={handleSendQuestion} className="my-auto py-4 space-y-4 z-10">
            {selectedMedia && (
              <div className="w-24 h-24 mx-auto rounded-2xl overflow-hidden shadow-lg border border-white/20">
                <img
                  src={selectedMedia.url}
                  alt={selectedMedia.label}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider opacity-80">
                {targetUsername}'a Sorulacak Soru:
              </label>
              <textarea
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                rows={2}
                placeholder="Örn: Benimle kahve içmeye çıkar mısın? ☕"
                className="w-full bg-black/40 border border-white/10 rounded-2xl p-3 text-sm placeholder-white/40 focus:outline-none focus:border-indigo-400 transition resize-none"
                required
              />
            </div>

            {/* Opsiyonel Detaylar */}
            <div className="space-y-2 border-t border-white/10 pt-3">
              <span className="text-[11px] font-medium text-slate-400">
                Etkinlik Detayları <span className="opacity-60">(Opsiyonel)</span>
              </span>
              <div className="space-y-2">
                <input
                  type="text"
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  placeholder="📍 Yer / Mekan (Örn: Moda Sahil / Kadıköy)"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs placeholder-white/40 focus:outline-none focus:border-indigo-400 transition"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white/90 focus:outline-none focus:border-indigo-400 transition"
                  />
                  <input
                    type="time"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white/90 focus:outline-none focus:border-indigo-400 transition"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className={`w-full py-3.5 font-bold rounded-2xl shadow-lg transition text-sm ${selectedPalette.primaryBtn}`}
            >
              Kartı Oluştur & İncele 🚀
            </button>
          </form>
        ) : !isAccepted ? (
          /* 2. ADIM: Etkileşimli Kart Önizlemesi */
          <div className="my-auto py-4 text-center space-y-5 relative z-10">
            {selectedMedia && (
              <div className="w-32 h-32 mx-auto rounded-2xl overflow-hidden shadow-xl border border-white/20">
                <img
                  src={selectedMedia.url}
                  alt={selectedMedia.label}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-extrabold leading-tight px-2">
                {questionText}
              </h2>

              {/* Tema 7: Timer Göstergesi */}
              {theme === "timer" && (
                <div className="text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 py-1 px-3 rounded-full inline-block">
                  ⏳ Kalan Süre: {timeLeft}s (Süre bitince Hayır yok olur!)
                </div>
              )}

              {hasEventDetails && (
                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                  {eventLocation && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/10 rounded-full text-xs font-medium border border-white/10">
                      📍 {eventLocation}
                    </span>
                  )}
                  {eventDate && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/10 rounded-full text-xs font-medium border border-white/10">
                      📅 {eventDate}
                    </span>
                  )}
                  {eventTime && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/10 rounded-full text-xs font-medium border border-white/10">
                      ⏰ {eventTime}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div
              className={`flex items-center justify-center gap-4 min-h-[100px] relative ${
                isSwapped ? "flex-row-reverse" : "flex-row"
              }`}
            >
              {/* EVET BUTONU */}
              <button
                onClick={handleYes}
                style={{ transform: `scale(${yesButtonScale})` }}
                className={`px-8 py-3.5 font-bold rounded-2xl shadow-lg transition-all duration-200 z-10 ${selectedPalette.primaryBtn}`}
              >
                Evet! 🎉
              </button>

              {/* HAYIR BUTONU (Temalara Göre Filtrelenir) */}
              {noButtonScale > 0 &&
                !(theme === "timer" && timeLeft === 0) &&
                !(theme === "shattering" && shatterStage >= 3) && (
                  <button
                    onClick={() => handleNoInteraction("click")}
                    onMouseEnter={(e) => {
                      handleNoInteraction("hover");
                      // Tema 10: Mıknatıs Efekti
                      if (theme === "magnet") {
                        handleYes();
                      }
                    }}
                    style={{
                      transform: `scale(${noButtonScale})`,
                      ...((theme === "escaping" || theme === "teleporting") && noButtonPos
                        ? {
                            position: "absolute",
                            top: noButtonPos.top,
                            left: noButtonPos.left,
                            transition: "all 0.15s ease-out",
                          }
                        : {}),
                    }}
                    className={`px-6 py-3.5 bg-white/10 hover:bg-rose-900/60 text-rose-300 font-semibold rounded-2xl border border-white/20 transition-all whitespace-nowrap shadow-md text-sm ${
                      theme === "shattering" && shatterStage === 1
                        ? "border-dashed opacity-80"
                        : theme === "shattering" && shatterStage === 2
                        ? "line-through opacity-50 scale-90"
                        : ""
                    }`}
                  >
                    {theme === "persuasive"
                      ? PERSUASIVE_STEPS[stepIndex]
                      : theme === "reverse_psychology"
                      ? "Kesinlikle Evet! 😉"
                      : "Hayır ❌"}
                  </button>
                )}
            </div>

            {/* Tema 6: Şifre Modalı */}
            {showPinModal && (
              <div className="absolute inset-0 bg-black/90 rounded-3xl p-6 flex flex-col items-center justify-center gap-3 z-30 animate-in fade-in">
                <span className="text-3xl">🔒</span>
                <h4 className="text-sm font-bold text-white">Hayır Demek İçin Şifre Girin</h4>
                <p className="text-[11px] text-slate-400">Bu işlem yetkilendirme gerektirir!</p>
                <input
                  type="password"
                  placeholder="Şifreniz..."
                  className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-center text-xs focus:outline-none"
                />
                {pinError && <p className="text-[10px] text-rose-400">Hatalı Şifre! (Erişim Engellendi)</p>}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setPinError(true)}
                    className="px-4 py-1.5 bg-rose-600 text-white text-xs rounded-xl font-bold"
                  >
                    Dene
                  </button>
                  <button
                    onClick={() => setShowPinModal(false)}
                    className="px-4 py-1.5 bg-white/10 text-xs rounded-xl"
                  >
                    Vazgeç (Evet De)
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* 3. ADIM: Sonuç Ekranı */
          <div className="my-auto py-8 text-center space-y-4 animate-in zoom-in-95 duration-300 z-10">
            <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center text-4xl mx-auto border border-emerald-500/30 animate-bounce">
              🥳
            </div>
            <h2 className="text-2xl font-bold">Tebrikler! Kabul Edildi ❤️</h2>
            <p className="text-xs opacity-70 max-w-xs mx-auto">
              Seçtiğin harika tasarım ve tema sayesinde Evet cevabı kaçınılmaz oldu!
            </p>

            {hasEventDetails && (
              <div className="bg-black/30 border border-white/10 rounded-2xl p-4 max-w-xs mx-auto space-y-2 text-left text-xs">
                <div className="font-semibold border-b border-white/10 pb-1 text-slate-300">
                  📌 Randevu Detayları
                </div>
                {eventLocation && <div>📍 <b>Mekan:</b> {eventLocation}</div>}
                {eventDate && <div>📅 <b>Tarih:</b> {eventDate}</div>}
                {eventTime && <div>⏰ <b>Saat:</b> {eventTime}</div>}
              </div>
            )}

            <button
              onClick={() => {
                setIsSent(false);
                setIsAccepted(false);
                setStepIndex(0);
                setClickCount(0);
                setIsSwapped(false);
                setNoButtonPos(null);
                setShowPinModal(false);
                setPinError(false);
                setTimeLeft(10);
                setShatterStage(0);
              }}
              className="mt-4 px-5 py-2 bg-white/10 hover:bg-white/20 text-xs rounded-xl border border-white/20 transition"
            >
              Yeni Soru Yaz & Düzenle
            </button>
          </div>
        )}

        {/* Alt Bilgi */}
        <div className="pt-4 border-t border-white/10 text-center text-[10px] opacity-50 z-10">
          Kaçan Kart Servisi • {THEME_NAMES[theme]}
        </div>
      </div>

      {/* TASARIM ÖZELLEŞTİRME PANELİ */}
      {!isSent && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-5 text-slate-100">
          <h3 className="text-sm font-bold border-b border-slate-800 pb-2 flex items-center gap-2">
            🎨 Görsel Tasarımı Özelleştir
          </h3>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400">Renk Paleti Seçin</label>
            <div className="grid grid-cols-2 gap-2">
              {COLOR_PALETTES.map((palette) => (
                <button
                  key={palette.id}
                  type="button"
                  onClick={() => setSelectedPalette(palette)}
                  className={`p-3 rounded-2xl border text-xs font-semibold flex items-center justify-between transition-all ${
                    selectedPalette.id === palette.id
                      ? "border-indigo-500 bg-indigo-500/20 text-white shadow-md"
                      : "border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <span>{palette.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400">Reaksiyon GIF'i Seçin</label>
            <div className="grid grid-cols-4 gap-2">
              {POPULAR_MEDIA.map((media) => (
                <button
                  key={media.id}
                  type="button"
                  onClick={() =>
                    setSelectedMedia(selectedMedia?.id === media.id ? null : media)
                  }
                  className={`relative rounded-xl overflow-hidden border-2 transition-all h-16 ${
                    selectedMedia?.id === media.id
                      ? "border-indigo-500 scale-105 shadow-md shadow-indigo-500/30"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img
                    src={media.url}
                    alt={media.label}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}