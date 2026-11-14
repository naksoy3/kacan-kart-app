"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { supabase } from "@/utils/supabase";
import AuthModal from "@/components/AuthModal";
import { useLanguage } from "@/components/LanguageProvider";

function SiteHeaderContent() {
  const { language, setLanguage, t } = useLanguage();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [profileSearch, setProfileSearch] = useState("");
  const [profileResults, setProfileResults] = useState<Array<{ username: string; full_name: string; avatar_url: string | null }>>([]);
  const [profileSearchLoading, setProfileSearchLoading] = useState(false);
  const [profileSearchOpen, setProfileSearchOpen] = useState(false);

  const isSharedCard =
    pathname === "/inbox" ||
    pathname.startsWith("/k/card/") ||
    (pathname === "/" && Boolean(searchParams.get("id") || searchParams.get("u") || searchParams.get("s")));

  useEffect(() => {
    if (pathname === "/bildirimler") setUnreadNotifications(0);
  }, [pathname]);

  useEffect(() => {
    const normalizedQuery = profileSearch.trim().replace(/^@+/, "");
    if (normalizedQuery.length < 2) {
      setProfileResults([]);
      setProfileSearchLoading(false);
      return;
    }

    let active = true;
    const timer = window.setTimeout(async () => {
      setProfileSearchLoading(true);
      const escapedQuery = normalizedQuery.replace(/[\\%_]/g, "\\$&");
      const { data, error } = await supabase
        .from("profiles")
        .select("username,full_name,avatar_url")
        .ilike("username", `${escapedQuery}%`)
        .order("username")
        .limit(6);

      if (active) {
        setProfileResults(error ? [] : data || []);
        setProfileSearchLoading(false);
      }
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [profileSearch]);

  useEffect(() => {
    let currentSession: any = null;

    const loadUnreadCount = async (session: any) => {
      const headers = {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
        Authorization: `Bearer ${session.access_token}`,
      };

      try {
        const params = new URLSearchParams({
          select: "id",
          user_id: `eq.${session.user.id}`,
          read: "eq.false",
        });
        const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/notifications?${params}`, {
          headers,
        });
        if (!response.ok) throw new Error("Unread notifications request failed");
        const rows = await response.json();
        setUnreadNotifications(Array.isArray(rows) ? rows.length : 0);
      } catch {
        setUnreadNotifications(0);
      }

      try {
        const messagesQuery = new URLSearchParams({
          select: "id",
          recipient_id: `eq.${session.user.id}`,
          read: "eq.false",
        });
        const messagesResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/messages?${messagesQuery}`, {
          headers,
        });
        if (!messagesResponse.ok) throw new Error("Unread messages request failed");
        const unreadMessageRows = await messagesResponse.json();
        setUnreadMessages(Array.isArray(unreadMessageRows) ? unreadMessageRows.length : 0);
      } catch {
        setUnreadMessages(0);
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
          else {
            setUnreadNotifications(0);
            setUnreadMessages(0);
          }
    });

    const refreshTimer = window.setInterval(() => {
      if (currentSession) loadUnreadCount(currentSession);
    }, 30000);
    const handleFocus = () => {
      if (currentSession) loadUnreadCount(currentSession);
    };
    const handleMessagesRead = () => {
      if (currentSession) loadUnreadCount(currentSession);
    };
    window.addEventListener("focus", handleFocus);
    window.addEventListener("messages-read", handleMessagesRead);

    return () => {
      data.subscription.unsubscribe();
      window.clearInterval(refreshTimer);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("messages-read", handleMessagesRead);
    };
  }, []);

  return (
    <>
      {!isSharedCard && (
        <nav className="relative z-50 mx-2 mt-2 grid w-[calc(100%-1rem)] grid-cols-3 gap-2 pb-1 sm:fixed sm:left-8 sm:top-4 sm:mx-0 sm:mt-0 sm:w-36 sm:grid-cols-1 sm:flex sm:flex-col sm:p-0">
          <a href="/" className="flex h-10 items-center justify-center rounded-xl border border-outline-variant/30 bg-surface-container/80 px-1.5 text-center text-label-sm font-label-sm text-on-surface-variant shadow-lg backdrop-blur transition hover:bg-surface-container-high/60 hover:text-on-surface sm:flex-none sm:px-3">
            {t("Anasayfa")}
          </a>
          <Link href="/bildirimler" className="relative flex h-10 items-center justify-center rounded-xl border border-outline-variant/30 bg-surface-container/80 px-1.5 text-center text-label-sm font-label-sm text-on-surface-variant shadow-lg backdrop-blur transition hover:bg-surface-container-high/60 hover:text-on-surface sm:flex-none sm:px-3">
            {t("Bildirimler")}
            {unreadNotifications > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-surface bg-tertiary px-1 text-label-sm font-bold leading-none text-background">
                {unreadNotifications > 99 ? "99+" : unreadNotifications}
              </span>
            )}
          </Link>
          <Link href="/mesajlar" className="relative flex h-10 items-center justify-center rounded-xl border border-outline-variant/30 bg-surface-container/80 px-1.5 text-center text-label-sm font-label-sm text-on-surface-variant shadow-lg backdrop-blur transition hover:bg-surface-container-high/60 hover:text-on-surface sm:flex-none sm:px-3">
            {t("Mesajlar")}
            {unreadMessages > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-surface bg-primary-container px-1 text-label-sm font-bold leading-none text-white" aria-label={`${unreadMessages} unread messages`}>
                {unreadMessages > 99 ? "99+" : unreadMessages}
              </span>
            )}
          </Link>
          <Link href="/gonderilenler" className="flex h-10 items-center justify-center rounded-xl border border-outline-variant/30 bg-surface-container/80 px-1.5 text-center text-label-sm font-label-sm text-on-surface-variant shadow-lg backdrop-blur transition hover:bg-surface-container-high/60 hover:text-on-surface sm:flex-none sm:px-3">
            {t("Gönderilenler")}
          </Link>
          <Link href="/gelenler" className="flex h-10 items-center justify-center rounded-xl border border-outline-variant/30 bg-surface-container/80 px-1.5 text-center text-label-sm font-label-sm text-on-surface-variant shadow-lg backdrop-blur transition hover:bg-surface-container-high/60 hover:text-on-surface sm:flex-none sm:px-3">
            {t("Gelenler")}
          </Link>
          <Link href="/kisiler" className="flex h-10 items-center justify-center rounded-xl border border-outline-variant/30 bg-surface-container/80 px-1.5 text-center text-label-sm font-label-sm text-on-surface-variant shadow-lg backdrop-blur transition hover:bg-surface-container-high/60 hover:text-on-surface sm:flex-none sm:px-3">
            {t("Kişiler")}
          </Link>
          <div className="relative col-span-3 sm:col-span-1">
            <label className="sr-only" htmlFor="profile-search">{t("Kişi ara")}</label>
            <input
              id="profile-search"
              type="search"
              value={profileSearch}
              onChange={(event) => {
                setProfileSearch(event.target.value);
                setProfileSearchOpen(true);
              }}
              onFocus={() => setProfileSearchOpen(true)}
              onKeyDown={(event) => {
                if (event.key === "Escape") setProfileSearchOpen(false);
                if (event.key === "Enter" && profileResults[0]) {
                  window.location.href = `/u/${encodeURIComponent(profileResults[0].username)}`;
                }
              }}
              placeholder={t("@ kullanıcı adı ara")}
              autoComplete="off"
              className="h-10 w-full rounded-xl border border-outline-variant/30 bg-surface-container/80 px-3 text-label-sm text-on-surface shadow-lg outline-none placeholder:text-on-surface-variant/60 focus:border-secondary focus:ring-2 focus:ring-secondary/25 transition-all"
            />
            {profileSearchOpen && profileSearch.trim().replace(/^@+/, "").length >= 2 && (
              <div className="absolute left-0 top-full z-[60] mt-2 max-h-72 w-full overflow-y-auto rounded-xl border border-outline-variant/40 bg-surface-container-high/95 backdrop-blur-xl p-1 shadow-2xl">
                {profileSearchLoading ? (
                  <p className="px-3 py-2 text-label-sm text-on-surface-variant">{t("Aranıyor...")}</p>
                ) : profileResults.length === 0 ? (
                  <p className="px-3 py-2 text-label-sm text-on-surface-variant">{t("Arama sonucu bulunamadı.")}</p>
                ) : profileResults.map((profile) => (
                  <Link
                    key={profile.username}
                    href={`/u/${encodeURIComponent(profile.username)}`}
                    onClick={() => {
                      setProfileSearchOpen(false);
                      setProfileSearch("");
                    }}
                    className="flex items-center gap-2 rounded-lg px-2 py-2 text-left transition hover:bg-surface-container-high/40"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-container/30 text-label-sm font-label-md font-bold text-primary-container">
                      {profile.avatar_url
                        ? <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
                        : profile.full_name.charAt(0).toUpperCase()}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-label-md font-label-md font-semibold text-on-surface">{profile.full_name}</span>
                      <span className="block truncate text-label-sm text-on-surface-variant">@{profile.username}</span>
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>
      )}

      <div className="relative z-50 ml-auto mr-3 mb-2 flex w-fit items-center gap-2 sm:fixed sm:right-4 sm:top-4 sm:ml-0 sm:mr-0 sm:mb-0">
        {user ? (
          <div className="flex items-center gap-2">
            <Link href="/profil" title={t("Profilini aç")} className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-primary-container/50 bg-gradient-to-tr from-primary-container via-secondary to-tertiary text-label-lg font-label-lg font-bold text-white shadow-lg transition hover:scale-105">
              {user.user_metadata?.avatar_url ? <img src={user.user_metadata.avatar_url} alt="Profil fotoğrafı" className="h-full w-full object-cover" /> : (user.user_metadata?.full_name || user.user_metadata?.username || "P").charAt(0).toUpperCase()}
            </Link>
            <button onClick={() => supabase.auth.signOut()} className="rounded-xl border border-error/40 bg-error-container/20 px-3 py-1.5 text-label-sm font-label-sm font-bold text-error shadow-lg transition hover:bg-error-container/30">
              {t("Çıkış")}
            </button>
          </div>
        ) : (
          <button onClick={() => setAuthOpen(true)} className="rounded-2xl bg-gradient-to-r from-primary-container to-[#E8437A] px-5 py-2.5 text-label-md font-label-md font-bold text-white shadow-btn-glow transition hover:brightness-110">
            {t("Giriş Yap / Kayıt Ol")}
          </button>
        )}
        <div className="flex rounded-full border border-outline-variant/30 bg-surface-container-lowest/80 p-0.5 text-label-sm font-label-sm shadow-lg backdrop-blur" role="group" aria-label="Language">
          {(["tr", "en"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setLanguage(option)}
              aria-pressed={language === option}
              className={`min-w-8 rounded-md px-2.5 py-1 transition ${language === option ? "bg-primary-container/25 text-white border border-primary-container" : "text-on-surface-variant hover:text-on-surface"}`}
            >
              {option.toUpperCase()}
            </button>
          ))}
        </div>
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
