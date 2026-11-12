import { TELEGRAM_URL } from '../../config/contactConfig.js';

export const navigation = [
  { to: "/", label: "Bosh sahifa", translationKey: "nav.home" },
  { to: "/products", label: "Mahsulotlar", translationKey: "nav.products" },
  { to: "/discounts", label: "Chegirmalar", translationKey: "nav.discounts" },
  { to: "/about", label: "Biz haqimizda", translationKey: "nav.about" },
];
// Single source of truth — imported from contactConfig
export const orderUrl = TELEGRAM_URL;
