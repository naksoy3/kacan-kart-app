"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@/components/LanguageProvider";
import { supabase } from "@/utils/supabase";

function CallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useLanguage();
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);
  const code = searchParams.get("code");
  const requestedNext = searchParams.get("next") || "/";
  const next = requestedNext.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : "/";

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const completeAuthentication = async () => {
      if (!code) {
        setError("Doğrulama bağlantısı geçersiz veya süresi dolmuş. Yeni bir bağlantı iste.");
        return;
      }

      try {
        const { data, error: authError } = await supabase.auth.exchangeCodeForSession(code);
        if (authError) throw authError;

        const user = data.user;
        const username = typeof user?.user_metadata?.username === "string"
          ? user.user_metadata.username.trim().toLowerCase()
          : "";
        const fullName = typeof user?.user_metadata?.full_name === "string"
          ? user.user_metadata.full_name
          : username;

        if (user && username) {
          const { error: profileError } = await supabase.from("profiles").upsert({
            id: user.id,
            username,
            full_name: fullName || username,
            avatar_url: typeof user.user_metadata?.avatar_url === "string" ? user.user_metadata.avatar_url : null,
          }, { onConflict: "id", ignoreDuplicates: true });

          if (profileError) throw profileError;
        }

        router.replace(next);
      } catch {
        setError("Doğrulama bağlantısı geçersiz veya süresi dolmuş. Yeni bir bağlantı iste.");
      }
    };

    completeAuthentication();
  }, [code, next, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-20 text-white">
      <section className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center shadow-2xl">
        {error ? (
          <>
            <h1 className="text-xl font-bold">{t("Doğrulama bağlantısı geçersiz veya süresi dolmuş. Yeni bir bağlantı iste.")}</h1>
            <Link href="/" className="mt-6 inline-block rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold hover:bg-indigo-500">
              {t("Giriş sayfasına dön")}
            </Link>
          </>
        ) : (
          <p className="animate-pulse text-sm text-slate-300">{t("E-posta doğrulaması tamamlanıyor...")}</p>
        )}
      </section>
    </main>
  );
}

export default function AuthCallbackPage() {
  const { t } = useLanguage();
  return (
    <Suspense fallback={<main className="flex min-h-screen items-center justify-center bg-slate-950 text-sm text-slate-300">{t("E-posta doğrulaması tamamlanıyor...")}</main>}>
      <CallbackContent />
    </Suspense>
  );
}