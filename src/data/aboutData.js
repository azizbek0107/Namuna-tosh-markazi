import { products } from './products';

const samples = products.filter(product => product.isVisible === true).flatMap(product => (product.images ?? []).map((image, index) => ({ id: `${product.id}-${index}`, name: product.name, image })));
export const aboutSeo = {
  title: 'Biz haqimizda | Namuna Tosh Markazi',
  description: 'Namuna Tosh Markazi — kerama granit, granit, kafel va tabiiy tosh mahsulotlariga ishlov berish markazi.',
};
export const aboutHero = {
  title: 'NAMUNA TOSH MARKAZI',
  subtitle: 'Mahsulotlarimiz ortida — puxta ishlov va e’tibor',
  description: 'Namuna Tosh Markazi kerama granit, granit, kafel va turli tosh mahsulotlariga puxta ishlov berish bilan shug‘ullanadi.',
  image: samples[0]?.image ?? null,
  imageName: samples[0]?.name ?? 'Mahsulot namunasi',
};
export const companyStory = [
  'Namuna Tosh Markazi — kerama granit, granit, kafel va turli tosh mahsulotlariga ishlov berishga ixtisoslashgan ishlab chiqarish markazi. Korxonamizda plitalarni kerakli o‘lchamda kesish va tayyor mahsulot holiga keltirish ishlari amalga oshiriladi.',
  'Maqsadimiz — mijozlarga ularning loyihalariga mos mahsulot va ishlov berish yechimlarini taqdim etish.',
];
export const productionSteps = [
  { id: 'material', icon: 'layers', title: 'Materialni tanlash', description: 'Loyihaga mos rang, naqsh va material ko‘rib chiqiladi.' },
  { id: 'measure', icon: 'ruler', title: 'O‘lchamni belgilash', description: 'Kerakli o‘lchamlar va ishlov talablari aniqlashtiriladi.' },
  { id: 'cut', icon: 'scissors', title: 'Plitani kesish', description: 'Material kelishilgan o‘lchamga moslab kesiladi.' },
  { id: 'edge', icon: 'sparkles', title: 'Chetlariga ishlov berish', description: 'Mahsulotning vazifasiga mos chet ishlovi bajariladi.' },
  { id: 'inspect', icon: 'check', title: 'Tayyor mahsulotni tekshirish', description: 'Tayyorlangan mahsulotning o‘lchami va ishlovi ko‘rib chiqiladi.' },
  { id: 'prepare', icon: 'package', title: 'Buyurtmaga tayyorlash', description: 'Buyurtma tafsilotlari va topshirish shartlari aniqlashtiriladi.' },
];
export const productDirections = [
  { id: 'kerama-granit', title: 'Kerama granit', description: 'Turli rang, format va naqshdagi yuqori sifatli plitalar.' },
  { id: 'granit', title: 'Granit', description: 'Mustahkam, chidamli va tabiiy jiloga ega toshlar.' },
  { id: 'kafel', title: 'Kafel', description: 'Zamonaviy interyer va eksteryer uchun kafel qoplamalari.' },
  { id: 'tayyor-mahsulot', title: 'Tayyor mahsulot', description: 'O‘lchamlari aniq kesilgan va ishlov berilgan tayyor tosh buyumlar.' },
  { id: 'qoshimcha', title: 'Qo‘shimcha', description: 'O‘rnatish, bezash va mustahkamlash uchun kerakli materiallar.' },
];

// Use an image from the same category, including images saved by the admin.
// Missing and failed images never leave an empty category card behind.
export function resolveProductDirections(catalog = [], failedSources = new Set()) {
  return productDirections.flatMap(direction => {
    const image = catalog
      .filter(product => product.isVisible === true &&
        [product.category, ...(product.categories || [])].includes(direction.id))
      .flatMap(product => product.images || [])
      .map(image => typeof image === 'string' ? { src: image } : { ...image, src: image?.src || image?.url })
      .find(image => typeof image.src === 'string' && image.src.trim() && !failedSources.has(image.src));
    return image ? [{ ...direction, image }] : [];
  });
}
export const companyServices = [
  { id: 'cut', icon: 'scissors', title: 'Kerakli o‘lchamda kesish', description: 'Loyihangiz uchun kesish o‘lchamlarini kelishamiz.' },
  { id: 'granite', icon: 'ruler', title: 'Granit va plitalarga ishlov berish', description: 'Plitalarni o‘lcham bo‘yicha silliqlash va ishlov berish.' },
  { id: 'custom-prod', icon: 'layers', title: 'Tayyor mahsulotlar ishlab chiqarish', description: 'Buyurtmaga mos holda tayyor tosh mahsulotlarini ishlab chiqarish.' },
  { id: 'advice', icon: 'message', title: 'Mahsulotlarni tanlash bo‘yicha maslahat', description: 'Material namunalari va ko‘rinishini birgalikda ko‘rib chiqamiz.' },
  { id: 'custom', icon: 'settings', title: 'Buyurtma asosida tayyorlash', description: 'Loyihangiz talablarini muhokama qilib, mos yechimni kelishamiz.' },
];
export const aboutGallery = samples;
export const aboutVideo = {
  channelName: 'uzb_yigiti_0107',
  channelUrl: null,
  isVerified: false,
  // Add the confirmed channel URL and set isVerified only after verification.
};
