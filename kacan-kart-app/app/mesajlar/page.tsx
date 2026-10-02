"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";
import { useLanguage } from "@/components/LanguageProvider";

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
  const { language, t } = useLanguage();
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [recipientUsername, setRecipientUsername] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [sendingReplyTo, setSendingReplyTo] = useState<string | null>(null);
  const [replyError, setReplyError] = useState<{ participantId: string; message: string } | null>(null);

  const loadMessages = async (currentUserId: string, accessToken: string) => {
    const query = new URLSearchParams({
      select: "id,sender_id,recipient_id,body,read,created_at",
      or: `(sender_id.eq.${currentUserId},recipient_id.eq.${currentUserId})`,
      order: "created_at.desc",
    });
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/messages?${query}`, {
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!response.ok) throw new Error(await response.text());

    const rows = (await response.json()) as Message[];
    const profileIds = Array.from(new Set(rows.flatMap((message) => [message.sender_id, message.recipient_id])));
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, username, full_name")
      .in("id", profileIds);

    const profileMap = new Map((profiles || []).map((profile: Profile) => [profile.id, profile]));
    setMessages(rows.map((message) => ({
      ...message,
      sender_name: profileMap.get(message.sender_id)?.full_name || profileMap.get(message.sender_id)?.username || t("Kullanıcı"),
      recipient_name: profileMap.get(message.recipient_id)?.full_name || profileMap.get(message.recipient_id)?.username || t("Kullanıcı"),
    })));
  };

  const markConversationRead = async (participantId: string) => {
    if (!userId) return;
    const unreadIds = messages
      .filter((message) => message.sender_id === participantId && message.recipient_id === userId && !message.read)
      .map((message) => message.id);
    if (unreadIds.length === 0) return;

    const { error: markReadError } = await supabase
      .from("messages")
      .update({ read: true })
      .in("id", unreadIds)
      .eq("recipient_id", userId);

    if (markReadError) return;

    setMessages((current) => current.map((message) => unreadIds.includes(message.id)
      ? { ...message, read: true }
      : message));
    window.dispatchEvent(new Event("messages-read"));
  };

  const conversations = Array.from(messages.reduce((groups, message) => {
    const participantId = message.sender_id === userId ? message.recipient_id : message.sender_id;
    const conversation = groups.get(participantId) || [];
    conversation.push(message);
    groups.set(participantId, conversation);
    return groups;
  }, new Map<string, Message[]>())).map(([participantId, conversationMessages]) => {
    const sortedMessages = [...conversationMessages].sort((first, second) =>
      new Date(first.created_at).getTime() - new Date(second.created_at).getTime());
    const latestMessage = sortedMessages[sortedMessages.length - 1];
    const participantName = latestMessage.sender_id === participantId
      ? latestMessage.sender_name
      : latestMessage.recipient_name;

    return {
      participantId,
      participantName,
      messages: sortedMessages,
      latestMessage,
      unreadCount: conversationMessages.filter((message) =>
        message.sender_id === participantId && message.recipient_id === userId && !message.read).length,
    };
  }).sort((first, second) =>
    new Date(second.latestMessage.created_at).getTime() - new Date(first.latestMessage.created_at).getTime());

  useEffect(() => {
    const preselectedRecipient = new URLSearchParams(window.location.search).get("to");
    if (preselectedRecipient) setRecipientUsername(preselectedRecipient);
  }, []);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        setLoading(false);
        return;
      }

      setUserId(session.user.id);
      window.setTimeout(() => {
        loadMessages(session.user.id, session.access_token)
          .catch(() => setError(t("Mesajlar yüklenemedi. Lütfen tekrar dene.")))
          .finally(() => setLoading(false));
      }, 0);
    });

    return () => data.subscription.unsubscribe();
  }, [router]);

  const handleSend = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!userId) {
      setError(t("Mesaj göndermek için giriş yapmalısın."));
      return;
    }

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
      setError(t("Bu kullanıcı adıyla kayıtlı bir profil bulunamadı."));
      setSending(false);
      return;
    }

    if (recipient.id === userId) {
      setError(t("Kendine mesaj gönderemezsin."));
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
      setFeedback(t("Mesajın gönderildi."));
      setRecipientUsername("");
      setBody("");
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session) await loadMessages(userId, sessionData.session.access_token);
    }
    setSending(false);
  };

  const handleReply = async (event: FormEvent<HTMLFormElement>, participantId: string) => {
    event.preventDefault();
    if (!userId || sendingReplyTo) return;

    const replyBody = replyDrafts[participantId]?.trim();
    if (!replyBody) return;

    setSendingReplyTo(participantId);
    setReplyError(null);
    const { error: messageError } = await supabase.from("messages").insert({
      sender_id: userId,
      recipient_id: participantId,
      body: replyBody,
    });

    if (messageError) {
      setReplyError({ participantId, message: messageError.message });
      setSendingReplyTo(null);
      return;
    }

    setReplyDrafts((current) => ({ ...current, [participantId]: "" }));
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData.session) {
      try {
        await loadMessages(userId, sessionData.session.access_token);
      } catch {
        setReplyError({ participantId, message: t("Mesajlar yüklenemedi. Lütfen tekrar dene.") });
      }
    }
    setSendingReplyTo(null);
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-24 text-white">
      <div className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[320px_1fr]">
        <section className="rounded-[28px] border border-slate-800 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-xl">
          <h1 className="text-2xl font-extrabold">{t("Mesajlar")}</h1>
          <p className="mt-2 text-xs leading-relaxed text-slate-400">{t("Kullanıcı adıyla bir arkadaşına doğrudan mesaj gönder.")}</p>
          <form onSubmit={handleSend} className="mt-6 space-y-4">
            <label className="block text-xs font-semibold text-slate-300">
              {t("Alıcının kullanıcı adı")}
              <input required value={recipientUsername} onChange={(event) => setRecipientUsername(event.target.value)} placeholder="kullanici_adi" className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-500" />
            </label>
            <label className="block text-xs font-semibold text-slate-300">
              {t("Mesajın")}
              <textarea required maxLength={2000} value={body} onChange={(event) => setBody(event.target.value)} placeholder={t("Mesajını yaz...")} rows={5} className="mt-1.5 w-full resize-none rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-500" />
            </label>
            {error && <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">{error}</p>}
            {feedback && <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300">{feedback}</p>}
            <button type="submit" disabled={sending} className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-bold hover:bg-indigo-500 disabled:opacity-50">{sending ? t("Gönderiliyor...") : t("Mesaj Gönder")}</button>
          </form>
          <Link href="/" className="mt-4 block text-center text-xs font-semibold text-indigo-300 hover:underline">{t("Anasayfaya dön")}</Link>
        </section>

        <section className="rounded-[28px] border border-slate-800 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-xl">
          <h2 className="text-lg font-bold">{t("Gelen ve gönderilen mesajlar")}</h2>
          {loading ? (
            <p className="py-12 text-center text-sm text-slate-400">{t("Mesajlar yükleniyor...")}</p>
          ) : error ? (
            <div className="mt-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-10 text-center text-sm text-rose-300">{error}</div>
          ) : conversations.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-700 p-10 text-center text-sm text-slate-400">{t("Henüz mesajın yok.")}</div>
          ) : (
            <div className="mt-5 space-y-3">
              {conversations.map((conversation) => (
                <details
                  key={conversation.participantId}
                  onToggle={(event) => {
                    if (event.currentTarget.open) void markConversationRead(conversation.participantId);
                  }}
                  className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-800/50"
                >
                  <summary className="flex cursor-pointer list-none items-center gap-3 p-4 hover:bg-slate-800">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-sm font-bold text-indigo-200">
                      {conversation.participantName?.charAt(0).toUpperCase() || "?"}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-3">
                        <span className="truncate text-sm font-bold text-white">{conversation.participantName}</span>
                        <time className="shrink-0 text-[11px] text-slate-500">
                          {new Date(conversation.latestMessage.created_at).toLocaleString(language === "en" ? "en-US" : "tr-TR")}
                        </time>
                      </span>
                      <span className="mt-1 block truncate text-xs text-slate-400">{conversation.latestMessage.body}</span>
                    </span>
                    {conversation.unreadCount > 0 && (
                      <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                        {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
                      </span>
                    )}
                  </summary>
                  <div className="space-y-2 border-t border-slate-800 p-4">
                    {conversation.messages.map((message) => {
                      const sent = message.sender_id === userId;
                      return (
                        <div key={message.id} className={`max-w-[88%] rounded-xl p-3 ${sent ? "ml-auto bg-indigo-600/30 text-right" : "bg-slate-900 text-left"}`}>
                          <p className="whitespace-pre-wrap break-words text-sm text-slate-100">{message.body}</p>
                          <time className="mt-1 block text-[10px] text-slate-400">
                            {new Date(message.created_at).toLocaleString(language === "en" ? "en-US" : "tr-TR")}
                          </time>
                        </div>
                      );
                    })}
                    <form onSubmit={(event) => void handleReply(event, conversation.participantId)} className="mt-4 flex items-end gap-2 border-t border-slate-800 pt-4">
                      <textarea
                        required
                        rows={1}
                        maxLength={2000}
                        value={replyDrafts[conversation.participantId] || ""}
                        onChange={(event) => setReplyDrafts((current) => ({ ...current, [conversation.participantId]: event.target.value }))}
                        placeholder={t("Yanıtını yaz...")}
                        className="min-h-11 min-w-0 flex-1 resize-y rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-500"
                      />
                      <button
                        type="submit"
                        disabled={sendingReplyTo === conversation.participantId || !replyDrafts[conversation.participantId]?.trim()}
                        className="h-11 shrink-0 rounded-xl bg-indigo-600 px-4 text-xs font-bold text-white hover:bg-indigo-500 disabled:opacity-50"
                      >
                        {sendingReplyTo === conversation.participantId ? t("Gönderiliyor...") : t("Mesaj Gönder")}
                      </button>
                    </form>
                    {replyError?.participantId === conversation.participantId && (
                      <p role="alert" className="mt-2 text-xs text-rose-300">{replyError.message}</p>
                    )}
                  </div>
                </details>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
