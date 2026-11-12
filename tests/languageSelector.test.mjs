import test from 'node:test';
import assert from 'node:assert/strict';
import { SUPPORTED_LANGUAGES, translations, latinToCyrillic } from '../src/utils/translations.js';

test('Multi-language configuration — 4 supported languages', () => {
  const codes = SUPPORTED_LANGUAGES.map((l) => l.code);
  assert.deepEqual(codes, ['uz', 'oz', 'ru', 'en']);

  const uz = SUPPORTED_LANGUAGES.find((l) => l.code === 'uz');
  assert.equal(uz.name, 'O‘zbekcha');
  assert.equal(uz.sub, 'Lotin');

  const oz = SUPPORTED_LANGUAGES.find((l) => l.code === 'oz');
  assert.equal(oz.name, 'Ўзбекча');
  assert.equal(oz.sub, 'Кирилл');

  const ru = SUPPORTED_LANGUAGES.find((l) => l.code === 'ru');
  assert.equal(ru.name, 'Русский');

  const en = SUPPORTED_LANGUAGES.find((l) => l.code === 'en');
  assert.equal(en.name, 'English');
});

test('Translations dictionary coverage across all 4 languages', () => {
  const requiredKeys = [
    'nav.home',
    'nav.products',
    'nav.discounts',
    'nav.about',
    'nav.contact',
    'cart.title',
    'cart.checkout',
    'product.grade',
    'product.size',
    'product.weight',
  ];

  for (const lang of ['uz', 'oz', 'ru', 'en']) {
    const dict = translations[lang];
    assert.ok(dict, `Dictionary for ${lang} must exist`);
    for (const key of requiredKeys) {
      assert.ok(dict[key], `Missing translation key "${key}" in language "${lang}"`);
    }
  }

  // Exact expected translations for navigation
  assert.equal(translations.uz['nav.home'], 'Bosh sahifa');
  assert.equal(translations.oz['nav.home'], 'Бош саҳифа');
  assert.equal(translations.ru['nav.home'], 'Главная');
  assert.equal(translations.en['nav.home'], 'Home');

  assert.equal(translations.uz['nav.products'], 'Mahsulotlar');
  assert.equal(translations.oz['nav.products'], 'Маҳсулотлар');
  assert.equal(translations.ru['nav.products'], 'Продукция');
  assert.equal(translations.en['nav.products'], 'Products');

  assert.equal(translations.uz['nav.discounts'], 'Chegirmalar');
  assert.equal(translations.oz['nav.discounts'], 'Чегирмалар');
  assert.equal(translations.ru['nav.discounts'], 'Скидки');
  assert.equal(translations.en['nav.discounts'], 'Discounts');
});

test('latinToCyrillic Uzbek transliteration logic', () => {
  assert.equal(latinToCyrillic('Oq marmar'), 'Оқ мармар');
  assert.equal(latinToCyrillic('Kerama granit'), 'Керама гранит');
  assert.equal(latinToCyrillic('Sokl va zinapoyalar'), 'Сокл ва зинапоялар');
  assert.equal(latinToCyrillic('Chegirmalar'), 'Чегирмалар');
  assert.equal(latinToCyrillic('O‘zbekcha'), 'Ўзбекча');
});

