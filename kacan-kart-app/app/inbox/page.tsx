"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import KacanKart from "@/components/KacanKart";
import { useLanguage } from "@/components/LanguageProvider";

function InboxContent() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();

  const targetUsername = searchParams.get("u") || "Nurullah";
  const sender = searchParams.get("sender") || searchParams.get("gonderen") || t("Gönderen");
  const soru = searchParams.get("s") || "Benimle yemeğe çıkar mısın?";
  const evetMetni = searchParams.get("e") || "Evet!";
  const hayirMetni = searchParams.get("h") || "Hayır";
  const gifUrl = searchParams.get("gif") || undefined;
  const theme = (searchParams.get("t") as any) || "escaping";

  const mekan = searchParams.get("mekan") || searchParams.get("yer") || undefined;
  const tarih = searchParams.get("tarih") || undefined;
  const saat = searchParams.get("saat") || searchParams.get("zaman") || undefined;

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="flex w-full max-w-md flex-col items-center gap-4">
        {sender && targetUsername && (
          <p className="text-center text-base font-bold tracking-wide text-indigo-300 sm:text-lg">
            ✨ {sender}, {targetUsername}&apos;ye {t("soruyor:")}
          </p>
        )}
        <KacanKart
          targetUsername={targetUsername}
          sender={sender}
          soru={soru}
          evetMetni={evetMetni}
          hayirMetni={hayirMetni}
          gifUrl={gifUrl}
          theme={theme}
          mekan={mekan}
          tarih={tarih}
          saat={saat}
          showShareButton={false}
        />
      </div>
    </main>
  );
}

export default function HomePage() {
  const { t } = useLanguage();
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
          <div className="text-slate-300 text-sm">{t("Kart yükleniyor...")}</div>
        </main>
      }
    >
      <InboxContent />
    </Suspense>
  );
}