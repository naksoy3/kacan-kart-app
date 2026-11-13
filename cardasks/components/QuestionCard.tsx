"use client";

import React, { useState } from "react";

// Kategorilere ayrılmış hazır soru şablonları
const QUESTION_TEMPLATES = [
  { id: 1, text: "Benim hakkımda ilk izlenimin neydi? 🤔", category: "Eğlenceli" },
  { id: 2, text: "Bende en sevdiğin/değiştirmemi istediğin bir huy? 💬", category: "Derin" },
  { id: 3, text: "Birlikte yaptığımız en unutulmaz şey neydi? ✨", category: "Anılar" },
  { id: 4, text: "Sence 5 yıl sonra beni nerede görüyorsun? 🚀", category: "Gelecek" },
  { id: 5, text: "Kimseye söyleyemediğin ama bana söylemek istediğin bir şey var mı? 🤫", category: "Derin" },
  { id: 6, text: "Beni 3 kelime ile tanımla! 🏷️", category: "Eğlenceli" },
];

interface QuestionCardProps {
  targetUsername?: string;
  onSendQuestion?: (data: { question: string; isAnonymous: boolean; senderName?: string }) => void;
}

export default function QuestionCard({
  targetUsername = "Nurullah",
  onSendQuestion,
}: QuestionCardProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("Tümü");
  const [customQuestion, setCustomQuestion] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [senderName, setSenderName] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const categories = ["Tümü", "Eğlenceli", "Derin", "Anılar", "Gelecek"];

  // Filtrelenmiş kalıplar
  const filteredTemplates =
    selectedCategory === "Tümü"
      ? QUESTION_TEMPLATES
      : QUESTION_TEMPLATES.filter((t) => t.category === selectedCategory);

  // Kalıba tıklandığında metin kutusuna aktar
  const handleSelectTemplate = (text: string) => {
    setCustomQuestion(text);
  };

  // Soru gönderme işlemi
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestion.trim()) return;

    if (onSendQuestion) {
      onSendQuestion({
        question: customQuestion,
        isAnonymous,
        senderName: isAnonymous ? "Anonim" : senderName || "Gizli Kullanıcı",
      });
    }

    setIsSubmitted(true);
  };

  // Yeni soru sorma ekranına dönme
  const handleReset = () => {
    setCustomQuestion("");
    setIsSubmitted(false);
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl text-slate-100 transition-all">
      {/* Başlık ve Profil Bilgisi */}
      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-800">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-2xl font-bold shadow-lg shadow-indigo-500/20">
          {targetUsername.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">{targetUsername}'a Soru Sor</h2>
          <p className="text-xs text-slate-400">
            {isAnonymous ? "🔒 Yanıtların anonim olarak iletilecektir." : "👤 İsmin görünür şekilde gönderilecek."}
          </p>
        </div>
      </div>

      {!isSubmitted ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Hazır Kalıplar Kategorileri */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Hazır Soru Kalıpları
            </label>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30"
                      : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Şablon Butonları */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 max-h-40 overflow-y-auto pr-1">
              {filteredTemplates.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => handleSelectTemplate(template.text)}
                  className="text-left p-3 text-xs bg-slate-800/60 hover:bg-indigo-950/50 hover:border-indigo-500/50 border border-slate-700/60 rounded-xl text-slate-300 transition-all overflow-hidden text-ellipsis display-webkit-box webkit-line-clamp-2 webkit-box-orient-vertical"
                >
                  {template.text}
                </button>
              ))}
            </div>
          </div>

          {/* Özel Soru Yazma Alanı */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Sorun (Veya kendi cümleni yaz)
              </label>
              <span className="text-[10px] text-slate-500">{customQuestion.length}/280</span>
            </div>
            <textarea
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              maxLength={280}
              rows={4}
              placeholder="Sorunu buraya yaz veya yukarıdan bir kalıp seç..."
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
              required
            />
          </div>

          {/* Gönderen İsmi ve Anonimlik Ayarı */}
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-300">Anonim Gönder</span>
              <button
                type="button"
                onClick={() => setIsAnonymous(!isAnonymous)}
                className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${
                  isAnonymous ? "bg-indigo-600" : "bg-slate-700"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ease-in-out ${
                    isAnonymous ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {!isAnonymous && (
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="Adınız veya kullanıcı adınız (İsteğe bağlı)"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            )}
          </div>

          {/* Gönder Butonu */}
          <button
            type="submit"
            disabled={!customQuestion.trim()}
            className="w-full py-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold rounded-2xl shadow-lg shadow-indigo-500/25 hover:opacity-95 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
          >
            Soru Gönder 🚀
          </button>
        </form>
      ) : (
        /* Gönderildi Onay Ekranı */
        <div className="text-center py-8 space-y-4">
          <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center text-3xl mx-auto border border-emerald-500/30 animate-bounce">
            🎉
          </div>
          <h3 className="text-xl font-bold text-white">Sorun Başarıyla Gönderildi!</h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            {targetUsername} sorunu aldı. Yanıtladığında profilinde görebilirsin.
          </p>
          <button
            onClick={handleReset}
            className="mt-4 px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-semibold rounded-xl border border-slate-700 transition"
          >
            Başka Bir Soru Daha Sor
          </button>
        </div>
      )}
    </div>
  );
}