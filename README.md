# Namuna Tosh Markazi

React + Vite asosidagi Black & Gold reklama sayti. Joriy bosqich: Navbar, routing, layout va boshlang‘ich sahifalar. Katalog, chegirmalarni boshqarish va admin amallari hali amalga oshirilmagan.

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
- Tailwind CSS Vite plagini va alohida komponent CSS fayllari. Ranglar `variables.css` ichida.
- Lucide React: SVG ikonkalari. Hero tasviri CSS’da yaratilgan konsept; real mahsulot rasmi deb ko‘rsatilmagan.
- Telegram manzili bir joyda: `src/components/Navbar/navigation.js`.
- Admin placeholder ochiq sahifa. Server autentifikatsiyasi yo‘q, maxfiy ma’lumot yoki admin amali yo‘q. Himoya keyingi bosqichda serverda qo‘shilishi kerak.

## Tekshiruvlar

`npm test` haqiqiy React komponentlarini jsdom orqali tekshiradi: mijozlar marshrutlari, aktiv holat, Navbar saqlanishi, Telegram havolasi, sahifa sarlavhasi, scroll reset, sticky holati, mobil panel, fokus sikli va tiklanishi, Escape/X/havola bilan yopish, desktopga o‘tish, adminning alohida layouti, 404 va runtime console xatolari/ogohlantirishlari.

Bu DOM integratsiya testi; haqiqiy brauzerdagi responsive maket, animatsiya ko‘rinishi va vizual QA o‘rnini bosmaydi.

## Qo‘llanmalar

- Tailwind Vite integratsiyasi: https://tailwindcss.com/docs/installation/using-vite
- Motion shared layout: https://motion.dev/docs/react-layout-animations
- Motion sahifa o‘tishlari: https://motion.dev/docs/react-animate-presence

Keyingi bosqichga tayyor: mahsulot katalogi, chegirmalar ma’lumotlari, real rasmlar va server autentifikatsiyasi.
