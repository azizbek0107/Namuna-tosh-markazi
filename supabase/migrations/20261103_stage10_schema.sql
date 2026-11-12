-- ==============================================================================
-- NAMUNA TOSH MARKAZI — STAGE 10: DATABASE SCHEMA & STORAGE POLICIES
-- ==============================================================================

-- 1. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
  price NUMERIC(12, 2) CHECK (price >= 0),
  price_unit TEXT NOT NULL DEFAULT 'm2' CHECK (price_unit IN ('piece', 'm2', 'linear_m')),
  is_visible BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  order_config JSONB DEFAULT '{"quantityModes": ["direct", "pieces"], "defaultQuantityMode": "direct", "linearLengthField": "lengthCm"}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. PRODUCT MULTI-CATEGORIES
CREATE TABLE IF NOT EXISTS public.product_categories (
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, category_id)
);

-- 4. PRODUCT SIZES TABLE
CREATE TABLE IF NOT EXISTS public.product_sizes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  width_cm NUMERIC(8, 2) NOT NULL CHECK (width_cm > 0),
  length_cm NUMERIC(8, 2) NOT NULL CHECK (length_cm > 0),
  thickness_mm NUMERIC(8, 2) NOT NULL DEFAULT 0 CHECK (thickness_mm >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. PRODUCT IMAGES TABLE
CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  width INT,
  height INT,
  display_order INT NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. DISCOUNTS TABLE
CREATE TABLE IF NOT EXISTS public.discounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT UNIQUE NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC(12, 2) NOT NULL CHECK (discount_value > 0),
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. SITE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- ── Categories Policies ──
CREATE POLICY "Public can view visible categories"
  ON public.categories FOR SELECT
  USING (is_visible = true OR public.is_admin());

CREATE POLICY "Admins have full access to categories"
  ON public.categories FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ── Products Policies ──
CREATE POLICY "Public can view visible products"
  ON public.products FOR SELECT
  USING (is_visible = true OR public.is_admin());

CREATE POLICY "Admins have full access to products"
  ON public.products FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ── Product Categories Policies ──
CREATE POLICY "Public can view product categories"
  ON public.product_categories FOR SELECT
  USING (true);

CREATE POLICY "Admins have full access to product categories"
  ON public.product_categories FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ── Product Sizes Policies ──
CREATE POLICY "Public can view product sizes"
  ON public.product_sizes FOR SELECT
  USING (true);

CREATE POLICY "Admins have full access to product sizes"
  ON public.product_sizes FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ── Product Images Policies ──
CREATE POLICY "Public can view product images"
  ON public.product_images FOR SELECT
  USING (true);

CREATE POLICY "Admins have full access to product images"
  ON public.product_images FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ── Discounts Policies ──
CREATE POLICY "Public can view active discounts"
  ON public.discounts FOR SELECT
  USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins have full access to discounts"
  ON public.discounts FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ── Site Settings Policies ──
CREATE POLICY "Public can view site settings"
  ON public.site_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins have full access to site settings"
  ON public.site_settings FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ==============================================================================
-- STORAGE CONFIGURATION (Product Images Bucket)
-- ==============================================================================
-- Run these in Supabase Dashboard SQL Editor:
--
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('product-images', 'product-images', true)
-- ON CONFLICT (id) DO NOTHING;
--
-- CREATE POLICY "Public read product images"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'product-images');
--
-- CREATE POLICY "Admins upload product images"
--   ON storage.objects FOR INSERT
--   TO authenticated
--   WITH CHECK (bucket_id = 'product-images' AND public.is_admin());
--
-- CREATE POLICY "Admins delete product images"
--   ON storage.objects FOR DELETE
--   TO authenticated
--   USING (bucket_id = 'product-images' AND public.is_admin());
-- ==============================================================================

