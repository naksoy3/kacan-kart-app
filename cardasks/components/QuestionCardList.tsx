"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";
import { supabase } from "@/utils/supabase";

type QuestionCard = {
  id: string;
  soru: string;
  target_username: string;
  from_username: string;
  status: string;
  created_at: string;
};

type QuestionCardListProps = {
  kind: "sent" | "received";
};

const CARD_COLUMNS = "id,soru,target_username,from_username,status,created_at";

export default function QuestionCardList({ kind }: QuestionCardListProps) {
  const { language, t } = useLanguage();
  const [cards, setCards] = useState<QuestionCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [needsSignIn, setNeedsSignIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadCards = async () => {
      setLoading(true);
      setError(null);
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        if (active) {
          setError("Soru kartları yüklenemedi.");
          setLoading(false);
        }
        return;
      }

      const user = sessionData.session?.user;
      if (!user) {
        if (active) {
          setNeedsSignIn(true);
          setLoading(false);
        }
        return;
      }

      let rows: QuestionCard[] = [];
      if (kind === "sent") {
        const { data, error: queryError } = await supabase
          .from("cards")
          .select(CARD_COLUMNS)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (queryError) {
          if (active) setError("Soru kartları yüklenemedi.");
        } else {
          rows = (data || []) as QuestionCard[];
        }
      } else {
        const identities = Array.from(new Set([
          user.user_metadata?.username,
          user.user_metadata?.full_name,
        ].filter((value): value is string => typeof value === "string" && value.trim().length > 0)));
        const escapeLike = (value: string) => value.replace(/[\\%_]/g, "\\$&");
        const results = await Promise.all(identities.map((identity) =>
          supabase
            .from("cards")
            .select(CARD_COLUMNS)
            .ilike("target_username", escapeLike(identity.trim()))
            .order("created_at", { ascending: false })
        ));
        const failed = results.some((result) => result.error);
        if (failed) {
          if (active) setError("Soru kartları yüklenemedi.");
        } else {
          const uniqueCards = new Map<string, QuestionCard>();
          results.forEach((result) => {
            (result.data || []).forEach((card) => uniqueCards.set(card.id, card as QuestionCard));
          });
          rows = Array.from(uniqueCards.values()).sort((first, second) =>
            new Date(second.created_at).getTime() - new Date(first.created_at).getTime());
        }
      }

      if (active) {
        setCards(rows);
        setLoading(false);
      }
    };

    loadCards().catch(() => {
      if (active) {
        setError("Soru kartları yüklenemedi.");
        setLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, [kind]);

  const title = kind === "sent" ? t("Gönderilenler") : t("Gelenler");
  const description = kind === "sent" ? t("Gönderdiğin sorular") : t("Sana gönderilen sorular");

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-24 text-white">
      <section className="mx-auto w-full max-w-4xl rounded-[28px] border border-slate-800 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
        <header className="mb-6">
          <h1 className="text-2xl font-extrabold">{title}</h1>
          <p className="mt-1 text-xs text-slate-400">{description}</p>
        </header>

        {loading ? (
          <p className="py-12 text-center text-sm text-slate-400">{t("Kart yükleniyor...")}</p>
        ) : needsSignIn ? (
          <div className="rounded-2xl border border-dashed border-slate-700 p-10 text-center text-sm text-slate-400">
            {t("Bu bölümü görmek için giriş yapmalısın.")}
          </div>
        ) : error ? (
          <div role="alert" className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-8 text-center text-sm text-rose-300">
            {t(error)}
          </div>
        ) : cards.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-700 p-10 text-center text-sm text-slate-400">
            {t(kind === "sent" ? "Henüz soru kartı göndermedin." : "Sana gönderilmiş soru kartı bulunamadı.")}
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {cards.map((card) => (
              <article key={card.id} className="flex flex-col gap-4 py-5 first:pt-0 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-bold leading-relaxed text-white">{card.soru}</p>
                  <p className="mt-2 text-xs text-slate-400">
                    {kind === "sent" ? `${t("Alıcı:")} ${card.target_username}` : `${t("Gönderen:")} ${card.from_username}`}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-x-3 text-[11px] text-slate-500">
                    <time>{new Date(card.created_at).toLocaleString(language === "en" ? "en-US" : "tr-TR")}</time>
                    <span>{t("Durum:")} {t(card.status === "accepted" ? "Kabul edildi" : "Beklemede")}</span>
                  </div>
                </div>
                <Link
                  href={`/k/card/${encodeURIComponent(card.id)}?v=2`}
                  className="inline-flex h-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 px-4 text-xs font-bold text-white transition hover:bg-indigo-500"
                >
                  {t("Soruyu aç")}
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}