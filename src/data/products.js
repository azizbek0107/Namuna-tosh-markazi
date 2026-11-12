import angolaOne from '../assets/images/products/angola-black-1.jpg';
import angolaTwo from '../assets/images/products/angola-black-2.jpg';
import crystal from '../assets/images/products/black-crystal.jpg';

export const testProducts = [
  {
    id: 'product-001', name: 'Angola Black', slug: 'angola-black',
    category: 'kerama-granit', categories: ['kerama-granit'],
    description: 'Qora tuslar va donador naqshli dekorativ kerama granit. Och va to‘q zarralar material ko‘rinishiga ifoda beradi.',
    images: [
      { src: angolaOne, alt: 'Angola Black — donador naqshli kerama granit plita', width: 1188, height: 1324 },
      { src: angolaTwo, alt: 'Angola Black — to‘q rangli ikkinchi namuna', width: 1024, height: 1536 },
    ],
    sizes: [], price: null, priceUnit: 'm2', unit: 'm2',
    tile_length: 120, tile_width: 60, thickness: 9, box_pieces: 2, box_m2: 1.44,
    cost_price: null, costPrice: null, stock: null,
    discountType: null, discountValue: 0,
    orderConfig: { quantityModes: ['direct', 'pieces'], defaultQuantityMode: 'direct', linearLengthField: 'lengthCm' },
    discountStartsAt: null, discountEndsAt: null, discountIsActive: false,
    isVisible: true, isFeatured: true, createdAt: '2026-11-02',
  },
  {
    id: 'product-002', name: 'Black Crystal', slug: 'black-crystal',
    category: 'kerama-granit', categories: ['kerama-granit'],
    description: 'Yorug‘likni aks ettiruvchi qora yuzali dekorativ kerama granit. Sodda rang va ifodali akslar uyg‘unligi.',
    images: [{ src: crystal, alt: 'Black Crystal — yorug‘lik aksi ko‘rinadigan qora plita', width: 1024, height: 1536 }],
    sizes: [], price: null, priceUnit: 'm2', unit: 'm2',
    tile_length: 120, tile_width: 60, thickness: 9, box_pieces: 2, box_m2: 1.44,
    cost_price: null, costPrice: null, stock: null,
    discountType: null, discountValue: 0,
    orderConfig: { quantityModes: ['direct', 'pieces'], defaultQuantityMode: 'direct', linearLengthField: 'lengthCm' },
    discountStartsAt: null, discountEndsAt: null, discountIsActive: false,
    isVisible: true, isFeatured: true, createdAt: '2026-11-02',
  },
];

export const realProducts = [
  {
    "artikul": "1001",
    "name": "Demehot",
    "slug": "demehot-1001",
    "category": "tayyor-mahsulot",
    "categories": [
      "tayyor-mahsulot"
    ],
    "description": "Demehot — sort 1. Tayyor mahsulot toifasidagi yuqori sifatli mahsulot. Omborda mavjud: 101 dona.",
    "images": [
      {
        "src": "/images/1001_demehot_c83c73.jpg",
        "alt": "Demehot — Tayyor mahsulot namunasi",
        "width": 1024,
        "height": 1024
      }
    ],
    "sizes": [],
    "tile_length": null,
    "tile_width": null,
    "thickness": null,
    "box_pieces": null,
    "box_m2": null,
    "price": 40000,
    "cost_price": 3000,
    "costPrice": 3000,
    "unit": "piece",
    "priceUnit": "piece",
    "stock": 101,
    "weightKg": 0.1,
    "discountType": null,
    "discountValue": 0,
    "orderConfig": {
      "quantityModes": [
        "pieces"
      ],
      "defaultQuantityMode": "pieces",
      "linearLengthField": "lengthCm"
    },
    "discountStartsAt": null,
    "discountEndsAt": null,
    "discountIsActive": false,
    "isVisible": true,
    "isFeatured": true,
    "createdAt": "2026-11-04"
  },
  {
    "id": "224d686f-8492-417d-bb40-893dadefb81f",
    "artikul": "002",
    "name": "Ko'k Saroy",
    "slug": "kok-saroy-002",
    "category": "granit",
    "categories": [
      "granit"
    ],
    "description": "Ko'k Saroy — sort 1. Granit toifasidagi yuqori sifatli mahsulot. Omborda mavjud: 875 m².",
    "images": [
      {
        "src": "/images/002_ko_k_saroy_224d68.jpg",
        "alt": "Ko'k Saroy — Granit namunasi",
        "width": 1024,
        "height": 1024
      }
    ],
    "sizes": [],
    "tile_length": null,
    "tile_width": null,
    "thickness": null,
    "box_pieces": null,
    "box_m2": null,
    "price": 160000,
    "cost_price": 140000,
    "costPrice": 140000,
    "unit": "m2",
    "priceUnit": "m2",
    "stock": 875,
    "weightKg": 10,
    "discountType": null,
    "discountValue": 0,
    "orderConfig": {
      "quantityModes": [
        "direct",
        "pieces"
      ],
      "defaultQuantityMode": "direct",
      "linearLengthField": "lengthCm"
    },
    "discountStartsAt": null,
    "discountEndsAt": null,
    "discountIsActive": false,
    "isVisible": true,
    "isFeatured": true,
    "createdAt": "2026-11-04"
  },
  {
    "id": "2628b321-be7c-438e-a633-b50ced1b0398",
    "artikul": "2630",
    "name": "Black Crystal",
    "slug": "black-crystal-2630",
    "category": "kerama-granit",
    "categories": [
      "kerama-granit"
    ],
    "description": "Black Crystal — sort 1. Kerama granit toifasidagi yuqori sifatli mahsulot. O‘lchami: 120 × 60 sm. Omborda mavjud: 1172.96 m².",
    "images": [
      {
        "src": "/images/2630_bleack_kristal_2628b3.jpg",
        "alt": "Black Crystal — Kerama granit namunasi",
        "width": 1024,
        "height": 1024
      }
    ],
    "sizes": [
      {
        "widthCm": 60,
        "lengthCm": 120,
        "thicknessMm": 9,
        "piecesPerBox": 2
      }
    ],
    "tile_length": 120,
    "tile_width": 60,
    "thickness": 9,
    "box_pieces": 2,
    "box_m2": 1.44,
    "price": 175000,
    "cost_price": 150000,
    "costPrice": 150000,
    "unit": "m2",
    "priceUnit": "m2",
    "stock": 1172.96,
    "weightKg": 8.333333333333334,
    "discountType": null,
    "discountValue": 0,
    "orderConfig": {
      "quantityModes": [
        "direct",
        "pieces"
      ],
      "defaultQuantityMode": "direct",
      "linearLengthField": "lengthCm"
    },
    "discountStartsAt": null,
    "discountEndsAt": null,
    "discountIsActive": false,
    "isVisible": true,
    "isFeatured": true,
    "createdAt": "2026-11-04"
  },
  {
    "id": "50c1e8f7-11f3-4601-afba-7fd043aaebf2",
    "artikul": "2641",
    "name": "Angola Black",
    "slug": "angola-black-2641",
    "category": "kerama-granit",
    "categories": [
      "kerama-granit"
    ],
    "description": "Angola Black — sort 1. Kerama granit toifasidagi yuqori sifatli mahsulot. O‘lchami: 120 × 60 sm. Omborda mavjud: 1411.4 m².",
    "images": [
      {
        "src": "/images/2641_angola_black_50c1e8.jpg",
        "alt": "Angola Black — Kerama granit namunasi",
        "width": 1024,
        "height": 1024
      }
    ],
    "sizes": [
      {
        "widthCm": 60,
        "lengthCm": 120,
        "thicknessMm": 9,
        "piecesPerBox": 2
      }
    ],
    "tile_length": 120,
    "tile_width": 60,
    "thickness": 9,
    "box_pieces": 2,
    "box_m2": 1.44,
    "price": 175000,
    "cost_price": 150000,
    "costPrice": 150000,
    "unit": "m2",
    "priceUnit": "m2",
    "stock": 1411.4,
    "weightKg": 6.944444444444445,
    "discountType": null,
    "discountValue": 0,
    "orderConfig": {
      "quantityModes": [
        "direct",
        "pieces"
      ],
      "defaultQuantityMode": "direct",
      "linearLengthField": "lengthCm"
    },
    "discountStartsAt": null,
    "discountEndsAt": null,
    "discountIsActive": false,
    "isVisible": true,
    "isFeatured": true,
    "createdAt": "2026-11-04"
  },
  {
    "id": "83215ff9-0e17-4fe4-8d3f-a312b017e199",
    "artikul": "1209",
    "name": "Angola Black1",
    "slug": "angola-black1-1209",
    "category": "kerama-granit",
    "categories": [
      "kerama-granit"
    ],
    "description": "Angola Black1 — sort 1; 120/60. Kerama granit toifasidagi yuqori sifatli mahsulot. O‘lchami: 120 × 60 sm. Omborda mavjud: 1322.72 m².",
    "images": [
      {
        "src": "/images/1209_angola_black1_83215f.jpg",
        "alt": "Angola Black1 — Kerama granit namunasi",
        "width": 1024,
        "height": 1024
      }
    ],
    "sizes": [
      {
        "widthCm": 60,
        "lengthCm": 120,
        "thicknessMm": 9,
        "piecesPerBox": 2
      }
    ],
    "tile_length": 120,
    "tile_width": 60,
    "thickness": 9,
    "box_pieces": 2,
    "box_m2": 1.44,
    "price": 125000,
    "cost_price": 110000,
    "costPrice": 110000,
    "unit": "m2",
    "priceUnit": "m2",
    "stock": 1322.72,
    "weightKg": 6.944444444444445,
    "discountType": null,
    "discountValue": 0,
    "orderConfig": {
      "quantityModes": [
        "direct",
        "pieces"
      ],
      "defaultQuantityMode": "direct",
      "linearLengthField": "lengthCm"
    },
    "discountStartsAt": null,
    "discountEndsAt": null,
    "discountIsActive": false,
    "isVisible": true,
    "isFeatured": true,
    "createdAt": "2026-11-04"
  },
  {
    "id": "0a51fa49-1f35-4d47-a20f-c6ef10d3acc5",
    "artikul": "1213",
    "name": "Angola Black2",
    "slug": "angola-black2-1213",
    "category": "kerama-granit",
    "categories": [
      "kerama-granit"
    ],
    "description": "Angola Black2 — sort 1. Kerama granit toifasidagi yuqori sifatli mahsulot. O‘lchami: 120 × 60 sm. Omborda mavjud: 1424.16 m².",
    "images": [
      {
        "src": "/images/1213_angola_black2_0a51fa.jpg",
        "alt": "Angola Black2 — Kerama granit namunasi",
        "width": 1024,
        "height": 1024
      }
    ],
    "sizes": [
      {
        "widthCm": 60,
        "lengthCm": 120,
        "thicknessMm": 9,
        "piecesPerBox": 2
      }
    ],
    "tile_length": 120,
    "tile_width": 60,
    "thickness": 9,
    "box_pieces": 2,
    "box_m2": 1.44,
    "price": 125000,
    "cost_price": 110000,
    "costPrice": 110000,
    "unit": "m2",
    "priceUnit": "m2",
    "stock": 1424.16,
    "weightKg": 6.944444444444445,
    "discountType": null,
    "discountValue": 0,
    "orderConfig": {
      "quantityModes": [
        "direct",
        "pieces"
      ],
      "defaultQuantityMode": "direct",
      "linearLengthField": "lengthCm"
    },
    "discountStartsAt": null,
    "discountEndsAt": null,
    "discountIsActive": false,
    "isVisible": true,
    "isFeatured": true,
    "createdAt": "2026-11-04"
  },
  {
    "id": "f4d772f6-5aa1-47df-8a12-344f1fe6c2b7",
    "artikul": "011",
    "name": "Angola Black3",
    "slug": "angola-black3-011",
    "category": "kerama-granit",
    "categories": [
      "kerama-granit"
    ],
    "description": "Angola Black3 — sort 1.5. Kerama granit toifasidagi yuqori sifatli mahsulot. O‘lchami: 120 × 60 sm. Omborda mavjud: 1432.8 m².",
    "images": [
      {
        "src": "/images/011_angola_black3_f4d772.jpg",
        "alt": "Angola Black3 — Kerama granit namunasi",
        "width": 1024,
        "height": 1024
      }
    ],
    "sizes": [
      {
        "widthCm": 60,
        "lengthCm": 120,
        "thicknessMm": 9,
        "piecesPerBox": 2
      }
    ],
    "tile_length": 120,
    "tile_width": 60,
    "thickness": 9,
    "box_pieces": 2,
    "box_m2": 1.44,
    "price": 105000,
    "cost_price": 95000,
    "costPrice": 95000,
    "unit": "m2",
    "priceUnit": "m2",
    "stock": 1432.8,
    "weightKg": 6.944444444444445,
    "discountType": null,
    "discountValue": 0,
    "orderConfig": {
      "quantityModes": [
        "direct",
        "pieces"
      ],
      "defaultQuantityMode": "direct",
      "linearLengthField": "lengthCm"
    },
    "discountStartsAt": null,
    "discountEndsAt": null,
    "discountIsActive": false,
    "isVisible": true,
    "isFeatured": false,
    "createdAt": "2026-11-04"
  },
  {
    "id": "b873b174-9729-451e-88c2-399f83b968fa",
    "artikul": "1212",
    "name": "Kokkoz",
    "slug": "kokkoz-1212",
    "category": "kerama-granit",
    "categories": [
      "kerama-granit"
    ],
    "description": "Kokkoz — sort 1. Kerama granit toifasidagi yuqori sifatli mahsulot. O‘lchami: 120 × 60 sm. Omborda mavjud: 1440 m².",
    "images": [
      {
        "src": "/images/1212_kokkoz_b873b1.jpg",
        "alt": "Kokkoz — Kerama granit namunasi",
        "width": 1024,
        "height": 1024
      }
    ],
    "sizes": [
      {
        "widthCm": 60,
        "lengthCm": 120,
        "thicknessMm": 9,
        "piecesPerBox": 2
      }
    ],
    "tile_length": 120,
    "tile_width": 60,
    "thickness": 9,
    "box_pieces": 2,
    "box_m2": 1.44,
    "price": 125000,
    "cost_price": 110000,
    "costPrice": 110000,
    "unit": "m2",
    "priceUnit": "m2",
    "stock": 1440,
    "weightKg": 6.944444444444445,
    "discountType": null,
    "discountValue": 0,
    "orderConfig": {
      "quantityModes": [
        "direct",
        "pieces"
      ],
      "defaultQuantityMode": "direct",
      "linearLengthField": "lengthCm"
    },
    "discountStartsAt": null,
    "discountEndsAt": null,
    "discountIsActive": false,
    "isVisible": true,
    "isFeatured": false,
    "createdAt": "2026-11-04"
  },
  {
    "id": "59dff511-d7fb-4e08-844d-7206ce79758d",
    "artikul": "1213",
    "name": "Angola Black4",
    "slug": "angola-black4-1213",
    "category": "kerama-granit",
    "categories": [
      "kerama-granit"
    ],
    "description": "Angola Black4 — sort 1.5. Kerama granit toifasidagi yuqori sifatli mahsulot. O‘lchami: 120 × 60 sm. Omborda mavjud: 1440 m².",
    "images": [
      {
        "src": "/images/1213_angola_black4_59dff5.jpg",
        "alt": "Angola Black4 — Kerama granit namunasi",
        "width": 1024,
        "height": 1024
      }
    ],
    "sizes": [
      {
        "widthCm": 60,
        "lengthCm": 120,
        "thicknessMm": 9,
        "piecesPerBox": 2
      }
    ],
    "tile_length": 120,
    "tile_width": 60,
    "thickness": 9,
    "box_pieces": 2,
    "box_m2": 1.44,
    "price": 105000,
    "cost_price": 95000,
    "costPrice": 95000,
    "unit": "m2",
    "priceUnit": "m2",
    "stock": 1440,
    "weightKg": 6.944444444444445,
    "discountType": null,
    "discountValue": 0,
    "orderConfig": {
      "quantityModes": [
        "direct",
        "pieces"
      ],
      "defaultQuantityMode": "direct",
      "linearLengthField": "lengthCm"
    },
    "discountStartsAt": null,
    "discountEndsAt": null,
    "discountIsActive": false,
    "isVisible": true,
    "isFeatured": false,
    "createdAt": "2026-11-04"
  },
  {
    "id": "6b7d8814-4f62-40ff-9c4e-775af337b429",
    "artikul": "1219",
    "name": "Tambrovun",
    "slug": "tambrovun-1219",
    "category": "kerama-granit",
    "categories": [
      "kerama-granit"
    ],
    "description": "Tambrovun — sort 1. Kerama granit toifasidagi yuqori sifatli mahsulot. O‘lchami: 120 × 60 sm. Omborda mavjud: 1440 m².",
    "images": [
      {
        "src": "/images/1219_tambrovun_6b7d88.jpg",
        "alt": "Tambrovun — Kerama granit namunasi",
        "width": 1024,
        "height": 1024
      }
    ],
    "sizes": [
      {
        "widthCm": 60,
        "lengthCm": 120,
        "thicknessMm": 9,
        "piecesPerBox": 2
      }
    ],
    "tile_length": 120,
    "tile_width": 60,
    "thickness": 9,
    "box_pieces": 2,
    "box_m2": 1.44,
    "price": 125000,
    "cost_price": 110000,
    "costPrice": 110000,
    "unit": "m2",
    "priceUnit": "m2",
    "stock": 1440,
    "weightKg": 6.944444444444445,
    "discountType": null,
    "discountValue": 0,
    "orderConfig": {
      "quantityModes": [
        "direct",
        "pieces"
      ],
      "defaultQuantityMode": "direct",
      "linearLengthField": "lengthCm"
    },
    "discountStartsAt": null,
    "discountEndsAt": null,
    "discountIsActive": false,
    "isVisible": true,
    "isFeatured": false,
    "createdAt": "2026-11-04"
  },
  {
    "id": "1af1749b-5d25-4589-985e-a84672da8801",
    "artikul": "888",
    "name": "Angola Black5",
    "slug": "angola-black5-888",
    "category": "kerama-granit",
    "categories": [
      "kerama-granit"
    ],
    "description": "Angola Black5 — sort 1. Kerama granit toifasidagi yuqori sifatli mahsulot. O‘lchami: 120 × 60 sm. Omborda mavjud: 1440 m².",
    "images": [
      {
        "src": "/images/888_angola_black5_1af174.jpg",
        "alt": "Angola Black5 — Kerama granit namunasi",
        "width": 1024,
        "height": 1024
      }
    ],
    "sizes": [
      {
        "widthCm": 60,
        "lengthCm": 120,
        "thicknessMm": 9,
        "piecesPerBox": 2
      }
    ],
    "tile_length": 120,
    "tile_width": 60,
    "thickness": 9,
    "box_pieces": 2,
    "box_m2": 1.44,
    "price": 105000,
    "cost_price": 95000,
    "costPrice": 95000,
    "unit": "m2",
    "priceUnit": "m2",
    "stock": 1440,
    "weightKg": 6.944444444444445,
    "discountType": null,
    "discountValue": 0,
    "orderConfig": {
      "quantityModes": [
        "direct",
        "pieces"
      ],
      "defaultQuantityMode": "direct",
      "linearLengthField": "lengthCm"
    },
    "discountStartsAt": null,
    "discountEndsAt": null,
    "discountIsActive": false,
    "isVisible": true,
    "isFeatured": false,
    "createdAt": "2026-11-04"
  },
  {
    "id": "dd13d8bd-af77-4553-b923-b77a8fecd66c",
    "artikul": "603",
    "name": "Angola Black6",
    "slug": "angola-black6-603",
    "category": "kerama-granit",
    "categories": [
      "kerama-granit"
    ],
    "description": "Angola Black6 — sort 1. Kerama granit toifasidagi yuqori sifatli mahsulot. O‘lchami: 120 × 60 sm. Omborda mavjud: 1339.2 m².",
    "images": [
      {
        "src": "/images/603_angola_black6_dd13d8.jpg",
        "alt": "Angola Black6 — Kerama granit namunasi",
        "width": 1024,
        "height": 1024
      }
    ],
    "sizes": [
      {
        "widthCm": 60,
        "lengthCm": 120,
        "thicknessMm": 9,
        "piecesPerBox": 2
      }
    ],
    "tile_length": 120,
    "tile_width": 60,
    "thickness": 9,
    "box_pieces": 2,
    "box_m2": 1.44,
    "price": 125000,
    "cost_price": 110000,
    "costPrice": 110000,
    "unit": "m2",
    "priceUnit": "m2",
    "stock": 1339.2,
    "weightKg": 6.944444444444445,
    "discountType": null,
    "discountValue": 0,
    "orderConfig": {
      "quantityModes": [
        "direct",
        "pieces"
      ],
      "defaultQuantityMode": "direct",
      "linearLengthField": "lengthCm"
    },
    "discountStartsAt": null,
    "discountEndsAt": null,
    "discountIsActive": false,
    "isVisible": true,
    "isFeatured": false,
    "createdAt": "2026-11-04"
  },
  {
    "id": "b4946a30-ac48-4311-94db-2243598f06bb",
    "artikul": "1210",
    "name": "Angola Black7",
    "slug": "angola-black7-1210",
    "category": "kerama-granit",
    "categories": [
      "kerama-granit"
    ],
    "description": "Angola Black7 — sort 1. Kerama granit toifasidagi yuqori sifatli mahsulot. O‘lchami: 120 × 60 sm. Omborda mavjud: 1440 m².",
    "images": [
      {
        "src": "/images/1210_angola_black7_b4946a.jpg",
        "alt": "Angola Black7 — Kerama granit namunasi",
        "width": 1024,
        "height": 1024
      }
    ],
    "sizes": [
      {
        "widthCm": 60,
        "lengthCm": 120,
        "thicknessMm": 9,
        "piecesPerBox": 2
      }
    ],
    "tile_length": 120,
    "tile_width": 60,
    "thickness": 9,
    "box_pieces": 2,
    "box_m2": 1.44,
    "price": 125000,
    "cost_price": 110000,
    "costPrice": 110000,
    "unit": "m2",
    "priceUnit": "m2",
    "stock": 1440,
    "weightKg": 6.944444444444445,
    "discountType": null,
    "discountValue": 0,
    "orderConfig": {
      "quantityModes": [
        "direct",
        "pieces"
      ],
      "defaultQuantityMode": "direct",
      "linearLengthField": "lengthCm"
    },
    "discountStartsAt": null,
    "discountEndsAt": null,
    "discountIsActive": false,
    "isVisible": true,
    "isFeatured": false,
    "createdAt": "2026-11-04"
  },
  {
    "id": "5a2fedc4-364d-49cf-85ad-4492d8354605",
    "artikul": "999",
    "name": "Angola Black8",
    "slug": "angola-black8-999",
    "category": "kerama-granit",
    "categories": [
      "kerama-granit"
    ],
    "description": "Angola Black8 — sort 1.5. Kerama granit toifasidagi yuqori sifatli mahsulot. O‘lchami: 120 × 60 sm. Omborda mavjud: 1440 m².",
    "images": [
      {
        "src": "/images/999_angola_black8_5a2fed.jpg",
        "alt": "Angola Black8 — Kerama granit namunasi",
        "width": 1024,
        "height": 1024
      }
    ],
    "sizes": [
      {
        "widthCm": 60,
        "lengthCm": 120,
        "thicknessMm": 9,
        "piecesPerBox": 2
      }
    ],
    "tile_length": 120,
    "tile_width": 60,
    "thickness": 9,
    "box_pieces": 2,
    "box_m2": 1.44,
    "price": 105000,
    "cost_price": 95000,
    "costPrice": 95000,
    "unit": "m2",
    "priceUnit": "m2",
    "stock": 1440,
    "weightKg": 6.944444444444445,
    "discountType": null,
    "discountValue": 0,
    "orderConfig": {
      "quantityModes": [
        "direct",
        "pieces"
      ],
      "defaultQuantityMode": "direct",
      "linearLengthField": "lengthCm"
    },
    "discountStartsAt": null,
    "discountEndsAt": null,
    "discountIsActive": false,
    "isVisible": true,
    "isFeatured": false,
    "createdAt": "2026-11-04"
  },
  {
    "id": "b3deb9ea-e718-4fea-a128-3fc35173306a",
    "artikul": "1213",
    "name": "Angola Black9",
    "slug": "angola-black9-1213",
    "category": "kerama-granit",
    "categories": [
      "kerama-granit"
    ],
    "description": "Angola Black9 — sort 2. Kerama granit toifasidagi yuqori sifatli mahsulot. O‘lchami: 120 × 60 sm. Omborda mavjud: 1440 m².",
    "images": [
      {
        "src": "/images/1213_angola_black9_b3deb9.jpg",
        "alt": "Angola Black9 — Kerama granit namunasi",
        "width": 1024,
        "height": 1024
      }
    ],
    "sizes": [
      {
        "widthCm": 60,
        "lengthCm": 120,
        "thicknessMm": 9,
        "piecesPerBox": 2
      }
    ],
    "tile_length": 120,
    "tile_width": 60,
    "thickness": 9,
    "box_pieces": 2,
    "box_m2": 1.44,
    "price": 90000,
    "cost_price": 80000,
    "costPrice": 80000,
    "unit": "m2",
    "priceUnit": "m2",
    "stock": 1440,
    "weightKg": 6.944444444444445,
    "discountType": null,
    "discountValue": 0,
    "orderConfig": {
      "quantityModes": [
        "direct",
        "pieces"
      ],
      "defaultQuantityMode": "direct",
      "linearLengthField": "lengthCm"
    },
    "discountStartsAt": null,
    "discountEndsAt": null,
    "discountIsActive": false,
    "isVisible": true,
    "isFeatured": false,
    "createdAt": "2026-11-04"
  },
  {
    "id": "36406280-5fb0-4d0d-8797-6e6f74e6bb54",
    "artikul": "000",
    "name": "Black Crystal 2",
    "slug": "black-crystal-2-000",
    "category": "kerama-granit",
    "categories": [
      "kerama-granit"
    ],
    "description": "Black Crystal 2 — sort 1. Kerama granit toifasidagi yuqori sifatli mahsulot. O‘lchami: 120 × 60 sm. Omborda mavjud: 1440 m².",
    "images": [
      {
        "src": "/images/000_bleack_kristal2_364062.jpg",
        "alt": "Black Crystal 2 — Kerama granit namunasi",
        "width": 1024,
        "height": 1024
      }
    ],
    "sizes": [
      {
        "widthCm": 60,
        "lengthCm": 120,
        "thicknessMm": 9,
        "piecesPerBox": 2
      }
    ],
    "tile_length": 120,
    "tile_width": 60,
    "thickness": 9,
    "box_pieces": 2,
    "box_m2": 1.44,
    "price": 115000,
    "cost_price": 105000,
    "costPrice": 105000,
    "unit": "m2",
    "priceUnit": "m2",
    "stock": 1440,
    "weightKg": 6.944444444444445,
    "discountType": null,
    "discountValue": 0,
    "orderConfig": {
      "quantityModes": [
        "direct",
        "pieces"
      ],
      "defaultQuantityMode": "direct",
      "linearLengthField": "lengthCm"
    },
    "discountStartsAt": null,
    "discountEndsAt": null,
    "discountIsActive": false,
    "isVisible": true,
    "isFeatured": false,
    "createdAt": "2026-11-04"
  },
  {
    "id": "7f5ff0b2-f91e-4397-bf73-7af4ecf8236e",
    "artikul": "663",
    "name": "Nomalum1",
    "slug": "nomalum1-663",
    "category": "kerama-granit",
    "categories": [
      "kerama-granit"
    ],
    "description": "Nomalum1 — sort 1. Kerama granit toifasidagi yuqori sifatli mahsulot. O‘lchami: 60 × 60 sm. Omborda mavjud: 1440 m².",
    "images": [
      {
        "src": "/images/663_nomalum1_7f5ff0.jpg",
        "alt": "Nomalum1 — Kerama granit namunasi",
        "width": 1024,
        "height": 1024
      }
    ],
    "sizes": [
      {
        "widthCm": 60,
        "lengthCm": 60,
        "thicknessMm": 9,
        "piecesPerBox": 4
      }
    ],
    "tile_length": 60,
    "tile_width": 60,
    "thickness": 9,
    "box_pieces": 4,
    "box_m2": 1.44,
    "price": 150000,
    "cost_price": 140000,
    "costPrice": 140000,
    "unit": "m2",
    "priceUnit": "m2",
    "stock": 1440,
    "weightKg": 6.944444444444445,
    "discountType": null,
    "discountValue": 0,
    "orderConfig": {
      "quantityModes": [
        "direct",
        "pieces"
      ],
      "defaultQuantityMode": "direct",
      "linearLengthField": "lengthCm"
    },
    "discountStartsAt": null,
    "discountEndsAt": null,
    "discountIsActive": false,
    "isVisible": true,
    "isFeatured": false,
    "createdAt": "2026-11-04"
  },
  {
    "id": "0b8b8b23-651e-4d8f-b27d-4039960845f6",
    "artikul": "677",
    "name": "Kokkoz",
    "slug": "kokkoz-677",
    "category": "kerama-granit",
    "categories": [
      "kerama-granit"
    ],
    "description": "Kokkoz — sort 1. Kerama granit toifasidagi yuqori sifatli mahsulot. O‘lchami: 60 × 60 sm. Omborda mavjud: 1440 m².",
    "images": [
      {
        "src": "/images/677_kokkoz_0b8b8b.jpg",
        "alt": "Kokkoz — Kerama granit namunasi",
        "width": 1024,
        "height": 1024
      }
    ],
    "sizes": [
      {
        "widthCm": 60,
        "lengthCm": 60,
        "thicknessMm": 9,
        "piecesPerBox": 4
      }
    ],
    "tile_length": 60,
    "tile_width": 60,
    "thickness": 9,
    "box_pieces": 4,
    "box_m2": 1.44,
    "price": 150000,
    "cost_price": 140000,
    "costPrice": 140000,
    "unit": "m2",
    "priceUnit": "m2",
    "stock": 1440,
    "weightKg": 6.944444444444445,
    "discountType": null,
    "discountValue": 0,
    "orderConfig": {
      "quantityModes": [
        "direct",
        "pieces"
      ],
      "defaultQuantityMode": "direct",
      "linearLengthField": "lengthCm"
    },
    "discountStartsAt": null,
    "discountEndsAt": null,
    "discountIsActive": false,
    "isVisible": true,
    "isFeatured": false,
    "createdAt": "2026-11-04"
  },
  {
    "id": "55f0ac1c-12df-4e8f-94f3-3930f6961bf4",
    "artikul": "6604",
    "name": "Nomalum2",
    "slug": "nomalum2-6604",
    "category": "kerama-granit",
    "categories": [
      "kerama-granit"
    ],
    "description": "Nomalum2 — sort 1. Kerama granit toifasidagi yuqori sifatli mahsulot. O‘lchami: 60 × 60 sm. Omborda mavjud: 1402.56 m².",
    "images": [
      {
        "src": "/images/6604_nomalum2_55f0ac.jpg",
        "alt": "Nomalum2 — Kerama granit namunasi",
        "width": 1024,
        "height": 1024
      }
    ],
    "sizes": [
      {
        "widthCm": 60,
        "lengthCm": 60,
        "thicknessMm": 9,
        "piecesPerBox": 4
      }
    ],
    "tile_length": 60,
    "tile_width": 60,
    "thickness": 9,
    "box_pieces": 4,
    "box_m2": 1.44,
    "price": 150000,
    "cost_price": 140000,
    "costPrice": 140000,
    "unit": "m2",
    "priceUnit": "m2",
    "stock": 1402.56,
    "weightKg": 6.944444444444445,
    "discountType": null,
    "discountValue": 0,
    "orderConfig": {
      "quantityModes": [
        "direct",
        "pieces"
      ],
      "defaultQuantityMode": "direct",
      "linearLengthField": "lengthCm"
    },
    "discountStartsAt": null,
    "discountEndsAt": null,
    "discountIsActive": false,
    "isVisible": true,
    "isFeatured": false,
    "createdAt": "2026-11-04"
  },
  {
    "id": "ee3d96df-3e57-468f-99ef-15a1e90a00ee",
    "artikul": "6621",
    "name": "Nomalum3",
    "slug": "nomalum3-6621",
    "category": "kerama-granit",
    "categories": [
      "kerama-granit"
    ],
    "description": "Nomalum3 — sort 1. Kerama granit toifasidagi yuqori sifatli mahsulot. O‘lchami: 60 × 60 sm. Omborda mavjud: 1438.56 m².",
    "images": [
      {
        "src": "/images/6621_nomalum3_ee3d96.jpg",
        "alt": "Nomalum3 — Kerama granit namunasi",
        "width": 1024,
        "height": 1024
      }
    ],
    "sizes": [
      {
        "widthCm": 60,
        "lengthCm": 60,
        "thicknessMm": 9,
        "piecesPerBox": 4
      }
    ],
    "tile_length": 60,
    "tile_width": 60,
    "thickness": 9,
    "box_pieces": 4,
    "box_m2": 1.44,
    "price": 150000,
    "cost_price": 140000,
    "costPrice": 140000,
    "unit": "m2",
    "priceUnit": "m2",
    "stock": 1438.56,
    "weightKg": 6.944444444444445,
    "discountType": null,
    "discountValue": 0,
    "orderConfig": {
      "quantityModes": [
        "direct",
        "pieces"
      ],
      "defaultQuantityMode": "direct",
      "linearLengthField": "lengthCm"
    },
    "discountStartsAt": null,
    "discountEndsAt": null,
    "discountIsActive": false,
    "isVisible": true,
    "isFeatured": false,
    "createdAt": "2026-11-04"
  },
  {
    "id": "5ba11380-9841-42c1-b851-2f9bafe7383b",
    "artikul": "6663",
    "name": "Nomalum4",
    "slug": "nomalum4-6663",
    "category": "kerama-granit",
    "categories": [
      "kerama-granit"
    ],
    "description": "Nomalum4 — sort 1. Kerama granit toifasidagi yuqori sifatli mahsulot. O‘lchami: 60 × 60 sm. Omborda mavjud: 1440 m².",
    "images": [
      {
        "src": "/images/6663_nomalum4_5ba113.jpg",
        "alt": "Nomalum4 — Kerama granit namunasi",
        "width": 1024,
        "height": 1024
      }
    ],
    "sizes": [
      {
        "widthCm": 60,
        "lengthCm": 60,
        "thicknessMm": 9,
        "piecesPerBox": 4
      }
    ],
    "tile_length": 60,
    "tile_width": 60,
    "thickness": 9,
    "box_pieces": 4,
    "box_m2": 1.44,
    "price": 150000,
    "cost_price": 140000,
    "costPrice": 140000,
    "unit": "m2",
    "priceUnit": "m2",
    "stock": 1440,
    "weightKg": 6.944444444444445,
    "discountType": null,
    "discountValue": 0,
    "orderConfig": {
      "quantityModes": [
        "direct",
        "pieces"
      ],
      "defaultQuantityMode": "direct",
      "linearLengthField": "lengthCm"
    },
    "discountStartsAt": null,
    "discountEndsAt": null,
    "discountIsActive": false,
    "isVisible": true,
    "isFeatured": false,
    "createdAt": "2026-11-04"
  },
  {
    "id": "ba7a0aea-2ba2-4fab-b7a4-b1b66cfbd49f",
    "artikul": "6819",
    "name": "Sherxon",
    "slug": "sherxon-6819",
    "category": "kerama-granit",
    "categories": [
      "kerama-granit"
    ],
    "description": "Sherxon — sort 1. Kerama granit toifasidagi yuqori sifatli mahsulot. O‘lchami: 60 × 60 sm. Omborda mavjud: 1440 m².",
    "images": [
      {
        "src": "/images/6819_sherxon_ba7a0a.jpg",
        "alt": "Sherxon — Kerama granit namunasi",
        "width": 1024,
        "height": 1024
      }
    ],
    "sizes": [
      {
        "widthCm": 60,
        "lengthCm": 60,
        "thicknessMm": 9,
        "piecesPerBox": 4
      }
    ],
    "tile_length": 60,
    "tile_width": 60,
    "thickness": 9,
    "box_pieces": 4,
    "box_m2": 1.44,
    "price": 149999,
    "cost_price": 140000,
    "costPrice": 140000,
    "unit": "m2",
    "priceUnit": "m2",
    "stock": 1440,
    "weightKg": 6.944444444444445,
    "discountType": null,
    "discountValue": 0,
    "orderConfig": {
      "quantityModes": [
        "direct",
        "pieces"
      ],
      "defaultQuantityMode": "direct",
      "linearLengthField": "lengthCm"
    },
    "discountStartsAt": null,
    "discountEndsAt": null,
    "discountIsActive": false,
    "isVisible": true,
    "isFeatured": false,
    "createdAt": "2026-11-04"
  },
  {
    "id": "bb6e4db2-0c0f-4b47-bc3a-2f11d2600d9a",
    "artikul": "G001",
    "name": "Gul1",
    "slug": "gul1-g001",
    "category": "qoshimcha",
    "categories": [
      "qoshimcha"
    ],
    "description": "Gul1 — sort 1. Qo‘shimcha toifasidagi yuqori sifatli mahsulot.",
    "images": [
      {
        "src": "/images/g001_gul1_bb6e4d.jpg",
        "alt": "Gul1 — Qo‘shimcha namunasi",
        "width": 1024,
        "height": 1024
      }
    ],
    "sizes": [],
    "tile_length": null,
    "tile_width": null,
    "thickness": null,
    "box_pieces": null,
    "box_m2": null,
    "price": 1500000,
    "cost_price": 1400000,
    "costPrice": 1400000,
    "unit": "piece",
    "priceUnit": "piece",
    "stock": 0,
    "weightKg": 10,
    "discountType": null,
    "discountValue": 0,
    "orderConfig": {
      "quantityModes": [
        "pieces"
      ],
      "defaultQuantityMode": "pieces",
      "linearLengthField": "lengthCm"
    },
    "discountStartsAt": null,
    "discountEndsAt": null,
    "discountIsActive": false,
    "isVisible": true,
    "isFeatured": false,
    "createdAt": "2026-11-04"
  },
  {
    "id": "8ea46001-4a05-47b2-9248-52e674295c82",
    "artikul": "G001",
    "name": "Gul2",
    "slug": "gul2-g001",
    "category": "qoshimcha",
    "categories": [
      "qoshimcha"
    ],
    "description": "Gul2 — sort1. Qo‘shimcha toifasidagi yuqori sifatli mahsulot.",
    "images": [
      {
        "src": "/images/g001_gul2_8ea460.jpg",
        "alt": "Gul2 — Qo‘shimcha namunasi",
        "width": 1024,
        "height": 1024
      }
    ],
    "sizes": [],
    "tile_length": null,
    "tile_width": null,
    "thickness": null,
    "box_pieces": null,
    "box_m2": null,
    "price": 1500000,
    "cost_price": 1400000,
    "costPrice": 1400000,
    "unit": "piece",
    "priceUnit": "piece",
    "stock": 0,
    "weightKg": 10,
    "discountType": null,
    "discountValue": 0,
    "orderConfig": {
      "quantityModes": [
        "pieces"
      ],
      "defaultQuantityMode": "pieces",
      "linearLengthField": "lengthCm"
    },
    "discountStartsAt": null,
    "discountEndsAt": null,
    "discountIsActive": false,
    "isVisible": true,
    "isFeatured": false,
    "createdAt": "2026-11-04"
  },
  {
    "id": "b1fff2b3-1aa2-4d89-9739-6be47553f619",
    "artikul": "G003",
    "name": "Gul3",
    "slug": "gul3-g003",
    "category": "qoshimcha",
    "categories": [
      "qoshimcha"
    ],
    "description": "Gul3 — sort1. Qo‘shimcha toifasidagi yuqori sifatli mahsulot.",
    "images": [
      {
        "src": "/images/g003_gul3_b1fff2.jpg",
        "alt": "Gul3 — Qo‘shimcha namunasi",
        "width": 1024,
        "height": 1024
      }
    ],
    "sizes": [],
    "tile_length": null,
    "tile_width": null,
    "thickness": null,
    "box_pieces": null,
    "box_m2": null,
    "price": 1500000,
    "cost_price": 1400000,
    "costPrice": 1400000,
    "unit": "piece",
    "priceUnit": "piece",
    "stock": 0,
    "weightKg": 10,
    "discountType": null,
    "discountValue": 0,
    "orderConfig": {
      "quantityModes": [
        "pieces"
      ],
      "defaultQuantityMode": "pieces",
      "linearLengthField": "lengthCm"
    },
    "discountStartsAt": null,
    "discountEndsAt": null,
    "discountIsActive": false,
    "isVisible": true,
    "isFeatured": false,
    "createdAt": "2026-11-04"
  },
  {
    "id": "85e25f4f-4bd4-4859-9604-cd9d4d0d5851",
    "artikul": "009",
    "name": "Kafel Matvi1",
    "slug": "kafel-matvi1-009",
    "category": "kafel",
    "categories": [
      "kafel"
    ],
    "description": "Kafel Matvi1 — sort 1. Kafel toifasidagi yuqori sifatli mahsulot. O‘lchami: 120 × 60 sm. Omborda mavjud: 1342.08 m².",
    "images": [
      {
        "src": "/images/009_kafel_matvi1_85e25f.jpg",
        "alt": "Kafel Matvi1 — Kafel namunasi",
        "width": 1024,
        "height": 1024
      }
    ],
    "sizes": [
      {
        "widthCm": 60,
        "lengthCm": 120,
        "thicknessMm": 9,
        "piecesPerBox": 2
      }
    ],
    "tile_length": 120,
    "tile_width": 60,
    "thickness": 9,
    "box_pieces": 2,
    "box_m2": 1.44,
    "price": 92000,
    "cost_price": 80000,
    "costPrice": 80000,
    "unit": "m2",
    "priceUnit": "m2",
    "stock": 1342.08,
    "weightKg": 1.3888888888888888,
    "discountType": null,
    "discountValue": 0,
    "orderConfig": {
      "quantityModes": [
        "direct",
        "pieces"
      ],
      "defaultQuantityMode": "direct",
      "linearLengthField": "lengthCm"
    },
    "discountStartsAt": null,
    "discountEndsAt": null,
    "discountIsActive": false,
    "isVisible": true,
    "isFeatured": false,
    "createdAt": "2026-11-04"
  },
  {
    "id": "fefc9e52-da3d-4d99-a71f-6941d55bf2f1",
    "artikul": "67",
    "name": "Kafel Matvi1",
    "slug": "kafel-matvi1-67",
    "category": "kafel",
    "categories": [
      "kafel"
    ],
    "description": "Kafel Matvi1 — sort 2. Kafel toifasidagi yuqori sifatli mahsulot. O‘lchami: 120 × 60 sm. Omborda mavjud: 1438.56 m².",
    "images": [
      {
        "src": "/images/67_kafel_matvi1_fefc9e.jpg",
        "alt": "Kafel Matvi1 — Kafel namunasi",
        "width": 1024,
        "height": 1024
      }
    ],
    "sizes": [
      {
        "widthCm": 60,
        "lengthCm": 120,
        "thicknessMm": 9,
        "piecesPerBox": 2
      }
    ],
    "tile_length": 120,
    "tile_width": 60,
    "thickness": 9,
    "box_pieces": 2,
    "box_m2": 1.44,
    "price": 65000,
    "cost_price": 55000,
    "costPrice": 55000,
    "unit": "m2",
    "priceUnit": "m2",
    "stock": 1438.56,
    "weightKg": 6.944444444444445,
    "discountType": null,
    "discountValue": 0,
    "orderConfig": {
      "quantityModes": [
        "direct",
        "pieces"
      ],
      "defaultQuantityMode": "direct",
      "linearLengthField": "lengthCm"
    },
    "discountStartsAt": null,
    "discountEndsAt": null,
    "discountIsActive": false,
    "isVisible": true,
    "isFeatured": false,
    "createdAt": "2026-11-04"
  },
  {
    "id": "0dd5a511-a3df-4ba0-abec-ac47ddf6d53a",
    "artikul": "464",
    "name": "Kafel Matvi2",
    "slug": "kafel-matvi2-464",
    "category": "kafel",
    "categories": [
      "kafel"
    ],
    "description": "Kafel Matvi2 — sort 1. Kafel toifasidagi yuqori sifatli mahsulot. O‘lchami: 120 × 60 sm. Omborda mavjud: 1440 m².",
    "images": [
      {
        "src": "/images/464_kafel_matvi2_0dd5a5.jpg",
        "alt": "Kafel Matvi2 — Kafel namunasi",
        "width": 1024,
        "height": 1024
      }
    ],
    "sizes": [
      {
        "widthCm": 60,
        "lengthCm": 120,
        "thicknessMm": 9,
        "piecesPerBox": 2
      }
    ],
    "tile_length": 120,
    "tile_width": 60,
    "thickness": 9,
    "box_pieces": 2,
    "box_m2": 1.44,
    "price": 92000,
    "cost_price": 80000,
    "costPrice": 80000,
    "unit": "m2",
    "priceUnit": "m2",
    "stock": 1440,
    "weightKg": 6.944444444444445,
    "discountType": null,
    "discountValue": 0,
    "orderConfig": {
      "quantityModes": [
        "direct",
        "pieces"
      ],
      "defaultQuantityMode": "direct",
      "linearLengthField": "lengthCm"
    },
    "discountStartsAt": null,
    "discountEndsAt": null,
    "discountIsActive": false,
    "isVisible": true,
    "isFeatured": false,
    "createdAt": "2026-11-04"
  },
  {
    "id": "1359dfbd-fd93-482b-9b78-00e3efc1008f",
    "artikul": "464",
    "name": "Kafel Matvi2",
    "slug": "kafel-matvi2-464-29",
    "category": "kafel",
    "categories": [
      "kafel"
    ],
    "description": "Kafel Matvi2 — sort 2. Kafel toifasidagi yuqori sifatli mahsulot. O‘lchami: 120 × 60 sm. Omborda mavjud: 1440 m².",
    "images": [
      {
        "src": "/images/464_kafel_matvi2_1359df.jpg",
        "alt": "Kafel Matvi2 — Kafel namunasi",
        "width": 1024,
        "height": 1024
      }
    ],
    "sizes": [
      {
        "widthCm": 60,
        "lengthCm": 120,
        "thicknessMm": 9,
        "piecesPerBox": 2
      }
    ],
    "tile_length": 120,
    "tile_width": 60,
    "thickness": 9,
    "box_pieces": 2,
    "box_m2": 1.44,
    "price": 65000,
    "cost_price": 55000,
    "costPrice": 55000,
    "unit": "m2",
    "priceUnit": "m2",
    "stock": 1440,
    "weightKg": 1.3888888888888888,
    "discountType": null,
    "discountValue": 0,
    "orderConfig": {
      "quantityModes": [
        "direct",
        "pieces"
      ],
      "defaultQuantityMode": "direct",
      "linearLengthField": "lengthCm"
    },
    "discountStartsAt": null,
    "discountEndsAt": null,
    "discountIsActive": false,
    "isVisible": true,
    "isFeatured": false,
    "createdAt": "2026-11-04"
  },
  {
    "id": "6254467d-10ab-40ef-8455-5a8480658618",
    "artikul": "1901",
    "name": "Pol Kafel1",
    "slug": "pol-kafel1-1901",
    "category": "kafel",
    "categories": [
      "kafel"
    ],
    "description": "Pol Kafel1 — sort 1. Kafel toifasidagi yuqori sifatli mahsulot. O‘lchami: 60 × 30 sm. Omborda mavjud: 1440 m².",
    "images": [
      {
        "src": "/images/1901_pol_kafel1_625446.jpg",
        "alt": "Pol Kafel1 — Kafel namunasi",
        "width": 1024,
        "height": 1024
      }
    ],
    "sizes": [
      {
        "widthCm": 30,
        "lengthCm": 60,
        "thicknessMm": 9,
        "piecesPerBox": 8
      }
    ],
    "tile_length": 60,
    "tile_width": 30,
    "thickness": 9,
    "box_pieces": 8,
    "box_m2": 1.44,
    "price": 77000,
    "cost_price": 71000,
    "costPrice": 71000,
    "unit": "m2",
    "priceUnit": "m2",
    "stock": 1440,
    "weightKg": 6.944444444444445,
    "discountType": null,
    "discountValue": 0,
    "orderConfig": {
      "quantityModes": [
        "direct",
        "pieces"
      ],
      "defaultQuantityMode": "direct",
      "linearLengthField": "lengthCm"
    },
    "discountStartsAt": null,
    "discountEndsAt": null,
    "discountIsActive": false,
    "isVisible": true,
    "isFeatured": false,
    "createdAt": "2026-11-04"
  },
  {
    "id": "0c040743-8202-453b-af29-45dbd7be1dda",
    "artikul": "050",
    "name": "Pol Kafel2",
    "slug": "pol-kafel2-050",
    "category": "kafel",
    "categories": [
      "kafel"
    ],
    "description": "Pol Kafel2 — sort 1. Kafel toifasidagi yuqori sifatli mahsulot. O‘lchami: 60 × 30 sm. Omborda mavjud: 1440 m².",
    "images": [
      {
        "src": "/images/050_pol_kafel2_0c0407.jpg",
        "alt": "Pol Kafel2 — Kafel namunasi",
        "width": 1024,
        "height": 1024
      }
    ],
    "sizes": [
      {
        "widthCm": 30,
        "lengthCm": 60,
        "thicknessMm": 9,
        "piecesPerBox": 8
      }
    ],
    "tile_length": 60,
    "tile_width": 30,
    "thickness": 9,
    "box_pieces": 8,
    "box_m2": 1.44,
    "price": 65000,
    "cost_price": 60000,
    "costPrice": 60000,
    "unit": "m2",
    "priceUnit": "m2",
    "stock": 1440,
    "weightKg": 6.944444444444445,
    "discountType": null,
    "discountValue": 0,
    "orderConfig": {
      "quantityModes": [
        "direct",
        "pieces"
      ],
      "defaultQuantityMode": "direct",
      "linearLengthField": "lengthCm"
    },
    "discountStartsAt": null,
    "discountEndsAt": null,
    "discountIsActive": false,
    "isVisible": true,
    "isFeatured": false,
    "createdAt": "2026-11-04"
  },
  {
    "id": "01bad236-96b6-441a-b1b6-81a59cd6b01e",
    "artikul": "AN30R",
    "name": "Pol Kafel3",
    "slug": "pol-kafel3-an30r",
    "category": "kafel",
    "categories": [
      "kafel"
    ],
    "description": "Pol Kafel3 — sort 1. Kafel toifasidagi yuqori sifatli mahsulot. O‘lchami: 60 × 30 sm. Omborda mavjud: 1080 m².",
    "images": [
      {
        "src": "/images/an30r_pol_kafel3_01bad2.jpg",
        "alt": "Pol Kafel3 — Kafel namunasi",
        "width": 1024,
        "height": 1024
      }
    ],
    "sizes": [
      {
        "widthCm": 30,
        "lengthCm": 60,
        "thicknessMm": 9,
        "piecesPerBox": 6
      }
    ],
    "tile_length": 60,
    "tile_width": 30,
    "thickness": 9,
    "box_pieces": 6,
    "box_m2": 1.08,
    "price": 65000,
    "cost_price": 50000,
    "costPrice": 50000,
    "unit": "m2",
    "priceUnit": "m2",
    "stock": 1080,
    "weightKg": 9.25925925925926,
    "discountType": null,
    "discountValue": 0,
    "orderConfig": {
      "quantityModes": [
        "direct",
        "pieces"
      ],
      "defaultQuantityMode": "direct",
      "linearLengthField": "lengthCm"
    },
    "discountStartsAt": null,
    "discountEndsAt": null,
    "discountIsActive": false,
    "isVisible": true,
    "isFeatured": false,
    "createdAt": "2026-11-04"
  },
  {
    "id": "c70e1fbf-2639-4a7c-bb1c-578bdf92d726",
    "artikul": "052",
    "name": "Pol Kafel4",
    "slug": "pol-kafel4-052",
    "category": "kafel",
    "categories": [
      "kafel"
    ],
    "description": "Pol Kafel4 — sort 1. Kafel toifasidagi yuqori sifatli mahsulot. O‘lchami: 60 × 30 sm. Omborda mavjud: 1440 m².",
    "images": [
      {
        "src": "/images/052_pol_kafel4_c70e1f.jpg",
        "alt": "Pol Kafel4 — Kafel namunasi",
        "width": 1024,
        "height": 1024
      }
    ],
    "sizes": [
      {
        "widthCm": 30,
        "lengthCm": 60,
        "thicknessMm": 9,
        "piecesPerBox": 8
      }
    ],
    "tile_length": 60,
    "tile_width": 30,
    "thickness": 9,
    "box_pieces": 8,
    "box_m2": 1.44,
    "price": 65000,
    "cost_price": 55000,
    "costPrice": 55000,
    "unit": "m2",
    "priceUnit": "m2",
    "stock": 1440,
    "weightKg": 6.944444444444445,
    "discountType": null,
    "discountValue": 0,
    "orderConfig": {
      "quantityModes": [
        "direct",
        "pieces"
      ],
      "defaultQuantityMode": "direct",
      "linearLengthField": "lengthCm"
    },
    "discountStartsAt": null,
    "discountEndsAt": null,
    "discountIsActive": false,
    "isVisible": true,
    "isFeatured": false,
    "createdAt": "2026-11-04"
  },
  {
    "id": "b173c2cd-40e6-402f-bc1f-c31cc3573a0d",
    "artikul": "300",
    "name": "Pol Kafel5",
    "slug": "pol-kafel5-300",
    "category": "kafel",
    "categories": [
      "kafel"
    ],
    "description": "Pol Kafel5 — sort 1. Kafel toifasidagi yuqori sifatli mahsulot. O‘lchami: 60 × 30 sm. Omborda mavjud: 1440 m².",
    "images": [
      {
        "src": "/images/300_pol_kafel5_b173c2.jpg",
        "alt": "Pol Kafel5 — Kafel namunasi",
        "width": 1024,
        "height": 1024
      }
    ],
    "sizes": [
      {
        "widthCm": 30,
        "lengthCm": 60,
        "thicknessMm": 9,
        "piecesPerBox": 8
      }
    ],
    "tile_length": 60,
    "tile_width": 30,
    "thickness": 9,
    "box_pieces": 8,
    "box_m2": 1.44,
    "price": 65000,
    "cost_price": 55000,
    "costPrice": 55000,
    "unit": "m2",
    "priceUnit": "m2",
    "stock": 1440,
    "weightKg": 6.944444444444445,
    "discountType": null,
    "discountValue": 0,
    "orderConfig": {
      "quantityModes": [
        "direct",
        "pieces"
      ],
      "defaultQuantityMode": "direct",
      "linearLengthField": "lengthCm"
    },
    "discountStartsAt": null,
    "discountEndsAt": null,
    "discountIsActive": false,
    "isVisible": true,
    "isFeatured": false,
    "createdAt": "2026-11-04"
  },
  {
    "id": "df4efa1e-acd5-4cfa-be06-17b007801e45",
    "artikul": "C",
    "name": "Pol Kafel6",
    "slug": "pol-kafel6-c",
    "category": "kafel",
    "categories": [
      "kafel"
    ],
    "description": "Pol Kafel6 — sort 1. Kafel toifasidagi yuqori sifatli mahsulot. O‘lchami: 60 × 30 sm. Omborda mavjud: 1440 m².",
    "images": [
      {
        "src": "/images/c_pol_kafel6_df4efa.jpg",
        "alt": "Pol Kafel6 — Kafel namunasi",
        "width": 1024,
        "height": 1024
      }
    ],
    "sizes": [
      {
        "widthCm": 30,
        "lengthCm": 60,
        "thicknessMm": 9,
        "piecesPerBox": 8
      }
    ],
    "tile_length": 60,
    "tile_width": 30,
    "thickness": 9,
    "box_pieces": 8,
    "box_m2": 1.44,
    "price": 153905.96,
    "cost_price": 142067.04,
    "costPrice": 142067.04,
    "unit": "m2",
    "priceUnit": "m2",
    "stock": 1440,
    "weightKg": 6.944444444444445,
    "discountType": null,
    "discountValue": 0,
    "orderConfig": {
      "quantityModes": [
        "direct",
        "pieces"
      ],
      "defaultQuantityMode": "direct",
      "linearLengthField": "lengthCm"
    },
    "discountStartsAt": null,
    "discountEndsAt": null,
    "discountIsActive": false,
    "isVisible": true,
    "isFeatured": false,
    "createdAt": "2026-11-04"
  },
  {
    "id": "4d4bf917-b714-4cfa-b870-c1b3105ae684",
    "artikul": "STX-0001",
    "name": "Sim",
    "slug": "sim-stx0001",
    "category": "xomashyo",
    "categories": [
      "xomashyo"
    ],
    "description": "Sim — sort 1. Xomashyo toifasidagi yuqori sifatli mahsulot. Omborda mavjud: 87 kg.",
    "images": [
      {
        "src": "/images/stx-0001_sim_4d4bf9.jpg",
        "alt": "Sim — Xomashyo namunasi",
        "width": 1024,
        "height": 1024
      }
    ],
    "sizes": [],
    "tile_length": null,
    "tile_width": null,
    "thickness": null,
    "box_pieces": null,
    "box_m2": null,
    "price": 18000,
    "cost_price": 10000,
    "costPrice": 10000,
    "unit": "kg",
    "priceUnit": "kg",
    "stock": 87,
    "weightKg": null,
    "discountType": null,
    "discountValue": 0,
    "orderConfig": {
      "quantityModes": [
        "direct"
      ],
      "defaultQuantityMode": "direct",
      "linearLengthField": "lengthCm"
    },
    "discountStartsAt": null,
    "discountEndsAt": null,
    "discountIsActive": false,
    "isVisible": true,
    "isFeatured": false,
    "createdAt": "2026-11-04"
  },
  {
    "id": "03b1e30b-4aeb-4981-9fd0-a1a8c18c542c",
    "artikul": "ESK905",
    "name": "Epa Esk",
    "slug": "epa-esk-esk905",
    "category": "xomashyo",
    "categories": [
      "xomashyo"
    ],
    "description": "Epa Esk — sort 1. Xomashyo toifasidagi yuqori sifatli mahsulot. Omborda mavjud: 100 dona.",
    "images": [
      {
        "src": "/images/esk905_epa_esk_03b1e3.jpg",
        "alt": "Epa Esk — Xomashyo namunasi",
        "width": 1024,
        "height": 1024
      }
    ],
    "sizes": [],
    "tile_length": null,
    "tile_width": null,
    "thickness": null,
    "box_pieces": null,
    "box_m2": null,
    "price": 35000,
    "cost_price": 25498,
    "costPrice": 25498,
    "unit": "piece",
    "priceUnit": "piece",
    "stock": 100,
    "weightKg": 0.1,
    "discountType": null,
    "discountValue": 0,
    "orderConfig": {
      "quantityModes": [
        "pieces"
      ],
      "defaultQuantityMode": "pieces",
      "linearLengthField": "lengthCm"
    },
    "discountStartsAt": null,
    "discountEndsAt": null,
    "discountIsActive": false,
    "isVisible": true,
    "isFeatured": false,
    "createdAt": "2026-11-04"
  },
  {
    "id": "df60598c-ce54-4e32-a5e4-bace3b39efa6",
    "artikul": "ESK904",
    "name": "Epa Esk",
    "slug": "epa-esk-esk904",
    "category": "xomashyo",
    "categories": [
      "xomashyo"
    ],
    "description": "Epa Esk — sort 1. Xomashyo toifasidagi yuqori sifatli mahsulot. Omborda mavjud: 99 dona.",
    "images": [
      {
        "src": "/images/esk904_epa_esk_df6059.jpg",
        "alt": "Epa Esk — Xomashyo namunasi",
        "width": 1024,
        "height": 1024
      }
    ],
    "sizes": [],
    "tile_length": null,
    "tile_width": null,
    "thickness": null,
    "box_pieces": null,
    "box_m2": null,
    "price": 60000,
    "cost_price": 50000,
    "costPrice": 50000,
    "unit": "piece",
    "priceUnit": "piece",
    "stock": 99,
    "weightKg": 0.07,
    "discountType": null,
    "discountValue": 0,
    "orderConfig": {
      "quantityModes": [
        "pieces"
      ],
      "defaultQuantityMode": "pieces",
      "linearLengthField": "lengthCm"
    },
    "discountStartsAt": null,
    "discountEndsAt": null,
    "discountIsActive": false,
    "isVisible": true,
    "isFeatured": false,
    "createdAt": "2026-11-04"
  },
  {
    "id": "9abd89b1-0943-40de-83e7-b5517d482d65",
    "artikul": "ESK902",
    "name": "Epa Esk",
    "slug": "epa-esk-esk902",
    "category": "xomashyo",
    "categories": [
      "xomashyo"
    ],
    "description": "Epa Esk — sort 1. Xomashyo toifasidagi yuqori sifatli mahsulot. Omborda mavjud: 87 dona.",
    "images": [
      {
        "src": "/images/esk902_epa_esk_9abd89.jpg",
        "alt": "Epa Esk — Xomashyo namunasi",
        "width": 1024,
        "height": 1024
      }
    ],
    "sizes": [],
    "tile_length": null,
    "tile_width": null,
    "thickness": null,
    "box_pieces": null,
    "box_m2": null,
    "price": 35000,
    "cost_price": 25000,
    "costPrice": 25000,
    "unit": "piece",
    "priceUnit": "piece",
    "stock": 87,
    "weightKg": 0.07,
    "discountType": null,
    "discountValue": 0,
    "orderConfig": {
      "quantityModes": [
        "pieces"
      ],
      "defaultQuantityMode": "pieces",
      "linearLengthField": "lengthCm"
    },
    "discountStartsAt": null,
    "discountEndsAt": null,
    "discountIsActive": false,
    "isVisible": true,
    "isFeatured": false,
    "createdAt": "2026-11-04"
  },
  {
    "id": "xk-ready:3a455e4b-95d8-4310-b6dc-b329350fd672:cutting",
    "artikul": "STX-0002",
    "name": "Kesish — X K",
    "slug": "kesish-x-k-stx0002",
    "category": "tayyor-mahsulot",
    "categories": [
      "tayyor-mahsulot"
    ],
    "description": "Kesish — X K — Kesish. Tayyor mahsulot toifasidagi yuqori sifatli mahsulot. Omborda mavjud: 1000 m.",
    "images": [
      {
        "src": "/images/products/placeholder.jpg",
        "alt": "Kesish — X K — Tayyor mahsulot namunasi",
        "width": 1024,
        "height": 1024
      }
    ],
    "sizes": [],
    "tile_length": null,
    "tile_width": null,
    "thickness": null,
    "box_pieces": null,
    "box_m2": null,
    "price": 20000,
    "cost_price": 10000,
    "costPrice": 10000,
    "unit": "linear_m",
    "priceUnit": "linear_m",
    "stock": 1000,
    "weightKg": 1,
    "discountType": null,
    "discountValue": 0,
    "orderConfig": {
      "quantityModes": [
        "direct"
      ],
      "defaultQuantityMode": "direct",
      "linearLengthField": "lengthCm"
    },
    "discountStartsAt": null,
    "discountEndsAt": null,
    "discountIsActive": false,
    "isVisible": true,
    "isFeatured": false,
    "createdAt": "2026-11-04"
  },
  {
    "id": "xk-ready:ac7d4f7a-525f-484a-aa07-a7c378f847b1:cutting",
    "artikul": "STX-0003",
    "name": "Kesish — X K",
    "slug": "kesish-x-k-stx0003",
    "category": "tayyor-mahsulot",
    "categories": [
      "tayyor-mahsulot"
    ],
    "description": "Kesish — X K — Kesish. Tayyor mahsulot toifasidagi yuqori sifatli mahsulot.",
    "images": [
      {
        "src": "/images/products/placeholder.jpg",
        "alt": "Kesish — X K — Tayyor mahsulot namunasi",
        "width": 1024,
        "height": 1024
      }
    ],
    "sizes": [],
    "tile_length": null,
    "tile_width": null,
    "thickness": null,
    "box_pieces": null,
    "box_m2": null,
    "price": null,
    "cost_price": 0,
    "costPrice": 0,
    "unit": "linear_m",
    "priceUnit": "linear_m",
    "stock": 0,
    "weightKg": null,
    "discountType": null,
    "discountValue": 0,
    "orderConfig": {
      "quantityModes": [
        "direct"
      ],
      "defaultQuantityMode": "direct",
      "linearLengthField": "lengthCm"
    },
    "discountStartsAt": null,
    "discountEndsAt": null,
    "discountIsActive": false,
    "isVisible": true,
    "isFeatured": false,
    "createdAt": "2026-11-04"
  },
  {
    "id": "4f53929c-a6e5-4feb-a4d9-6ac2a2120248",
    "artikul": "AKFIX001",
    "name": "Akfix Kley",
    "slug": "akfix-kley-akfix001",
    "category": "xomashyo",
    "categories": [
      "xomashyo"
    ],
    "description": "Akfix Kley — #500. Xomashyo toifasidagi yuqori sifatli mahsulot.",
    "images": [
      {
        "src": "/images/akfix001_akfix_kley_4f5392.jpg",
        "alt": "Akfix Kley — Xomashyo namunasi",
        "width": 1024,
        "height": 1024
      }
    ],
    "sizes": [],
    "tile_length": null,
    "tile_width": null,
    "thickness": null,
    "box_pieces": null,
    "box_m2": null,
    "price": 60000,
    "cost_price": 50000,
    "costPrice": 50000,
    "unit": "piece",
    "priceUnit": "piece",
    "stock": 0,
    "weightKg": 0.7,
    "discountType": null,
    "discountValue": 0,
    "orderConfig": {
      "quantityModes": [
        "pieces"
      ],
      "defaultQuantityMode": "pieces",
      "linearLengthField": "lengthCm"
    },
    "discountStartsAt": null,
    "discountEndsAt": null,
    "discountIsActive": false,
    "isVisible": true,
    "isFeatured": false,
    "createdAt": "2026-11-04"
  },
  {
    "id": "936c8e10-9ab4-4b3a-89dc-a48f6ae709e0",
    "artikul": "AKFIX002",
    "name": "Akfix Kley",
    "slug": "akfix-kley-akfix002",
    "category": "xomashyo",
    "categories": [
      "xomashyo"
    ],
    "description": "Akfix Kley — #400. Xomashyo toifasidagi yuqori sifatli mahsulot. Omborda mavjud: 99 dona.",
    "images": [
      {
        "src": "/images/akfix002_akfix_kley_936c8e.jpg",
        "alt": "Akfix Kley — Xomashyo namunasi",
        "width": 1024,
        "height": 1024
      }
    ],
    "sizes": [],
    "tile_length": null,
    "tile_width": null,
    "thickness": null,
    "box_pieces": null,
    "box_m2": null,
    "price": 50000,
    "cost_price": 40000,
    "costPrice": 40000,
    "unit": "piece",
    "priceUnit": "piece",
    "stock": 99,
    "weightKg": 0.7,
    "discountType": null,
    "discountValue": 0,
    "orderConfig": {
      "quantityModes": [
        "pieces"
      ],
      "defaultQuantityMode": "pieces",
      "linearLengthField": "lengthCm"
    },
    "discountStartsAt": null,
    "discountEndsAt": null,
    "discountIsActive": false,
    "isVisible": true,
    "isFeatured": false,
    "createdAt": "2026-11-04"
  },
  {
    "id": "c47b4d05-0e10-4a27-9c43-564f03674128",
    "artikul": "AFKIX003",
    "name": "Akfix Kley",
    "slug": "akfix-kley-afkix003",
    "category": "xomashyo",
    "categories": [
      "xomashyo"
    ],
    "description": "Akfix Kley — #200. Xomashyo toifasidagi yuqori sifatli mahsulot. Omborda mavjud: 99 dona.",
    "images": [
      {
        "src": "/images/afkix003_akfix_kley_c47b4d.jpg",
        "alt": "Akfix Kley — Xomashyo namunasi",
        "width": 1024,
        "height": 1024
      }
    ],
    "sizes": [],
    "tile_length": null,
    "tile_width": null,
    "thickness": null,
    "box_pieces": null,
    "box_m2": null,
    "price": 30000,
    "cost_price": 20000,
    "costPrice": 20000,
    "unit": "piece",
    "priceUnit": "piece",
    "stock": 99,
    "weightKg": 0.3,
    "discountType": null,
    "discountValue": 0,
    "orderConfig": {
      "quantityModes": [
        "pieces"
      ],
      "defaultQuantityMode": "pieces",
      "linearLengthField": "lengthCm"
    },
    "discountStartsAt": null,
    "discountEndsAt": null,
    "discountIsActive": false,
    "isVisible": true,
    "isFeatured": false,
    "createdAt": "2026-11-04"
  },
  {
    "id": "3dfb2055-fc70-42ec-ba23-97dc6c190bf4",
    "artikul": "BEN001",
    "name": "Benfix Kley",
    "slug": "benfix-kley-ben001",
    "category": "xomashyo",
    "categories": [
      "xomashyo"
    ],
    "description": "Benfix Kley — sort 1. Xomashyo toifasidagi yuqori sifatli mahsulot. Omborda mavjud: 100 dona.",
    "images": [
      {
        "src": "/images/ben001_benfix_kley_3dfb20.jpg",
        "alt": "Benfix Kley — Xomashyo namunasi",
        "width": 1024,
        "height": 1024
      }
    ],
    "sizes": [],
    "tile_length": null,
    "tile_width": null,
    "thickness": null,
    "box_pieces": null,
    "box_m2": null,
    "price": 50000,
    "cost_price": 40000,
    "costPrice": 40000,
    "unit": "piece",
    "priceUnit": "piece",
    "stock": 100,
    "weightKg": 0.5,
    "discountType": null,
    "discountValue": 0,
    "orderConfig": {
      "quantityModes": [
        "pieces"
      ],
      "defaultQuantityMode": "pieces",
      "linearLengthField": "lengthCm"
    },
    "discountStartsAt": null,
    "discountEndsAt": null,
    "discountIsActive": false,
    "isVisible": true,
    "isFeatured": false,
    "createdAt": "2026-11-04"
  },
  {
    "id": "e336b0f1-24f7-4478-b812-f896d4b51025",
    "artikul": "A.D001",
    "name": "Almazniy Disk",
    "slug": "almazniy-disk-ad001",
    "category": "xomashyo",
    "categories": [
      "xomashyo"
    ],
    "description": "Almazniy Disk — sort 1. Xomashyo toifasidagi yuqori sifatli mahsulot. Omborda mavjud: 100 dona.",
    "images": [
      {
        "src": "/images/a_d001_almazniy_disk_e336b0.jpg",
        "alt": "Almazniy Disk — Xomashyo namunasi",
        "width": 1024,
        "height": 1024
      }
    ],
    "sizes": [],
    "tile_length": null,
    "tile_width": null,
    "thickness": null,
    "box_pieces": null,
    "box_m2": null,
    "price": 75000,
    "cost_price": 60000,
    "costPrice": 60000,
    "unit": "piece",
    "priceUnit": "piece",
    "stock": 100,
    "weightKg": 1,
    "discountType": null,
    "discountValue": 0,
    "orderConfig": {
      "quantityModes": [
        "pieces"
      ],
      "defaultQuantityMode": "pieces",
      "linearLengthField": "lengthCm"
    },
    "discountStartsAt": null,
    "discountEndsAt": null,
    "discountIsActive": false,
    "isVisible": true,
    "isFeatured": false,
    "createdAt": "2026-11-04"
  },
  {
    "id": "cd365d9d-2bd8-4243-9518-060f03fe7b9f",
    "artikul": "D.K001",
    "name": "Dermax Kley",
    "slug": "dermax-kley-dk001",
    "category": "xomashyo",
    "categories": [
      "xomashyo"
    ],
    "description": "Dermax Kley — sort 1. Xomashyo toifasidagi yuqori sifatli mahsulot. Omborda mavjud: 22 dona.",
    "images": [
      {
        "src": "/images/d_k001_dermax_kley_jpg_cd365d.jpg",
        "alt": "Dermax Kley — Xomashyo namunasi",
        "width": 1024,
        "height": 1024
      }
    ],
    "sizes": [],
    "tile_length": null,
    "tile_width": null,
    "thickness": null,
    "box_pieces": null,
    "box_m2": null,
    "price": 50000,
    "cost_price": 40000,
    "costPrice": 40000,
    "unit": "piece",
    "priceUnit": "piece",
    "stock": 22,
    "weightKg": 0.5,
    "discountType": null,
    "discountValue": 0,
    "orderConfig": {
      "quantityModes": [
        "pieces"
      ],
      "defaultQuantityMode": "pieces",
      "linearLengthField": "lengthCm"
    },
    "discountStartsAt": null,
    "discountEndsAt": null,
    "discountIsActive": false,
    "isVisible": true,
    "isFeatured": false,
    "createdAt": "2026-11-04"
  },
  {
    "id": "f992cdf5-4718-4be0-b21e-a2a1e52ea801",
    "artikul": "E.D001",
    "name": "Epa Disk",
    "slug": "epa-disk-ed001",
    "category": "xomashyo",
    "categories": [
      "xomashyo"
    ],
    "description": "Epa Disk — sort 1. Xomashyo toifasidagi yuqori sifatli mahsulot. Omborda mavjud: 30 dona.",
    "images": [
      {
        "src": "/images/e_d001_epa_disk_f992cd.jpg",
        "alt": "Epa Disk — Xomashyo namunasi",
        "width": 1024,
        "height": 1024
      }
    ],
    "sizes": [],
    "tile_length": null,
    "tile_width": null,
    "thickness": null,
    "box_pieces": null,
    "box_m2": null,
    "price": 45000,
    "cost_price": 35000,
    "costPrice": 35000,
    "unit": "piece",
    "priceUnit": "piece",
    "stock": 30,
    "weightKg": 0.1,
    "discountType": null,
    "discountValue": 0,
    "orderConfig": {
      "quantityModes": [
        "pieces"
      ],
      "defaultQuantityMode": "pieces",
      "linearLengthField": "lengthCm"
    },
    "discountStartsAt": null,
    "discountEndsAt": null,
    "discountIsActive": false,
    "isVisible": true,
    "isFeatured": false,
    "createdAt": "2026-11-04"
  },
  {
    "id": "68be542a-4da2-406f-892e-aa3fbd7c2dea",
    "artikul": "Z.D001",
    "name": "Zen.disk",
    "slug": "zen-disk-zd001",
    "category": "xomashyo",
    "categories": [
      "xomashyo"
    ],
    "description": "Zen.disk — sort 1. Xomashyo toifasidagi yuqori sifatli mahsulot. Omborda mavjud: 25 dona.",
    "images": [
      {
        "src": "/images/z_d001_zen_disk_68be54.jpg",
        "alt": "Zen.disk — Xomashyo namunasi",
        "width": 1024,
        "height": 1024
      }
    ],
    "sizes": [],
    "tile_length": null,
    "tile_width": null,
    "thickness": null,
    "box_pieces": null,
    "box_m2": null,
    "price": 35000,
    "cost_price": 25000,
    "costPrice": 25000,
    "unit": "piece",
    "priceUnit": "piece",
    "stock": 25,
    "weightKg": 0.1,
    "discountType": null,
    "discountValue": 0,
    "orderConfig": {
      "quantityModes": [
        "pieces"
      ],
      "defaultQuantityMode": "pieces",
      "linearLengthField": "lengthCm"
    },
    "discountStartsAt": null,
    "discountEndsAt": null,
    "discountIsActive": false,
    "isVisible": true,
    "isFeatured": false,
    "createdAt": "2026-11-04"
  }
];

const isTestEnv = typeof globalThis !== 'undefined' && Boolean(globalThis.IS_REACT_ACT_ENVIRONMENT);
export const products = isTestEnv ? testProducts : realProducts;
export default products;
