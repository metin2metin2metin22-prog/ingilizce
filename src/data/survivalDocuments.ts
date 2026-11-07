export interface TravelDocumentItem {
  id: string;
  title: string;
  titleTr: string;
  icon: string;
  badge: string;
  purpose: string;
  fields: { label: string; value: string; hintTr?: string }[];
  keyTerms: { en: string; tr: string; phoneticTr: string }[];
  officerTip: string;
}

export const SURVIVAL_DOCUMENTS: TravelDocumentItem[] = [
  {
    id: 'hotel-voucher',
    title: 'Hotel Accommodation Voucher',
    titleTr: 'Otel Rezervasyon Belgesi',
    icon: '🏨',
    badge: 'CONFIRMED & PREPAID',
    purpose: 'Gümrük memuru "Where will you be staying?" (Nerede kalacaksınız?) diye sorduğunda ibraz edilir.',
    fields: [
      { label: 'Hotel Name', value: 'The Resident Soho London', hintTr: 'Otel Adı' },
      { label: 'Address', value: '10 Carlisle St, Soho, London W1D 3BR', hintTr: 'Açık Adres ve Posta Kodu' },
      { label: 'Check-in / Check-out', value: '14 Nov 2026 / 19 Nov 2026 (5 Nights)', hintTr: 'Giriş / Çıkış Tarihi' },
      { label: 'Room Type', value: 'Standard Double (Non-Smoking)', hintTr: 'Oda Tipi' },
      { label: 'Payment Status', value: '£485.00 PAID IN FULL (Non-Refundable)', hintTr: 'Ödeme Durumu: Tamamı Ödendi' },
    ],
    keyTerms: [
      { en: 'Proof of accommodation', tr: 'Konaklama kanıtı', phoneticTr: '[ pruuf ov e-kom-mı-dey-şın ]' },
      { en: 'Prepaid', tr: 'Önceden ödenmiş', phoneticTr: '[ pri-peyd ]' },
      { en: 'Non-refundable', tr: 'İadesiz / Kesin rezervasyon', phoneticTr: '[ non ri-fan-dı-bıl ]' },
      { en: 'Check-in time', tr: 'Otele giriş saati', phoneticTr: '[ çek-in taym ]' },
    ],
    officerTip: 'Sınır memuru asla arkadaşınızın ev adresini sözlü söylemenizi sevmez; rezervasyon belgesi üzerindeki posta kodunu (ör: W1D 3BR) görmek ister.',
  },
  {
    id: 'flight-ticket',
    title: 'E-Ticket Return Flight Itinerary',
    titleTr: 'Dönüş Uçak Bileti & Seyahat Planı',
    icon: '✈️',
    badge: 'CONFIRMED E-TICKET',
    purpose: 'Memur "When will you return to your country?" (Ülkenize ne zaman döneceksiniz?) dediğinde gösterilir.',
    fields: [
      { label: 'Passenger Name', value: 'SURVIVOR / EXPLORER', hintTr: 'Yolcu Adı' },
      { label: 'Outbound Flight', value: 'TK1985 • Istanbul (IST) -> London Heathrow (LHR)', hintTr: 'Gidiş Uçuşu' },
      { label: 'Inbound Return Flight', value: 'TK1986 • London Heathrow (LHR) -> Istanbul (IST)', hintTr: 'Dönüş Uçuşu' },
      { label: 'Return Date', value: '19 Nov 2026, 17:30 GMT (Terminal 2)', hintTr: 'Dönüş Saati ve Terminali' },
      { label: 'Baggage Allowance', value: '1 Check-in (23kg) + 1 Cabin Bag (8kg)', hintTr: 'Bagaj Hakkı' },
    ],
    keyTerms: [
      { en: 'Return ticket', tr: 'Gidiş-dönüş bileti', phoneticTr: '[ ri-törn tik-kıt ]' },
      { en: 'Outbound / Inbound', tr: 'Gidiş / Dönüş seferi', phoneticTr: '[ aut-baund / in-baund ]' },
      { en: 'Baggage allowance', tr: 'Bagaj hakkı sınırı', phoneticTr: '[ beg-gıc e-lau-ıns ]' },
      { en: 'Flight itinerary', tr: 'Uçuş seyahat programı', phoneticTr: '[ flayt ay-tin-ı-re-ri ]' },
    ],
    officerTip: 'İngiltere\'ye tek yön (one-way) biletle giderseniz sınır polisi kaçak kalacağınızı varsayarak sizi doğrudan ikinci mülakata (detention) alır.',
  },
  {
    id: 'bank-statement',
    title: 'Bank Statement & Proof of Funds',
    titleTr: 'Banka Hesap Özeti & Mali Yeterlilik Belgesi',
    icon: '💳',
    badge: 'OFFICIAL STAMPED',
    purpose: 'Memur "How will you fund your stay?" (Masraflarınızı nasıl karşılayacaksınız?) sorusunun resmi yanıtıdır.',
    fields: [
      { label: 'Account Holder', value: 'TURKISH EXPLORER PASSPORT HOLDER', hintTr: 'Hesap Sahibi' },
      { label: 'Available Balance', value: '£2,850.00 GBP (Equivalent in EUR/TRY)', hintTr: 'Kullanılabilir Bakiye' },
      { label: 'Credit Card Limit', value: '£5,000.00 (International Contactless)', hintTr: 'Kredi Kartı Limiti' },
      { label: 'Bank Name & Branch', value: 'Global Banking Corp - Istanbul Levent Branch', hintTr: 'Banka ve Şube' },
    ],
    keyTerms: [
      { en: 'Proof of funds', tr: 'Maddi yeterlilik kanıtı', phoneticTr: '[ pruuf ov fandz ]' },
      { en: 'Available balance', tr: 'Kullanılabilir bakiye', phoneticTr: '[ e-vey-lı-bıl be-lıns ]' },
      { en: 'Cover expenses', tr: 'Masrafları karşılamak', phoneticTr: '[ ka-vır iks-pen-sız ]' },
      { en: 'Sufficient funds', tr: 'Yeterli parasal kaynak', phoneticTr: '[ sıf-fi-şınt fandz ]' },
    ],
    officerTip: 'İngiltere\'de ortalama günlük harcama için en az £70-100 bakiye göstermek memurun şüphesini sıfıra indirir.',
  },
  {
    id: 'eta-permit',
    title: 'UK Electronic Travel Authorisation (ETA)',
    titleTr: 'Birleşik Krallık Elektronik Seyahat İzni (ETA)',
    icon: '🪪',
    badge: 'STATUS: VALID / GRANTED',
    purpose: 'Birleşik Krallık sınırına giriş için dijital vize onay belgesidir.',
    fields: [
      { label: 'Document Number', value: 'UK-ETA-2026-884920', hintTr: 'İzin Numarası' },
      { label: 'Validity Period', value: '2 Years (Multiple Entry)', hintTr: 'Geçerlilik Süresi: 2 Yıl Çoklu Giriş' },
      { label: 'Purpose of Visit', value: 'Tourism / Short Business Visit', hintTr: 'Giriş Amacı: Turizm' },
      { label: 'Max Stay per Visit', value: 'Up to 6 Months per visit', hintTr: 'Maksimum Kalış Süresi' },
    ],
    keyTerms: [
      { en: 'Electronic Travel Authorisation', tr: 'Elektronik Seyahat İzni', phoneticTr: '[ i-lek-tron-ik tre-vıl o-to-ray-zey-şın ]' },
      { en: 'Multiple entry', tr: 'Çoklu giriş hakkı', phoneticTr: '[ mol-ti-pıl en-tri ]' },
      { en: 'Validity period', tr: 'Geçerlilik süresi', phoneticTr: '[ ve-li-di-ti pi-ri-yıd ]' },
    ],
    officerTip: 'ETA izin belgeniz olsa bile pasaport kontrolünde yalan söylemek veya şüpheli davranmak anında iptale neden olabilir.',
  },
];
