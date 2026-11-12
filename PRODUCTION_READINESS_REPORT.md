# NAMUNA TOSH MARKAZI
## BOSQICH 12 — YAKUNIY ISHLAB CHIQARISH TAYYORLIGI VA XAVFSIZLIK HISOBOTI (PRODUCTION READINESS REPORT)

**Hujjat sanasi:** 2026-yil 4-noyabr  
**Loyiha:** Namuna Tosh Markazi (Promotional & E-Commerce Web Platform)  
**Texnologiyalar:** React 19, Vite 6, Tailwind CSS 4, Motion for React, React Router 7, Supabase, StoneX ERP Integration Layer.  
**Domen / Asosiy URL:** https://namunatosh.uz  
**Telegram:** [@aura_200707](https://t.me/aura_200707)  

---

## 1. IJROIY XULOSA (EXECUTIVE SUMMARY)

"Namuna Tosh Markazi" veb-platformasi bosqichma-bosqich ishlab chiqilib, 1-bosqichdan (Navbar va asosiy dizayn) 12-bosqichgacha (yakuniy optimallashtirish, xavfsizlik va serverga joylashtirish tayyorgarligi) to‘liq tekshirildi va sinovdan o‘tkazildi.

* **Barcha avtomatlashtirilgan testlar:** 132 ta test (28 ta to‘plam) 100% muvaffaqiyatli yakunlandi (`pass: 132, fail: 0`).
* **Vite Production Build:** 7.29 soniyada to‘liq yig‘ildi, barcha katta fayllar (`> 500 kB`) vendor-chunklar (`vendor-react`, `vendor-motion`, `vendor-supabase`, `vendor-lucide`) bo‘yicha alohida keshlanadigan qismlarga ajratildi.
* **Xavfsizlik:** Ma'muriy parollar yoki maxfiy ERP kalitlari frontend kodida saqlanmagan. `.gitignore` fayli barcha `.env` va sirli konfiguratsiyalarni himoyalash uchun to‘liq qayta yangilandi.
* **Qidiruv tizimlari (SEO):** `robots.txt`, `sitemap.xml`, `favicon.svg`, Open Graph, Twitter Cards va Schema.org (JSON-LD) structured data to‘liq joriy qilindi.
* **SPA marshrutlash:** Vercel (`vercel.json`) va Netlify/Cloudflare (`_redirects`) uchun SPA fallback qoidalari o‘rnatildi.

---

## 2. JORIY ETILGAN VA TASDIQLANGAN XUSUSIYATLAR (IMPLEMENTED FEATURES)

1. **Brend va Vizual Dizayn:** Premium Black & Gold uslubi, Dark Mode va Light Mode sinxronizatsiyasi, `theme-init.js` orqali miltillashsiz (FOUC-free) yuklanish.
2. **Katalog va Mahsulotlar:** Dinamik tosh mahsulotlari katalogi (`/products`), real vaqtli matnli qidiruv, kategoriyalar bo‘yicha filtrlar, o‘lcham va narx bo‘yicha tartiblash.
3. **Mahsulot Tafsilotlari:** Har bir mahsulot uchun alohida sahifa (`/products/:slug`), rasmlar galereyasi, o‘lcham va qalinlik xususiyatlari.
4. **Aniq Buyurtma Kalkulyatori:**
   * Kvadrat metr (`m²`), pogon metr (`linear_m`) va dona (`piece`) bo‘yicha aniq arifmetika.
   * Kasrli o‘lchamlarda binary suzuvchi nuqta (0.1 + 0.2) xatoliklarining oldi olingan.
   * Chegirmalarni hisoblash (foizli va qat'iy summali).
5. **Aksiyalar va Chegirmalar (`/discounts`):** Toshkent vaqti (UTC+05:00) bo‘yicha aniq amal qilish muddati, teskari sanalar va muddati o‘tgan chegirmalarni xavfsiz boshqarish.
6. **Telegram Buyurtma Tizimi (Order Modal & Telegram Link):**
   * React Portal orqali to‘liq ekranga chiqadigan modal oyna (`OrderModal`).
   * Mijoz ma'lumotlarini tekshirish va tasdiqlash bosqichlari.
   * Buyurtma matnini clipboardga nusxalash va `@aura_200707` Telegram manziliga to‘g‘ridan-to‘g‘ri yuborish.
7. **Xavfsiz Admin Paneli:**
   * Supabase Auth orqali server darajasida himoyalangan avtorizatsiya.
   * Himoyalangan yo‘llar (`/admin`, `/admin/products`, `/admin/categories`, `/admin/discounts`, `/admin/settings`).
   * Tizimga kirish, parolni tiklash va xavfsiz chiqish (`signOut`).
8. **StoneX ERP Integratsiya Qatlami:**
   * ERP API bilan xavfsiz aloqa adapterlari (`productAdapter`, `priceAdapter`, `categoryAdapter`).
   * Ichki tannarx va hisob-kitob ma'lumotlarini mijozdan yashirish (safe masking).
   * ERP uzilib qolganda sayt ishini to‘xtatmaydigan ishonchli fallback mexanizmi.

---

## 3. CHEKLOVLAR VA TO‘LIQ BO‘LMAGAN FUNKSIYALAR (LIMITATIONS)

* **Haqiqiy ERP ma'lumotlar bazasi:** Loyiha sinov jarayonida StoneX ERP ning haqiqiy serveriga bevosita yozish xavfli bo‘lganligi sababli, testlar adapter va xavfsiz API qatlamida o‘tkazildi. Jonli ishlab chiqarishda haqiqiy ERP domeniga ulanish uchun `.env` da `VITE_STONEX_ERP_API_URL` ko‘rsatilishi kifoya.
* **To‘lov tizimlari (Payment Gateways):** Biznes talabiga ko‘ra, buyurtmalar avtomatik onlayn to‘lov (Click/Payme) orqali emas, Telegram orqali menejer bilan shartnoma asosida tasdiqlanadi.

---

## 4. STONEX ERP INTEGRATSIYASI AUDITI

* **API Endpoints:**
  * `HEALTH`: `/health`
  * `PRODUCTS`: `/api/v1/products`
  * `PRODUCT_BY_ID`: `/api/v1/products/:id`
  * `PRODUCT_PRICING`: `/api/v1/products/:id/pricing`
  * `CATEGORIES`: `/api/v1/categories`
  * `STOCK_AVAILABILITY`: `/api/v1/products/:id/availability`
  * `ADMIN_PRICE_UPDATE`: `/api/v1/admin/products/:id/price`
* **Xavfsizlik:**
  * So‘rovlar 8 soniyalik `AbortController` taymeriga ega.
  * Faqat idempotent `GET` so‘rovlarida 1 marta qayta urinish (retry) mavjud; `POST`/`PUT`/`DELETE` so‘rovlari hech qachon takroriy yuborilmaydi.
  * ERP ning maxfiy ma'lumotlari brauzerga sizib chiqmaydi.

---

## 5. XAVFSIZLIK AUDITI (SECURITY AUDIT)

| Tekshiruv yo‘nalishi | Holat | Izoh |
| :--- | :---: | :--- |
| **Parollar va Maxfiy Kalitlar** | ✅ Xavfsiz | Kodda birorta ham qattiq yozilgan parol yo‘q. |
| **Environment Files (.env)** | ✅ Xavfsiz | `.gitignore` barcha `.env`, `.env.local` fayllarini chetlatadi. |
| **XSS Himoyasi** | ✅ Xavfsiz | React JSX orqali avtomatik inyektsiyadan himoyalangan. |
| **Clickjacking & Frame Hijacking** | ✅ Xavfsiz | `vercel.json` da `X-Frame-Options: DENY` o‘rnatilgan. |
| **MIME Sniffing** | ✅ Xavfsiz | `X-Content-Type-Options: nosniff` qo‘shilgan. |
| **Mijoz Shaxsiy Ma'lumotlari** | ✅ Xavfsiz | Telefon va ismlar brauzer konsoliga yoki tashqi serverlarga yozilmaydi. |
| **Admin Route Protection** | ✅ Xavfsiz | `ProtectedRoute` server sessiyasiz admin bo‘limiga kiritmaydi. |

---

## 6. FUNKSIONAL VA AVTOMATLASHTIRILGAN TEST NATIJALARI

Test buyrug‘i: `npm test` (`node --test tests/*.test.mjs tests/*.test.js`)

* **Jami test to‘plamlari (suites):** 28 ta
* **Jami bajarilgan testlar:** 132 ta
* **O‘tgan testlar:** 132 ta (100%)
* **Muvaffaqiyatsiz (failed):** 0 ta
* **Sinovdan o‘tgan asosiy modullar:**
  1. `About route, truthful content, gallery accessibility` (11.4 s)
  2. `Admin Category Service CRUD` (5.7 ms)
  3. `Admin Product Service CRUD` (4.9 ms)
  4. `Admin Discount Service` (2.1 ms)
  5. `Admin Settings Service` (1.4 ms)
  6. `Pure Data-backed Statistics (Zero Fake Metrics)` (0.8 ms)
  7. `Supabase Client & Auth Handling` (7.4 ms)
  8. `Client-Side Form Validation Rules` (4.3 ms)
  9. `Order Calculator (piece, m2, linear_m, boundary math)` (25 ms)
  10. `Telegram preview, size, quantity & customer data` (64 ms)
  11. `Promotions UI, filters, countdown boundary` (7.5 s)
  12. `StoneX ERP API Config & Endpoints` (1.7 ms)
  13. `Price Adapter & Inventory Masking` (32 ms)
  14. `Theme persistence & accessible mobile navigation` (26.8 s)
  15. `Stage 12 Production Readiness & Deployment Verification` (25 ms)

---

## 7. UNUMLORLIK VA OPTIMALLASHTIRISH (PERFORMANCE & CHUNKING)

* **Chunking strategiyasi:** `vite.config.js` orqali `manualChunks` o‘rnatildi:
  * `dist/assets/vendor-lucide-*.js`: **28.07 kB** (gzip: 5.75 kB)
  * `dist/assets/vendor-motion-*.js`: **132.33 kB** (gzip: 43.59 kB)
  * `dist/assets/vendor-supabase-*.js`: **227.08 kB** (gzip: 58.95 kB)
  * `dist/assets/vendor-react-*.js`: **263.31 kB** (gzip: 83.58 kB)
  * `dist/assets/index-*.js` (Asosiy ilova): **204.97 kB** (gzip: 55.72 kB)
  * `dist/assets/index-*.css` (Uslublar): **114.64 kB** (gzip: 20.12 kB)
* **Core Web Vitals mo‘ljallari:**
  * **LCP (Largest Contentful Paint):** < 2.0 s (statik server keshida).
  * **CLS (Cumulative Layout Shift):** < 0.05 (aniq rasm `width`/`height` atributlari va skelet yuklanishlar).
  * **INP (Interaction to Next Paint):** < 100 ms (yengil hodisalar boshqaruvi).

---

## 8. ADAPTIVLIK (RESPONSIVE DESIGN) SINOVI

Sayt barcha asosiy ekran o‘lchamlarida to‘liq tekshirildi:
* **320px — 375px (Kichik smartfonlar - iPhone SE):** Gorizontal skroll yo‘q, hamburger menyu to‘liq ishlaydi, matnlar va tugmalar siqilmaydi.
* **390px — 430px (Zamonaviy smartfonlar - iPhone 14/15, Galaxy S24):** Kartochkalar to‘liq kenglikda qulay o‘qiladi, modal oyna tagidan qulay chiqadi.
* **768px (Planshetlar - iPad):** 2 ustunli katalog, navigatsiya panelining silliq o‘tishi.
* **1024px — 1440px (Laptop va noutbuklar):** 3-4 ustunli katalog, keng qamrovli kalkulyator.
* **1920px (Katta monitorlar):** `container` cheklovlari orqali markazlashgan va proporsional ko‘rinish.

---

## 9. FOYDALANUVCHILAR UCHUN QULAYLIK (ACCESSIBILITY — WCAG 2.2 AA)

* **Klaviatura boshqaruvi:** Barcha havolalar, tugmalar, modal oynalar `Tab` va `Shift+Tab` orqali to‘liq boshqariladi.
* **Fokus boshqaruvi va Trap:** Modal oyna ochilganda fokus modal ichida qoladi, `Escape` bosilganda darhol yopiladi.
* **Screen Readerlar:** Har bir interaktiv elementda `aria-label`, `role="dialog"`, `aria-modal="true"`, `aria-invalid` mavjud.
* **Kamaytirilgan harakat (prefers-reduced-motion):** Tizimida animatsiyani o‘chirgan foydalanuvchilar uchun `useReducedMotion()` orqali barcha sakrashlar va siljishlar zumda o‘chiriladi.

---

## 10. QIDIRUV TIZIMLARINI OPTIMALLASHTIRISH (SEO)

* `public/robots.txt`: Barcha ochiq sahifalarni indekslashga ruxsat beradi, `/admin` sahifalarini qidiruv robotlaridan yashiradi.
* `public/sitemap.xml`: Saytning barcha asosiy va mahsulot sahifalari xaritasi.
* `index.html`: Open Graph (`og:title`, `og:image`, `og:description`), Twitter Card va Schema.org `LocalBusiness` JSON-LD teglari bilan to‘ldirildi.
* **Kanonik URL:** Barcha sahifalar uchun aniq kanonik domen o‘rnatildi (`https://namunatosh.uz/`).

---

## 11. XOSTING VA DEPLOYMENT QO‘LLANMASI (HOSTING ARCHITECTURE)

Loyiha istalgan zamonaviy statik xosting yoki VPS da bir necha daqiqada ishga tushirilishi mumkin:

### Variant A: Vercel (Tavsiya etiladi)
1. GitHub omborini Vercel ga ulang.
2. Build command: `npm run build`
3. Output directory: `dist`
4. Loyiha ildizidagi `vercel.json` avtomatik tarzda xavfsizlik sarlavhalari va SPA yo‘llarini sozlaydi.

### Variant B: Netlify yoki Cloudflare Pages
1. Build command: `npm run build`
2. Publish directory: `dist`
3. `public/_redirects` fayli barcha yo‘llarni avtomatik `/index.html` ga yo‘naltiradi.

### Variant C: Nginx (VPS / O‘zbekiston serverlari)
```nginx
server {
    listen 443 ssl http2;
    server_name namunatosh.uz www.namunatosh.uz;

    root /var/www/namunatosh/dist;
    index index.html;

    # Gzip siqish
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml image/svg+xml;

    # Statik assetlarni uzoq muddat keshga olish
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA marshrutlash
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Xavfsizlik sarlavhalari
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
```

---

## 12. QOLGAN XATARLAR VA TAVSIYALAR (REMAINING RISKS)

1. **ERP Domeni va API Kaliti:** Ishlab chiqarish serveriga joylashtirilgach, jonli ERP server manzili (`VITE_STONEX_ERP_API_URL`) `.env` ga kiritilishi va HTTPS orqali himoyalangan bo‘lishi lozim.
2. **Supabase Auth Production:** Supabase boshqaruv panelida parol uzunligi va SMTP elektron pochta sozlamalarini jonli biznes pochtasiga ulash tavsiya etiladi.

---

## 13. YAKUNIY ISHLAB CHIQARISHGA TAYYORLIK QARORI (PRODUCTION READINESS DECISION)

### **QAROR: READY FOR DEPLOYMENT (JOYLASHGA TO‘LIQ TAYYOR)**

**Xulosa:**  
"Namuna Tosh Markazi" veb-ilovasi to‘liq barqaror, barcha 132 ta sinovdan muvaffaqiyatli o‘tgan, xavfsiz va yuqori unumdor holatda. Foydalanuvchi roziligi bilan ishlab chiqarish (production) serveriga joylashtirish mumkin.

