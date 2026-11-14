"use client";

import { useState } from "react";
import { CardTheme } from "@/components/Cardasks";
import { themeName } from "@/components/ThemePicker";
import { useLanguage } from "@/components/LanguageProvider";

export default function CardCreationPreview({
  theme, sender, recipient, question, gif, date, time, place,
}: {
  theme: CardTheme;
  sender: string;
  recipient: string;
  question: string;
  gif: string;
  date: string;
  time: string;
  place: string;
}) {
  const { t } = useLanguage();
  const [failedGif, setFailedGif] = useState<string | null>(null);
  return (
    <aside className="lg:sticky lg:top-24">
      <div className="relative overflow-hidden rounded-3xl border border-primary-container/30 bg-gradient-to-b from-[#2a1653] to-[#180b2e] p-5 shadow-card-elevation-2 sm:p-6">
        <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-primary-container/20 blur-3xl" />
        <div className="relative">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="rounded-full border border-primary-container/40 bg-primary-container/20 px-3 py-1 text-xs font-bold text-primary">● {t("CANLI ÖNİZLEME")}</span>
            <span className="text-xs text-on-surface-variant">{t("Tema:")} {themeName(theme, t)}</span>
          </div>
          <div className="mt-4 flex flex-wrap justify-between gap-2 border-b border-white/10 pb-3 text-xs text-on-surface-variant">
            <span>{t("Gönderen:")} <strong className="text-tertiary">{sender || "—"}</strong></span>
            <span>{t("Alıcı:")} <strong className="text-primary">{recipient || "—"}</strong></span>
          </div>
          <div className="mt-4 rounded-2xl border border-white/10 bg-surface-container-high/60 p-5 text-center">
            {gif !== failedGif ? (
              <img src={gif} alt="" onError={() => setFailedGif(gif)} className="mx-auto h-28 w-28 rounded-2xl border border-primary-container/30 bg-surface-container-lowest object-contain" />
            ) : (
              <div role="status" className="mx-auto flex h-28 w-28 items-center justify-center rounded-2xl border border-primary-container/30 bg-surface-container-lowest p-2 text-xs text-on-surface-variant">
                {t("GIF yüklenemedi.")}
              </div>
            )}
            <h3 className="mt-4 break-words text-xl font-bold leading-snug text-white">{question || t("Sorun burada görünecek.")}</h3>
            {(date || time || place) && (
              <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs text-on-surface">
                {date && <span className="rounded-full bg-surface-variant px-3 py-1">📅 {date}</span>}
                {time && <span className="rounded-full bg-surface-variant px-3 py-1">🕒 {time}</span>}
                {place && <span className="max-w-full break-words rounded-full bg-surface-variant px-3 py-1">📍 {place}</span>}
              </div>
            )}
            <div aria-hidden="true" className="mt-6 flex justify-center gap-3 text-sm font-bold">
              <span className="rounded-xl bg-emerald-700 px-5 py-3 text-white">{t("Evet!")}</span>
              <span className="rounded-xl bg-surface-variant px-5 py-3 text-on-surface-variant">{t("Hayır")}</span>
            </div>
            <p className="mt-4 text-xs text-on-surface-variant">{t("Etkileşimli önizleme kart oluşturulduktan sonra açılır.")}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
