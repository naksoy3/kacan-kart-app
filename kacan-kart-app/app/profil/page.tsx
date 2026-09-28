"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";

type ProfileUser = {
  email?: string;
  user_metadata?: {
    full_name?: string;
    username?: string;
    avatar_url?: string | null;
  };
};

export default function ProfilPage() {
  const router = useRouter();
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace("/");
        return;
      }
      setUser(data.user as ProfileUser);
      setLoading(false);
    });
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };

  if (loading || !user) {
    return <main className="min-h-screen bg-slate-950" />;
  }

  const metadata = user.user_metadata || {};
  const displayName = metadata.full_name || metadata.username || "Profil";

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-16 text-white">
      <div className="mx-auto w-full max-w-lg rounded-[28px] border border-slate-800 bg-slate-900/90 p-8 text-center shadow-2xl backdrop-blur-xl sm:p-10">
        <div className="mx-auto mb-5 flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-2 border-indigo-400/50 bg-gradient-to-tr from-indigo-500 to-purple-500 text-4xl font-bold shadow-lg">
          {metadata.avatar_url ? (
            <img src={metadata.avatar_url} alt="Profil fotoğrafı" className="h-full w-full object-cover" />
          ) : (
            displayName.charAt(0).toUpperCase()
          )}
        </div>
        <h1 className="text-2xl font-extrabold">{displayName}</h1>
        {metadata.username && <p className="mt-1 text-sm text-indigo-300">@{metadata.username}</p>}
        <p className="mt-3 text-xs text-slate-400">{user.email}</p>

        <div className="mt-8 flex flex-col gap-3">
          <Link href="/" className="rounded-xl bg-indigo-600 py-3 text-sm font-bold transition hover:bg-indigo-500">
            Anasayfaya dön
          </Link>
          <button onClick={handleSignOut} className="rounded-xl border border-rose-500/30 bg-rose-500/10 py-3 text-sm font-bold text-rose-300 transition hover:bg-rose-500/20">
            Çıkış yap
          </button>
        </div>
      </div>
    </main>
  );
}
