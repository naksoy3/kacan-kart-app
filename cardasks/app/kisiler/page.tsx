"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";
import { supabase } from "@/utils/supabase";

type ContactProfile = {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
};

export default function ContactsPage() {
  const { t } = useLanguage();
  const [contacts, setContacts] = useState<ContactProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadContacts = async (userId: string) => {
      const { data: rows, error: contactsError } = await supabase
        .from("contacts")
        .select("contact_id,created_at")
        .eq("owner_id", userId)
        .order("created_at", { ascending: false });

      if (contactsError) throw contactsError;
      const ids = (rows || []).map((row) => row.contact_id);
      if (ids.length === 0) {
        if (active) setContacts([]);
        return;
      }

      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id,username,full_name,avatar_url")
        .in("id", ids);

      if (profilesError) throw profilesError;
      const profileMap = new Map((profiles || []).map((profile) => [profile.id, profile as ContactProfile]));
      const orderedContacts = ids.flatMap((id) => profileMap.has(id) ? [profileMap.get(id)!] : []);
      if (active) setContacts(orderedContacts);
    };

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setError(null);
      if (!session?.user) {
        setContacts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      window.setTimeout(() => {
        loadContacts(session.user.id)
          .catch(() => { if (active) setError("Kişi listen yüklenemedi."); })
          .finally(() => { if (active) setLoading(false); });
      }, 0);
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-24 text-white">
      <section className="mx-auto w-full max-w-3xl rounded-[28px] border border-slate-800 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
        <header className="mb-6">
          <h1 className="text-2xl font-extrabold">{t("Kişilerim")}</h1>
        </header>

        {error && <p role="alert" className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">{t(error)}</p>}
        {loading ? (
          <p className="py-12 text-center text-sm text-slate-400">{t("Kart yükleniyor...")}</p>
        ) : contacts.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-700 p-10 text-center text-sm text-slate-400">{t("Henüz kişi eklemedin.")}</p>
        ) : (
          <div className="divide-y divide-slate-800">
            {contacts.map((contact) => (
              <div key={contact.id} className="flex flex-col gap-3 py-4 first:pt-0 sm:flex-row sm:items-center">
                <Link href={`/u/${encodeURIComponent(contact.username)}`} className="flex min-w-0 flex-1 items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-500/20 text-sm font-bold text-indigo-200">
                    {contact.avatar_url
                      ? <img src={contact.avatar_url} alt="" className="h-full w-full object-cover" />
                      : contact.full_name.charAt(0).toUpperCase()}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-white">{contact.full_name}</span>
                    <span className="block truncate text-xs text-slate-400">@{contact.username}</span>
                  </span>
                </Link>
                <div className="grid w-full shrink-0 grid-cols-2 gap-2 sm:w-auto">
                  <Link
                    href={`/mesajlar?to=${encodeURIComponent(contact.username)}`}
                    className="flex h-10 items-center justify-center rounded-xl bg-indigo-600 px-3 text-[11px] font-bold text-white transition hover:bg-indigo-500"
                  >
                    {t("💬 Mesaj At")}
                  </Link>
                  <Link
                    href={`/?to=${encodeURIComponent(contact.username)}&step=1`}
                    className="flex h-10 items-center justify-center rounded-xl border border-indigo-400/30 bg-indigo-500/10 px-3 text-[11px] font-bold text-indigo-200 transition hover:bg-indigo-500/20"
                  >
                    {t("✨ Soru Sor")}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}