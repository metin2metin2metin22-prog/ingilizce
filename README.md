# 🇬🇧 London Survival: İngilizce Hayatta Kalma & İnteraktif Diyalog Simülatörü

Gerçek hayat senaryoları (Havalimanı, Kafe, Metro, Ev Kiralama, Mülakat ve Yönetim Kurulu) üzerinden **aktif geri çağırma (active recall)** ve **canlı diyalog** ile İngilizce kelime öğreten interaktif web uygulaması.

---

## 🎯 Projenin Amacı ve Felsefesi
Dil ezberle değil, **ihtiyaç duyulduğu anda** öğrenilir. Oyuncu tek kuruşsuz Londra'ya iner ve hayatta kalmak için İngilizce konuşmak zorundadır:

1. **🛂 A1: Heathrow Terminal 5 - Pasaport Masası:** Sınır Muhafızı Memur Smith (*Purpose, Stay, Address, Return, Declare*).
2. **☕ A2: King's Cross İstasyonu - Kafe & Metro:** Barista Chloe & İstasyon Danışmanı (*Order, Receipt, Single, Platform, Direction*).
3. **💼 B1: Soho - Ev Kiralama & İş Mülakatı:** Ev Sahibi Higgins & İK Müdürü Claire (*Deposit, Contract, Responsible, Experience, Negotiate*).
4. **👔 B2: Canary Wharf - CEO Yönetim Kurulu:** 10 Milyon Poundluk Yatırım Zirvesi (*Detrimental, Substantial, Comprehensive, Resilience, Ambiguous*).

---

## 🧠 Nasıl Öğretiyor?
1. **Canlı Diyalog Akışı:** Karakter doğrudan İngilizce konuşur (İngiliz aksanlı doğal ses sentezi + Türkçe altyazı).
2. **Cümle İçi Aktif Geri Çağırma (Active Recall Slotting):** Oyuncu söyleyeceği cümlenin ortasındaki anahtar kelime boşluğunu (`[ _____ ]`) zihninden bularak konuşur.
3. **Akıllı Kelime Kartı (Micro-Flashcard):** Konuşma balonlarındaki kelimelere dokunulduğunda telaffuz, fonetik ve akılda kalıcı hafıza çivisi (mnemonic) açılır.
4. **%100 Hafıza Mührü (The Retention Blitz):** Diyalog bitince o 5 kelimeyi ezberinden hatasız teyit etmeden pasaporta yeşil giriş damgası basılmaz!
5. **İngiliz Pasaportu:** Toplanan vize damgaları ve hafızaya kilitlenen tüm kelimeler pasaportta arşivlenir.

---

## 🚀 Yerel Kurulum & Çalıştırma

```bash
# Bağımlılıkları yükleyin
npm install

# Geliştirme sunucusunu başlatın
npm run dev

# Üretim derlemesi
npm run build
```

Tarayıcınızda açın: `http://localhost:5173/`

---

## 🛠️ Teknolojiler
- **React 18 + TypeScript**
- **Vite 6**
- **Tailwind CSS v4**
- **Lucide Icons**
- **Web Audio API & SpeechSynthesis API** (Doğal ses efektleri & İngiliz aksanı)
- **Canvas Confetti**
