"use client";

import { useState } from "react";
import { supabase } from "@/utils/supabase";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) {
        setError(error.message);
      } else {
        setMessage("Kayıt başarılı! Lütfen e-postanızı kontrol edin veya giriş yapın.");
        setIsSignUp(false);
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message);
      } else {
        onSuccess();
        onClose();
      }
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-[28px] p-8 text-white shadow-2xl relative space-y-6">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white text-lg font-bold cursor-pointer"
        >
          ✕
        </button>

        <div className="text-center space-y-2">
          <h3 className="text-2xl font-extrabold tracking-tight">
            {isSignUp ? "✨ Hesap Oluştur" : "👋 Giriş Yap"}
          </h3>
          <p className="text-xs text-slate-400">
            {isSignUp
              ? "Kart oluşturmak ve bildirim almak için hemen kaydol."
              : "Hesabına giriş yaparak soru kartı göndermeye devam et."}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs text-center">
            {error}
          </div>
        )}

        {message && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs text-center">
            {message}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4 text-sm">
          <div>
            <label className="block text-slate-400 mb-1.5 font-medium">E-posta Adresi:</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@mail.com"
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition text-sm"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1.5 font-medium">Şifre:</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 font-bold rounded-xl text-sm transition shadow-lg shadow-indigo-600/30 cursor-pointer disabled:opacity-50 mt-2"
          >
            {loading ? "İşleniyor..." : isSignUp ? "Kayıt Ol" : "Giriş Yap"}
          </button>
        </form>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
              setMessage(null);
            }}
            className="text-xs text-indigo-400 hover:underline cursor-pointer font-medium"
          >
            {isSignUp
              ? "Zaten hesabın var mı? Giriş yap"
              : "Hesabın yok mu? Hemen kaydol"}
          </button>
        </div>
      </div>
    </div>
  );
}