# React + Vite

## Daromad diagrammasi va OpenAI

`So‘nggi operatsiyalar` o‘rnidagi panel tanlangan davr bo‘yicha sotuv tushumlarini ko‘rsatadi.
Sotuv manbasi hali ulanmagan: `RevenueChart` komponentining `sales` parametriga
`{ id, time: ISO_sana, amount: UZS_summasi }` yozuvlarini yuboring. Ombor qiymati daromad hisoblanmaydi.

OpenAI uchun `.env.example` faylidan `.env.local` nusxasini yarating, `OPENAI_API_KEY`
va loyihangizda mavjud Responses API modeli uchun `OPENAI_MODEL` qiymatini to‘ldiring.
Kalitga `VITE_` prefiksini qo‘shmang. Keyin `npm.cmd run dev` serverini qayta boshlang.
Sotuv ma’lumotlari bo‘lsa, `AI tahlil` tugmasi hisoblangan vaqt bo‘laklari va sotuv sonini
OpenAI Responses API orqali tahlil qiladi; mahsulot yoki mijoz nomlari yuborilmaydi.

API `/api/revenue-analysis` Vite dev/preview serverlarida va Vercel Function orqali ishlaydi.
API uchun tizimga administrator sifatida kirish kerak.

Manba: https://developers.openai.com/api/docs/guides/migrate-to-responses

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.

## Login va rollar

`npm.cmd run dev` yoki `npm.cmd run preview` serveri bilan oching. Birinchi kirishda administrator ismi, login va kamida 8 belgili parol yaratiladi. Tayyor standart parol yo‘q.

Administrator barcha bo‘limlarni ko‘radi. Sozlamalar → Ishchi va kassa akkauntlari orqali ishchi va kassir loginlarini yarating. Ishchi faqat ishlab chiqarish oynasini, kassir faqat kassani ko‘radi. Mavjud loginni o‘sha rol bilan qayta saqlash parolni yangilaydi va uning ochiq sessiyalarini tugatadi. Chiqish tugmasi sessiyani bekor qiladi.

Parollar scrypt bilan xeshlanadi va `.local-data/users.json` faylida saqlanadi; bu papka Git va Vite fayl serveridan chiqarilgan. Cookie HttpOnly va SameSite=Strict; sessiya 8 soat amal qiladi. Server qayta ishga tushsa, qayta login qilish kerak, akkauntlar esa saqlanadi.

Savdo, ombor va ishlab chiqarish yozuvlari avvalgidek brauzer localStorage xotirasida. Rollar oynalarni ajratadi; turli kompyuterlar orasida umumiy ERP bazasi hali yo‘q. Buning uchun ERP yozuvlarini server bazasiga ko‘chirish kerak. Statik dist hostingning o‘zi login API’ni ishga tushirmaydi. Vercel uchun quyidagi API va Redis sozlamalaridan foydalaning; HTTPS/Secure cookie yoqilgan.

## Vercel orqali ishlatish

1. Vercel loyihasida **Storage → Create Database → Upstash Redis** orqali baza yarating va loyihaga ulang. Production muhitini tanlang.
2. **Settings → Environment Variables** da `UPSTASH_REDIS_REST_URL` va `UPSTASH_REDIS_REST_TOKEN` borligini tekshiring. Integratsiya `KV_REST_API_URL` va `KV_REST_API_TOKEN` nomlarini qo‘shsa, ular ham ishlaydi. Kalitlar server uchun; `VITE_` prefiksini qo‘shmang.
3. GitHub `main` tarmog‘idagi yangi kodni deploy qiling yoki **Deployments → Redeploy** ni bosing. Environment Variables o‘zgarganda qayta deploy kerak.
4. `/api/auth/session` JSON qaytarishini, roldan kirishni, sahifani yangilashni va chiqishni tekshiring.

`vercel.json` API so‘rovlarini `api/index.js` funksiyasiga yo‘naltiradi. Akkauntlar, sessiyalar, davomat, bonuslar Redis’da saqlanadi; Vercel diskiga yozilmaydi. Bir vaqtdagi o‘zgarishlar Redis Lua compare-and-set orqali saqlanadi. Preview va Production uchun alohida kalit ishlatiladi. Baza ulanmagan yoki ishlamayotgan bo‘lsa, API 503 qaytaradi; vaqtinchalik xotiraga o‘tmaydi.

Mahalliy dev/preview server oldingidek `.local-data` fayllaridan foydalanadi. Mahalliy akkaunt va davomat fayllari Redis’ga avtomatik ko‘chirilmaydi. Savdo, ombor, buyurtmalar va yopilgan mijoz savatlari hozircha brauzer localStorage xotirasida saqlanadi; turli qurilmalar orasida sinxronlanmaydi.

Tekshirish: `npm.cmd test`, `node --test server/vercelHandler.test.js`, `npm.cmd run lint`, `npm.cmd run build`.
