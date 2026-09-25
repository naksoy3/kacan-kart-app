"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import KacanKart from "@/components/KacanKart";

export default function Home() {
  const [soru, setSoru] = useState("Benimle yemeğe çıkar mısın?");
  const [evet, setEvet] = useState("Evet!");
  const [hayir, setHayir] = useState("Hayır");
  const [gifUrl, setGifUrl] = useState("");
  const [link, setLink] = useState<string | null>(null);
  const [kopyalandi, setKopyalandi] = useState(false);

  const olusturDisabled = soru.trim().length === 0;

  const linkOlustur = () => {
    const params = new URLSearchParams({
      soru: soru.trim() || "Benimle çıkar mısın?",
      evet: evet.trim() || "Evet",
      hayir: hayir.trim() || "Hayır",
    });

    if (gifUrl.trim()) {
      params.set("gif", gifUrl.trim());
    }

    const taban =
      typeof window !== "undefined" ? window.location.origin : "";
    setLink(`${taban}/k/card?${params.toString()}`);
    setKopyalandi(false);
  };

  const kopyala = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setKopyalandi(true);
      setTimeout(() => setKopyalandi(false), 1800);
    } catch {
      // panoya erişilemezse sessizce yut, kullanıcı elle seçip kopyalayabilir
    }
  };

  const onizlemeProps = useMemo(
    () => ({ soru, evetMetni: evet, hayirMetni: hayir, gifUrl: gifUrl || undefined }),
    [soru, evet, hayir, gifUrl]
  );

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-14 sm:py-20 gap-14">
      <div className="text-center max-w-lg">
        <h1 className="font-baslik text-3xl sm:text-4xl text-krem">
          Kaçan Kart
        </h1>
        <p className="mt-3 text-krem/60">
          Kendi sorunu yaz, "Hayır" butonunu kaçırt, arkadaşına gönder.
        </p>
      </div>

      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 items-start">
        <div className="rounded-[28px] bg-gece2/60 border border-white/10 backdrop-blur-xl p-7 sm:p-8">
          <div className="flex flex-col gap-5">
            <label className="flex flex-col gap-2">
              <span className="text-sm text-krem/70">Soru</span>
              <textarea
                value={soru}
                onChange={(e) => setSoru(e.target.value)}
                rows={2}
                maxLength={140}
                className="resize-none rounded-xl bg-white/5 border border-white/15 px-4 py-3 text-krem placeholder:text-krem/30 outline-none focus:border-mercan/70 transition-colors"
                placeholder="Örn: Benimle sinemaya gelir misin?"
              />
            </label>

            <div className="grid grid-cols-2 gap-4">
              <label className="flex flex-col gap-2">
                <span className="text-sm text-krem/70">Evet buton metni</span>
                <input
                  value={evet}
                  onChange={(e) => setEvet(e.target.value)}
                  maxLength={24}
                  className="rounded-xl bg-white/5 border border-white/15 px-4 py-3 text-krem placeholder:text-krem/30 outline-none focus:border-mercan/70 transition-colors"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm text-krem/70">Hayır buton metni</span>
                <input
                  value={hayir}
                  onChange={(e) => setHayir(e.target.value)}
                  maxLength={24}
                  className="rounded-xl bg-white/5 border border-white/15 px-4 py-3 text-krem placeholder:text-krem/30 outline-none focus:border-mercan/70 transition-colors"
                />
              </label>
            </div>

            <label className="flex flex-col gap-2">
              <span className="text-sm text-krem/70">GIF URL (opsiyonel)</span>
              <input
                value={gifUrl}
                onChange={(e) => setGifUrl(e.target.value)}
                placeholder="https://...gif"
                className="rounded-xl bg-white/5 border border-white/15 px-4 py-3 text-krem placeholder:text-krem/30 outline-none focus:border-mercan/70 transition-colors"
              />
            </label>

            <button
              type="button"
              disabled={olusturDisabled}
              onClick={linkOlustur}
              className="mt-2 rounded-2xl bg-mercan px-6 py-3.5 font-baslik text-lg text-gece disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-95 transition-transform"
            >
              Link oluştur
            </button>

            {link && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl bg-black/30 border border-white/10 p-4 flex flex-col gap-3"
              >
                <p className="text-xs text-krem/50 break-all">{link}</p>
                <button
                  type="button"
                  onClick={kopyala}
                  className="self-start rounded-lg bg-white/10 border border-white/15 px-4 py-2 text-sm text-krem hover:bg-white/15 transition-colors"
                >
                  {kopyalandi ? "Kopyalandı ✓" : "Linki kopyala"}
                </button>
              </motion.div>
            )}
          </div>
        </div>

        <div className="flex justify-center md:sticky md:top-14">
          <KacanKart {...onizlemeProps} />
        </div>
      </div>
    </main>
  );
}
