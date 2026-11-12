// Synthetic products used only by tests. Never imported into src/.
export const discountTestNow = Date.parse('2026-11-02T12:00:00+05:00');
const common = { priceUnit: 'm2', sizes: [], images: [], description: 'Test uchun namuna', isVisible: true, createdAt: '2026-11-02', discountStartsAt: '2026-11-01', discountIsActive: true };
export const discountTestProducts = [
  { ...common, id: 'test-percentage', slug: 'test-percentage', name: 'Foizli namuna', category: 'kerama-granit', price: 250000, discountType: 'percentage', discountValue: 20, discountEndsAt: new Date(discountTestNow + 5000).toISOString(), isFeatured: true },
  { ...common, id: 'test-fixed', slug: 'test-fixed', name: 'Summali namuna', category: 'sokl', categories: ['kerama-granit'], price: 300000, discountType: 'fixed', discountValue: 50000, discountEndsAt: new Date(discountTestNow + 10000).toISOString() },
  { ...common, id: 'test-unpriced', slug: 'test-unpriced', name: 'Narxsiz namuna', category: 'sokl', price: null, discountType: 'percentage', discountValue: 20 },
  { ...common, id: 'test-disabled', slug: 'test-disabled', name: 'O‘chirilgan', category: 'sokl', price: 100000, discountType: 'percentage', discountValue: 20, discountIsActive: false },
  { ...common, id: 'test-future', slug: 'test-future', name: 'Rejalashtirilgan', category: 'sokl', price: 100000, discountType: 'percentage', discountValue: 20, discountStartsAt: '2026-11-03' },
  { ...common, id: 'test-hidden', slug: 'test-hidden', name: 'Yashirilgan', category: 'sokl', price: 100000, discountType: 'percentage', discountValue: 20, isVisible: false },
];
