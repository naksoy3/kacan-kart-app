"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";
import { useLanguage } from "@/components/LanguageProvider";

type Notification = {
  id: string;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
  type: string;
  actor_id: string | null;
  actor_username: string | null;
};

export default function BildirimlerPage() {
  const { language, t } = useLanguage();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedInviteId, setCopiedInviteId] = useState<string | null>(null);
  const translateNotificationMessage = (message: string) => {
    const marker = " soruna Evet yanıtı verdi: ";
    const markerIndex = message.indexOf(marker);
    if (language === "en" && markerIndex >= 0) {
      return `${message.slice(0, markerIndex)} ${t("soruna Evet yanıtı verdi:")} ${message.slice(markerIndex + marker.length)}`;
    }
    const receivedMarker = " sana cevaplaman için bir soru gönderdi: ";
    const receivedMarkerIndex = message.indexOf(receivedMarker);
    if (language === "en" && receivedMarkerIndex >= 0) {
      return `${message.slice(0, receivedMarkerIndex)} ${t("sana cevaplaman için bir soru gönderdi:")} ${message.slice(receivedMarkerIndex + receivedMarker.length)}`;
    }
    return t(message);
  };

  const inviteToPlatform = async (notificationId: string) => {
    const inviteUrl = new URL("/kayit", window.location.origin).toString();
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Cardasks",
          text: t("Cardasks'e katıl ve kendi soru kartını oluştur!"),
          url: inviteUrl,
        });
      } else {
        await navigator.clipboard.writeText(inviteUrl);
        setCopiedInviteId(notificationId);
        window.setTimeout(() => setCopiedInviteId(null), 2500);
      }
    } catch {
      // Share cancellation is not an error state.
    }
  };

  useEffect(() => {
    const loadNotifications = async (userId: string, accessToken: string) => {
      try {
        const query = new URLSearchParams({
          select: "id,title,message,created_at,read,type,actor_id,actor_username",
          user_id: `eq.${userId}`,
          order: "created_at.desc",
        });
        const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/notifications?${query}`, {
          headers: {
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
            Authorization: `Bearer ${accessToken}`,
          },
        });
        if (!response.ok) throw new Error(await response.text());
        const rows = (await response.json()) as Notification[];
        const actorIds = Array.from(new Set(rows.flatMap((notification) => notification.actor_id ? [notification.actor_id] : [])));
        let actorUsernames = new Map<string, string>();
        if (actorIds.length > 0) {
          const { data: profiles } = await supabase
            .from("profiles")
            .select("id,username")
            .in("id", actorIds);
          actorUsernames = new Map((profiles || []).map((profile) => [profile.id, profile.username]));
        }
        const enrichedRows = rows.map((notification) => ({
          ...notification,
          actor_username: notification.actor_username || (notification.actor_id ? actorUsernames.get(notification.actor_id) || null : null),
        }));
        setNotifications(enrichedRows);

        const unreadIds = rows.filter((notification) => !notification.read);
        if (unreadIds.length > 0) {
          const readQuery = new URLSearchParams({ user_id: `eq.${userId}`, read: "eq.false" });
          await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/notifications?${readQuery}`, {
            method: "PATCH",
            headers: {
              apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
              Prefer: "return=minimal",
            },
            body: JSON.stringify({ read: true }),
          });
        }
      } catch {
        setError(t("Bildirimler sorgusu zaman aşımına uğradı veya oturum okunamadı. Lütfen çıkış yapıp tekrar giriş yap."));
      } finally {
        setLoading(false);
      }
    };

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        setLoading(false);
        return;
      }
      window.setTimeout(() => loadNotifications(session.user.id, session.access_token), 0);
    });

    return () => data.subscription.unsubscribe();
  }, [router]);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-24 text-white">
      <div className="mx-auto w-full max-w-2xl rounded-[28px] border border-slate-800 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold">{t("Bildirimler")}</h1>
            <p className="mt-1 text-xs text-slate-400">{t("Kartlarına gelen yanıtlar burada görünür.")}</p>
          </div>
          <Link href="/" className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold hover:bg-indigo-500">
            {t("Anasayfa")}
          </Link>
        </div>

        {loading ? (
          <p className="py-12 text-center text-sm text-slate-400">{t("Bildirimler yükleniyor...")}</p>
          ) : error ? (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-10 text-center text-sm text-rose-300">{error}</div>
        ) : notifications.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-700 p-10 text-center text-sm text-slate-400">
            {t("Henüz bildirimin yok.")}
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <article key={notification.id} className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                <h2 className="text-sm font-bold text-emerald-300">{t(notification.title)}</h2>
                <p className="mt-1 text-sm text-slate-200">{translateNotificationMessage(notification.message)}</p>
                <time className="mt-2 block text-[11px] text-slate-500">
                  {new Date(notification.created_at).toLocaleString(language === "en" ? "en-US" : "tr-TR")}
                </time>
                {notification.type === "card_accepted" && notification.actor_id && notification.actor_username ? (
                  <Link
                    href={`/mesajlar?to=${encodeURIComponent(notification.actor_username)}`}
                    className="mt-3 inline-flex h-9 items-center justify-center rounded-xl bg-indigo-600 px-4 text-xs font-bold text-white transition hover:bg-indigo-500"
                  >
                    {t("💬 Mesaj Gönder")}
                  </Link>
                ) : notification.type === "card_accepted" && !notification.actor_id ? (
                  <button
                    type="button"
                    onClick={() => void inviteToPlatform(notification.id)}
                    className="mt-3 inline-flex h-9 items-center justify-center rounded-xl border border-indigo-400/30 bg-indigo-500/10 px-4 text-xs font-bold text-indigo-200 transition hover:bg-indigo-500/20"
                  >
                    {copiedInviteId === notification.id ? t("Davet bağlantısı kopyalandı!") : t("Platforma Davet Et")}
                  </button>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
