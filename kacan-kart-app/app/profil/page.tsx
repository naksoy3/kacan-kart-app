"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";

type ProfileUser = {
  id: string;
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
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        setLoading(false);
        router.replace("/");
        return;
      }

      const profileUser = session.user as ProfileUser;
      setUser(profileUser);
      setName(profileUser.user_metadata?.full_name || "");
      setUsername(profileUser.user_metadata?.username || "");
      setAvatarUrl(profileUser.user_metadata?.avatar_url || "");
      setLoading(false);
    });

    return () => data.subscription.unsubscribe();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Lütfen bir görsel dosyası seç.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Fotoğraf en fazla 2 MB olabilir.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setAvatarUrl(String(reader.result));
    reader.readAsDataURL(file);
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;

    setSaving(true);
    setError(null);
    const normalizedUsername = username.trim().toLowerCase();

    const { error: authError } = await supabase.auth.updateUser({
      data: {
        full_name: name.trim(),
        username: normalizedUsername,
        avatar_url: avatarUrl || null,
      },
    });

    if (authError) {
      setError(authError.message);
      setSaving(false);
      return;
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        full_name: name.trim(),
        username: normalizedUsername,
        avatar_url: avatarUrl || null,
      })
      .eq("id", user.id);

    if (profileError) {
      setError(
        profileError.code === "23505"
          ? "Bu kullanıcı adı zaten alınmış. Lütfen başka bir kullanıcı adı seç."
          : "Profil güncellenemedi. Lütfen tekrar dene."
      );
      setSaving(false);
      return;
    }

    const { data } = await supabase.auth.getUser();
    if (data.user) setUser(data.user as ProfileUser);
    setEditing(false);
    setSaving(false);
  };

  if (loading || !user) {
    return <main className="min-h-screen bg-slate-950" />;
  }

  const metadata = user.user_metadata || {};
  const displayName = metadata.full_name || metadata.username || "Profil";

  return (
    <main className="relative min-h-screen bg-slate-950 px-4 py-24 text-white">
      <div className="mx-auto w-full max-w-lg rounded-[28px] border border-slate-800 bg-slate-900/90 p-8 text-center shadow-2xl backdrop-blur-xl sm:p-10">
        <div className="mb-7">
          <h1 className="text-2xl font-extrabold">Profil</h1>
          <p className="mt-2 text-xs text-slate-400">{user.email}</p>
        </div>

        {error && <div className="mb-5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">{error}</div>}

        {editing ? (
          <form onSubmit={handleSave} className="space-y-4 text-left">
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-800 bg-slate-800/40 p-5">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-indigo-400/50 bg-gradient-to-tr from-indigo-500 to-purple-500 text-3xl font-bold">
                {avatarUrl ? <img src={avatarUrl} alt="Profil fotoğrafı" className="h-full w-full object-cover" /> : displayName.charAt(0).toUpperCase()}
              </div>
              <label className="cursor-pointer rounded-xl bg-indigo-600/20 px-4 py-2 text-xs font-semibold text-indigo-200 hover:bg-indigo-600/30">
                Fotoğrafı değiştir
                <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
              </label>
            </div>

            <label className="block text-sm font-medium text-slate-300">
              Ad
              <input value={name} onChange={(event) => setName(event.target.value)} required className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-indigo-500" />
            </label>
            <label className="block text-sm font-medium text-slate-300">
              Kullanıcı adı
              <input value={username} onChange={(event) => setUsername(event.target.value.replace(/\s/g, "").toLowerCase())} required minLength={3} className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-indigo-500" />
            </label>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setEditing(false)} className="w-1/3 rounded-xl bg-slate-800 py-3 text-sm font-bold text-slate-300 hover:bg-slate-700">Vazgeç</button>
              <button type="submit" disabled={saving} className="w-2/3 rounded-xl bg-indigo-600 py-3 text-sm font-bold hover:bg-indigo-500 disabled:opacity-50">{saving ? "Kaydediliyor..." : "Kaydet"}</button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col gap-3">
            <button onClick={() => setEditing(true)} className="rounded-xl bg-indigo-600 py-3 text-sm font-bold transition hover:bg-indigo-500">Profil bilgilerini düzenle</button>
            <Link href="/" className="rounded-xl border border-slate-700 bg-slate-800 py-3 text-sm font-bold text-slate-300 transition hover:bg-slate-700">Anasayfaya dön</Link>
            <button onClick={handleSignOut} className="rounded-xl border border-rose-500/30 bg-rose-500/10 py-3 text-sm font-bold text-rose-300 transition hover:bg-rose-500/20">Çıkış yap</button>
          </div>
        )}
      </div>
    </main>
  );
}
