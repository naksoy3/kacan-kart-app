"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";

type Notification = {
  id: string;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
};

export default function BildirimlerPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadNotifications = async (userId: string) => {
      try {
        const activeUserId = userId;

        const query = supabase
          .from("notifications")
          .select("id, title, message, created_at, read")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });
        const { data, error: queryError } = await Promise.race([
          query,
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), 20000)),
        ]);

        if (queryError) setError(`Bildirimler yüklenemedi: ${queryError.message}`); 
        setNotifications((data || []) as Notification[]);
      } catch {
        setError("Bildirimler sorgusu zaman aşımına uğradı veya oturum okunamadı. Lütfen çıkış yapıp tekrar giriş yap.");
      } finally {
        setLoading(false);
      }
    };

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        setLoading(false);
        return;
      }
      window.setTimeout(() => loadNotifications(session.user.id), 0);
    });

    return () => data.subscription.unsubscribe();
  }, [router]);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-24 text-white">
      <div className="mx-auto w-full max-w-2xl rounded-[28px] border border-slate-800 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold">Bildirimler</h1>
            <p className="mt-1 text-xs text-slate-400">Kartlarına gelen yanıtlar burada görünür.</p>
          </div>
          <Link href="/" className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold hover:bg-indigo-500">
            Anasayfa
          </Link>
        </div>

        {loading ? (
          <p className="py-12 text-center text-sm text-slate-400">Bildirimler yükleniyor...</p>
          ) : error ? (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-10 text-center text-sm text-rose-300">{error}</div>
        ) : notifications.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-700 p-10 text-center text-sm text-slate-400">
            Henüz bildirimin yok.
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <article key={notification.id} className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                <h2 className="text-sm font-bold text-emerald-300">{notification.title}</h2>
                <p className="mt-1 text-sm text-slate-200">{notification.message}</p>
                <time className="mt-2 block text-[11px] text-slate-500">
                  {new Date(notification.created_at).toLocaleString("tr-TR")}
                </time>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
