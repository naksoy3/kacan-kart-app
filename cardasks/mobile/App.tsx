import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Image as ExpoImage } from "expo-image";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import LocationPicker from "./LocationPicker";

const SITE_URL = (process.env.EXPO_PUBLIC_SITE_URL || "https://cardasks.com").replace(/\/$/, "");
const CARD_GIFS = [
  "https://media.giphy.com/media/WpNO2ZXjhJ85y/giphy.gif",
  "https://media.giphy.com/media/xaw15bdmMEkgg/giphy.gif",
  "https://media.giphy.com/media/tLwQSHQo6hjTa/giphy.gif",
  "https://media.giphy.com/media/3dcoLqDDjd9pC/giphy.gif",
  "https://media.giphy.com/media/QFfs8ubyDkluo/giphy.gif",
  "https://media.giphy.com/media/10hYVVSPrSpZS0/giphy.gif",
  "https://media.giphy.com/media/EYJz9cfMa7WAU/giphy.gif",
  "https://media.giphy.com/media/Q21vzIHyTtmaQ/giphy.gif",
  "https://media.giphy.com/media/pzmUOeqhzJTck/giphy.gif",
  "https://media.giphy.com/media/G6kt1Gb4Luxy0/giphy.gif",
  "https://media.giphy.com/media/13wjHxAz6B6E9i/giphy.gif",
  "https://media.giphy.com/media/ANbbM3IzH9Tna/giphy.gif",
  "https://media.giphy.com/media/EQ5I7NF4BDYA/giphy.gif",
  "https://media.giphy.com/media/L7gHewOS8GOWY/giphy.gif",
  "https://media.giphy.com/media/nO16UrmQh7khW/giphy.gif",
  "https://media.giphy.com/media/eGuk6gQM3Q29W/giphy.gif",
  "https://media.giphy.com/media/8dpPMMlxmDEJO/giphy.gif",
  "https://media.giphy.com/media/5ox090BjCB8ME/giphy.gif",
  "https://media.giphy.com/media/Hzm8c1eMSq3CM/giphy.gif",
  "https://media.giphy.com/media/2APlzZshLu3LO/giphy.gif",
];
const CARD_COLUMNS = "id,soru,target_username,from_username,status,created_at";
const THEMES = [
  { id: "escaping", name: "Kaçan Hayır", emoji: "🏃" },
  { id: "persuasive", name: "Israrcı Cevaplar", emoji: "💬" },
  { id: "shrinking", name: "Küçülen Buton", emoji: "🔍" },
  { id: "role_reversal", name: "Yer Değiştiren", emoji: "🔀" },
  { id: "teleporting", name: "Işınlanan Buton", emoji: "⚡" },
  { id: "pin_code", name: "Şifreli Hayır", emoji: "🔒" },
  { id: "timer", name: "Geri Sayımlı", emoji: "⏳" },
  { id: "reverse_psychology", name: "Ters Psikoloji", emoji: "🪞" },
  { id: "shattering", name: "Parçalanan Buton", emoji: "💥" },
  { id: "magnet", name: "Mıknatıs Evet", emoji: "🧲" },
  { id: "riddle", name: "Bulmacalı Hayır", emoji: "🧩" },
  { id: "scratchpad", name: "Sürpriz Kazı-Kazan", emoji: "🎁" },
] as const;
type ThemeId = typeof THEMES[number]["id"];
type CreateStep = "details" | "gif" | "preview";

type AppTab = "create" | "received" | "sent";

type QuestionCard = {
  id: string;
  soru: string;
  target_username: string;
  from_username: string;
  status: string;
  created_at: string;
};

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [targetUsername, setTargetUsername] = useState("");
  const [question, setQuestion] = useState("");
  const [selectedTheme, setSelectedTheme] = useState<ThemeId>("escaping");
  const [selectedGif, setSelectedGif] = useState(CARD_GIFS[0]);
  const [place, setPlace] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [createStep, setCreateStep] = useState<CreateStep>("details");
  const [shareUrl, setShareUrl] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [activeTab, setActiveTab] = useState<AppTab>("create");
  const [cards, setCards] = useState<QuestionCard[]>([]);
  const [cardsLoading, setCardsLoading] = useState(false);
  const [cardsError, setCardsError] = useState("");
  const [cardsRefresh, setCardsRefresh] = useState(0);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const client = supabase;
    const user = session?.user;
    if (!client || !user || activeTab === "create") return;

    let active = true;
    const loadCards = async () => {
      setCardsLoading(true);
      setCardsError("");
      try {
        if (activeTab === "sent") {
          const { data, error: queryError } = await client
            .from("cards")
            .select(CARD_COLUMNS)
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });
          if (queryError) throw queryError;
          if (active) setCards((data || []) as QuestionCard[]);
        } else {
          const identities = Array.from(new Set([
            user.user_metadata?.username,
            user.user_metadata?.full_name,
          ].filter((value): value is string => typeof value === "string" && value.trim().length > 0)));
          const escapeLike = (value: string) => value.replace(/[\\%_]/g, "\\$&");
          const results = await Promise.all(identities.map((identity) =>
            client
              .from("cards")
              .select(CARD_COLUMNS)
              .ilike("target_username", escapeLike(identity.trim()))
              .order("created_at", { ascending: false })
          ));
          const failed = results.find((result) => result.error);
          if (failed?.error) throw failed.error;
          const uniqueCards = new Map<string, QuestionCard>();
          results.forEach((result) => {
            (result.data || []).forEach((card) => uniqueCards.set(card.id, card as QuestionCard));
          });
          const rows = Array.from(uniqueCards.values()).sort((first, second) =>
            new Date(second.created_at).getTime() - new Date(first.created_at).getTime());
          if (active) setCards(rows);
        }
      } catch {
        if (active) setCardsError("Kartlar yüklenemedi. Bağlantını kontrol edip tekrar dene.");
      } finally {
        if (active) setCardsLoading(false);
      }
    };

    void loadCards();
    return () => { active = false; };
  }, [activeTab, cardsRefresh, session?.user.id, session?.user.user_metadata?.username, session?.user.user_metadata?.full_name]);

  const handleSignIn = async () => {
    if (!supabase) return;
    setBusy(true);
    setError("");
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (signInError) setError(signInError.message);
    setBusy(false);
  };

  const handleCreateCard = async () => {
    if (!supabase || !session) return;
    const normalizedTarget = targetUsername.trim().replace(/^@/, "");
    if (!normalizedTarget || !question.trim()) {
      setError("Alıcı kullanıcı adını ve sorunu yaz.");
      return;
    }

    setBusy(true);
    setError("");
    setShareUrl("");
    try {
      const sender = session.user.user_metadata?.username ||
        session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "";
      const response = await fetch(`${SITE_URL}/api/cards`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({
          from_username: sender,
          target_username: normalizedTarget,
          soru: question.trim(),
          theme: selectedTheme,
          gif_url: selectedGif,
          yer: place,
          tarih: selectedDate?.toLocaleDateString("tr-TR", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          }) || "",
          zaman: selectedTime
            ? `${String(selectedTime.getHours()).padStart(2, "0")}:${String(selectedTime.getMinutes()).padStart(2, "0")}`
            : "",
        }),
      });
      const result = (await response.json()) as { id?: string; error?: string };
      if (!response.ok || !result.id) throw new Error(result.error || "Kart oluşturulamadı. Tekrar dene.");
      setShareUrl(`${SITE_URL}/k/card/${encodeURIComponent(result.id)}?v=2`);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Kart oluşturulamadı.");
    } finally {
      setBusy(false);
    }
  };

  const handleShare = async () => {
    if (shareUrl) await Share.share({ message: `Sana özel bir soru kartı hazırladım: ${shareUrl}` });
  };

  const handleSignOut = async () => {
    await supabase?.auth.signOut();
    setShareUrl("");
    setActiveTab("create");
  };

  const openCard = (cardId: string) => {
    void Linking.openURL(`${SITE_URL}/k/card/${encodeURIComponent(cardId)}?v=2`);
  };

  const hasSupabaseConfig = Boolean(
    process.env.EXPO_PUBLIC_SUPABASE_URL && process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={styles.page}
          keyboardShouldPersistTaps="handled"
          refreshControl={session && activeTab !== "create" ? (
            <RefreshControl
              refreshing={cardsLoading}
              onRefresh={() => setCardsRefresh((current) => current + 1)}
              tintColor={colors.mint}
            />
          ) : undefined}
        >
          <View style={styles.header}>
            <Image source={require("./assets/icon.png")} style={styles.logo} />
            <View style={styles.brandCopy}>
              <Text style={styles.brandName}>Cardasks</Text>
              <Text style={styles.brandCaption}>SORU KARTI STÜDYOSU</Text>
            </View>
            {session ? <Pressable onPress={handleSignOut}><Text style={styles.signOut}>Çıkış</Text></Pressable> : null}
          </View>

          {activeTab === "create" || !session ? (
            <View style={styles.hero}>
              <Text style={styles.eyebrow}>BİR SORU, KÜÇÜK BİR HEYECAN</Text>
              <Text style={styles.title}>Soru kartı,</Text>
              <Text style={styles.titleAccent}>istediğin cevabı al.</Text>
              <Text style={styles.subtitle}>Sorunu hazırla, kartını gönder. Gerisini kaçan Hayır butonu halleder.</Text>
            </View>
          ) : null}

          {!hasSupabaseConfig ? (
            <View style={styles.panel}>
              <Text style={styles.panelTitle}>Supabase ayarı gerekiyor</Text>
              <Text style={styles.helper}>mobile/.env dosyasına .env.example içindeki Supabase değerlerini ekle.</Text>
            </View>
          ) : !session ? (
            <View style={styles.panel}>
              <Text style={styles.eyebrow}>HESABINLA DEVAM ET</Text>
              <Text style={styles.panelTitle}>Giriş yap</Text>
              <TextInput value={email} onChangeText={setEmail} placeholder="E-posta adresin" placeholderTextColor={colors.muted} keyboardType="email-address" autoCapitalize="none" autoComplete="email" style={styles.input} />
              <TextInput value={password} onChangeText={setPassword} placeholder="Şifren" placeholderTextColor={colors.muted} secureTextEntry autoComplete="current-password" style={styles.input} />
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <ActionButton label="Giriş yap" busy={busy} onPress={handleSignIn} />
              <Pressable onPress={() => Linking.openURL(`${SITE_URL}/kayit`)} style={styles.registerLink}>
                <Text style={styles.helper}>Yeni misin? <Text style={styles.registerAccent}>Hesap oluştur</Text></Text>
              </Pressable>
            </View>
          ) : activeTab === "create" ? (
            <View style={styles.panel}>
              {shareUrl ? (
                <View>
                  <Text style={styles.eyebrow}>KARTIN HAZIR</Text>
                  <Text style={styles.panelTitle}>Paylaşmaya hazır</Text>
                  <PreviewCard question={question} target={targetUsername} gif={selectedGif} theme={selectedTheme} place={place} date={selectedDate} time={selectedTime} />
                  <Text style={styles.shareUrl} selectable>{shareUrl}</Text>
                  <ActionButton label="Linki paylaş" onPress={handleShare} />
                  <Pressable onPress={() => { setShareUrl(""); setCreateStep("details"); }} style={styles.secondaryAction}>
                    <Text style={styles.secondaryActionText}>Yeni kart oluştur</Text>
                  </Pressable>
                </View>
              ) : createStep === "details" ? (
                <View>
                  <Text style={styles.eyebrow}>1 / 3 · KART DETAYLARI</Text>
                  <Text style={styles.panelTitle}>Kimin için?</Text>
                  <Text style={styles.fieldLabel}>KULLANICI ADI</Text>
                  <TextInput value={targetUsername} onChangeText={setTargetUsername} placeholder="ör. deniz" placeholderTextColor={colors.muted} autoCapitalize="none" autoCorrect={false} style={styles.input} />
                  <Text style={styles.fieldLabel}>SORUN</Text>
                  <TextInput value={question} onChangeText={setQuestion} placeholder="Aklındaki soruyu yaz..." placeholderTextColor={colors.muted} multiline maxLength={240} textAlignVertical="top" style={[styles.input, styles.questionInput]} />
                  <Text style={styles.characterCount}>{question.length}/240</Text>

                  <Text style={styles.fieldLabel}>KART TEMASI</Text>
                  <View style={styles.themeGrid}>
                    {THEMES.map((theme) => (
                      <Pressable key={theme.id} onPress={() => setSelectedTheme(theme.id)} style={[styles.themeOption, selectedTheme === theme.id && styles.themeOptionSelected]}>
                        <Text style={styles.themeEmoji}>{theme.emoji}</Text>
                        <Text numberOfLines={2} style={[styles.themeName, selectedTheme === theme.id && styles.themeNameSelected]}>{theme.name}</Text>
                      </Pressable>
                    ))}
                  </View>

                  <Text style={styles.fieldLabel}>BULUŞMA KONUMU <Text style={styles.optional}>(İSTEĞE BAĞLI)</Text></Text>
                  <LocationPicker value={place} onChange={setPlace} />

                  <Text style={styles.fieldLabel}>TARİH VE SAAT <Text style={styles.optional}>(İSTEĞE BAĞLI)</Text></Text>
                  <View style={styles.dateTimeRow}>
                    <Pressable onPress={() => { setShowDatePicker((open) => !open); setShowTimePicker(false); }} style={styles.dateTimeButton}>
                      <Text style={styles.dateTimeHint}>TARİH</Text>
                      <Text style={styles.dateTimeValue}>{selectedDate ? selectedDate.toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" }) : "Tarih seç"}</Text>
                    </Pressable>
                    <Pressable onPress={() => { setShowTimePicker((open) => !open); setShowDatePicker(false); }} style={styles.dateTimeButton}>
                      <Text style={styles.dateTimeHint}>SAAT</Text>
                      <Text style={styles.dateTimeValue}>{selectedTime ? `${String(selectedTime.getHours()).padStart(2, "0")}:${String(selectedTime.getMinutes()).padStart(2, "0")}` : "Saat seç"}</Text>
                    </Pressable>
                  </View>
                  {showDatePicker ? (
                    <View style={styles.pickerWrap}>
                      <DateTimePicker value={selectedDate || new Date()} mode="date" display="default" minimumDate={new Date()} onChange={(event, value) => { if (Platform.OS === "android") setShowDatePicker(false); if (event.type === "set" && value) setSelectedDate(value); }} />
                      {Platform.OS === "ios" ? <Pressable onPress={() => setShowDatePicker(false)} style={styles.pickerDone}><Text style={styles.refreshText}>Tamam</Text></Pressable> : null}
                    </View>
                  ) : null}
                  {showTimePicker ? (
                    <View style={styles.pickerWrap}>
                      <DateTimePicker value={selectedTime || new Date()} mode="time" display="default" onChange={(event, value) => { if (Platform.OS === "android") setShowTimePicker(false); if (event.type === "set" && value) setSelectedTime(value); }} />
                      {Platform.OS === "ios" ? <Pressable onPress={() => setShowTimePicker(false)} style={styles.pickerDone}><Text style={styles.refreshText}>Tamam</Text></Pressable> : null}
                    </View>
                  ) : null}
                  {error ? <Text style={styles.error}>{error}</Text> : null}
                  <ActionButton label="GIF seçimine geç" onPress={() => {
                    if (!targetUsername.trim() || !question.trim()) {
                      setError("Alıcı kullanıcı adını ve sorunu yaz.");
                      return;
                    }
                    setError("");
                    setCreateStep("gif");
                  }} />
                </View>
              ) : createStep === "gif" ? (
                <View>
                  <Text style={styles.eyebrow}>2 / 3 · ANİMASYONUNU SEÇ</Text>
                  <Text style={styles.panelTitle}>Kartına bir GIF ekle</Text>
                  <View style={styles.gifGrid}>
                    {CARD_GIFS.map((gif) => (
                      <Pressable key={gif} onPress={() => setSelectedGif(gif)} style={[styles.gifOption, selectedGif === gif && styles.gifOptionSelected]}>
                        <ExpoImage source={{ uri: gif }} style={styles.gifImage} contentFit="cover" transition={150} />
                      </Pressable>
                    ))}
                  </View>
                  <Text style={styles.helper}>Seçilen GIF kart bağlantısında hareketli görünür.</Text>
                  <View style={styles.actionRow}>
                    <ActionButton label="Geri" onPress={() => setCreateStep("details")} />
                    <ActionButton label="Önizle" onPress={() => setCreateStep("preview")} />
                  </View>
                </View>
              ) : (
                <View>
                  <Text style={styles.eyebrow}>3 / 3 · SON KONTROL</Text>
                  <Text style={styles.panelTitle}>Kartın böyle görünecek</Text>
                  <PreviewCard question={question} target={targetUsername} gif={selectedGif} theme={selectedTheme} place={place} date={selectedDate} time={selectedTime} />
                  {error ? <Text style={styles.error}>{error}</Text> : null}
                  <View style={styles.actionRow}>
                    <ActionButton label="Düzenle" onPress={() => setCreateStep("details")} />
                    <ActionButton label="GIF değiştir" onPress={() => setCreateStep("gif")} />
                  </View>
                  <ActionButton label="Kartı oluştur ve paylaş" busy={busy} onPress={handleCreateCard} />
                </View>
              )}
            </View>
          ) : (
            <View style={styles.cardList}>
              <View style={styles.listHeader}>
                <View>
                  <Text style={styles.eyebrow}>{activeTab === "received" ? "SANA GELENLER" : "SENİN GÖNDERDİKLERİN"}</Text>
                  <Text style={styles.panelTitle}>{activeTab === "received" ? "Gelenler" : "Gönderilenler"}</Text>
                </View>
                <Pressable onPress={() => setCardsRefresh((current) => current + 1)} accessibilityRole="button" style={styles.refreshButton}>
                  <Text style={styles.refreshText}>Yenile</Text>
                </Pressable>
              </View>
              {cardsLoading && cards.length === 0 ? (
                <View style={styles.stateBox}><ActivityIndicator color={colors.mint} /><Text style={styles.helper}>Kartlar yükleniyor...</Text></View>
              ) : cardsError ? (
                <Pressable onPress={() => setCardsRefresh((current) => current + 1)} style={styles.stateBox}>
                  <Text style={styles.error}>{cardsError}</Text><Text style={styles.refreshText}>Tekrar dene</Text>
                </Pressable>
              ) : cards.length === 0 ? (
                <View style={styles.stateBox}>
                  <Text style={styles.emptyTitle}>{activeTab === "received" ? "Henüz kartın yok" : "Henüz kart göndermedin"}</Text>
                  <Text style={styles.helper}>{activeTab === "received" ? "Sana gönderilen soru kartları burada görünür." : "Oluşturduğun kartlar burada görünür."}</Text>
                </View>
              ) : (
                <View style={styles.cardRows}>
                  {cards.map((card) => (
                    <View key={card.id} style={styles.cardRow}>
                      <Text style={styles.cardQuestion}>{card.soru}</Text>
                      <Text style={styles.cardPerson}>
                        {activeTab === "sent" ? `Alıcı: ${card.target_username}` : `Gönderen: ${card.from_username}`}
                      </Text>
                      <View style={styles.cardMeta}>
                        <Text style={styles.cardDate}>{new Date(card.created_at).toLocaleDateString("tr-TR")}</Text>
                        <Text style={styles.cardStatus}>{card.status === "accepted" ? "Kabul edildi" : "Beklemede"}</Text>
                      </View>
                      <Pressable onPress={() => openCard(card.id)} accessibilityRole="button" style={styles.openCardButton}>
                        <Text style={styles.openCardText}>Soruyu aç</Text>
                      </Pressable>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          <View style={styles.footer}>
            <Text style={styles.footerMark}>EVET <Text style={styles.footerHeart}>♥</Text> HAYIR</Text>
            <Text style={styles.footerCaption}>Küçük bir kart, büyük bir cevap.</Text>
          </View>
        </ScrollView>
        {session ? (
          <View style={styles.tabBar}>
            <TabButton label="Oluştur" symbol="+" active={activeTab === "create"} onPress={() => setActiveTab("create")} />
            <TabButton label="Gelenler" symbol="↓" active={activeTab === "received"} onPress={() => setActiveTab("received")} />
            <TabButton label="Gönderilenler" symbol="↑" active={activeTab === "sent"} onPress={() => setActiveTab("sent")} />
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function ActionButton({ label, onPress, busy = false }: { label: string; onPress: () => void; busy?: boolean }) {
  return (
    <Pressable onPress={onPress} disabled={busy} accessibilityRole="button" style={({ pressed }) => [styles.button, pressed && styles.buttonPressed, busy && styles.buttonDisabled]}>
      {busy ? <ActivityIndicator color={colors.background} /> : <Text style={styles.buttonText}>{label}</Text>}
    </Pressable>
  );
}

function PreviewCard({
  question,
  target,
  gif,
  theme,
  place,
  date,
  time,
}: {
  question: string;
  target: string;
  gif: string;
  theme: ThemeId;
  place: string;
  date: Date | null;
  time: Date | null;
}) {
  const themeName = THEMES.find((item) => item.id === theme)?.name || THEMES[0].name;
  const timeLabel = time ? `${String(time.getHours()).padStart(2, "0")}:${String(time.getMinutes()).padStart(2, "0")}` : "";

  return (
    <View style={styles.previewCard}>
      <View style={styles.previewHeader}>
        <Text style={styles.previewBrand}>CARDASKS</Text>
        <Text style={styles.previewRecipient}>@{target.replace(/^@/, "")}</Text>
      </View>
      <Text style={styles.previewQuestion}>{question || "Sorun burada görünecek."}</Text>
      <ExpoImage source={{ uri: gif }} style={styles.previewGif} contentFit="contain" transition={180} />
      <View style={styles.previewDetails}>
        <Text style={styles.previewTheme}>{themeName}</Text>
        {place ? <Text numberOfLines={2} style={styles.previewDetail}>⌖ {place}</Text> : null}
        {date ? <Text style={styles.previewDetail}>◷ {date.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}{timeLabel ? ` · ${timeLabel}` : ""}</Text> : timeLabel ? <Text style={styles.previewDetail}>◷ {timeLabel}</Text> : null}
      </View>
      <View style={styles.previewAnswers}>
        <Text style={styles.previewYes}>Evet! 💚</Text>
        <Text style={styles.previewNo}>Hayır 🙃</Text>
      </View>
    </View>
  );
}

function TabButton({ label, symbol, active, onPress }: { label: string; symbol: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityState={{ selected: active }} style={styles.tabButton}>
      <Text style={[styles.tabSymbol, active && styles.tabActive]}>{symbol}</Text>
      <Text style={[styles.tabLabel, active && styles.tabActive]}>{label}</Text>
    </Pressable>
  );
}

const colors = { background: "#17181B", surface: "#222428", raised: "#2A2C30", ink: "#F5F1E9", muted: "#96989D", coral: "#FF7867", mint: "#9BE0BE", line: "#3B3D41", error: "#FF9A8D" };

const styles = StyleSheet.create({
  flex: { flex: 1 }, safeArea: { flex: 1, backgroundColor: colors.background },
  page: { flexGrow: 1, paddingHorizontal: 22, paddingTop: 18, paddingBottom: 28 },
  header: { minHeight: 48, flexDirection: "row", alignItems: "center" },
  logo: { width: 42, height: 42, borderRadius: 12 }, brandCopy: { marginLeft: 11, flex: 1 },
  brandName: { color: colors.ink, fontSize: 17, fontWeight: "800" }, brandCaption: { marginTop: 2, color: colors.muted, fontSize: 9, fontWeight: "700", letterSpacing: 1 },
  signOut: { color: colors.ink, fontSize: 12, fontWeight: "700", padding: 9 },
  hero: { marginTop: 42, marginBottom: 27 }, eyebrow: { color: colors.mint, fontSize: 10, fontWeight: "800", letterSpacing: 1.2 },
  title: { marginTop: 13, color: colors.ink, fontSize: 34, lineHeight: 39, fontWeight: "800" }, titleAccent: { color: colors.coral, fontSize: 30, lineHeight: 38, fontWeight: "800" },
  subtitle: { maxWidth: 320, marginTop: 12, color: colors.muted, fontSize: 14, lineHeight: 21 },
  panel: { padding: 19, borderRadius: 22, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  panelTitle: { marginTop: 6, marginBottom: 14, color: colors.ink, fontSize: 22, fontWeight: "800" },
  fieldLabel: { marginTop: 12, marginBottom: 8, color: colors.muted, fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  input: { minHeight: 50, marginTop: 10, paddingHorizontal: 14, borderRadius: 13, backgroundColor: colors.raised, borderWidth: 1, borderColor: colors.line, color: colors.ink, fontSize: 15 },
  questionInput: { height: 100, paddingTop: 14 }, characterCount: { marginTop: 7, color: colors.muted, fontSize: 11, textAlign: "right" },
  button: { minHeight: 52, marginTop: 18, borderRadius: 14, backgroundColor: colors.mint, alignItems: "center", justifyContent: "center" },
  buttonPressed: { opacity: 0.84, transform: [{ scale: 0.99 }] }, buttonDisabled: { opacity: 0.65 },
  buttonText: { color: colors.background, fontSize: 15, fontWeight: "800" },
  error: { marginTop: 12, color: colors.error, fontSize: 13, lineHeight: 19 },
  registerLink: { alignItems: "center", paddingTop: 18, paddingBottom: 2 }, helper: { marginTop: 8, color: colors.muted, fontSize: 13, lineHeight: 20 }, registerAccent: { color: colors.coral, fontWeight: "700" },
  sharePanel: { marginTop: 20, paddingTop: 17, borderTopWidth: 1, borderTopColor: colors.line }, shareUrl: { color: colors.muted, fontSize: 12, lineHeight: 18 },
  footer: { marginTop: "auto", paddingTop: 32, alignItems: "center" }, footerMark: { color: colors.ink, fontSize: 10, fontWeight: "800", letterSpacing: 1.5 }, footerHeart: { color: colors.coral }, footerCaption: { marginTop: 7, color: colors.muted, fontSize: 11 },
  cardList: { marginTop: 5 }, listHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 18 },
  refreshButton: { paddingVertical: 9, paddingHorizontal: 13, borderRadius: 12, borderWidth: 1, borderColor: colors.line }, refreshText: { color: colors.mint, fontSize: 12, fontWeight: "700" },
  stateBox: { minHeight: 150, justifyContent: "center", alignItems: "center", padding: 20, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.line },
  emptyTitle: { color: colors.ink, fontSize: 16, fontWeight: "800" },
  cardRows: { borderTopWidth: 1, borderColor: colors.line }, cardRow: { paddingVertical: 18, borderBottomWidth: 1, borderColor: colors.line },
  cardQuestion: { color: colors.ink, fontSize: 16, lineHeight: 23, fontWeight: "700" }, cardPerson: { marginTop: 8, color: colors.muted, fontSize: 12 },
  cardMeta: { marginTop: 7, flexDirection: "row", gap: 12 }, cardDate: { color: colors.muted, fontSize: 11 }, cardStatus: { color: colors.mint, fontSize: 11, fontWeight: "700" },
  openCardButton: { alignSelf: "flex-start", marginTop: 12, paddingVertical: 9, paddingHorizontal: 13, borderRadius: 11, backgroundColor: colors.raised }, openCardText: { color: colors.ink, fontSize: 12, fontWeight: "700" },
  tabBar: { minHeight: 66, flexDirection: "row", borderTopWidth: 1, borderTopColor: colors.line, backgroundColor: colors.background, paddingHorizontal: 8 },
  tabButton: { flex: 1, alignItems: "center", justifyContent: "center", gap: 3 }, tabSymbol: { color: colors.muted, fontSize: 18, lineHeight: 21, fontWeight: "700" },
  tabLabel: { color: colors.muted, fontSize: 10, fontWeight: "700" }, tabActive: { color: colors.mint },
  optional: { color: colors.muted, fontSize: 9, fontWeight: "500", letterSpacing: 0 },
  themeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  themeOption: { width: "31%", minHeight: 68, alignItems: "center", justifyContent: "center", padding: 7, borderRadius: 12, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.raised },
  themeOptionSelected: { borderColor: colors.mint, backgroundColor: "#29433A" },
  themeEmoji: { fontSize: 20 }, themeName: { marginTop: 4, color: colors.muted, fontSize: 9, fontWeight: "600", textAlign: "center" },
  themeNameSelected: { color: colors.ink },
  dateTimeRow: { flexDirection: "row", gap: 10 },
  dateTimeButton: { flex: 1, minHeight: 58, justifyContent: "center", paddingHorizontal: 13, borderRadius: 12, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.raised },
  dateTimeHint: { color: colors.muted, fontSize: 9, fontWeight: "700", letterSpacing: 1 }, dateTimeValue: { marginTop: 4, color: colors.ink, fontSize: 13, fontWeight: "700" },
  pickerWrap: { marginTop: 8, padding: 8, borderRadius: 12, backgroundColor: colors.raised }, pickerDone: { alignSelf: "flex-end", padding: 8 },
  gifGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 8 },
  gifOption: { width: "31.5%", aspectRatio: 1, overflow: "hidden", borderRadius: 12, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.raised },
  gifOptionSelected: { borderWidth: 3, borderColor: colors.mint }, gifImage: { width: "100%", height: "100%" },
  actionRow: { flexDirection: "row", gap: 9 },
  previewCard: { marginBottom: 10, overflow: "hidden", borderRadius: 18, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.raised },
  previewHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 14, borderBottomWidth: 1, borderBottomColor: colors.line },
  previewBrand: { color: colors.mint, fontSize: 10, fontWeight: "900", letterSpacing: 1 }, previewRecipient: { color: colors.muted, fontSize: 11, fontWeight: "700" },
  previewQuestion: { paddingHorizontal: 17, paddingTop: 17, color: colors.ink, fontSize: 19, lineHeight: 26, fontWeight: "800", textAlign: "center" },
  previewGif: { width: "100%", height: 190, marginTop: 10, backgroundColor: colors.background },
  previewDetails: { gap: 5, paddingHorizontal: 15, paddingTop: 12 }, previewTheme: { color: colors.coral, fontSize: 11, fontWeight: "800" }, previewDetail: { color: colors.muted, fontSize: 11, lineHeight: 16 },
  previewAnswers: { flexDirection: "row", gap: 10, padding: 14 }, previewYes: { flex: 1, padding: 11, overflow: "hidden", borderRadius: 11, backgroundColor: colors.mint, color: colors.background, fontSize: 12, fontWeight: "800", textAlign: "center" },
  previewNo: { flex: 1, padding: 11, overflow: "hidden", borderRadius: 11, backgroundColor: colors.coral, color: colors.background, fontSize: 12, fontWeight: "800", textAlign: "center" },
  secondaryAction: { alignItems: "center", padding: 14 }, secondaryActionText: { color: colors.mint, fontSize: 13, fontWeight: "700" },
});
