# Kaçan Kart — İnteraktif Kaçan Butonlu Mesaj Kartı

Next.js 14 (App Router) + TypeScript + Tailwind CSS + Framer Motion + canvas-confetti ile yapılmış, "Hayır" butonu kaçan, "Evet" butonuna basınca konfeti patlatan paylaşılabilir mesaj kartı.

## Dosya yapısı

```
kacan-kart-app/
├── app/
│   ├── layout.tsx          # Kök layout, fontlar (Baloo 2 + Inter)
│   ├── globals.css         # Tailwind + global stiller
│   ├── page.tsx            # Kart oluşturma paneli (üretici sayfası)
│   └── k/
│       └── card/
│           └── page.tsx    # Alıcının gördüğü sayfa (URL parametrelerini okur)
├── components/
│   └── KacanKart.tsx       # Ana interaktif kart bileşeni
├── package.json
├── tailwind.config.ts
├── postcss.config.js
├── tsconfig.json
└── next.config.mjs
```

## Kurulum

Bu klasörü bilgisayarınıza indirdikten sonra terminalde proje klasörüne girip:

```bash
cd kacan-kart-app
npm install
```

Bağımlılıklar zaten `package.json` içinde tanımlı (`framer-motion`, `canvas-confetti`, `@types/canvas-confetti` dahil), `npm install` hepsini kuracaktır.

## Geliştirme sunucusunu çalıştırma

```bash
npm run dev
```

Tarayıcıda `http://localhost:3000` adresine gidin.

- `/` → Kart oluşturma paneli. Soru, Evet/Hayır buton metinlerini girip **Link oluştur**'a basın, üretilen linki kopyalayın.
- `/k/card?soru=...&evet=...&hayir=...` → Paylaşılan linke tıklayan kişinin göreceği sayfa.

## Production build

```bash
npm run build
npm run start
```

## Nasıl çalışıyor?

- **Kaçan buton:** `KacanKart.tsx` içinde "Hayır" butonu `onMouseEnter` (masaüstü) veya `onTouchStart` (mobil) tetiklendiğinde, çevresindeki oyun alanının (`playzone`) sınırları içinde rastgele bir `x`/`y` konumu hesaplanır ve Framer Motion'ın `spring` (`stiffness: 320, damping: 18`) animasyonuyla o konuma yumuşakça kayar. Buton ayrıca her kaçışta metnini değiştirir (“Emin misin?”, “Yakalayamazsın 😏” vb.).
- **Konfeti:** "Evet" butonuna tıklanınca `canvas-confetti` ile üç ayrı patlama tetiklenir ve kart, başarı mesajına geçiş yapar (Framer Motion `AnimatePresence` ile yumuşak geçiş).
- **Paylaşılabilir link:** Üretici sayfası, girilen metinleri `URLSearchParams` ile `/k/card` yoluna query parametresi olarak ekler. `app/k/card/page.tsx` bu parametreleri sunucu bileşeninde okuyup `KacanKart`'a prop olarak aktarır.

## Notlar / olası geliştirmeler

- Şu an linkler durum tutmuyor (sunucusuz, tamamen URL parametreleriyle çalışıyor) — istenirse bir veritabanı (ör. Vercel KV/Postgres) eklenip kısa linkler (`/k/abc123`) üretilebilir.
- Metinler URL'de görünür durumda; hassas/uzun metinler için ileride bir backend ile kısaltma eklenebilir.
