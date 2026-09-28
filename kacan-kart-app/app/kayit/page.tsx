"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";

export default function KayitPage() {
  const router = useRouter();
  const [ad, setAd] = useState("");
  const [kullaniciAdi, setKullaniciAdi] = useState("");
  const [fotoUrl, setFotoUrl] = useState("");
  const [email, setEmail] = useState("");
  const [sifre, setSifre] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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
    reader.onload = () => setFotoUrl(String(reader.result));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const normalizedUsername = kullaniciAdi.trim().toLowerCase();
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", normalizedUsername)
      .maybeSingle();

    if (profileCheckError) {
      setError("Kullanıcı adı servisi hazır değil. Supabase profiles tablosunu oluşturmalısın.");
      setLoading(false);
      return;
    }

    if (existingProfile) {
      setError("Bu kullanıcı adı zaten alınmış. Lütfen başka bir kullanıcı adı seç.");
      setLoading(false);
      return;
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password: sifre,
      options: {
        data: {
          full_name: ad,
          username: normalizedUsername,
          avatar_url: fotoUrl || null,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
    } else {
      const { data: sessionData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: sifre,
      });

      if (sessionData.session && !signInError) {
        const { error: profileError } = await supabase.from("profiles").insert({
          id: sessionData.session.user.id,
          username: normalizedUsername,
          full_name: ad,
          avatar_url: fotoUrl || null,
        });

        if (profileError) {
          await supabase.auth.signOut();
          setError(
            profileError.code === "23505"
              ? "Bu kullanıcı adı zaten alınmış. Lütfen başka bir kullanıcı adı seç."
              : "Profil oluşturulamadı. Lütfen tekrar dene."
          );
          setLoading(false);
          return;
        }

        setMessage("Profilin oluşturuldu. Hoş geldin!");
        setTimeout(() => router.push("/"), 900);
      } else {
        setError("Kayıt tamamlandı ancak otomatik giriş yapılamadı. Supabase Auth ayarlarından e-posta doğrulamasını geçici olarak kapatmalısın.");
      }
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-16 text-white">
      <div className="mx-auto w-full max-w-lg rounded-[28px] border border-slate-800 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-2xl shadow-lg">
            ✨
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Profilini Oluştur</h1>
          <p className="mt-2 text-sm text-slate-400">
            Cardasks deneyimini kişiselleştirmek için bilgilerini gir.
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-center text-xs text-rose-300">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-center text-xs text-emerald-300">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-800 bg-slate-800/40 p-5">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-3xl shadow-lg">
              {fotoUrl ? <img src={fotoUrl} alt="Profil önizlemesi" className="h-full w-full object-cover" /> : "👤"}
            </div>
            <label className="cursor-pointer rounded-xl border border-indigo-400/30 bg-indigo-600/20 px-4 py-2 text-xs font-semibold text-indigo-200 transition hover:bg-indigo-600/30">
              Profil fotoğrafı seç
              <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
            </label>
            <p className="text-[11px] text-slate-500">İsteğe bağlı, en fazla 2 MB</p>
          </div>

          <label className="block text-sm font-medium text-slate-300">
            Adın
            <input
              required
              value={ad}
              onChange={(event) => setAd(event.target.value)}
              placeholder="Adını yaz"
              className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-white outline-none transition focus:border-indigo-500"
            />
          </label>

          <label className="block text-sm font-medium text-slate-300">
            Kullanıcı adın
            <input
              required
              minLength={3}
              value={kullaniciAdi}
              onChange={(event) => setKullaniciAdi(event.target.value.replace(/\s/g, "").toLowerCase())}
              placeholder="Kullanıcı adını yaz"
              className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-white outline-none transition focus:border-indigo-500"
            />
          </label>

          <label className="block text-sm font-medium text-slate-300">
            E-posta adresin
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="ornek@mail.com"
              className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-white outline-none transition focus:border-indigo-500"
            />
          </label>

          <label className="block text-sm font-medium text-slate-300">
            Şifren
            <input
              required
              minLength={6}
              type="password"
              value={sifre}
              onChange={(event) => setSifre(event.target.value)}
              placeholder="En az 6 karakter"
              className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-white outline-none transition focus:border-indigo-500"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-xl bg-indigo-600 py-3.5 text-sm font-bold shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500 disabled:opacity-50"
          >
            {loading ? "Profil oluşturuluyor..." : "Profil Oluştur"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">
          Zaten hesabın var mı?{" "}
          <Link href="/" className="font-semibold text-indigo-400 hover:underline">
            Giriş yap
          </Link>
        </p>
      </div>
    </main>
  );
}
