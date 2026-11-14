"use client";

import { useState } from "react";
import { CardTheme, THEME_NAMES } from "@/components/Cardasks";
import { useLanguage } from "@/components/LanguageProvider";

type Category = "fun" | "surprise" | "challenge";

const themes: Record<CardTheme, { icon: string; category: Category; description: string }> = {
  escaping: { icon: "directions_run", category: "challenge", description: "Hayır butonu yaklaşınca kaçar." },
  persuasive: { icon: "forum", category: "fun", description: "Her hayırda yeni bir cevap belirir." },
  shrinking: { icon: "zoom_out_map", category: "surprise", description: "Hayır küçülürken Evet büyür." },
  role_reversal: { icon: "swap_horiz", category: "fun", description: "Evet ve Hayır yer değiştirir." },
  teleporting: { icon: "auto_fix_high", category: "surprise", description: "Hayır butonu başka bir yere ışınlanır." },
  pin_code: { icon: "lock", category: "challenge", description: "Hayır demek için şifre istenir." },
  timer: { icon: "timer", category: "challenge", description: "Geri sayım sona erdiğinde Hayır kaybolur." },
  reverse_psychology: { icon: "psychology", category: "surprise", description: "Farklı Evet seçenekleri görünür." },
  shattering: { icon: "grain", category: "fun", description: "Hayır butonu parçalara ayrılır." },
  magnet: { icon: "attractions", category: "surprise", description: "Evet butonu Hayır denemesinde hareket eder." },
  riddle: { icon: "extension", category: "challenge", description: "Kartta bir bilmece ve ipucu görünür." },
  scratchpad: { icon: "celebration", category: "fun", description: "Kartta sürpriz mesajlar belirir." },
};

const categories: { id: "all" | Category; label: string }[] = [
  { id: "all", label: "Tümü" },
  { id: "fun", label: "Eğlenceli 🎈" },
  { id: "surprise", label: "Şaşırtıcı ⚡" },
  { id: "challenge", label: "Meydan Okuma 🏆" },
];

export function themeName(theme: CardTheme, t: (text: string) => string) {
  return t(THEME_NAMES[theme]).replace(/^.*?:\s*/, "");
}

export default function ThemePicker({
  selected,
  onSelect,
  onContinue,
}: {
  selected: CardTheme;
  onSelect: (theme: CardTheme) => void;
  onContinue: () => void;
}) {
  const { t } = useLanguage();
  const [category, setCategory] = useState<"all" | Category>("all");
  const visibleThemes = (Object.keys(themes) as CardTheme[]).filter(
    (theme) => category === "all" || themes[theme].category === category
  );
  const selectedDetails = themes[selected];

  const surprise = () => {
    const alternatives = visibleThemes.filter((theme) => theme !== selected);
    const choices = alternatives.length ? alternatives : visibleThemes;
    onSelect(choices[Math.floor(Math.random() * choices.length)]);
  };

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#251347]/90 via-[#1a0b33]/90 to-[#130726]/95 p-4 shadow-card-elevation-2 backdrop-blur-2xl sm:p-6">
      <div aria-hidden="true" className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-primary-container/15 blur-3xl" />
      <div className="relative">
        <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-center">
          <div>
            <span className="inline-flex rounded-full border border-secondary/30 bg-secondary-container/40 px-3 py-1 text-[11px] font-bold text-secondary">
              ✨ {t("ETKİLEŞİM KEŞİF ALANI")}
            </span>
            <h2 className="mt-2 text-xl font-bold text-white sm:text-2xl">{t("1. Adım: Kart Temasını Keşfet & Seç")} ✨</h2>
            <p className="mt-1 text-sm text-on-surface-variant">{t("Kartın etkileşimini seç ve önizlemede gör.")}</p>
          </div>
          <button type="button" onClick={surprise} className="min-h-11 shrink-0 self-start rounded-xl border border-secondary/40 bg-surface-container-high px-4 py-2 text-sm font-bold text-tertiary transition hover:border-tertiary hover:bg-surface-bright">
            🎲 {t("Bana Sürpriz Yap")}
          </button>
        </div>

        <div className="my-4 flex gap-2 overflow-x-auto pb-2" aria-label={t("Tema kategorileri")}>
          {categories.map((item) => (
            <button key={item.id} type="button" onClick={() => setCategory(item.id)} aria-pressed={category === item.id}
              className={`min-h-11 shrink-0 rounded-xl border px-4 text-xs font-bold transition ${category === item.id ? "border-primary-container bg-inverse-primary text-white" : "border-white/10 bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"}`}>
              {t(item.label)}{item.id === "all" && ` (${Object.keys(themes).length})`}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
          {visibleThemes.map((theme) => {
            const details = themes[theme];
            const active = selected === theme;
            const badge = categories.find((item) => item.id === details.category);
            return (
              <button key={theme} type="button" onClick={() => onSelect(theme)} aria-pressed={active}
                className={`group relative flex min-h-40 flex-col rounded-2xl border p-4 text-left transition duration-200 motion-safe:hover:-translate-y-1 ${active ? "border-primary-container bg-primary-container/10 shadow-glow-coral" : "border-white/10 bg-surface-container-low/80 hover:border-secondary/70 hover:bg-surface-container-high/60"}`}>
                <span className="flex w-full items-start justify-between gap-2">
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${active ? "border-primary-container bg-primary-container/20 text-primary" : "border-secondary/30 bg-secondary/10 text-secondary"}`}>
                    <span aria-hidden="true" className="material-symbols-outlined">{details.icon}</span>
                  </span>
                  <span className="rounded-md border border-tertiary/30 bg-tertiary/10 px-2 py-1 text-[10px] font-bold text-tertiary">{badge && t(badge.label)}</span>
                </span>
                <span className="mt-3 flex w-full items-center justify-between gap-2 text-sm font-bold text-white">
                  {themeName(theme, t)}
                  {active && <span aria-hidden="true" className="material-symbols-outlined text-lg text-primary">check_circle</span>}
                </span>
                <span className="mt-2 text-xs leading-relaxed text-on-surface-variant">{t(details.description)}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-secondary/30 bg-surface-container/80 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-primary-container bg-primary-container/20 text-primary">
              <span aria-hidden="true" className="material-symbols-outlined">{selectedDetails.icon}</span>
            </span>
            <div aria-live="polite">
              <p className="text-sm font-bold text-white">{t("Seçili Tema:")} {themeName(selected, t)}</p>
              <p className="mt-1 text-xs text-on-surface-variant">{t(selectedDetails.description)}</p>
            </div>
          </div>
          <button type="button" onClick={onContinue} className="min-h-11 shrink-0 rounded-xl bg-gradient-to-r from-secondary-container to-[#7c3aed] px-5 py-3 text-sm font-bold text-white shadow-glow-purple transition hover:brightness-110">
            {t("Devam Et: Detayları Gir ➡️")}
          </button>
        </div>
      </div>
    </section>
  );
}
