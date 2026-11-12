// Shared by the interface, metadata and generated order messages.
export const brandNames = {
  uz: { name: 'Namuna Tosh Markazi', short: 'NAMUNA', descriptor: 'TOSH MARKAZI' },
  oz: { name: 'Намуна Тош Маркази', short: 'НАМУНА', descriptor: 'ТОШ МАРКАЗИ' },
  ru: { name: 'Намуна — центр камня', short: 'НАМУНА', descriptor: 'ЦЕНТР КАМНЯ' },
  en: { name: 'Namuna Stone Center', short: 'NAMUNA', descriptor: 'STONE CENTER' },
};

export function getBrand(language = 'uz') {
  const brand = brandNames[language] || brandNames.uz;
  return { ...brand, title: `${brand.short} ${brand.descriptor}` };
}
