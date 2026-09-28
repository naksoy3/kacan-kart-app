"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { supabase } from "@/utils/supabase";
import AuthModal from "@/components/AuthModal";

function SiteHeaderContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [authOpen, setAuthOpen] = useState(false);

  const isSharedCard =
    pathname === "/inbox" ||
    pathname.startsWith("/k/card/") ||
    (pathname === "/" && Boolean(searchParams.get("id") || searchParams.get("u") || searchParams.get("s")));

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  return (
    <>
      {!isSharedCard && (
        <nav className="fixed left-2 top-2 z-50 flex w-[calc(100%-1rem)] flex-row gap-2 sm:left-8 sm:top-4 sm:w-36 sm:flex-col">
          <a href="/" className="flex h-10 flex-1 items-center justify-center rounded-xl border border-white/10 bg-slate-900/90 px-3 text-xs font-semibold text-slate-200 shadow-lg backdrop-blur transition hover:bg-slate-800 sm:flex-none">
            Anasayfa
          </a>
          <Link href="/bildirimler" className="flex h-10 flex-1 items-center justify-center rounded-xl border border-white/10 bg-slate-900/90 px-3 text-xs font-semibold text-slate-200 shadow-lg backdrop-blur transition hover:bg-slate-800 sm:flex-none">
            Bildirimler
          </Link>
          <Link href="/mesajlar" className="flex h-10 flex-1 items-center justify-center rounded-xl border border-white/10 bg-slate-900/90 px-3 text-xs font-semibold text-slate-200 shadow-lg backdrop-blur transition hover:bg-slate-800 sm:flex-none">
            Mesajlar
          </Link>
        </nav>
      )}

      <div className="fixed right-4 top-4 z-50">
        {user ? (
          <div className="flex flex-col items-center gap-2">
            <Link href="/profil" title="Profilini aç" className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-indigo-400/50 bg-gradient-to-tr from-indigo-500 to-purple-500 text-sm font-bold text-white shadow-lg transition hover:scale-105">
              {user.user_metadata?.avatar_url ? <img src={user.user_metadata.avatar_url} alt="Profil fotoğrafı" className="h-full w-full object-cover" /> : (user.user_metadata?.full_name || user.user_metadata?.username || "P").charAt(0).toUpperCase()}
            </Link>
            <button onClick={() => supabase.auth.signOut()} className="rounded-xl border border-rose-500/20 bg-slate-900/90 px-3 py-1.5 text-[11px] font-bold text-rose-400 shadow-lg transition hover:bg-rose-600/20">
              Çıkış
            </button>
          </div>
        ) : (
          <button onClick={() => setAuthOpen(true)} className="rounded-2xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500">
            Giriş Yap / Kayıt Ol
          </button>
        )}
      </div>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} onSuccess={() => setAuthOpen(false)} />
    </>
  );
}

export default function SiteHeader() {
  return (
    <Suspense fallback={null}>
      <SiteHeaderContent />
    </Suspense>
  );
}
