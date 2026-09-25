"use client";

import React, { useState } from "react";

export interface QuestionItem {
  id: string;
  question: string;
  isAnonymous: boolean;
  senderName?: string;
  createdAt: string;
  answer?: string;
  answeredAt?: string;
}

interface InboxPanelProps {
  username?: string;
  initialQuestions?: QuestionItem[];
  onAnswerQuestion?: (questionId: string, answerText: string) => void;
  onDeleteQuestion?: (questionId: string) => void;
}

// Örnek başlangıç verileri
const DEMO_QUESTIONS: QuestionItem[] = [
  {
    id: "1",
    question: "Benim hakkımda ilk izlenimin neydi? 🤔",
    isAnonymous: true,
    senderName: "Anonim",
    createdAt: "10 dk önce",
  },
  {
    id: "2",
    question: "Yeni projen Materooms nasıl gidiyor, hedefler neler? 🚀",
    isAnonymous: false,
    senderName: "Ahmet_97",
    createdAt: "2 saat önce",
    answer: "Harika gidiyor! Ev arkadaşı eşleşme algoritmasını geliştirdik, yakında yayındayız.",
    answeredAt: "1 saat önce",
  },
  {
    id: "3",
    question: "Birlikte yaptığımız en unutulmaz şey neydi? ✨",
    isAnonymous: true,
    senderName: "Anonim",
    createdAt: "1 gün önce",
  },
];

export default function InboxPanel({
  username = "Nurullah",
  initialQuestions = DEMO_QUESTIONS,
  onAnswerQuestion,
  onDeleteQuestion,
}: InboxPanelProps) {
  const [questions, setQuestions] = useState<QuestionItem[]>(initialQuestions);
  const [activeTab, setActiveTab] = useState<"all" | "unanswered" | "answered">("unanswered");
  const [replyInputs, setReplyInputs] = useState<{ [key: string]: string }>({});
  const [previewQuestion, setPreviewQuestion] = useState<QuestionItem | null>(null);

  // Sekme filtreleme
  const filteredQuestions = questions.filter((q) => {
    if (activeTab === "unanswered") return !q.answer;
    if (activeTab === "answered") return !!q.answer;
    return true;
  });

  // Yanıt gönderme işlemi
  const handleSendAnswer = (questionId: string) => {
    const text = replyInputs[questionId];
    if (!text || !text.trim()) return;

    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? { ...q, answer: text, answeredAt: "Şimdi" }
          : q
      )
    );

    if (onAnswerQuestion) {
      onAnswerQuestion(questionId, text);
    }

    // Input alanını temizle
    setReplyInputs((prev) => ({ ...prev, [questionId]: "" }));
  };

  // Soru silme işlemi
  const handleDelete = (questionId: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== questionId));
    if (onDeleteQuestion) {
      onDeleteQuestion(questionId);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Üst Bilgi ve İstatistik Başlığı */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl text-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Gelen Kutusu</h1>
          <p className="text-xs text-slate-400 mt-1">
            @{username} hesabına gelen soruları buradan yönetebilir ve yanıtlayabilirsin.
          </p>
        </div>

        <div className="flex gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs w-full sm:w-auto justify-center">
          <button
            onClick={() => setActiveTab("unanswered")}
            className={`px-3 py-2 rounded-xl font-medium transition ${
              activeTab === "unanswered"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Bekleyen ({questions.filter((q) => !q.answer).length})
          </button>
          <button
            onClick={() => setActiveTab("answered")}
            className={`px-3 py-2 rounded-xl font-medium transition ${
              activeTab === "answered"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Yanıtlanan ({questions.filter((q) => q.answer).length})
          </button>
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-2 rounded-xl font-medium transition ${
              activeTab === "all"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Tümü
          </button>
        </div>
      </div>

      {/* Soru Listesi */}
      <div className="space-y-4">
        {filteredQuestions.length === 0 ? (
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-12 text-center text-slate-500">
            <span className="text-4xl block mb-3">📬</span>
            <p className="text-sm font-medium">Bu kategoride gösterilecek soru bulunamadı.</p>
          </div>
        ) : (
          filteredQuestions.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4 transition hover:border-slate-700"
            >
              {/* Soru Üst Bilgisi */}
              <div className="flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded-full font-medium text-[11px] ${
                      item.isAnonymous
                        ? "bg-purple-950/80 text-purple-300 border border-purple-800/50"
                        : "bg-indigo-950/80 text-indigo-300 border border-indigo-800/50"
                    }`}
                  >
                    {item.isAnonymous ? "🔒 Anonim" : `👤 ${item.senderName}`}
                  </span>
                  <span>• {item.createdAt}</span>
                </div>

                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-slate-500 hover:text-rose-400 transition text-sm p-1"
                  title="Soruyu Sil"
                >
                  🗑️
                </button>
              </div>

              {/* Soru Metni */}
              <p className="text-base font-semibold text-slate-100">{item.question}</p>

              {/* Yanıtlanmışsa Yanıt Alanı */}
              {item.answer ? (
                <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider">
                      Yanıtın:
                    </span>
                    <button
                      onClick={() => setPreviewQuestion(item)}
                      className="text-xs bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 px-2.5 py-1 rounded-lg border border-indigo-500/30 transition flex items-center gap-1"
                    >
                      <span>📸</span> Story Kartı Oluştur
                    </button>
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed">{item.answer}</p>
                </div>
              ) : (
                /* Yanıtlanmamışsa Input Alanı */
                <div className="space-y-3 pt-2">
                  <textarea
                    rows={2}
                    value={replyInputs[item.id] || ""}
                    onChange={(e) =>
                      setReplyInputs({ ...replyInputs, [item.id]: e.target.value })
                    }
                    placeholder="Yanıtını yaz..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition resize-none"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleSendAnswer(item.id)}
                      disabled={!replyInputs[item.id]?.trim()}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-medium text-xs rounded-xl transition shadow-md shadow-indigo-600/20"
                    >
                      Yanıtla 💬
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Instagram Story Formatında Görsel Kart Önizleme Modalı */}
      {previewQuestion && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-5 relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setPreviewQuestion(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg font-bold"
            >
              ✕
            </button>

            <h3 className="text-sm font-semibold text-slate-300 text-center">
              Instagram Story Kartı
            </h3>

            {/* Story Şablonu */}
            <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 text-center space-y-6 shadow-2xl">
              <div className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] text-indigo-200 border border-white/10">
                @{username}
              </div>

              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-2 text-left">
                <span className="text-[10px] text-purple-400 font-medium">
                  {previewQuestion.isAnonymous ? "🔒 Anonim Sordu" : `👤 ${previewQuestion.senderName}`}
                </span>
                <p className="text-sm font-semibold text-white">{previewQuestion.question}</p>
              </div>

              <div className="bg-indigo-600 text-white rounded-2xl p-4 text-left shadow-lg space-y-1">
                <span className="text-[10px] text-indigo-200 block font-medium">Cevap:</span>
                <p className="text-sm font-medium">{previewQuestion.answer}</p>
              </div>
            </div>

            <p className="text-[11px] text-center text-slate-400">
              Ekran görüntüsü alarak Instagram veya TikTok hikayende paylaşabilirsin! 🚀
            </p>
          </div>
        </div>
      )}
    </div>
  );
}