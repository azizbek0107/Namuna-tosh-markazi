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

API `/api/revenue-analysis` Vite dev va preview serverlarida ishlaydi.
Statik `dist` hosting uchun alohida server endpointi va foydalanuvchi autentifikatsiyasi kerak.
Joriy endpoint mahalliy foydalanish uchun mo‘ljallangan; ommaviy joylashtirmang.

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

Savdo, ombor va ishlab chiqarish yozuvlari avvalgidek brauzer localStorage xotirasida. Rollar oynalarni ajratadi; turli kompyuterlar orasida umumiy baza va ma’lumotlarni server darajasida ajratish hali yo‘q. Buning uchun ERP yozuvlarini server bazasiga ko‘chirish kerak. Statik dist hostingning o‘zi login API’ni ishga tushirmaydi. Internetga joylashda alohida production server va HTTPS/Secure cookie sozlamasi kerak.

Tekshirish: `npm.cmd test`, `npm.cmd run lint`, `npm.cmd run build`.
