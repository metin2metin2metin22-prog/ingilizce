export interface LuggageItem {
  id: string;
  nameEn: string;
  nameTr: string;
  phoneticTr: string;
  icon: string;
  actionRequired: 'TRAY' | 'PROHIBITED' | 'KEEP_IN_HAND' | 'POCKET_EMPTY' | 'CABIN_ONLY';
  actionPromptEn: string;
  actionPromptTr: string;
  securityExplanation: string;
  points: number;
}

export const LUGGAGE_SECURITY_ITEMS: LuggageItem[] = [
  {
    id: 'laptop',
    nameEn: 'Laptop Computer',
    nameTr: 'Dizüstü Bilgisayar',
    phoneticTr: '[ lep-top kom-pyu-tır ]',
    icon: '💻',
    actionRequired: 'TRAY',
    actionPromptEn: 'Remove from bag and place in a separate plastic tray',
    actionPromptTr: 'Çantadan çıkar ve ayrı bir plastik sepete koy',
    securityExplanation: 'Bataryalar ve yoğun devreler X-Ray tarayıcısında altındaki eşyaları gizlemesin diye mutlaka ayrı sepete konur.',
    points: 15,
  },
  {
    id: 'large-liquids',
    nameEn: 'Bottled Drink (500ml)',
    nameTr: 'Şişe İçecek (500ml Sıvı)',
    phoneticTr: '[ bot-tıld drink ]',
    icon: '🥤',
    actionRequired: 'PROHIBITED',
    actionPromptEn: 'Forbidden! Must be discarded before security checkpoint',
    actionPromptTr: 'Yasak! Güvenlik kontrolünden önce çöpe atılmalıdır',
    securityExplanation: '100 ml üzerindeki sıvılar kabin bagajına alınamaz. Çöpe atılmalı veya güvenlik öncesi tüketilmelidir.',
    points: 20,
  },
  {
    id: 'small-perfume',
    nameEn: 'Travel Perfume (50ml)',
    nameTr: 'Seyahat Parfümü (50ml)',
    phoneticTr: '[ tre-vıl pör-fyuum ]',
    icon: '🧴',
    actionRequired: 'TRAY',
    actionPromptEn: 'Place in a clear transparent 1-litre resealable plastic bag',
    actionPromptTr: 'Şeffaf kilitli 1 litrelik poşete koyarak sepete yerleştir',
    securityExplanation: '100 ml altı sıvılar şeffaf kilitli poşette olmak kaydıyla sepete ayrı olarak konulabilir.',
    points: 15,
  },
  {
    id: 'apple-fresh',
    nameEn: 'Fresh Apple & Fruit',
    nameTr: 'Taze Elma & Yaş Meyve',
    phoneticTr: '[ freş ep-pıl ]',
    icon: '🍏',
    actionRequired: 'PROHIBITED',
    actionPromptEn: 'Strictly prohibited agricultural item; declare or surrender',
    actionPromptTr: 'Tarım ürünü olduğu için yasaktır; beyan et veya teslim et',
    securityExplanation: 'İngiltere biyolojik güvenlik yasaları gereği ülke dışından taze meyve/tohum sokulması yasaktır.',
    points: 20,
  },
  {
    id: 'power-bank',
    nameEn: 'Power Bank (Lithium Battery)',
    nameTr: 'Taşınabilir Şarj Cihazı (Lityum)',
    phoneticTr: '[ pau-wır benk ]',
    icon: '🔋',
    actionRequired: 'CABIN_ONLY',
    actionPromptEn: 'Must remain in cabin hand baggage (never in cargo hold)',
    actionPromptTr: 'Sadece kabin el bagajında taşınmalıdır (asla kargo bagajına verilmez)',
    securityExplanation: 'Lityum iyon piller uçak kargosunda yangın riski oluşturduğu için yalnızca kabin bagajında taşınabilir.',
    points: 15,
  },
  {
    id: 'pocket-knife',
    nameEn: 'Pocket Swiss Knife',
    nameTr: 'Çakı / Kesici Alet',
    phoneticTr: '[ pok-kıt nayf ] (K okunmaz!)',
    icon: '🔪',
    actionRequired: 'PROHIBITED',
    actionPromptEn: 'Confiscated! Sharp blade exceeding 6cm is illegal in cabin',
    actionPromptTr: 'El konulur! 6 cm üzeri kesici aletler kabine sokulamaz',
    securityExplanation: 'Bıçak ve sivri uçlu kesici aletler güvenlik personelince anında müsadere edilir.',
    points: 25,
  },
  {
    id: 'keys-coins',
    nameEn: 'Keys & Metal Coins',
    nameTr: 'Anahtarlar & Madeni Paralar',
    phoneticTr: '[ kiiz end koynz ]',
    icon: '🔑',
    actionRequired: 'POCKET_EMPTY',
    actionPromptEn: 'Empty your pockets into the tray before metal detector arch',
    actionPromptTr: 'Dedektörden geçmeden önce ceplerini tamamen sepete boşalt',
    securityExplanation: 'Madeni paralar ve anahtarlar kapı dedektörünün alarmını çaldırarak aramayı geciktirir.',
    points: 10,
  },
  {
    id: 'passport-boarding-pass',
    nameEn: 'Passport & Boarding Pass',
    nameTr: 'Pasaport ve Biniş Kartı',
    phoneticTr: '[ paas-port end bor-ding paas ]',
    icon: '🪪',
    actionRequired: 'KEEP_IN_HAND',
    actionPromptEn: 'Keep in hand! Do not put your ID inside luggage trays',
    actionPromptTr: 'Elinizde tutun! Kimliğinizi sepetlerin içine bırakmayın',
    securityExplanation: 'Güvenlik sonrasında ve kapılarda tekrar gösterileceği için elinizde hazır bulunmalıdır.',
    points: 15,
  },
];
