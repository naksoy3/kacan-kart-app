"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useLanguage } from "@/components/LanguageProvider";
import { supabase } from "@/utils/supabase";

type PublicProfile = {
  username: string;
  full_name: string;
  avatar_url: string | null;
};

export default function PublicProfilePage() {
  const params = useParams<{ username: string }>();
  const { t } = useLanguage();
  const username = decodeURIComponent(params.username).toLowerCase();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      const { data, error: profileError } = await supabase
        .from("profiles")
        .select("username,full_name,avatar_url")
        .eq("username", username)
        .maybeSingle();

      if (!active) return;
      if (profileError) setError("Profil yüklenemedi. Tekrar deneyin.");
      else if (!data) setError("Profil bulunamadı.");
      else setProfile(data as PublicProfile);
      setLoading(false);
    };

    loadProfile().catch(() => {
      if (active) {
        setError("Profil yüklenemedi. Tekrar deneyin.");
        setLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, [username]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-24 text-white">
      <section className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/90 p-8 text-center shadow-2xl backdrop-blur-xl">
        {loading ? (
          <p className="animate-pulse text-sm text-slate-400">{t("Kart yükleniyor...")}</p>
        ) : error || !profile ? (
          <p role="alert" className="text-sm text-rose-300">{t(error || "Profil bulunamadı.")}</p>
        ) : (
          <>
            <div className="mx-auto flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-indigo-400/40 bg-indigo-500/20 text-3xl font-bold text-indigo-200">
              {profile.avatar_url
                ? <img src={profile.avatar_url} alt={profile.full_name} className="h-full w-full object-cover" />
                : profile.full_name.charAt(0).toUpperCase()}
            </div>
            <h1 className="mt-5 text-2xl font-extrabold">{profile.full_name}</h1>
            <p className="mt-1 text-sm text-slate-400">@{profile.username}</p>
            <div className="mt-7 grid grid-cols-2 gap-3">
              <Link
                href={`/mesajlar?to=${encodeURIComponent(profile.username)}`}
                className="flex h-11 items-center justify-center rounded-xl bg-indigo-600 px-3 text-xs font-bold text-white transition hover:bg-indigo-500"
              >
                {t("💬 Mesaj At")}
              </Link>
              <Link
                href={`/?to=${encodeURIComponent(profile.username)}&step=1`}
                className="flex h-11 items-center justify-center rounded-xl border border-indigo-400/30 bg-indigo-500/10 px-3 text-xs font-bold text-indigo-200 transition hover:bg-indigo-500/20"
              >
                {t("✨ Soru Sor")}
              </Link>
            </div>
          </>
        )}
      </section>
    </main>
  );
}