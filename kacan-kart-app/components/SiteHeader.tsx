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
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const isSharedCard =
    pathname === "/inbox" ||
    pathname.startsWith("/k/card/") ||
    (pathname === "/" && Boolean(searchParams.get("id") || searchParams.get("u") || searchParams.get("s")));

  useEffect(() => {
    if (pathname === "/bildirimler") setUnreadNotifications(0);
  }, [pathname]);

  useEffect(() => {
    let currentSession: any = null;

    const loadUnreadCount = async (session: any) => {
      try {
        const params = new URLSearchParams({
          select: "id",
          user_id: `eq.${session.user.id}`,
          read: "eq.false",
        });
        const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/notifications?${params}`, {
          headers: {
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
            Authorization: `Bearer ${session.access_token}`,
          },
        });
        if (!response.ok) throw new Error("Unread notifications request failed");
        const rows = await response.json();
        setUnreadNotifications(Array.isArray(rows) ? rows.length : 0);
      } catch {
        setUnreadNotifications(0);
      }
    };

    supabase.auth.getSession().then(({ data }) => {
      currentSession = data.session;
      setUser(currentSession?.user ?? null);
      if (currentSession) loadUnreadCount(currentSession);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      currentSession = session;
      setUser(session?.user ?? null);
      if (session) window.setTimeout(() => loadUnreadCount(session), 0);
      else setUnreadNotifications(0);
    });

    const refreshTimer = window.setInterval(() => {
      if (currentSession) loadUnreadCount(currentSession);
    }, 30000);
    const handleFocus = () => {
      if (currentSession) loadUnreadCount(currentSession);
    };
    window.addEventListener("focus", handleFocus);

    return () => {
      data.subscription.unsubscribe();
      window.clearInterval(refreshTimer);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  return (
    <>
      {!isSharedCard && (
        <nav className="fixed left-2 top-2 z-50 flex w-[calc(100%-1rem)] flex-row gap-2 sm:left-8 sm:top-4 sm:w-36 sm:flex-col">
          <a href="/" className="flex h-10 flex-1 items-center justify-center rounded-xl border border-white/10 bg-slate-900/90 px-3 text-xs font-semibold text-slate-200 shadow-lg backdrop-blur transition hover:bg-slate-800 sm:flex-none">
            Anasayfa
          </a>
          <Link href="/bildirimler" className="relative flex h-10 flex-1 items-center justify-center rounded-xl border border-white/10 bg-slate-900/90 px-3 text-xs font-semibold text-slate-200 shadow-lg backdrop-blur transition hover:bg-slate-800 sm:flex-none">
            Bildirimler
            {unreadNotifications > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-slate-950 bg-rose-500 px-1 text-[10px] font-bold leading-none text-white">
                {unreadNotifications > 99 ? "99+" : unreadNotifications}
              </span>
            )}
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
