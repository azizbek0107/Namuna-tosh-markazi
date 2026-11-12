# Namuna Tosh Markazi

React + Vite asosidagi Black & Gold reklama sayti. Navbar, routing, kunduzgi/tungi rejim, haqiqiy rasmlar bilan carousel va mahsulotlar katalogi mavjud. Katalog lokal ma’lumotlar bilan ishlaydi; admin orqali boshqarish va backend keyingi bosqichda ulanadi.

## Ishga tushirish

```sh
npm install
npm run dev
```

PowerShell bajarish siyosati `npm.ps1`ni cheklasa, `npm.cmd run dev`dan foydalaning. Terminal chiqargan Local havolani oching.

```sh
npm run build
npm run preview
npm test
```

## Buyurtma kalkulyatori

`/products/:slug` sahifasida o‘lcham, dona yoki bevosita m²/pogon metr miqdori, yakuniy hisob va mijoz formasi mavjud. To‘liq fayllar ro‘yxati va tekshiruv natijalari: [output/calculator-report.md](output/calculator-report.md).

Mahsulotning `orderConfig.quantityModes` maydoni `direct` va/yoki `pieces` usullarini ruxsat etadi; `defaultQuantityMode` dastlabki tanlovni belgilaydi. Dona sonidan m² hisoblash uchun variantda `lengthCm` va `widthCm` kerak. Pogon metr uchun `orderConfig.linearLengthField` aniq o‘lcham maydonini belgilaydi: odatda `lengthCm`, zarur bo‘lsa `widthCm`. Yetishmayotgan o‘lchamlar avtomatik yaratilmaydi.

Chegirma umumiy summaga bir marta qo‘llanadi. Formadagi ism/telefon faqat sahifa xotirasida turadi; buyurtma matni ko‘rsatiladi va foydalanuvchi uni o‘zi Telegramga joylashtiradi. Serverga yuborish yoki backend yo‘q.

## Chegirmalar va aksiyalar

`/discounts` faqat ko‘rinadigan, narxi ma’lum va ayni vaqtda amaldagi chegirmasi bor mahsulotlarni ko‘rsatadi. Hozirgi haqiqiy mahsulotlarda tasdiqlangan narx/aksiya yo‘q: bo‘sh holat ko‘rsatiladi, bosh sahifadagi `DiscountBanner` yashirin turadi. Demo narxlar faqat `tests/fixtures/discountProducts.mjs` ichida.

Mahalliy model saqlangan: `discountType` (`percentage` yoki `fixed`), `discountValue`, `discountStartsAt`, `discountEndsAt`, `discountIsActive`. Joriy mahsulotlarda `discountIsActive: false`. Eski yozuvlarda bu maydon bo‘lmasa, oldingi xatti-harakat saqlanadi; yangi ma’lumotlarda uni aniq belgilang. Kelajakdagi API `discount: { type, value, startDate, endDate, isActive }` shaklida kelsa, `getDiscountConfig` uni shu umumiy hisobga moslashtiradi; har bir mahsulotda faqat bitta shakldan foydalaning. Nested `discount` mavjud bo‘lsa u ustun keladi, `isActive: true` talab qilinadi.

Yagona chegirma funksiyasi `priceUtils.applyOrderDiscount`: katalog narxi, aksiyalar kartasi, kalkulyator va Telegram hisoblari undan foydalanadi. Kartadagi chegirmali narx bitta sotuv birligidagi buyurtma misolidir. Summali chegirma ko‘p birlikli buyurtmada bir marta ayriladi; bu farq kartada tushuntiriladi. Eng katta chegirma saralashi shu bir birlik uchun samarali foizni taqqoslaydi.

Sana-only qiymatlar (`2026-11-02`) Toshkent kunining boshidan oxirigacha talqin qilinadi. Vaqtli qiymatlarni `2026-11-02T18:00:00+05:00` yoki `Z` bilan saqlash tavsiya etiladi. Vaqt zonasi yo‘q vaqtli qiymat ham Toshkent vaqti sifatida olinadi. Tugash oni inklyuziv, undan keyin chegirma o‘chadi. Sanasiz chegirma ochiq muddatli, tugash sanasi bo‘lmasa countdown yo‘q. Hisob mijoz qurilmasi vaqtiga bog‘liq; server vaqti keyingi bosqichda ulanadi.

Fayllar va tekshiruvlar: [output/discounts-report.md](output/discounts-report.md).

## Biz haqimizda

`/about` sahifasida korxona haqida matn, umumiy ishlab chiqarish bosqichlari, beshta mahsulot yo‘nalishi, xizmatlar, mahsulot foto galereyasi va CTA bor. Matnlar va rasmlar manbasi `src/data/aboutData.js`; kompaniya tarixi/ishlab chiqarish quvvati haqidagi tasdiqlanmagan raqamlar kiritilmagan. Galereya mavjud mahsulot rasmlaridan olinadi. Rasmi yo‘q yo‘nalishlarda neytral placeholder ko‘rsatiladi.

Galereya modali: Escape/yopish tugmasi/tashqi fon bilan yopish, oldingi/keyingi, ←/→/Home/End, fokus sikli va qaytarish, fonni inert qilish va body scrollni tiklash. Sahifa SEO title/description qiymatlarini routing boshqaradi; boshqa sahifaga o‘tganda description tiklanadi.

YouTube uchun `aboutVideo.channelName` berilgan, lekin `channelUrl: null`, `isVerified: false`. Haqiqiy kanal manzili tasdiqlangach `https://www.youtube.com/...` URL va `isVerified: true` yoziladi. Tasdiqlanmaguncha tugma o‘chiq; taxminiy iframe yoki video ID yo‘q. Sexning haqiqiy fotolari uchun `src/assets/images/about/` tayyor, hozir u yerga boshqa turdagi surat qo‘shilmagan.

Fayllar va testlar: [output/about-report.md](output/about-report.md).

## Fayllar

```text
src/
  assets/
    images/.gitkeep
    icons/.gitkeep
  components/
    Navbar/
      Navbar.jsx
      Navbar.css
      MobileMenu.jsx
      NavItem.jsx
      navigation.js
    Footer/
      Footer.jsx
      Footer.css
    AnimatedOutlet.jsx
    Brand.jsx
    OrderButton.jsx
    PagePlaceholder.jsx
    ScrollToTop.jsx
  pages/
    Home/Home.jsx + Home.css
    Products/Products.jsx + Products.css
    Discounts/Discounts.jsx + Discounts.css
    About/About.jsx + About.css
    Contact/Contact.jsx + Contact.css
    Admin/Admin.jsx + Admin.css
    NotFound/NotFound.jsx
  layouts/
    MainLayout.jsx
    AdminLayout.jsx
  routes/AppRoutes.jsx
  styles/
    variables.css
    global.css
  legacy/
    PreviousSite.jsx
    style.css
  App.jsx
  main.jsx

tests/navigation.test.mjs
vite.config.js
index.html
package.json
package-lock.json
```

`src/legacy/` avvalgi sahifaning o‘zgartirilmagan nusxasini saqlaydi; u yangi ilovaga import qilinmaydi. Avvalgi `src/style.css` ham saqlandi.

## Arxitektura

- React Router DOM: `/`, `/products`, `/discounts`, `/about`, `/contact`, `/admin` va 404 fallback. Umumiy Navbar marshrut almashganda qayta o‘rnatilmaydi.
- MainLayout: mijozlar navigatsiyasi, main, Footer. AdminLayout: alohida boshlang‘ich admin sahifasi. Admin mijozlar menyusida ko‘rsatilmaydi.
- Motion for React: bir xil `layoutId` bilan aktiv indikator, fade + slide sahifa o‘tishlari va mobil panel. `MotionConfig reducedMotion="user"` hamda CSS orqali tizimning reduced-motion sozlamasiga rioya qilinadi.
- Mobil menyu: 1100px dan kichik ekranlar; X, Escape, backdrop va havola orqali yopiladi; body scroll bloklanadi; fon inert qilinadi; Tab/Shift+Tab panel ichida aylanadi; yopilganda fokus tiklanadi. Desktopga o‘tilganda ochiq menyu yopiladi.
- Tailwind CSS Vite plagini va alohida komponent CSS fayllari. Umumiy sozlamalar `variables.css`, rejim ranglari `themes.css` ichida.
- Lucide React: SVG ikonkalari. Hero carousel foydalanuvchi taqdim etgan mahsulot rasmlaridan foydalanadi.
- Telegram manzili bir joyda: `src/components/Navbar/navigation.js`.
- Admin placeholder ochiq sahifa. Server autentifikatsiyasi yo‘q, maxfiy ma’lumot yoki admin amali yo‘q. Himoya keyingi bosqichda serverda qo‘shilishi kerak.

## Tekshiruvlar

`npm test` haqiqiy React komponentlarini jsdom orqali tekshiradi: mijozlar marshrutlari, aktiv holat, Navbar saqlanishi, Telegram havolasi, sahifa sarlavhasi, scroll reset, sticky holati, mobil panel, fokus sikli va tiklanishi, Escape/X/havola bilan yopish, desktopga o‘tish, adminning alohida layouti, 404 va runtime console xatolari/ogohlantirishlari.

Bu DOM integratsiya testi; haqiqiy brauzerdagi responsive maket, animatsiya ko‘rinishi va vizual QA o‘rnini bosmaydi.

## Qo‘llanmalar

- Tailwind Vite integratsiyasi: https://tailwindcss.com/docs/installation/using-vite
- Motion shared layout: https://motion.dev/docs/react-layout-animations
- Motion sahifa o‘tishlari: https://motion.dev/docs/react-animate-presence

Keyingi bosqich: tasdiqlangan narx va o‘lchamlarni kiritish, backend integratsiyasi va server autentifikatsiyasi.

## Kunduzgi/tungi rejim va mahsulot carousel

- Theme: `src/context/ThemeContext.jsx`, `src/hooks/useTheme.js`, `src/components/ThemeToggle/ThemeToggle.jsx` va `.css`, `src/styles/themes.css`.
- Birinchi kirishda tizim rejimi olinadi. Qo‘lda tanlangan rejim `namuna-theme` kaliti bilan localStorage’da saqlanadi va ustun turadi. Tizim o‘zgarishlari (qo‘lda tanlov bo‘lmasa) va boshqa tabdagi tanlov ham kuzatiladi. Storage bloklansa, rejim shu sessiyada ishlashda davom etadi.
- `public/theme-init.js` sahifa chizilishidan oldin rejimni o‘rnatadi. Ranglar 300 ms, toggle belgisi 250 ms davomida o‘zgaradi. Reduced-motion sozlamasi hurmat qilinadi.
- Carousel: `src/components/ProductCarousel/ProductCarousel.jsx`, `ProductSlide.jsx`, `ProductCarousel.css`; mahsulotlar: `src/data/heroProducts.js`.
- Carousel 5 soniyada almashadi. Hover, klaviatura fokusi va yashirin brauzer tabida pauza qiladi. Fokusdan keyin Play tugmasi orqali qayta boshlanadi. Pauza, oldingi/keyingi, indikatorlar, ArrowLeft/ArrowRight, Home/End va gorizontal swipe mavjud. Reduced-motion yoqilganda avtomatik almashish o‘chadi.
- Rasmlar `object-fit: contain` bilan to‘liq ko‘rsatiladi, kesilmaydi yoki filtrlanmaydi. Rang, nisbat va rasm fayli o‘zgartirilmagan. Texnik xususiyatlar yoki narxlar qo‘shilmagan.
- Asl fayllar xaritasi: `angola black5.jpg` → `src/assets/images/products/angola-black-1.jpg`; `angola black4.jpg` → `angola-black-2.jpg`; `bleack kristal.jpg` → `black-crystal.jpg`; `photo_2026-10-26_09-06-29.jpg` → `src/assets/images/namuna-logo.jpg`.
- Berilgan NTJ logotipi Navbar, mobil menyu va Footer’da ishlatiladi.

Tekshiruv: theme tanlovi va remountda saqlanishi, tizim rejimi, birinchi chizilishdagi theme va storage bloklanishi, carousel taymeri/hover/pauza/tugma/klaviatura/swipe, mavjud routing va mobil menyu testlari. Asl va ko‘chirilgan to‘rtta rasmning SHA-256 hashlari tengligi tekshirildi. Brauzer ulanishi mavjud emasligi uchun haqiqiy telefon ekrani va vizual animatsiya QA bajarilmadi.

Yangi yoki o‘zgargan fayllar: yuqoridagilardan tashqari `App.jsx`, `main.jsx`, `Brand.jsx`, `Navbar.jsx`, `Navbar.css`, `Footer.css`, `MainLayout.jsx`, `Home.jsx`, `Home.css`, global va mavjud sahifalar rang uslublari, `index.html`, `tests/navigation.test.mjs`, `tests/theme-bootstrap.test.mjs`. Backend va yangi admin funksiyalari qo‘shilmadi.

Carousel accessibility qo‘llanmasi: https://www.w3.org/WAI/ARIA/apg/patterns/carousel/
Theme qo‘llanmasi: https://developer.chrome.com/docs/modern-web-guidance/guides/ui-components/dark-mode-toggle

## Hero bosqichi

Yaratilgan fayllar:

- `src/components/Hero/Hero.jsx`, `Hero.css`, `HeroContent.jsx`, `HeroVisual.jsx`, `HeroActions.jsx`, `heroMotion.js`.
- `src/components/HeroStats/HeroStats.jsx`, `HeroStats.css`.
- `src/components/ScrollIndicator/ScrollIndicator.jsx`, `ScrollIndicator.css`.
- `src/data/heroData.js`; kelajakdagi rasmlar uchun `src/assets/images/hero/.gitkeep`.

O‘zgartirilgan fayllar: `src/pages/Home/Home.jsx`, `Home.css`, `src/data/heroProducts.js`, `src/components/ProductCarousel/ProductCarousel.jsx`, `ProductSlide.jsx`, `tests/navigation.test.mjs` va ushbu README.

Yangi kutubxona o‘rnatilmadi. Mavjud Motion for React, Lucide, React Router va theme tizimi ishlatiladi. Navbar, boshqa sahifalar va routing o‘zgartirilmadi.

Hero chapida belgilangan o‘zbekcha badge, bitta gradient H1, ikkinchi sarlavha, tavsif va ikkita CTA bor. CTA mahsulotlar sahifasiga va Telegram akkauntiga olib boradi. O‘ngdagi HeroVisual avvalgi carouselni saqlaydi, Black Crystal rasmini birinchi namoyish qiladi. Asl rasmlar qayta ishlanmaydi, `contain` bilan to‘liq ko‘rsatiladi. Rasm o‘lchamlari ma’lumotlarda saqlanadi; birinchi rasm eager/high-priority bilan yuklanadi.

Content stagger/fade/translate animatsiyalari 0.6 soniya, visual kirishi 0.75 soniya. Parallax 4px gorizontal va 3px vertikal bilan cheklangan; faqat sichqonchali ekranlarda ishlaydi. Motion values/springs React’ni har bir pointer siljishida qayta render qilmaydi. Floating/zoom juda yengil; visual ekrandan chiqqanda floating to‘xtaydi. Reduced-motion yoqilganda ushbu harakatlar o‘chadi.

HeroStats uchta haqiqiy yo‘nalishni ko‘rsatadi; tajriba yoki mijoz soniga oid raqamlar yo‘q. ScrollIndicator haqiqiy `mahsulotlar-preview` bo‘limiga scroll qiladi va fokusni o‘tkazadi. Mobile 320–767px da bitta ustun, tablet 768–1023px va desktop 1024px dan boshlab ikki ustun ishlaydi. Qisqa ekranlarda mazmun kesilmasdan tabiiy davom etadi.

Test: bitta H1 va berilgan matnlar, birinchi Black Crystal rasmi, image loading attributlari, CTA orqali `/products`ga haqiqiy navigatsiya, Telegram manzili/target/rel, HeroStats va scroll/fokus; theme, carousel va Navbarning oldingi testlari saqlangan. Brauzer ulanmagani sabab haqiqiy responsive maket va parallax vizual tekshiruvi bajarilmadi.

Motion qo‘llanmasi: https://motion.dev/docs/react-use-spring va https://motion.dev/docs/react-motion-value
