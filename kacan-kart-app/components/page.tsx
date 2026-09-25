"use client";

import React, { useState } from "react";
// Import işlemi KacanKart.tsx dosyasından yapılıyor
import EscapeCard, { CardTheme, THEME_NAMES } from "@/components/KacanKart";

// 10 Temanın Açıklamaları
const themeDescriptions: Record<string, string> = {
  escaping: "Tıklandıkça ekranda rastgele kaçar.",
  persuasive: "Kaçmaz, her tıkta yeni ikna metinleri çıkar.",
  shrinking: "Tıklandıkça küçülür ve en son yok olur.",
  role_reversal: "Fare üzerine geldikçe Evet ile Hayır takas yapar.",
  teleporting: "Fare yaklaştığı an anında köşeye ışınlanır.",
  pin_code: "Hayır demek şifre ister ve şifre asla kabul edilmez!",
  timer: "10 saniyelik geri sayım bittiğinde Hayır butonu kaybolur.",
  reverse_psychology: "Hayır butonu aslında 'Evet' cevabı verir.",
  shattering: "Her tıkta çatlayarak 3. tıkta patlar.",
  magnet: "Fare Hayır'a yaklaştığında Evet butonu fareye yapışır.",
};

// Temalara özel simgeler/emojiler
const themeIcons: Record<string, string> = {
  escaping: "🏃‍♂️",
  persuasive: "💬",
  shrinking: "🔍",
  role_reversal: "🔄",
  teleporting: "⚡",
  pin_code: "🔐",
  timer: "⏳",
  reverse_psychology: "🧠",
  shattering: "💥",
  magnet: "🧲",
};

export default function CardPage() {
  const [selectedTheme, setSelectedTheme] = useState<CardTheme | null>(null);

  // THEME_NAMES tanımsız gelirse projenin patlamasını önleyen fallback nesnesi
  const availableThemes = THEME_NAMES || {
    escaping: "🎯 Tema 1: Kaçan Hayır",
    persuasive: "💬 Tema 2: Israrcı Cevaplar",
    shrinking: "🔍 Tema 3: Küçülen Buton",
    role_reversal: "🔀 Tema 4: Yer Değiştiren",
    teleporting: "⚡ Tema 5: Işınlanan Buton",
    pin_code: "🔒 Tema 6: Şifreli Hayır",
    timer: "⏳ Tema 7: Geri Sayımlı",
    reverse_psychology: "🪞 Tema 8: Ters Psikoloji",
    shattering: "💥 Tema 9: Parçalanan Buton",
    magnet: "🧲 Tema 10: Mıknatıs Evet",
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 md:p-10">
      {!selectedTheme ? (
        <div className="w-full max-w-6xl bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-10 shadow-2xl space-y-8 backdrop-blur-md">
          {/* Başlık ve Açıklama */}
          <div className="text-center space-y-3">
            <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              Soru Kartı Teması Seçin
            </h1>
            <p className="text-sm md:text-base text-slate-400 max-w-xl mx-auto">
              Hayır butonunun nasıl davranacağını belirleyen bir oyun modu seçin ve kartınızı oluşturun.
            </p>
          </div>

          {/* Kare Kutucuklar (Grid Yapısı) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {(Object.keys(availableThemes) as CardTheme[]).map((themeKey) => (
              <button
                key={themeKey}
                onClick={() => setSelectedTheme(themeKey)}
                className="group relative flex flex-col justify-between p-6 bg-slate-950/80 hover:bg-slate-800/90 border-2 border-slate-800 hover:border-indigo-500 rounded-2xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 text-left aspect-square"
              >
                {/* Sol Üst Emoji */}
                <div className="text-3xl md:text-4xl mb-2 group-hover:scale-110 transition-transform">
                  {themeIcons[themeKey] || "🎯"}
                </div>

                {/* Başlık ve Açıklama */}
                <div className="space-y-1.5">
                  <div className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors">
                    {availableThemes[themeKey]}
                  </div>
                  <div className="text-xs text-slate-400 leading-relaxed">
                    {themeDescriptions[themeKey] || "Özel etkileşimli kart modu."}
                  </div>
                </div>

                {/* Sağ Alt Buton / Ok İşareti */}
                <div className="pt-3 flex items-center justify-between text-xs font-semibold text-indigo-400 opacity-80 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                  <span>Modu Seç</span>
                  <span>➔</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <EscapeCard
          targetUsername="Nurullah"
          theme={selectedTheme}
          onBack={() => setSelectedTheme(null)}
        />
      )}
    </main>
  );
}