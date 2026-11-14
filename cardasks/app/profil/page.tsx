"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";
import { prepareAvatarImage } from "@/utils/avatar-image";
import { useLanguage } from "@/components/LanguageProvider";

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
  const { t } = useLanguage();
  const router = useRouter();
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [email, setEmail] = useState("");

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
      setEmail(profileUser.email || "");
      setLoading(false);
    });

    return () => data.subscription.unsubscribe();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };

  const handlePhotoChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError(t("Lütfen JPG, PNG veya WebP formatında bir fotoğraf seç."));
      return;
    }
    setError(null);
    try {
      const preparedFile = await prepareAvatarImage(file);
      setAvatarFile(preparedFile);
      const reader = new FileReader();
      reader.onload = () => setAvatarUrl(String(reader.result));
      reader.readAsDataURL(preparedFile);
    } catch {
      setError(t("Fotoğraf sıkıştırılamadı. Lütfen başka bir fotoğraf seç."));
    }
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;

    setSaving(true);
    setError(null);
    setNotice(null);
    const normalizedUsername = username.trim().toLowerCase();
    const normalizedEmail = email.trim().toLowerCase();
    const emailChanged = normalizedEmail !== (user.email || "").toLowerCase();
    let savedAvatarUrl = avatarUrl.startsWith("data:image/") ? "" : avatarUrl;

    if (avatarFile) {
      const extension = avatarFile.type === "image/jpeg" ? "jpg" : avatarFile.type.split("/")[1];
      const filePath = `${user.id}/avatar-${Date.now()}.${extension}`;
      const { data: uploadedFile, error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, avatarFile, { contentType: avatarFile.type, cacheControl: "3600" });

      if (uploadError) {
        setError(`${t("Profil fotoğrafı yüklenemedi:")} ${uploadError.message}`);
        setSaving(false);
        return;
      }

      savedAvatarUrl = supabase.storage.from("avatars").getPublicUrl(uploadedFile.path).data.publicUrl;
    }

    const { error: authError } = await supabase.auth.updateUser({
      ...(emailChanged ? { email: normalizedEmail } : {}),
      data: {
        full_name: name.trim(),
        username: normalizedUsername,
        avatar_url: savedAvatarUrl || null,
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
        avatar_url: savedAvatarUrl || null,
      })
      .eq("id", user.id);

    if (profileError) {
      setError(
        profileError.code === "23505"
          ? t("Bu kullanıcı adı zaten alınmış. Lütfen başka bir kullanıcı adı seç.")
          : t("Profil güncellenemedi. Lütfen tekrar dene.")
      );
      setSaving(false);
      return;
    }

    const { data } = await supabase.auth.getUser();
    if (data.user) {
      setUser(data.user as ProfileUser);
      setEmail(data.user.email || normalizedEmail);
    }
    setAvatarUrl(savedAvatarUrl);
    setAvatarFile(null);
    if (emailChanged) {
      setNotice(t("Profilin güncellendi. Yeni e-posta adresini etkinleştirmek için gelen doğrulama bağlantısını onayla."));
    }
    setEditing(false);
    setSaving(false);
  };

  if (loading || !user) {
    return <main className="min-h-screen bg-background" />;
  }

  const metadata = user.user_metadata || {};
  const displayName = metadata.full_name || metadata.username || t("Profil");

  return (
    <main className="relative min-h-screen bg-background px-4 py-8 md:py-12 lg:py-16 text-on-surface">
      <div className="mx-auto w-full max-w-2xl">
        {/* Header */}
        <div className="mb-8 md:mb-12">
          <h1 className="text-headline-lg md:text-headline-xl font-headline-xl text-headline-xl font-extrabold text-white">
            {t("Profil")}
          </h1>
          <p className="mt-2 text-body-sm md:text-body-md text-on-surface-variant">{user.email}</p>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="mb-6 rounded-xl border border-error/40 bg-error-container/20 p-4 text-body-sm text-error">
            {error}
          </div>
        )}
        {notice && (
          <div className="mb-6 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-body-sm text-emerald-300">
            {notice}
          </div>
        )}

        {/* Profile Card */}
        <div className="overflow-hidden rounded-3xl border border-outline-variant/30 bg-gradient-to-br from-surface-container/90 via-surface-container-low/95 to-surface-container-lowest/90 backdrop-blur-2xl shadow-card-elevation-2">
          {/* Ambient glows */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary-container/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-56 h-56 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 p-6 md:p-8 lg:p-10">
            {editing ? (
              <form onSubmit={handleSave} className="space-y-6">
                {/* Avatar Upload Section */}
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl overflow-hidden p-1 bg-gradient-to-tr from-primary-container via-secondary to-tertiary shadow-lg">
                      <div className="w-full h-full rounded-[26px] overflow-hidden bg-surface-container">
                        {avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt={t("Profil fotoğrafı")}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-5xl font-extrabold text-primary-container bg-surface-container-high">
                            {displayName.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                    </div>
                    <label className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-primary-container/20 px-4 py-2 text-label-md text-primary font-label-md border border-primary-container/40 hover:bg-primary-container/30 transition-all">
                      <span className="material-symbols-outlined text-lg">photo_camera</span>
                      {t("Fotoğrafı değiştir")}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Form Fields */}
                  <div className="flex-1 w-full space-y-4">
                    <div>
                      <label className="block text-label-lg font-label-lg font-bold text-on-surface mb-2">
                        {t("Ad")}
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        required
                        className="w-full rounded-xl border border-outline-variant/40 bg-surface-container/50 px-4 py-3 text-body-md text-on-surface placeholder:text-on-surface-variant outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/25 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-label-lg font-label-lg font-bold text-on-surface mb-2">
                        {t("Kullanıcı adı")}
                      </label>
                      <input
                        type="text"
                        value={username}
                        onChange={(event) =>
                          setUsername(event.target.value.replace(/\s/g, "").toLowerCase())
                        }
                        required
                        minLength={3}
                        className="w-full rounded-xl border border-outline-variant/40 bg-surface-container/50 px-4 py-3 text-body-md text-on-surface placeholder:text-on-surface-variant outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/25 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-label-lg font-label-lg font-bold text-on-surface mb-2">
                        {t("E-posta adresi")}
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        required
                        className="w-full rounded-xl border border-outline-variant/40 bg-surface-container/50 px-4 py-3 text-body-md text-on-surface placeholder:text-on-surface-variant outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/25 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-outline-variant/20">
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="px-6 py-3 rounded-xl bg-surface-container-high/60 text-on-surface font-label-lg text-label-lg border border-outline-variant/30 hover:bg-surface-container-high/80 transition-all active:scale-95"
                  >
                    {t("Vazgeç")}
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary-container to-[#E8437A] text-white font-label-lg text-label-lg shadow-btn-glow hover:brightness-110 active:translate-y-0.5 disabled:opacity-50 transition-all"
                  >
                    {saving ? t("Kaydediliyor...") : t("Kaydet")}
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex flex-col gap-6">
                {/* Profile Summary */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl overflow-hidden p-1 bg-gradient-to-tr from-primary-container via-secondary to-tertiary shadow-lg shrink-0">
                    <div className="w-full h-full rounded-[26px] overflow-hidden bg-surface-container">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={displayName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-5xl font-extrabold text-primary-container bg-surface-container-high">
                          {displayName.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 text-center sm:text-left">
                    <h2 className="text-headline-md md:text-headline-lg font-headline-lg text-headline-lg text-white font-bold">
                      {displayName}
                    </h2>
                    <p className="text-label-lg font-label-lg text-primary mt-1">@{username}</p>
                    <p className="text-body-md text-on-surface-variant mt-3">{user.email}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 pt-4 border-t border-outline-variant/20">
                  <button
                    onClick={() => setEditing(true)}
                    className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-primary-container to-[#E8437A] text-white font-label-lg text-label-lg shadow-btn-glow hover:brightness-110 active:translate-y-0.5 transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined">edit</span>
                    {t("Profil bilgilerini düzenle")}
                  </button>
                  <Link
                    href="/"
                    className="w-full px-6 py-3 rounded-xl border border-outline-variant/40 bg-surface-container-high/40 text-on-surface font-label-lg text-label-lg text-center hover:bg-surface-container-high/60 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined">home</span>
                    {t("Anasayfaya dön")}
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full px-6 py-3 rounded-xl border border-error/40 bg-error-container/20 text-error font-label-lg text-label-lg hover:bg-error-container/30 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined">logout</span>
                    {t("Çıkış yap")}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
