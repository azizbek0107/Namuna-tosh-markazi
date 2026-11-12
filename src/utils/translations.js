import { uiTranslations } from './uiTranslations.js';
import { brandNames, getBrand } from '../config/brandConfig.js';

/**
 * Comprehensive Multi-Language Translations & Helpers for Namuna Tosh Markazi.
 * Supported languages:
 *  - 'uz': O‘zbekcha (Lotin)
 *  - 'oz': Ўзбекча (Кирилл)
 *  - 'ru': Русский
 *  - 'en': English
 */

export const SUPPORTED_LANGUAGES = [
  { code: 'uz', name: 'O‘zbekcha', sub: 'Lotin', flag: '🇺🇿', short: 'UZ' },
  { code: 'oz', name: 'Ўзбекча', sub: 'Кирилл', flag: '🇺🇿', short: 'ЎЗ' },
  { code: 'ru', name: 'Русский', sub: 'Русский', flag: '🇷🇺', short: 'RU' },
  { code: 'en', name: 'English', sub: 'English', flag: '🇬🇧', short: 'EN' },
];

export const translations = {
  uz: {
    // Nav
    'nav.home': 'Bosh sahifa',
    'nav.products': 'Mahsulotlar',
    'nav.discounts': 'Chegirmalar',
    'nav.about': 'Biz haqimizda',
    'nav.contact': 'Bog‘lanish',
    'nav.order': 'Buyurtma berish',
    'nav.menu': 'Menyu',
    'nav.close': 'Yopish',
    'nav.start_together': 'LOYIHANGIZNI BIRGA BOSHLAYMIZ',
    'nav.materials_tagline': 'Kerama granit · Tosh · Me’moriy detallar',

    // Theme & Lang
    'lang.select': 'Tilni tanlash',
    'theme.toggle': 'Mavzuni almashtirish',

    // Hero
    'hero.badge': 'PREMIUM KERAMA GRANIT VA TOSH MAHSULOTLARI',
    'hero.title_brand': 'NAMUNA',
    'hero.title_rest': 'TOSH MARKAZI',
    'hero.subtitle': 'Sifat va nafislik uyg‘unligi',
    'hero.description': 'Uyingiz va loyihalaringiz uchun zamonaviy kerama granit, granit, kafel hamda tabiiy tosh mahsulotlari. Nafis dizayn, puxta ishlov va didingizga mos yechimlar.',
    'hero.cta_products': 'Mahsulotlarni ko‘rish',
    'hero.cta_telegram': 'Telegram orqali buyurtma',
    'hero.trust_1': 'Haqiqiy mahsulot rasmlari',
    'hero.trust_2': 'Loyihangizga mos tanlov',
    'hero.stat_1_title': 'Kerama granit',
    'hero.stat_1_desc': 'Rang va fakturalar bilan tanishing.',
    'hero.stat_2_title': 'Sokl va zinapoyalar',
    'hero.stat_2_desc': 'Makoningizni to‘ldiradigan detallar.',
    'hero.stat_3_title': 'Buyurtma asosida ishlov',
    'hero.stat_3_desc': 'G‘oyangiz va o‘lchamlarni muhokama qilamiz.',

    // Home Preview
    'home.preview_eyebrow': 'KEYINGI QADAM / MAHSULOTLAR',
    'home.preview_title_1': 'Har bir makonning',
    'home.preview_title_2': 'o‘z xarakteri bor.',
    'home.preview_desc': 'Kerama granit, granit, kafel va tabiiy tosh mahsulotlari bilan tanishing. Material va ishlov haqidagi savollaringizni loyihangizga mos ravishda muhokama qilamiz.',
    'home.preview_cta': 'Mahsulotlar bo‘limiga o‘tish',
    'home.why_eyebrow': 'AFZALLIKLARIMIZ / XIZMATLAR',

    // Why Choose Us
    'why.title': 'Nega Namuna Tosh Markazi?',
    'why.description': 'Buyurtmangizga mos material, o‘lcham va ishlov bo‘yicha birgalikda qaror qilamiz.',
    'why.service_1_title': 'Kerakli o‘lchamda kesish',
    'why.service_1_desc': 'Loyihangiz uchun kesish o‘lchamlarini kelishamiz.',
    'why.service_2_title': 'Granit va plitalarga ishlov berish',
    'why.service_2_desc': 'Plitalarni o‘lcham bo‘yicha silliqlash va ishlov berish.',
    'why.service_3_title': 'Tayyor mahsulotlar ishlab chiqarish',
    'why.service_3_desc': 'Buyurtmaga mos holda tayyor tosh mahsulotlarini ishlab chiqarish.',
    'why.service_4_title': 'Mahsulotlarni tanlash bo‘yicha maslahat',
    'why.service_4_desc': 'Material namunalari va ko‘rinishini birgalikda ko‘rib chiqamiz.',
    'why.service_5_title': 'Buyurtma asosida tayyorlash',
    'why.service_5_desc': 'Loyihangiz talablarini muhokama qilib, mos yechimni kelishamiz.',

    // Catalog / Products Page
    'catalog.eyebrow': 'MAHSULOTLAR KATALOGI',
    'catalog.title': 'Makoningizga mos tanlov.',
    'catalog.description': 'Rang, faktura va xarakter. Kerama granit namunalarini ko‘rib chiqing va loyihangiz uchun tanlang.',
    'catalog.sample_count': 'MAHSULOT NAMUNASI',
    'catalog.search_placeholder': 'Nomi yoki artikul bo‘yicha qidiring...',
    'catalog.size_all': 'Barcha o‘lchamlar',
    'catalog.loading': 'Mahsulotlar yuklanmoqda...',
    'catalog.found_count': 'ta mahsulot topildi',
    'catalog.unpriced_note': 'ta mahsulot narxi so‘rov asosida',
    'catalog.priced_note': 'ta narxi ko‘rsatilgan mahsulot',
    'catalog.view_detail': 'Batafsil ko‘rish',
    'catalog.in_cart_badge': 'Buyurtmada',
    'catalog.empty_title': 'Mahsulot topilmadi',
    'catalog.empty_desc': 'Qidiruv parametrlarini o‘zgartirib ko‘ring.',
    'catalog.clear_filters': 'Filtrlarni tozalash',

    // Product Details
    'product.grade': 'Sorti',
    'product.size': 'Razmeri (O‘lchamlar)',
    'product.thickness': 'Qalinligi',
    'product.artikul': 'Artikul',
    'product.stock': 'Omborda mavjudligi',
    'product.weight': 'Vazni',
    'product.price': 'Narxi',
    'product.order_btn': 'Buyurtma berish',
    'product.in_cart_prefix': 'Savatda',
    'product.in_cart_open': 'Karzinkani ochish',
    'product.back_catalog': 'Katalogga qaytish',
    'product.back_discounts': 'Aksiyalarga qaytish',
    'product.standard_size': 'Standart o‘lcham',
    'product.to_clarify': 'Aniqlashtiriladi',
    'product.in_stock': 'dona mavjud',
    'product.in_stock_simple': 'Omborda mavjud',
    'product.gallery_note': 'Rang, naqsh va proporsiyalar asl rasmlardan o‘zgartirilmagan.',

    // Discounts
    'discounts.eyebrow': 'CHEGIRMALAR VA AKSIYALAR',
    'discounts.hero_title': 'MAXSUS TAKLIFLAR',
    'discounts.hero_subtitle': 'Sifatli mahsulotlar — qulay narxlarda',
    'discounts.hero_status': 'ta faol taklif',
    'discounts.hero_no_active': 'Hozircha faol aksiya yo‘q',
    'discounts.loading': 'Takliflar yuklanmoqda...',
    'discounts.retry': 'Qayta yuklash',
    'discounts.error_title': 'Takliflarni yuklab bo‘lmadi',
    'discounts.error_desc': 'Sahifani yangilab qayta urinib ko‘ring.',
    'discounts.title': 'Chegirmalar va maxsulot aksiyalari',
    'discounts.desc': 'Foydali narxdagi tanlangan kerama granit va tabiiy tosh mahsulotlari.',
    'discounts.active_count': 'ta faol taklif topildi',
    'discounts.footnote': 'Narxlar bir sotuv birligi uchun ko‘rsatilgan. Chegirma buyurtmaning umumiy summasiga qo‘llanadi.',

    // About
    'about.hero_eyebrow': '01 / BIZ HAQIMIZDA',
    'about.hero_title': 'NAMUNA TOSH MARKAZI',
    'about.hero_subtitle': 'Mahsulotlarimiz ortida — puxta ishlov va e’tibor',
    'about.hero_desc': 'Namuna Tosh Markazi kerama granit, granit, kafel va turli tosh mahsulotlariga puxta ishlov berish bilan shug‘ullanadi.',
    'about.hero_signature': 'MATERIAL. O‘LCHAM. ISHLOV.',
    'about.story_eyebrow': '01 / MARKAZIMIZ',
    'about.story_title': 'Biz haqimizda',
    'about.story_note': 'Materialdan tayyor mahsulotgacha.',
    'about.story_p1': 'Namuna Tosh Markazi — kerama granit, granit, kafel va turli tosh mahsulotlariga ishlov berishga ixtisoslashgan ishlab chiqarish markazi. Korxonamizda plitalarni kerakli o‘lchamda kesish va tayyor mahsulot holiga keltirish ishlari amalga oshiriladi.',
    'about.story_p2': 'Maqsadimiz — mijozlarga ularning loyihalariga mos mahsulot va ishlov berish yechimlarini taqdim etish.',
    'about.process_eyebrow': '02 / JARAYON',
    'about.process_title': 'Mahsulot qanday tayyorlanadi?',
    'about.process_desc': 'Umumiy ishlov berish bosqichlari. Aniq ishlar va ularning ketma-ketligi mahsulot hamda buyurtma talabiga qarab belgilanadi.',
    'about.step_1_title': 'Materialni tanlash',
    'about.step_1_desc': 'Loyihaga mos rang, naqsh va material ko‘rib chiqiladi.',
    'about.step_2_title': 'O‘lchamni belgilash',
    'about.step_2_desc': 'Kerakli o‘lchamlar va ishlov talablari aniqlashtiriladi.',
    'about.step_3_title': 'Plitani kesish',
    'about.step_3_desc': 'Material kelishilgan o‘lchamga moslab kesiladi.',
    'about.step_4_title': 'Chetlariga ishlov berish',
    'about.step_4_desc': 'Mahsulotning vazifasiga mos chet ishlovi bajariladi.',
    'about.step_5_title': 'Tayyor mahsulotni tekshirish',
    'about.step_5_desc': 'Tayyorlangan mahsulotning o‘lchami va ishlovi ko‘rib chiqiladi.',
    'about.step_6_title': 'Buyurtmaga tayyorlash',
    'about.step_6_desc': 'Buyurtma tafsilotlari va topshirish shartlari aniqlashtiriladi.',
    'about.directions_eyebrow': '03 / MAHSULOTLAR',
    'about.directions_title': 'Mahsulot yo‘nalishlari',
    'about.directions_desc': 'Material va ishlov turini loyihangizga mos tanlang. Mavjud namunalar bilan katalogda tanishing.',
    'about.no_image': 'Rasm hali qo‘shilmagan',
    'about.direction_link': 'mahsulotlari',
    'about.gallery_eyebrow': '05 / GALEREYA',
    'about.gallery_title': 'Mahsulotlarimiz bilan yaqindan tanishing',
    'about.gallery_desc': 'Angola Black va Black Crystal mahsulotlarining taqdim etilgan namunalari. Rasmni kattalashtirib ko‘rish uchun bosing.',
    'about.video_eyebrow': 'VIDEO /',
    'about.video_title': 'Ishlab chiqarish videolarini YouTube kanalimizda kuzatib boring',
    'about.video_ready': 'Kanalda e’lon qilingan videolar bilan tanishing.',
    'about.video_pending': 'Kanal havolasi tasdiqlangach, shu yerdan o‘tishingiz mumkin.',
    'about.video_cta': 'YouTube kanalga o‘tish',
    'about.cta_title': 'Loyihangiz uchun tosh tanlashga tayyormisiz?',
    'about.cta_desc': 'Katalogdagi mahsulotlarni ko‘rib chiqing yoki to‘g‘ridan-to‘g‘ri biz bilan bog‘laning.',
    'about.cta_btn': 'Katalogga o‘tish',

    // Discount Filters
    'filters.toggle': 'Aksiya filtrlari',
    'filters.title': 'FILTRLAR',
    'filters.clear': 'Tozalash',
    'filters.category': 'Kategoriya',
    'filters.discount_type': 'Chegirma turi',
    'filters.type_all': 'Barcha aksiyalar',
    'filters.type_percentage': 'Foizli chegirmalar',
    'filters.type_fixed': 'Summali chegirmalar',
    'filters.sort': 'Saralash',
    'filters.sort_active': 'Amaldagi takliflar',
    'filters.sort_ending': 'Tez orada tugaydiganlar',
    'filters.sort_saving': 'Katta chegirmalar',
    'filters.footnote': 'Summali chegirma har bir birlikdan emas, buyurtmadan bir marta ayriladi. Foiz bo‘yicha taqqoslash bir sotuv birligi uchun hisoblanadi.',

    // Contact
    'contact.eyebrow': 'BOG‘LANISH',
    'contact.title': 'Suhbatdan boshlaymiz.',
    'contact.description': 'Mahsulot, o‘lcham va buyurtma bo‘yicha savollaringizni Telegram orqali yuboring. Loyihangiz haqida yozib qoldiring.',
    'contact.telegram_sub': 'Telegram · yangi oynada ochiladi ↗',
    'contact.back_home': 'Bosh sahifaga',
    'contact.location_val': 'G‘azg‘on sh., Navoiy viloyati',

    // Cart
    'cart.title': 'Savatcha',
    'cart.empty': 'Savatingiz hozircha bo‘sh',
    'cart.empty_desc': 'Mahsulotlar katalogidan o‘zingizga ma’qul tosh va kerama granit namunalarini tanlab savatga qo‘shing.',
    'cart.view_catalog': 'Katalogni ko‘rish',
    'cart.subtotal': 'Oraliq summa',
    'cart.discount': 'Chegirma',
    'cart.total': 'Jami summa',
    'cart.checkout': 'Buyurtmani rasmiylashtirish',
    'cart.confirm': 'Buyurtmani tasdiqlash',
    'cart.close': 'Yopish',
    'cart.back_to_items': 'Savatga qaytish',
    'cart.clear': 'Savatni tozalash',
    'cart.customer_name': 'Ismingiz',
    'cart.customer_phone': 'Telefon raqamingiz',
    'cart.customer_comment': 'Qo‘shimcha izoh (ixtiyoriy)',
    'cart.delivery_option': 'Yetkazib berish kerak',
    'cart.pickup': 'Olib ketish',
    'cart.delivery': 'Dostavka xizmati',
    'cart.my_location': 'Mening lokatsiyam',
    'cart.address_placeholder': 'Manzil yoki karta koordinatasini kiriting',
    'cart.pickup_date': 'Olib ketish sanasi',
    'cart.items_count': 'Mahsulotlar',
    'cart.sending': 'Yuborilmoqda...',
    'cart.telegram_confirm': 'Buyurtmani tasdiqlash (Telegram)',
    'cart.success_title': 'Buyurtmangiz yuborildi!',
    'cart.success_desc': 'Buyurtma matni Telegram orqali menejerimizga jo‘natildi. Savatchangiz muvaffaqiyatli bo‘shatildi.',
    'cart.success_close': 'Tushunarli, yopish',
    'cart.delivery_date': 'Kutilayotgan sana',
    'cart.delivery_address': 'Yetkazib berish manzili',
    'cart.in_stock': 'Mavjud',
    'cart.unit_piece': 'dona',
    'cart.unit_sqm': 'm²',
    'cart.unit_linear': 'm',

    // Time & Countdown & Extra
    'time.days': 'kun',
    'time.hours': 'soat',
    'time.minutes': 'daqiqa',
    'time.seconds': 'soniya',
    'discounts.ends_at': 'Tugash vaqti:',
    'discounts.ended': 'Aksiya yakunlandi',
    'discounts.countdown_label': 'Aksiya tugashiga qolgan vaqt',
    'discounts.banner_label': 'Faol aksiyalar',
    'discounts.banner_title': 'Maxsus chegirmalar',
    'discounts.banner_desc': 'Amaldagi aksiyalar bilan tanishing.',
    'catalog.footnote': 'Narx va aniq o‘lchamlar buyurtma vaqtida kelishiladi. Rasmlar mahsulot ko‘rinishini tanishtirish uchun taqdim etilgan.',
    'catalog.size_unknown': 'O‘lchami aniqlashtiriladi',
    'catalog.search_label': 'Mahsulot qidirish',
    'catalog.clear_search': 'Qidiruvni tozalash',
    'about.services_eyebrow': '04 / XIZMATLARIMIZ',

    // Footer
    'footer.tagline': 'Kerama granit va tabiiy tosh mahsulotlari markazi',
    'footer.hours': 'Ish vaqti: Dushanba – Shanba, 08:00 – 18:00',
    'footer.sections': 'BO‘LIMLAR',
    'footer.contact_title': 'BOG‘LANISH VA LOKATSIYA',
    'footer.label_telegram': 'Telegram',
    'footer.label_phone': 'Telefon',
    'footer.label_instagram': 'Instagram',
    'footer.label_location': 'Lokatsiya / Manzil',
    'footer.rights': 'Barcha huquqlar himoyalangan.',
    'footer.products_sub': 'KERAMA GRANIT & TOSH MAHSULOTLARI',
    'footer.contact_link': 'Bog‘lanish sahifasi',
  },

  oz: {
    // Nav
    'nav.home': 'Бош саҳифа',
    'nav.products': 'Маҳсулотлар',
    'nav.discounts': 'Чегирмалар',
    'nav.about': 'Биз ҳақимизда',
    'nav.contact': 'Боғланиш',
    'nav.order': 'Буюртма бериш',
    'nav.menu': 'Меню',
    'nav.close': 'Ёпиш',
    'nav.start_together': 'ЛОЙИҲАНГИЗНИ БИРГА БОШЛАЙМИЗ',
    'nav.materials_tagline': 'Керама гранит · Тош · Меъморий деталлар',

    // Theme & Lang
    'lang.select': 'Тилни танлаш',
    'theme.toggle': 'Мавзуни алмаштириш',

    // Hero
    'hero.badge': 'ПРЕМИУМ КЕРАМА ГРАНИТ ВА ТОШ МАҲСУЛОТЛАРИ',
    'hero.title_brand': 'НАМУНА',
    'hero.title_rest': 'ТОШ МАРКАЗИ',
    'hero.subtitle': 'Сифат ва нафислик уйғунлиги',
    'hero.description': 'Уйингиз ва лойиҳаларингиз учун замонавий керама гранит, гранит, кафель ҳамда табиий тош маҳсулотлари. Нафис дизайн, пухта ишлов ва дидингизга мос ечимлар.',
    'hero.cta_products': 'Маҳсулотларни кўриш',
    'hero.cta_telegram': 'Телеграм орқали буюртма',
    'hero.trust_1': 'Ҳақиқий маҳсулот расмлари',
    'hero.trust_2': 'Лойиҳангизга мос танлов',
    'hero.stat_1_title': 'Керама гранит',
    'hero.stat_1_desc': 'Ранг ва фактуралар билан танишинг.',
    'hero.stat_2_title': 'Сокл ва зинапоялар',
    'hero.stat_2_desc': 'Маконингизни тўлдирадиган деталлар.',
    'hero.stat_3_title': 'Буюртма асосида ишлов',
    'hero.stat_3_desc': 'Ғоянгиз ва ўлчамларни муҳокама қиламиз.',

    // Home Preview
    'home.preview_eyebrow': 'КЕЙИНГИ ҚАДАМ / МАҲСУЛОТЛАР',
    'home.preview_title_1': 'Ҳар бир маконнинг',
    'home.preview_title_2': 'ўз характери бор.',
    'home.preview_desc': 'Керама гранит, гранит, кафель ва табиий тош маҳсулотлари билан танишинг. Материал ва ишлов ҳақидаги саволларингизни лойиҳангизга мос равишда муҳокама қиламиз.',
    'home.preview_cta': 'Маҳсулотлар бўлимига ўтиш',
    'home.why_eyebrow': 'АФЗАЛЛИКЛАРИМИЗ / ХИЗМАТЛАР',

    // Why Choose Us
    'why.title': 'Нега Намуна Тош Маркази?',
    'why.description': 'Буюртмангизга мос материал, ўлчам ва ишлов бўйича биргаликда қарор қиламиз.',
    'why.service_1_title': 'Керакли ўлчамда кесиш',
    'why.service_1_desc': 'Лойиҳангиз учун кесиш ўлчамларини келишамиз.',
    'why.service_2_title': 'Гранит ва плиталарга ишлов бериш',
    'why.service_2_desc': 'Плиталарни ўлчам бўйича силлиқлаш ва ишлов бериш.',
    'why.service_3_title': 'Тайёр маҳсулотлар ишлаб чиқариш',
    'why.service_3_desc': 'Буюртмага мос ҳолда тайёр тош маҳсулотларини ишлаб чиқариш.',
    'why.service_4_title': 'Маҳсулотларни танлаш бўйича маслаҳат',
    'why.service_4_desc': 'Материал намуналари ва кўринишини биргаликда кўриб чиқамиз.',
    'why.service_5_title': 'Буюртма асосида тайёрлаш',
    'why.service_5_desc': 'Лойиҳангиз талабларини муҳокама қилиб, мос ечимни келишамиз.',

    // Catalog / Products Page
    'catalog.eyebrow': 'МАҲСУЛОТЛАР КАТАЛОГИ',
    'catalog.title': 'Маконингизга мос танлов.',
    'catalog.description': 'Ранг, фактура ва характер. Керама гранит намуналарини кўриб чиқинг ва лойиҳангиз учун танланг.',
    'catalog.sample_count': 'МАҲСУЛОТ НАМУНАСИ',
    'catalog.search_placeholder': 'Номи ёки артикул бўйича қидиринг...',
    'catalog.size_all': 'Барча ўлчамлар',
    'catalog.loading': 'Маҳсулотлар юкланмоқда...',
    'catalog.found_count': 'та маҳсулот топилди',
    'catalog.unpriced_note': 'та маҳсулот нархи сўров асосида',
    'catalog.priced_note': 'та нархи кўрсатилган маҳсулот',
    'catalog.view_detail': 'Батафсил кўриш',
    'catalog.in_cart_badge': 'Буюртмада',
    'catalog.empty_title': 'Маҳсулот топилмади',
    'catalog.empty_desc': 'Қидирув параметрларини ўзгартириб кўринг.',
    'catalog.clear_filters': 'Фильтрларни тозалаш',

    // Product Details
    'product.grade': 'Сорти',
    'product.size': 'Размери (Ўлчамлар)',
    'product.thickness': 'Қалинлиги',
    'product.artikul': 'Артикул',
    'product.stock': 'Омборда мавжудлиги',
    'product.weight': 'Вазни',
    'product.price': 'Нархи',
    'product.order_btn': 'Буюртма бериш',
    'product.in_cart_prefix': 'Саватда',
    'product.in_cart_open': 'Карзинкани очиш',
    'product.back_catalog': 'Каталогга қайтиш',
    'product.back_discounts': 'Акцияларга қайтиш',
    'product.standard_size': 'Стандарт ўлчам',
    'product.to_clarify': 'Аниқлаштирилади',
    'product.in_stock': 'дона мавжуд',
    'product.in_stock_simple': 'Омборда мавжуд',
    'product.gallery_note': 'Ранг, нақш ва пропорциялар асл расмлардан ўзгартирилмаган.',

    // Discounts
    'discounts.eyebrow': 'ЧЕГИРМАЛАР ВА АКЦИЯЛАР',
    'discounts.hero_title': 'МАХСУС ТАКЛИФЛАР',
    'discounts.hero_subtitle': 'Сифатли маҳсулотлар — қулай нархларда',
    'discounts.hero_status': 'та фаол таклиф',
    'discounts.hero_no_active': 'Ҳозирча фаол акция йўқ',
    'discounts.loading': 'Таклифлар юкланмоқда...',
    'discounts.retry': 'Қайта юклаш',
    'discounts.error_title': 'Таклифларни юклаб бўлмади',
    'discounts.error_desc': 'Саҳифани янгилаб қайта уриниб кўринг.',
    'discounts.title': 'Чегирмалар ва маҳсулот акциялари',
    'discounts.desc': 'Фойдали нархдаги танланган керама гранит ва табиий тош маҳсулотлари.',
    'discounts.active_count': 'та фаол таклиф топилди',
    'discounts.footnote': 'Нархлар бир сотув бирлиги учун кўрсатилган. Чегирма буюртманинг умумий суммасига қўлланади.',

    // About
    'about.hero_eyebrow': '01 / БИЗ ҲАҚИМИЗДА',
    'about.hero_title': 'НАМУНА ТОШ МАРКАЗИ',
    'about.hero_subtitle': 'Маҳсулотларимиз ортида — пухта ишлов ва эътибор',
    'about.hero_desc': 'Намуна Тош Маркази керама гранит, гранит, кафель ва турли тош маҳсулотларига пухта ишлов бериш билан шуғулланади.',
    'about.hero_signature': 'МАТЕРИАЛ. ЎЛЧАМ. ИШЛОВ.',
    'about.story_eyebrow': '01 / МАРКАЗИМИЗ',
    'about.story_title': 'Биз ҳақимизда',
    'about.story_note': 'Материалдан тайёр маҳсулотгача.',
    'about.story_p1': 'Намуна Тош Маркази — керама гранит, гранит, кафель ва турли тош маҳсулотларига ишлов беришга ихтисослашган ишлаб чиқариш маркази. Корхонамизда плиталарни керакли ўлчамда кесиш ва тайёр маҳсулот ҳолига келтириш ишлари амалга оширилади.',
    'about.story_p2': 'Мақсадимиз — мижозларга уларнинг лойиҳаларига мос маҳсулот ва ишлов бериш ечимларини тақдим этиш.',
    'about.process_eyebrow': '02 / ЖАРАЁН',
    'about.process_title': 'Маҳсулот қандай тайёрланади?',
    'about.process_desc': 'Умумий ишлов бериш босқичлари. Аниқ ишлар ва уларнинг кетма-кетлиги маҳсулот ҳамда буюртма талабига қараб белгиланади.',
    'about.step_1_title': 'Материални танлаш',
    'about.step_1_desc': 'Лойиҳага мос ранг, нақш ва материал кўриб чиқилади.',
    'about.step_2_title': 'Ўлчамни белгилаш',
    'about.step_2_desc': 'Керакли ўлчамлар ва ишлов талаблари аниқлаштирилади.',
    'about.step_3_title': 'Плитани кесиш',
    'about.step_3_desc': 'Материал келишилган ўлчамга мослаб кесилади.',
    'about.step_4_title': 'Четларига ишлов бериш',
    'about.step_4_desc': 'Маҳсулотнинг вазифасига мос чет ишлови бажарилади.',
    'about.step_5_title': 'Тайёр маҳсулотни текшириш',
    'about.step_5_desc': 'Тайёрланган маҳсулотнинг ўлчами ва ишлови кўриб чиқилади.',
    'about.step_6_title': 'Буюртмага тайёрлаш',
    'about.step_6_desc': 'Буюртма тафсилотлари ва топшириш шартлари аниқлаштирилади.',
    'about.directions_eyebrow': '03 / МАҲСУЛОТЛАР',
    'about.directions_title': 'Маҳсулот йўналишлари',
    'about.directions_desc': 'Материал ва ишлов турини лойиҳангизга мос танланг. Мавжуд намуналар билан каталогда танишинг.',
    'about.no_image': 'Расм ҳали қўшилмаган',
    'about.direction_link': 'маҳсулотлари',
    'about.gallery_eyebrow': '05 / ГАЛЕРЕЯ',
    'about.gallery_title': 'Маҳсулотларимиз билан яқиндан танишинг',
    'about.gallery_desc': 'Angola Black ва Black Crystal маҳсулотларининг тақдим этилган намуналари. Расмни катталаштириб кўриш учун босинг.',
    'about.video_eyebrow': 'VIDEO /',
    'about.video_title': 'Ишлаб чиқариш видеоларини YouTube каналимизда кузатиб боринг',
    'about.video_ready': 'Каналда эълон қилинган видеолар билан танишинг.',
    'about.video_pending': 'Канал ҳаволаси тасдиқлангач, шу ердан ўтишингиз мумкин.',
    'about.video_cta': 'YouTube каналга ўтиш',
    'about.cta_title': 'Лойиҳангиз учун тош танлашга тайёрмисиз?',
    'about.cta_desc': 'Каталогдаги маҳсулотларни кўриб чиқинг ёки тўғридан-тўғри биз билан боғланинг.',
    'about.cta_btn': 'Каталогга ўтиш',

    // Discount Filters
    'filters.toggle': 'Акция фильтрлари',
    'filters.title': 'ФИЛЬТРЛАР',
    'filters.clear': 'Тозалаш',
    'filters.category': 'Категория',
    'filters.discount_type': 'Чегирма тури',
    'filters.type_all': 'Барча акциялар',
    'filters.type_percentage': 'Фоизли чегирмалар',
    'filters.type_fixed': 'Суммали чегирмалар',
    'filters.sort': 'Саралаш',
    'filters.sort_active': 'Амалдаги таклифлар',
    'filters.sort_ending': 'Тез орада тугайдиганлар',
    'filters.sort_saving': 'Катта чегирмалар',
    'filters.footnote': 'Суммали чегирма ҳар бир бирликдан эмас, буюртмадан бир марта айрилади. Фоиз бўйича таққослаш бир сотув бирлиги учун ҳисобланади.',

    // Contact
    'contact.eyebrow': 'БОҒЛАНИШ',
    'contact.title': 'Суҳбатдан бошлаймиз.',
    'contact.description': 'Маҳсулот, ўлчам ва буюртма бўйича саволларингизни Телеграм орқали юборинг. Лойиҳангиз ҳақида ёзиб қолдиринг.',
    'contact.telegram_sub': 'Телеграм · янги ойнада очилади ↗',
    'contact.back_home': 'Бош саҳифага',
    'contact.location_val': 'Ғозғон ш., Навоий вилояти',

    // Cart
    'cart.title': 'Саватча',
    'cart.empty': 'Саватингиз ҳозирча бўш',
    'cart.empty_desc': 'Маҳсулотлар каталогидан ўзингизга маъқул тош ва керама гранит намуналарини танлаб саватга қўшинг.',
    'cart.view_catalog': 'Каталогни кўриш',
    'cart.subtotal': 'Оралиқ сумма',
    'cart.discount': 'Чегирма',
    'cart.total': 'Жами сумма',
    'cart.checkout': 'Буюртмани расмийлаштириш',
    'cart.confirm': 'Буюртмани тасдиқлаш',
    'cart.close': 'Ёпиш',
    'cart.back_to_items': 'Саватга қайтиш',
    'cart.clear': 'Саватни тозалаш',
    'cart.customer_name': 'Исмингиз',
    'cart.customer_phone': 'Телефон рақамингиз',
    'cart.customer_comment': 'Қўшимча изоҳ (ихтиёрий)',
    'cart.delivery_option': 'Етказиб бериш керак',
    'cart.pickup': 'Олиб кетиш',
    'cart.delivery': 'Доставка хизмати',
    'cart.my_location': 'Менинг локациям',
    'cart.address_placeholder': 'Манзил ёки карта координатасини киритинг',
    'cart.pickup_date': 'Олиб кетиш санаси',
    'cart.items_count': 'Маҳсулотлар',
    'cart.sending': 'Юборилмоқда...',
    'cart.telegram_confirm': 'Буюртмани тасдиқлаш (Telegram)',
    'cart.success_title': 'Буюртмангиз юборилди!',
    'cart.success_desc': 'Буюртма матни Telegram орқали менежеримизга жўнатилди. Саватчангиз муваффақиятли бўшатилди.',
    'cart.success_close': 'Тушунарли, ёпиш',
    'cart.delivery_date': 'Кутилаётган сана',
    'cart.delivery_address': 'Етказиб бериш манзили',
    'cart.in_stock': 'Мавжуд',
    'cart.unit_piece': 'дона',
    'cart.unit_sqm': 'м²',
    'cart.unit_linear': 'м',

    // Time & Countdown & Extra
    'time.days': 'кун',
    'time.hours': 'соат',
    'time.minutes': 'дақиқа',
    'time.seconds': 'сония',
    'discounts.ends_at': 'Тугаш вақти:',
    'discounts.ended': 'Акция якунланди',
    'discounts.countdown_label': 'Акция тугашига қолган вақт',
    'discounts.banner_label': 'Фаол акциялар',
    'discounts.banner_title': 'Махсус чегирмалар',
    'discounts.banner_desc': 'Амалдаги акциялар билан танишинг.',
    'catalog.footnote': 'Нарх ва аниқ ўлчамлар буюртма вақтида келишилади. Расмлар маҳсулот кўринишини таништириш учун тақдим этилган.',
    'catalog.size_unknown': 'Ўлчами аниқлаштирилади',
    'catalog.search_label': 'Маҳсулот қидириш',
    'catalog.clear_search': 'Қидирувни тозалаш',
    'about.services_eyebrow': '04 / ХИЗМАТЛАРИМИЗ',

    // Footer
    'footer.tagline': 'Керама гранит ва табиий тош маҳсулотлари маркази',
    'footer.hours': 'Иш вақти: Душанба – Шанба, 08:00 – 18:00',
    'footer.sections': 'БЎЛИМЛАР',
    'footer.contact_title': 'БОҒЛАНИШ ВА ЛОКАЦИЯ',
    'footer.label_telegram': 'Телеграм',
    'footer.label_phone': 'Телефон',
    'footer.label_instagram': 'Инстаграм',
    'footer.label_location': 'Локация / Манзил',
    'footer.rights': 'Барча ҳуқуқлар ҳимояланган.',
    'footer.products_sub': 'КЕРАМА ГРАНИТ & ТОШ МАҲСУЛОТЛАРИ',
    'footer.contact_link': 'Боғланиш саҳифаси',
  },

  ru: {
    // Nav
    'nav.home': 'Главная',
    'nav.products': 'Продукция',
    'nav.discounts': 'Скидки',
    'nav.about': 'О нас',
    'nav.contact': 'Контакты',
    'nav.order': 'Заказать',
    'nav.menu': 'Меню',
    'nav.close': 'Закрыть',
    'nav.start_together': 'НАЧНЕМ ВАШ ПРОЕКТ ВМЕСТЕ',
    'nav.materials_tagline': 'Керамогранит · Камень · Архитектурные детали',

    // Theme & Lang
    'lang.select': 'Выбрать язык',
    'theme.toggle': 'Сменить тему',

    // Hero
    'hero.badge': 'ПРЕМИАЛЬНЫЙ КЕРАМОГРАНИТ И КАМЕННЫЕ ИЗДЕЛИЯ',
    'hero.title_brand': 'NAMUNA',
    'hero.title_rest': 'TOSH MARKAZI',
    'hero.subtitle': 'Гармония качества и элегантности',
    'hero.description': 'Современный керамогранит, гранит, кафель и изделия из натурального камня для вашего дома и проектов. Изысканный дизайн, точная обработка и индивидуальные решения.',
    'hero.cta_products': 'Смотреть продукцию',
    'hero.cta_telegram': 'Заказ через Telegram',
    'hero.trust_1': 'Реальные фотографии товаров',
    'hero.trust_2': 'Подбор под ваш проект',
    'hero.stat_1_title': 'Керамогранит',
    'hero.stat_1_desc': 'Ознакомьтесь с палитрой цветов и фактур.',
    'hero.stat_2_title': 'Цоколь и ступени',
    'hero.stat_2_desc': 'Детали, завершающие ваше пространство.',
    'hero.stat_3_title': 'Обработка под заказ',
    'hero.stat_3_desc': 'Обсудим ваши идеи и точные размеры.',

    // Home Preview
    'home.preview_eyebrow': 'СЛЕДУЮЩИЙ ШАГ / ПРОДУКЦИЯ',
    'home.preview_title_1': 'У каждого пространства',
    'home.preview_title_2': 'свой характер.',
    'home.preview_desc': 'Ознакомьтесь с керамогранитом, гранитом, кафелем и натуральным камнем. Мы поможем подобрать идеальный материал и обработку для вашего проекта.',
    'home.preview_cta': 'Перейти в каталог продукции',
    'home.why_eyebrow': 'НАШИ ПРЕИМУЩЕСТВА / УСЛУГИ',

    // Why Choose Us
    'why.title': 'Почему Namuna Tosh Markazi?',
    'why.description': 'Подбираем материал, размеры и тип обработки индивидуально для каждого клиента.',
    'why.service_1_title': 'Распил по точным размерам',
    'why.service_1_desc': 'Согласуем точные размеры распила под ваш проект.',
    'why.service_2_title': 'Обработка гранита и плит',
    'why.service_2_desc': 'Шлифовка, полировка и подготовка плит любого формата.',
    'why.service_3_title': 'Производство готовых изделий',
    'why.service_3_desc': 'Изготовление готовых изделий из камня под заказ.',
    'why.service_4_title': 'Консультация по выбору материалов',
    'why.service_4_desc': 'Поможем оценить образцы, цвет и текстуру камня.',
    'why.service_5_title': 'Изготовление по индивидуальному заказу',
    'why.service_5_desc': 'Детально обсудим требования и согласуем наилучшее решение.',

    // Catalog / Products Page
    'catalog.eyebrow': 'КАТАЛОГ ПРОДУКЦИИ',
    'catalog.title': 'Идеальный выбор для вашего интерьера.',
    'catalog.description': 'Цвет, фактура и стиль. Ознакомьтесь с образцами керамогранита и выберите лучшее для своего проекта.',
    'catalog.sample_count': 'ОБРАЗЦОВ ТОВАРОВ',
    'catalog.search_placeholder': 'Поиск по названию или артикулу...',
    'catalog.size_all': 'Все размеры',
    'catalog.loading': 'Загрузка товаров...',
    'catalog.found_count': 'товаров найдено',
    'catalog.unpriced_note': 'товаров с ценой по запросу',
    'catalog.priced_note': 'товаров с указанной ценой',
    'catalog.view_detail': 'Подробнее',
    'catalog.in_cart_badge': 'В заказе',
    'catalog.empty_title': 'Товары не найдены',
    'catalog.empty_desc': 'Попробуйте изменить параметры поиска или фильтры.',
    'catalog.clear_filters': 'Очистить фильтры',

    // Product Details
    'product.grade': 'Сорт',
    'product.size': 'Размеры',
    'product.thickness': 'Толщина',
    'product.artikul': 'Артикул',
    'product.stock': 'Наличие на складе',
    'product.weight': 'Вес',
    'product.price': 'Цена',
    'product.order_btn': 'Оформить заказ',
    'product.in_cart_prefix': 'В корзине',
    'product.in_cart_open': 'Открыть корзину',
    'product.back_catalog': 'Вернуться в каталог',
    'product.back_discounts': 'Вернуться к акциям',
    'product.standard_size': 'Стандартный размер',
    'product.to_clarify': 'Уточняется',
    'product.in_stock': 'шт. в наличии',
    'product.in_stock_simple': 'В наличии на складе',
    'product.gallery_note': 'Цвета, узоры и пропорции соответствуют оригинальным фотографиям.',

    // Discounts
    'discounts.eyebrow': 'СКИДКИ И АКЦИИ',
    'discounts.hero_title': 'СПЕЦИАЛЬНЫЕ ПРЕДЛОЖЕНИЯ',
    'discounts.hero_subtitle': 'Качественная продукция — по выгодным ценам',
    'discounts.hero_status': 'активных предложений',
    'discounts.hero_no_active': 'Сейчас нет активных акций',
    'discounts.loading': 'Загрузка предложений...',
    'discounts.retry': 'Повторить',
    'discounts.error_title': 'Не удалось загрузить предложения',
    'discounts.error_desc': 'Обновите страницу и попробуйте снова.',
    'discounts.title': 'Скидки и акции на продукцию',
    'discounts.desc': 'Выгодные цены на избранный керамогранит и натуральный камень.',
    'discounts.active_count': 'активных предложений найдено',
    'discounts.footnote': 'Цены указаны за единицу товара. Скидка применяется к общей сумме заказа.',

    // About
    'about.hero_eyebrow': '01 / О НАС',
    'about.hero_title': 'NAMUNA TOSH MARKAZI',
    'about.hero_subtitle': 'За нашей продукцией — мастерство и безупречное качество',
    'about.hero_desc': 'Namuna Tosh Markazi специализируется на высокоточной обработке керамогранита, гранита, плитки и камня.',
    'about.hero_signature': 'МАТЕРИАЛ. РАЗМЕР. ОБРАБОТКА.',
    'about.story_eyebrow': '01 / НАШ ЦЕНТР',
    'about.story_title': 'О нас',
    'about.story_note': 'От материала до готового изделия.',
    'about.story_p1': 'Namuna Tosh Markazi — производственный центр, специализирующийся на обработке керамогранита, гранита, плитки и натурального камня. Мы осуществляем высокоточный распил слябов по размерам заказчика и создание готовых изделий.',
    'about.story_p2': 'Наша цель — предложить клиентам наилучшие материалы и профессиональные решения по обработке камня под их проекты.',
    'about.process_eyebrow': '02 / ЭТАПЫ ПРОИЗВОДСТВА',
    'about.process_title': 'Как создаются изделия?',
    'about.process_desc': 'Основные этапы обработки. Конкретный перечень операций и их последовательность определяются требованиями каждого заказа.',
    'about.step_1_title': 'Подбор материала',
    'about.step_1_desc': 'Подбираем цвет, рисунок и тип камня под ваш проект.',
    'about.step_2_title': 'Согласование размеров',
    'about.step_2_desc': 'Уточняем точные габариты и требования к обработке.',
    'about.step_3_title': 'Распил слябов',
    'about.step_3_desc': 'Камень распиливается строго по согласованным размерам.',
    'about.step_4_title': 'Обработка торцов и кромок',
    'about.step_4_desc': 'Выполняем фаску, полировку и подготовку кромок.',
    'about.step_5_title': 'Контроль качества',
    'about.step_5_desc': 'Тщательно проверяем геометрию и качество поверхности.',
    'about.step_6_title': 'Подготовка к выдаче',
    'about.step_6_desc': 'Согласуем условия самовывоза или доставки клиенту.',
    'about.directions_eyebrow': '03 / НАПРАВЛЕНИЯ ПРОДУКЦИИ',
    'about.directions_title': 'Направления продукции',
    'about.directions_desc': 'Выберите подходящий тип материала и обработки. С имеющимися образцами можно ознакомиться в каталоге.',
    'about.no_image': 'Изображение пока не добавлено',
    'about.direction_link': 'изделия',
    'about.gallery_eyebrow': '05 / ГАЛЕРЕЯ',
    'about.gallery_title': 'Познакомьтесь с нашей продукцией',
    'about.gallery_desc': 'Образцы камня Angola Black и Black Crystal. Нажмите на фото для полноразмерного просмотра.',
    'about.video_eyebrow': 'ВИДЕО /',
    'about.video_title': 'Смотрите видео о производстве на нашем YouTube-канале',
    'about.video_ready': 'Ознакомьтесь с видеоматериалами на нашем канале.',
    'about.video_pending': 'После подтверждения ссылки на канал вы сможете перейти прямо отсюда.',
    'about.video_cta': 'Перейти на YouTube-канал',
    'about.cta_title': 'Готовы подобрать камень для вашего проекта?',
    'about.cta_desc': 'Ознакомьтесь с каталогом или свяжитесь с нами напрямую для консультации.',
    'about.cta_btn': 'Перейти в каталог',

    // Discount Filters
    'filters.toggle': 'Фильтры акций',
    'filters.title': 'ФИЛЬТРЫ',
    'filters.clear': 'Сбросить',
    'filters.category': 'Категория',
    'filters.discount_type': 'Тип скидки',
    'filters.type_all': 'Все акции',
    'filters.type_percentage': 'Процентные скидки',
    'filters.type_fixed': 'Фиксированные скидки',
    'filters.sort': 'Сортировка',
    'filters.sort_active': 'Действующие предложения',
    'filters.sort_ending': 'Скоро заканчиваются',
    'filters.sort_saving': 'Самые большие скидки',
    'filters.footnote': 'Фиксированная скидка применяется один раз ко всему заказу, а не к каждой единице. Сравнение процентов рассчитывается за единицу товара.',

    // Contact
    'contact.eyebrow': 'КОНТАКТЫ',
    'contact.title': 'Начнем с диалога.',
    'contact.description': 'Отправьте вопросы о материалах, размерах и заказе в Telegram. Расскажите о вашем проекте.',
    'contact.telegram_sub': 'Telegram · откроется в новой вкладке ↗',
    'contact.back_home': 'На главную',
    'contact.location_val': 'г. Газган, Навоийская область',

    // Cart
    'cart.title': 'Корзина',
    'cart.empty': 'Ваша корзина пуста',
    'cart.empty_desc': 'Выберите понравившиеся образцы керамогранита и камня из каталога и добавьте их в корзину.',
    'cart.view_catalog': 'Смотреть каталог',
    'cart.subtotal': 'Промежуточный итог',
    'cart.discount': 'Скидка',
    'cart.total': 'Итого к оплате',
    'cart.checkout': 'Оформить заказ',
    'cart.confirm': 'Подтвердить заказ',
    'cart.close': 'Закрыть',
    'cart.back_to_items': 'Вернуться в корзину',
    'cart.clear': 'Очистить корзину',
    'cart.customer_name': 'Ваше имя',
    'cart.customer_phone': 'Номер телефона',
    'cart.customer_comment': 'Комментарий к заказу (необязательно)',
    'cart.delivery_option': 'Требуется доставка',
    'cart.pickup': 'Самовывоз',
    'cart.delivery': 'Служба доставки',
    'cart.my_location': 'Мое местоположение',
    'cart.address_placeholder': 'Введите адрес или координаты на карте',
    'cart.pickup_date': 'Дата самовывоза',
    'cart.items_count': 'Товары',
    'cart.sending': 'Отправка...',
    'cart.telegram_confirm': 'Подтвердить заказ (Telegram)',
    'cart.success_title': 'Ваш заказ отправлен!',
    'cart.success_desc': 'Текст заказа отправлен нашему менеджеру в Telegram. Ваша корзина очищена.',
    'cart.success_close': 'Понятно, закрыть',
    'cart.delivery_date': 'Желаемая дата',
    'cart.delivery_address': 'Адрес доставки',
    'cart.in_stock': 'В наличии',
    'cart.unit_piece': 'шт.',
    'cart.unit_sqm': 'м²',
    'cart.unit_linear': 'м',

    // Time & Countdown & Extra
    'time.days': 'дн.',
    'time.hours': 'ч.',
    'time.minutes': 'мин.',
    'time.seconds': 'сек.',
    'discounts.ends_at': 'Время окончания:',
    'discounts.ended': 'Акция завершена',
    'discounts.countdown_label': 'Время до окончания акции',
    'discounts.banner_label': 'Активные акции',
    'discounts.banner_title': 'Специальные скидки',
    'discounts.banner_desc': 'Ознакомьтесь с актуальными акционными предложениями.',
    'catalog.footnote': 'Цены и точные размеры согласовываются при заказе. Фотографии представлены для ознакомления со стилем и фактурой.',
    'catalog.size_unknown': 'Размеры уточняются',
    'catalog.search_label': 'Поиск товаров',
    'catalog.clear_search': 'Очистить поиск',
    'about.services_eyebrow': '04 / НАШИ УСЛУГИ',

    // Footer
    'footer.tagline': 'Центр премиального керамогранита и натурального камня',
    'footer.hours': 'Режим работы: Понедельник – Суббота, 08:00 – 18:00',
    'footer.sections': 'РАЗДЕЛЫ',
    'footer.contact_title': 'КОНТАКТЫ И АДРЕС',
    'footer.label_telegram': 'Telegram',
    'footer.label_phone': 'Телефон',
    'footer.label_instagram': 'Instagram',
    'footer.label_location': 'Адрес / Локация',
    'footer.rights': 'Все права защищены.',
    'footer.products_sub': 'КЕРАМОГРАНИТ И ИЗДЕЛИЯ ИЗ КАМНЯ',
    'footer.contact_link': 'Страница контактов',
  },

  en: {
    // Nav
    'nav.home': 'Home',
    'nav.products': 'Products',
    'nav.discounts': 'Discounts',
    'nav.about': 'About Us',
    'nav.contact': 'Contact',
    'nav.order': 'Order Now',
    'nav.menu': 'Menu',
    'nav.close': 'Close',
    'nav.start_together': 'LET’S BUILD YOUR PROJECT TOGETHER',
    'nav.materials_tagline': 'Porcelain Stoneware · Natural Stone · Architectural Details',

    // Theme & Lang
    'lang.select': 'Select Language',
    'theme.toggle': 'Toggle Theme',

    // Hero
    'hero.badge': 'PREMIUM PORCELAIN STONEWARE & STONE PRODUCTS',
    'hero.title_brand': 'NAMUNA',
    'hero.title_rest': 'TOSH MARKAZI',
    'hero.subtitle': 'Harmony of quality and sophistication',
    'hero.description': 'Modern porcelain stoneware, granite, tiles, and natural stone products for your home and projects. Elegant design, precision stonework, and custom solutions.',
    'hero.cta_products': 'Explore Products',
    'hero.cta_telegram': 'Order via Telegram',
    'hero.trust_1': 'Authentic product photos',
    'hero.trust_2': 'Tailored to your project',
    'hero.stat_1_title': 'Porcelain Stoneware',
    'hero.stat_1_desc': 'Discover rich colors and tactile textures.',
    'hero.stat_2_title': 'Plinth & Staircases',
    'hero.stat_2_desc': 'Architectural details that elevate your space.',
    'hero.stat_3_title': 'Custom Stonework',
    'hero.stat_3_desc': 'We discuss your ideas and exact measurements.',

    // Home Preview
    'home.preview_eyebrow': 'NEXT STEP / PRODUCTS',
    'home.preview_title_1': 'Every architectural space',
    'home.preview_title_2': 'has its own character.',
    'home.preview_desc': 'Explore our curated porcelain stoneware, granite, tiles, and natural stones. We consult and craft the best stone solutions tailored to your project.',
    'home.preview_cta': 'Go to Products Catalog',
    'home.why_eyebrow': 'OUR ADVANTAGES / SERVICES',

    // Why Choose Us
    'why.title': 'Why Namuna Tosh Markazi?',
    'why.description': 'We determine the ideal materials, dimensions, and finishes in partnership with you.',
    'why.service_1_title': 'Precision Dimension Cutting',
    'why.service_1_desc': 'We execute custom cuts to your project specifications.',
    'why.service_2_title': 'Granite & Slab Processing',
    'why.service_2_desc': 'Precision grinding, edge beveling, and surface polishing.',
    'why.service_3_title': 'Finished Product Manufacturing',
    'why.service_3_desc': 'Crafting ready-to-install custom stone elements.',
    'why.service_4_title': 'Material Selection Advisory',
    'why.service_4_desc': 'Review physical samples and finishes with our specialists.',
    'why.service_5_title': 'Custom Order Fabrication',
    'why.service_5_desc': 'Detailed consultation to bring unique architectural visions to life.',

    // Catalog / Products Page
    'catalog.eyebrow': 'PRODUCTS CATALOG',
    'catalog.title': 'The refined choice for your space.',
    'catalog.description': 'Color, texture, and character. Explore premium porcelain stoneware samples and select the best fit for your build.',
    'catalog.sample_count': 'PRODUCT SAMPLES',
    'catalog.search_placeholder': 'Search by name or article code...',
    'catalog.size_all': 'All Dimensions',
    'catalog.loading': 'Loading products...',
    'catalog.found_count': 'products found',
    'catalog.unpriced_note': 'products with pricing on inquiry',
    'catalog.priced_note': 'products with listed price',
    'catalog.view_detail': 'View Details',
    'catalog.in_cart_badge': 'In Order',
    'catalog.empty_title': 'No products found',
    'catalog.empty_desc': 'Try adjusting your search criteria or filters.',
    'catalog.clear_filters': 'Reset Filters',

    // Product Details
    'product.grade': 'Grade',
    'product.size': 'Dimensions',
    'product.thickness': 'Thickness',
    'product.artikul': 'SKU / Article',
    'product.stock': 'Stock Availability',
    'product.weight': 'Weight',
    'product.price': 'Price',
    'product.order_btn': 'Order Now',
    'product.in_cart_prefix': 'In Cart',
    'product.in_cart_open': 'Open Cart',
    'product.back_catalog': 'Back to Catalog',
    'product.back_discounts': 'Back to Offers',
    'product.standard_size': 'Standard size',
    'product.to_clarify': 'To be clarified',
    'product.in_stock': 'pcs available',
    'product.in_stock_simple': 'In Stock',
    'product.gallery_note': 'Color, texture, and proportions remain unaltered from original photos.',

    // Discounts
    'discounts.eyebrow': 'DISCOUNTS & PROMOTIONS',
    'discounts.hero_title': 'SPECIAL OFFERS',
    'discounts.hero_subtitle': 'Premium stonework at favorable rates',
    'discounts.hero_status': 'active offers',
    'discounts.hero_no_active': 'No active offers currently',
    'discounts.loading': 'Loading offers...',
    'discounts.retry': 'Retry',
    'discounts.error_title': 'Failed to load offers',
    'discounts.error_desc': 'Please refresh the page and try again.',
    'discounts.title': 'Discounts & Product Promotions',
    'discounts.desc': 'Favorable pricing on selected porcelain stoneware and natural stone items.',
    'discounts.active_count': 'active offers found',
    'discounts.footnote': 'Prices shown per unit. Discount applies to total order amount.',

    // About
    'about.hero_eyebrow': '01 / ABOUT US',
    'about.hero_title': 'NAMUNA TOSH MARKAZI',
    'about.hero_subtitle': 'Behind our products — meticulous stonework and care',
    'about.hero_desc': 'Namuna Tosh Markazi specializes in precision craftsmanship of porcelain stoneware, granite, tiles, and natural stone.',
    'about.hero_signature': 'MATERIAL. DIMENSION. FINISH.',
    'about.story_eyebrow': '01 / OUR CENTER',
    'about.story_title': 'About Us',
    'about.story_note': 'From raw material to finished product.',
    'about.story_p1': 'Namuna Tosh Markazi is a manufacturing workshop specializing in precision processing of porcelain stoneware, granite, tiles, and natural stone. We cut slabs to exact specifications and craft turn-key stone products.',
    'about.story_p2': 'Our mission is to provide clients with optimal stone materials and precision stonework solutions tailored to their architectural projects.',
    'about.process_eyebrow': '02 / PRODUCTION PHASES',
    'about.process_title': 'How products are crafted?',
    'about.process_desc': 'General manufacturing stages. Precise tasks and steps are determined based on product and individual project requirements.',
    'about.step_1_title': 'Material Selection',
    'about.step_1_desc': 'Colors, patterns, and materials suited to the project are evaluated.',
    'about.step_2_title': 'Dimension Sizing',
    'about.step_2_desc': 'Exact dimensions and processing specifications are determined.',
    'about.step_3_title': 'Slab Cutting',
    'about.step_3_desc': 'Material is precisely cut to agreed dimensions.',
    'about.step_4_title': 'Edge Processing',
    'about.step_4_desc': 'Custom edge profiling, beveling, and polishing are performed.',
    'about.step_5_title': 'Quality Inspection',
    'about.step_5_desc': 'Dimensions, surface finish, and tolerances are inspected.',
    'about.step_6_title': 'Order Preparation',
    'about.step_6_desc': 'Order details, packaging, and dispatch conditions are finalized.',
    'about.directions_eyebrow': '03 / STONE CATEGORIES',
    'about.directions_title': 'Stone Categories',
    'about.directions_desc': 'Select the optimal stone material and finishing for your project. Explore available physical samples in our catalog.',
    'about.no_image': 'Image coming soon',
    'about.direction_link': 'products',
    'about.gallery_eyebrow': '05 / GALLERY',
    'about.gallery_title': 'Discover our craftsmanship',
    'about.gallery_desc': 'Featured samples of Angola Black and Black Crystal. Click on any photo to enlarge.',
    'about.video_eyebrow': 'VIDEO /',
    'about.video_title': 'Watch production videos on our YouTube channel',
    'about.video_ready': 'Explore production footage on our YouTube channel.',
    'about.video_pending': 'You will be able to visit our verified channel directly from here.',
    'about.video_cta': 'Visit YouTube Channel',
    'about.cta_title': 'Ready to choose the ideal stone for your project?',
    'about.cta_desc': 'Explore our catalog items or contact our workshop team directly.',
    'about.cta_btn': 'Explore Catalog',

    // Discount Filters
    'filters.toggle': 'Promotion Filters',
    'filters.title': 'FILTERS',
    'filters.clear': 'Reset',
    'filters.category': 'Category',
    'filters.discount_type': 'Discount Type',
    'filters.type_all': 'All Promotions',
    'filters.type_percentage': 'Percentage Discounts',
    'filters.type_fixed': 'Fixed Discounts',
    'filters.sort': 'Sort by',
    'filters.sort_active': 'Active Offers',
    'filters.sort_ending': 'Ending Soon',
    'filters.sort_saving': 'Largest Discounts',
    'filters.footnote': 'Fixed discounts apply once per entire order rather than per unit. Percentage comparisons are computed per sales unit.',

    // Contact
    'contact.eyebrow': 'CONTACT',
    'contact.title': 'Let’s start a conversation.',
    'contact.description': 'Inquire about materials, dimensions, and custom orders via Telegram. Share details about your project.',
    'contact.telegram_sub': 'Telegram · opens in new window ↗',
    'contact.back_home': 'Back to Home',
    'contact.location_val': 'Gazgan city, Navoiy region',

    // Cart
    'cart.title': 'Order Cart',
    'cart.empty': 'Your cart is currently empty',
    'cart.empty_desc': 'Select your preferred stone and porcelain stoneware samples from our catalog to get started.',
    'cart.view_catalog': 'View Catalog',
    'cart.subtotal': 'Subtotal',
    'cart.discount': 'Discount',
    'cart.total': 'Total Due',
    'cart.checkout': 'Proceed to Checkout',
    'cart.confirm': 'Confirm Order',
    'cart.close': 'Close',
    'cart.back_to_items': 'Back to Cart',
    'cart.clear': 'Clear Cart',
    'cart.customer_name': 'Your Name',
    'cart.customer_phone': 'Phone Number',
    'cart.customer_comment': 'Additional Note (optional)',
    'cart.delivery_option': 'Delivery required',
    'cart.pickup': 'Pickup in person',
    'cart.delivery': 'Delivery service',
    'cart.my_location': 'My location',
    'cart.address_placeholder': 'Enter delivery address or coordinates',
    'cart.pickup_date': 'Pickup date',
    'cart.items_count': 'Items',
    'cart.sending': 'Sending...',
    'cart.telegram_confirm': 'Confirm Order (Telegram)',
    'cart.success_title': 'Your order has been submitted!',
    'cart.success_desc': 'Order details have been forwarded to our manager on Telegram. Your cart is now empty.',
    'cart.success_close': 'Understood, close',
    'cart.delivery_date': 'Preferred Date',
    'cart.delivery_address': 'Delivery Address',
    'cart.in_stock': 'In Stock',
    'cart.unit_piece': 'pcs',
    'cart.unit_sqm': 'm²',
    'cart.unit_linear': 'm',

    // Time & Countdown & Extra
    'time.days': 'days',
    'time.hours': 'hrs',
    'time.minutes': 'min',
    'time.seconds': 'sec',
    'discounts.ends_at': 'Ends at:',
    'discounts.ended': 'Offer ended',
    'discounts.countdown_label': 'Time remaining until offer ends',
    'discounts.banner_label': 'Active Offers',
    'discounts.banner_title': 'Special Promotions',
    'discounts.banner_desc': 'Explore our ongoing promotional deals.',
    'catalog.footnote': 'Pricing and exact dimensions are finalized at order placement. Photos are provided for aesthetic and texture presentation.',
    'catalog.size_unknown': 'Custom / Dimension upon inquiry',
    'catalog.search_label': 'Search products',
    'catalog.clear_search': 'Clear search',
    'about.services_eyebrow': '04 / OUR SERVICES',

    // Footer
    'footer.tagline': 'Center of premium porcelain stoneware and natural stone products',
    'footer.hours': 'Working Hours: Monday – Saturday, 08:00 – 18:00',
    'footer.sections': 'SECTIONS',
    'footer.contact_title': 'CONTACT & LOCATION',
    'footer.label_telegram': 'Telegram',
    'footer.label_phone': 'Phone',
    'footer.label_instagram': 'Instagram',
    'footer.label_location': 'Location / Address',
    'footer.rights': 'All rights reserved.',
    'footer.products_sub': 'PORCELAIN STONEWARE & STONE PRODUCTS',
    'footer.contact_link': 'Contact Page',
  },
};

/**
 * Category names translations dictionary
 */
export const categoryTranslations = {
  all: {
    uz: 'Barcha mahsulotlar',
    oz: 'Барча маҳсулотлар',
    ru: 'Вся продукция',
    en: 'All Products',
  },
  'kerama-granit': {
    uz: 'Kerama granit',
    oz: 'Керама гранит',
    ru: 'Керамогранит',
    en: 'Porcelain Stoneware',
  },
  keramogranit: {
    uz: 'Keramogranit',
    oz: 'Керамогранит',
    ru: 'Керамогранит',
    en: 'Porcelain Stoneware',
  },
  granit: {
    uz: 'Granit',
    oz: 'Гранит',
    ru: 'Гранит',
    en: 'Granite',
  },
  marmar: {
    uz: 'Marmar',
    oz: 'Мармар',
    ru: 'Мрамор',
    en: 'Marble',
  },
  xizmatlar: {
    uz: 'Xizmatlar',
    oz: 'Хизматлар',
    ru: 'Услуги',
    en: 'Services',
  },
  kafel: {
    uz: 'Kafel',
    oz: 'Кафель',
    ru: 'Кафель / Плитка',
    en: 'Tiles',
  },
  'tayyor-mahsulot': {
    uz: 'Tayyor mahsulot',
    oz: 'Тайёр маҳсулот',
    ru: 'Готовая продукция',
    en: 'Finished Products',
  },
  qoshimcha: {
    uz: 'Qo‘shimcha',
    oz: 'Қўшимча',
    ru: 'Дополнительно',
    en: 'Accessories',
  },
  xomashyo: {
    uz: 'Xomashyo',
    oz: 'Хомашё',
    ru: 'Сырье',
    en: 'Raw Materials',
  },
  sokl: {
    uz: 'Sokl',
    oz: 'Сокл',
    ru: 'Цоколь',
    en: 'Plinth / Baseboard',
  },
  zinapoyalar: {
    uz: 'Zinapoyalar',
    oz: 'Зинапоялар',
    ru: 'Ступени и лестницы',
    en: 'Steps & Stairs',
  },
  'pol-plitalari': {
    uz: 'Pol uchun plitalar',
    oz: 'Пол учун плиталар',
    ru: 'Напольные плиты',
    en: 'Floor Slabs',
  },
  buyurtma: {
    uz: 'Buyurtma asosida',
    oz: 'Буюртма асосида',
    ru: 'Под заказ',
    en: 'Custom Order',
  },
};

export function getLocalizedCategoryName(categoryId, lang = 'uz') {
  if (!categoryId) return '';
  const item = categoryTranslations[categoryId];
  if (item && item[lang]) return item[lang];
  if (item && item.uz) return item.uz;
  if (lang === 'oz') return latinToCyrillic(categoryId);
  return categoryId;
}

/**
 * Latin to Cyrillic Uzbek transliteration function.
 */
export function latinToCyrillic(text) {
  if (!text || typeof text !== 'string') return text;

  const map = [
    [/Sh/g, 'Ш'], [/sh/g, 'ш'],
    [/Ch/g, 'Ч'], [/ch/g, 'ч'],
    [/Yo/g, 'Ё'], [/yo/g, 'ё'],
    [/Yu/g, 'Ю'], [/yu/g, 'ю'],
    [/Ya/g, 'Я'], [/ya/g, 'я'],
    [/Ye/g, 'Е'], [/ye/g, 'е'],
    [/O‘/g, 'Ў'], [/O'/g, 'Ў'], [/o‘/g, 'ў'], [/o'/g, 'ў'], [/o`/g, 'ў'],
    [/G‘/g, 'Ғ'], [/G'/g, 'Ғ'], [/g‘/g, 'ғ'], [/g'/g, 'ғ'], [/g`/g, 'ғ'],
    [/A/g, 'А'], [/a/g, 'а'],
    [/B/g, 'Б'], [/b/g, 'б'],
    [/D/g, 'Д'], [/d/g, 'д'],
    [/E/g, 'Э'], [/e/g, 'е'],
    [/F/g, 'Ф'], [/f/g, 'ф'],
    [/G/g, 'Г'], [/g/g, 'г'],
    [/H/g, 'Ҳ'], [/h/g, 'ҳ'],
    [/I/g, 'И'], [/i/g, 'и'],
    [/J/g, 'Ж'], [/j/g, 'ж'],
    [/K/g, 'К'], [/k/g, 'к'],
    [/L/g, 'Л'], [/l/g, 'л'],
    [/M/g, 'М'], [/m/g, 'м'],
    [/N/g, 'Н'], [/n/g, 'н'],
    [/O/g, 'О'], [/o/g, 'о'],
    [/P/g, 'П'], [/p/g, 'п'],
    [/Q/g, 'Қ'], [/q/g, 'қ'],
    [/R/g, 'Р'], [/r/g, 'р'],
    [/S/g, 'С'], [/s/g, 'с'],
    [/T/g, 'Т'], [/t/g, 'т'],
    [/U/g, 'У'], [/u/g, 'у'],
    [/V/g, 'В'], [/v/g, 'в'],
    [/X/g, 'Х'], [/x/g, 'х'],
    [/Y/g, 'Й'], [/y/g, 'й'],
    [/Z/g, 'З'], [/z/g, 'з'],
    [/'/g, 'ъ'], [/‘/g, 'ъ'], [/`/g, 'ъ'],
  ];

  let result = text;
  for (const [pattern, repl] of map) {
    result = result.replace(pattern, repl);
  }
  return result;
}

/**
 * Product translation helper.
 * Provides translated names and descriptions for known stone products,
 * with graceful Cyrillic transliteration for 'oz' and fallback for 'uz'.
 */
const productTranslationsMap = {
  'oq-marmar': {
    ru: { name: 'Белый мрамор', desc: 'Элегантный белый мрамор с мягкими естественными прожилками для изысканных интерьеров.' },
    en: { name: 'White Marble', desc: 'Elegant white marble with subtle natural veining for sophisticated architectural spaces.' },
  },
  'qizil-granit': {
    ru: { name: 'Красный гранит', desc: 'Высокопрочный красный гранит для фасадов, ступеней и долговечных покрытий.' },
    en: { name: 'Red Granite', desc: 'High-durability red granite suitable for facades, stairways, and resilient paving.' },
  },
  'angola-black': {
    ru: { name: 'Angola Black', desc: 'Глубокий черный гранит с кристаллическим блеском для премиальных решений.' },
    en: { name: 'Angola Black', desc: 'Deep black granite with crystalline glimmer for premium architectural projects.' },
  },
  'black-crystal': {
    ru: { name: 'Black Crystal', desc: 'Премиальный черный камень с мерцающими кристаллами для облицовки и декора.' },
    en: { name: 'Black Crystal', desc: 'Premium black stone with sparkling crystal flecks for cladding and interior decor.' },
  },
};

export function getTranslatedProduct(product, lang = 'uz') {
  if (!product) return product;
  if (lang === 'uz') return product;

  const localized = product.translations?.[lang];
  if (localized) {
    return { ...product, name: localized.name || product.name, description: localized.description || product.description };
  }

  if (lang === 'oz') {
    return {
      ...product,
      name: latinToCyrillic(product.name),
      description: latinToCyrillic(product.description),
    };
  }

  const slug = product.slug || product.id;
  const mapped = productTranslationsMap[slug];
  // Imported catalog descriptions follow this template. Translate the wording
  // while preserving the original names, grades, dimensions and stock values.
  if (['ru', 'en'].includes(lang) && /toifasidagi yuqori sifatli mahsulot\./.test(product.description || '')) {
    const category = getLocalizedCategoryName(product.category, lang);
    const description = product.description
      .replace(/(?:Kerama granit|Granit|Kafel|Tayyor mahsulot|Qo‘shimcha|Xomashyo) toifasidagi yuqori sifatli mahsulot\./g,
        lang === 'ru' ? `Высококачественный товар категории «${category}».` : `A high-quality product in the ${category} category.`)
      .replace(/\bsort\s*/g, lang === 'ru' ? 'сорт ' : 'grade ')
      .replace(/O‘lchami:/g, lang === 'ru' ? 'Размер:' : 'Dimensions:')
      .replace(/Omborda mavjud:/g, lang === 'ru' ? 'В наличии:' : 'In stock:')
      .replace(/\bsm\b/g, lang === 'ru' ? 'см' : 'cm')
      .replace(/\bdona\b/g, lang === 'ru' ? 'шт.' : 'pcs');
    return { ...product, name: mapped?.[lang]?.name || product.name, description };
  }
  if (mapped && mapped[lang]) {
    return {
      ...product,
      name: mapped[lang].name || product.name,
      description: mapped[lang].desc || product.description,
    };
  }

  return product;
}

for (const [key, values] of Object.entries(uiTranslations)) {
  for (const lang of ['uz', 'oz', 'ru', 'en']) {
    translations[lang][key] ??= lang === 'oz' ? latinToCyrillic(values.uz) : values[lang];
  }
}

for (const language of Object.keys(brandNames)) {
  const brand = getBrand(language);
  // Existing sentences use the same localized company name as the headings.
  for (const [key, value] of Object.entries(translations[language])) {
    translations[language][key] = value
      .replace(/Namuna Tosh Markazi|Намуна Тош Маркази/g, brand.name)
      .replace(/NAMUNA TOSH MARKAZI|НАМУНА ТОШ МАРКАЗИ/g, brand.title);
  }
  Object.assign(translations[language], {
    'brand.name': brand.name,
    'brand.title': brand.title,
    'brand.short': brand.short,
    'brand.descriptor': brand.descriptor,
    'hero.title_brand': brand.short,
    'hero.title_rest': brand.descriptor,
    'about.hero_title': brand.title,
  });
}
