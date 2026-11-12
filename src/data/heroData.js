import { heroProducts } from "./heroProducts";

export const heroData = {
  badge: "PREMIUM KERAMA GRANIT VA TOSH MAHSULOTLARI",
  title: "NAMUNA TOSH MARKAZI",
  subtitle: "Sifat va nafislik uyg‘unligi",
  description:
    "Uyingiz va loyihalaringiz uchun zamonaviy kerama granit, granit, kafel hamda tabiiy tosh mahsulotlari. Nafis dizayn, puxta ishlov va didingizga mos yechimlar.",
  trust: ["Haqiqiy mahsulot rasmlari", "Loyihangizga mos tanlov"],
};

// Existing original photographs are reused without altering their pixels.
export const heroSlides = ["crystal", "angola-1", "angola-2"].map(
  (id, index) => {
    const product = heroProducts.find((item) => item.id === id);
    return {
      ...product,
      edition: `0${index + 1} / ${product.edition.split(" / ")[1]}`,
    };
  },
);

export const heroStats = [
  {
    id: "granite",
    title: "Kerama granit",
    description: "Rang va fakturalar bilan tanishing.",
    icon: "layers",
    to: "/products",
  },
  {
    id: "stairs",
    title: "Sokl va zinapoyalar",
    description: "Makoningizni to‘ldiradigan detallar.",
    icon: "stairs",
    to: "/products",
  },
  {
    id: "custom",
    title: "Buyurtma asosida ishlov",
    description: "G‘oyangiz va o‘lchamlarni muhokama qilamiz.",
    icon: "ruler",
    to: "/contact",
  },
];
