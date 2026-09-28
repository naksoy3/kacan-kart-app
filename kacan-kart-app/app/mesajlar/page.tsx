"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";

type Message = {
  id: string;
  sender_id: string;
  recipient_id: string;
  body: string;
  read: boolean;
  created_at: string;
  sender_name?: string;
  recipient_name?: string;
};

type Profile = {
  id: string;
  username: string;
  full_name: string;
};

export default function MesajlarPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [recipientUsername, setRecipientUsername] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadMessages = async (currentUserId: string) => {
    const query = supabase
      .from("messages")
      .select("id, sender_id, recipient_id, body, read, created_at")
      .or(`sender_id.eq.${currentUserId},recipient_id.eq.${currentUserId}`)
      .order("created_at", { ascending: false });
    const { data, error: messagesError } = await Promise.race([
      query,
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), 20000)),
    ]).catch(() => ({ data: null, error: new Error("timeout") }));

    if (messagesError) {
      setError(`Mesajlar yüklenemedi: ${messagesError.message}`);
      return;
    }

    const rows = (data || []) as Message[];
    const profileIds = Array.from(new Set(rows.flatMap((message) => [message.sender_id, message.recipient_id])));
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, username, full_name")
      .in("id", profileIds);

    const profileMap = new Map((profiles || []).map((profile: Profile) => [profile.id, profile]));
    setMessages(rows.map((message) => ({
      ...message,
      sender_name: profileMap.get(message.sender_id)?.full_name || profileMap.get(message.sender_id)?.username || "Kullanıcı",
      recipient_name: profileMap.get(message.recipient_id)?.full_name || profileMap.get(message.recipient_id)?.username || "Kullanıcı",
    })));
  };

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!data.session?.user) return;
        const activeUserId = data.session.user.id;
        setUserId(activeUserId);
        await loadMessages(activeUserId);
      } catch {
        setError("Mesajlar yüklenemedi. Supabase bağlantısını veya tablo ayarlarını kontrol et.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  const handleSend = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!userId) return;

    setSending(true);
    setError(null);
    setFeedback(null);
    const normalizedUsername = recipientUsername.trim().toLowerCase();

    const { data: recipient, error: recipientError } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", normalizedUsername)
      .maybeSingle();

    if (recipientError || !recipient) {
      setError("Bu kullanıcı adıyla kayıtlı bir profil bulunamadı.");
      setSending(false);
      return;
    }

    if (recipient.id === userId) {
      setError("Kendine mesaj gönderemezsin.");
      setSending(false);
      return;
    }

    const { error: messageError } = await supabase.from("messages").insert({
      sender_id: userId,
      recipient_id: recipient.id,
      body: body.trim(),
    });

    if (messageError) {
      setError(messageError.message);
    } else {
      setFeedback("Mesajın gönderildi.");
      setRecipientUsername("");
      setBody("");
      await loadMessages(userId);
    }
    setSending(false);
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-24 text-white">
      <div className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[320px_1fr]">
        <section className="rounded-[28px] border border-slate-800 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-xl">
          <h1 className="text-2xl font-extrabold">Mesajlar</h1>
          <p className="mt-2 text-xs leading-relaxed text-slate-400">Kullanıcı adıyla bir arkadaşına doğrudan mesaj gönder.</p>
          <form onSubmit={handleSend} className="mt-6 space-y-4">
            <label className="block text-xs font-semibold text-slate-300">
              Alıcının kullanıcı adı
              <input required value={recipientUsername} onChange={(event) => setRecipientUsername(event.target.value)} placeholder="kullanici_adi" className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-500" />
            </label>
            <label className="block text-xs font-semibold text-slate-300">
              Mesajın
              <textarea required maxLength={2000} value={body} onChange={(event) => setBody(event.target.value)} placeholder="Mesajını yaz..." rows={5} className="mt-1.5 w-full resize-none rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-500" />
            </label>
            {error && <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">{error}</p>}
            {feedback && <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300">{feedback}</p>}
            <button type="submit" disabled={sending} className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-bold hover:bg-indigo-500 disabled:opacity-50">{sending ? "Gönderiliyor..." : "Mesaj Gönder"}</button>
          </form>
          <Link href="/" className="mt-4 block text-center text-xs font-semibold text-indigo-300 hover:underline">Anasayfaya dön</Link>
        </section>

        <section className="rounded-[28px] border border-slate-800 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-xl">
          <h2 className="text-lg font-bold">Gelen ve gönderilen mesajlar</h2>
          {loading ? (
            <p className="py-12 text-center text-sm text-slate-400">Mesajlar yükleniyor...</p>
          ) : error ? (
            <div className="mt-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-10 text-center text-sm text-rose-300">{error}</div>
          ) : messages.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-700 p-10 text-center text-sm text-slate-400">Henüz mesajın yok.</div>
          ) : (
            <div className="mt-5 space-y-3">
              {messages.map((message) => {
                const received = message.recipient_id === userId;
                return (
                  <article key={message.id} className={`rounded-2xl border p-4 ${received ? "border-indigo-500/30 bg-indigo-500/10" : "border-slate-700 bg-slate-800/60"}`}>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-bold text-white">{received ? message.sender_name : `Alıcı: ${message.recipient_name}`}</p>
                      <time className="text-[11px] text-slate-500">{new Date(message.created_at).toLocaleString("tr-TR")}</time>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-slate-200">{message.body}</p>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
