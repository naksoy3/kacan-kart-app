"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/LanguageProvider";
import { supabase } from "@/utils/supabase";

export default function SifreYenilePage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (password.length < 6) {
      setError(t("Şifre en az 6 karakter olmalı."));
      return;
    }
    if (password !== confirmation) {
      setError(t("Şifreler eşleşmiyor."));
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setMessage(t("Şifren güncellendi. Ana sayfaya yönlendiriliyorsun."));
    window.setTimeout(() => router.replace("/"), 1200);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-20 text-white">
      <section className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
        <h1 className="text-2xl font-extrabold">{t("Yeni şifre belirle")}</h1>
        <p className="mt-2 text-sm text-slate-400">{t("Yeni şifreni gir.")}</p>

        {error && <p role="alert" className="mt-5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">{error}</p>}
        {message && <p role="status" className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300">{message}</p>}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-sm font-medium text-slate-300">
            {t("Yeni şifre")}
            <input
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-indigo-500"
            />
          </label>
          <label className="block text-sm font-medium text-slate-300">
            {t("Yeni şifreyi tekrar gir")}
            <input
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-indigo-500"
            />
          </label>
          <button type="submit" disabled={loading || Boolean(message)} className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-bold hover:bg-indigo-500 disabled:opacity-50">
            {loading ? t("İşleniyor...") : t("Şifreyi güncelle")}
          </button>
        </form>

        <Link href="/" className="mt-5 block text-center text-xs font-semibold text-indigo-300 hover:underline">
          {t("Giriş sayfasına dön")}
        </Link>
      </section>
    </main>
  );
}