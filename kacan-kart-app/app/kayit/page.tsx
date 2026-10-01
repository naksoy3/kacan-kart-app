"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";
import { useLanguage } from "@/components/LanguageProvider";

export default function KayitPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [ad, setAd] = useState("");
  const [kullaniciAdi, setKullaniciAdi] = useState("");
  const [fotoUrl, setFotoUrl] = useState("");
  const [fotoDosyasi, setFotoDosyasi] = useState<File | null>(null);
  const [email, setEmail] = useState("");
  const [sifre, setSifre] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError(t("Lütfen JPG, PNG veya WebP formatında bir fotoğraf seç."));
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError(t("Fotoğraf en fazla 2 MB olabilir."));
      return;
    }

    setFotoDosyasi(file);
    const reader = new FileReader();
    reader.onload = () => setFotoUrl(String(reader.result));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normalizedEmail)) {
      setError(t("Geçerli bir e-posta adresi gir. Örnek: ad@ornek.com"));
      setLoading(false);
      return;
    }

    const normalizedUsername = kullaniciAdi.trim().toLowerCase();
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", normalizedUsername)
      .maybeSingle();

    if (profileCheckError) {
      setError(t("Kullanıcı adı servisi hazır değil. Supabase profiles tablosunu oluşturmalısın."));
      setLoading(false);
      return;
    }

    if (existingProfile) {
      setError(t("Bu kullanıcı adı zaten alınmış. Lütfen başka bir kullanıcı adı seç."));
      setLoading(false);
      return;
    }

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password: sifre,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          full_name: ad,
          username: normalizedUsername,
        },
      },
    });

    if (signUpError) {
      const authMessage = signUpError.message.toLowerCase();
      setError(
        authMessage.includes("already registered") || authMessage.includes("already been registered") || authMessage.includes("user_already_exists")
          ? t("Bu e-posta adresi zaten kayıtlı. Giriş yapmayı deneyebilirsin.")
          : signUpError.message
      );
    } else {
      const sessionData = signUpData;
      if (!sessionData.session) {
        setMessage(t("Kayıt tamamlandı. E-posta adresini doğrulamak için gelen kutunu kontrol et."));
      } else {
        let uploadedAvatarUrl: string | null = null;
        if (fotoDosyasi) {
          const extension = fotoDosyasi.type === "image/jpeg" ? "jpg" : fotoDosyasi.type.split("/")[1];
          const filePath = `${sessionData.session.user.id}/avatar-${Date.now()}.${extension}`;
          const { data: uploadedFile, error: uploadError } = await supabase.storage
            .from("avatars")
            .upload(filePath, fotoDosyasi, { contentType: fotoDosyasi.type, cacheControl: "3600" });

          if (uploadError) {
            setError(`${t("Profil fotoğrafı yüklenemedi:")} ${uploadError.message}`);
            setLoading(false);
            return;
          }

          uploadedAvatarUrl = supabase.storage.from("avatars").getPublicUrl(uploadedFile.path).data.publicUrl;
          const { error: metadataError } = await supabase.auth.updateUser({
            data: { full_name: ad, username: normalizedUsername, avatar_url: uploadedAvatarUrl },
          });
          if (metadataError) {
            setError(`${t("Profil fotoğrafı profiline bağlanamadı:")} ${metadataError.message}`);
            setLoading(false);
            return;
          }
        }

        const { error: profileError } = await supabase.from("profiles").insert({
          id: sessionData.session.user.id,
          username: normalizedUsername,
          full_name: ad,
          avatar_url: uploadedAvatarUrl,
        });

        if (profileError) {
          await supabase.auth.signOut();
          setError(
            profileError.code === "23505"
              ? t("Bu kullanıcı adı zaten alınmış. Lütfen başka bir kullanıcı adı seç.")
              : t("Profil oluşturulamadı. Lütfen tekrar dene.")
          );
          setLoading(false);
          return;
        }

        setMessage(t("Profilin oluşturuldu. Hoş geldin!"));
        setTimeout(() => router.push("/"), 900);
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
          <h1 className="text-3xl font-extrabold tracking-tight">{t("Profilini Oluştur")}</h1>
          <p className="mt-2 text-sm text-slate-400">
            {t("Cardasks deneyimini kişiselleştirmek için bilgilerini gir.")}
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
              {fotoUrl ? <img src={fotoUrl} alt={t("Profil fotoğrafı önizlemesi")} className="h-full w-full object-cover" /> : "👤"}
            </div>
            <label className="cursor-pointer rounded-xl border border-indigo-400/30 bg-indigo-600/20 px-4 py-2 text-xs font-semibold text-indigo-200 transition hover:bg-indigo-600/30">
              {t("Profil fotoğrafı seç")}
              <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
            </label>
            <p className="text-[11px] text-slate-500">{t("İsteğe bağlı, en fazla 2 MB")}</p>
          </div>

          <label className="block text-sm font-medium text-slate-300">
            {t("Adın")}
            <input
              required
              value={ad}
              onChange={(event) => setAd(event.target.value)}
              placeholder={t("Adını yaz")}
              className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-white outline-none transition focus:border-indigo-500"
            />
          </label>

          <label className="block text-sm font-medium text-slate-300">
            {t("Kullanıcı adın")}
            <input
              required
              minLength={3}
              value={kullaniciAdi}
              onChange={(event) => setKullaniciAdi(event.target.value.replace(/\s/g, "").toLowerCase())}
              placeholder={t("Kullanıcı adını yaz")}
              className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-white outline-none transition focus:border-indigo-500"
            />
          </label>

          <label className="block text-sm font-medium text-slate-300">
            {t("E-posta adresin")}
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={t("ornek@mail.com")}
              className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-white outline-none transition focus:border-indigo-500"
            />
          </label>

          <label className="block text-sm font-medium text-slate-300">
            {t("Şifren")}
            <input
              required
              minLength={6}
              type="password"
              value={sifre}
              onChange={(event) => setSifre(event.target.value)}
              placeholder={t("En az 6 karakter")}
              className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-white outline-none transition focus:border-indigo-500"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-xl bg-indigo-600 py-3.5 text-sm font-bold shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500 disabled:opacity-50"
          >
            {loading ? t("Profil oluşturuluyor...") : t("Profil Oluştur")}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">
          {t("Zaten hesabın var mı?")}{" "}
          <Link href="/" className="font-semibold text-indigo-400 hover:underline">
            {t("Giriş yap")}
          </Link>
        </p>
      </div>
    </main>
  );
}
