"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import AuthModal from "@/components/AuthModal";
import { useLanguage } from "@/components/LanguageProvider";
import { supabase } from "@/utils/supabase";

type PublicProfile = {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
};

export default function PublicProfilePage() {
  const params = useParams<{ username: string }>();
  const router = useRouter();
  const { t } = useLanguage();
  const username = decodeURIComponent(params.username).toLowerCase();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isContact, setIsContact] = useState(false);
  const [contactBusy, setContactBusy] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      const { data, error: profileError } = await supabase
        .from("profiles")
        .select("id,username,full_name,avatar_url")
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

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setCurrentUserId(data.session?.user.id || null));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUserId(session?.user.id || null);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    let active = true;
    setIsContact(false);
    if (!currentUserId || !profile || currentUserId === profile.id) return;

    supabase
      .from("contacts")
      .select("contact_id")
      .eq("owner_id", currentUserId)
      .eq("contact_id", profile.id)
      .maybeSingle()
      .then(({ data }) => {
        if (active) setIsContact(Boolean(data));
      });

    return () => {
      active = false;
    };
  }, [currentUserId, profile]);

  const toggleContact = async () => {
    if (!profile) return;
    if (!currentUserId) {
      setContactError(t("Bir kişiyi eklemek için giriş yapmalısın."));
      setAuthOpen(true);
      return;
    }
    if (currentUserId === profile.id || contactBusy) return;

    setContactBusy(true);
    setContactError(null);
    const result = isContact
      ? await supabase.from("contacts").delete().eq("owner_id", currentUserId).eq("contact_id", profile.id)
      : await supabase.from("contacts").insert({ owner_id: currentUserId, contact_id: profile.id });

    if (result.error) setContactError(t("Kişi listen güncellenemedi."));
    else setIsContact(!isContact);
    setContactBusy(false);
  };

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
            {currentUserId !== profile.id && (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => void toggleContact()}
                  disabled={contactBusy}
                  className={`h-11 w-full rounded-xl border px-3 text-xs font-bold transition disabled:opacity-60 ${isContact ? "border-rose-400/30 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20" : "border-emerald-400/30 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20"}`}
                >
                  {contactBusy
                    ? t(isContact ? "Kişilerinden çıkarılıyor..." : "Kişilerine ekleniyor...")
                    : t(isContact ? "Kişilerinden Çıkar" : "Kişilerine Ekle")}
                </button>
                {contactError && <p role="alert" className="mt-2 text-xs text-rose-300">{contactError}</p>}
              </div>
            )}
          </>
        )}
      </section>
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} onSuccess={() => { setAuthOpen(false); router.refresh(); }} />
    </main>
  );
}