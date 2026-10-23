const isStockAmount = (value) => Number.isFinite(value) && value >= 0;

export function normalizeStockProducts(products = [], initialProducts = []) {
  if (!Array.isArray(products)) return [];
  const originals = Array.isArray(initialProducts) ? initialProducts : [];

  return products.map((product) => {
    if (!product || typeof product !== "object") return product;
    if (isStockAmount(product.stockReference)) return { ...product };

    const quantity = isStockAmount(product.quantity) ? product.quantity : 0;
    const initial = originals.find((item) => item?.id === product.id && item.unit === product.unit);
    const stockReference = isStockAmount(initial?.quantity)
      ? Math.max(quantity, initial.quantity)
      : quantity;

    return { ...product, stockReference };
  });
}

export function getLowStockProducts(products = []) {
  if (!Array.isArray(products)) return [];

  return products
    .filter((product) => product && isStockAmount(product.quantity))
    .flatMap((product) => {
      const { id, name, unit, quantity } = product;
      const reference = isStockAmount(product.stockReference) ? product.stockReference : quantity;
      const ratio = reference > 0 ? quantity / reference : 0;
      const percentage = ratio * 100;
      // Ignore machine rounding at exactly 30%, such as 3.09 out of 10.3.
      const belowThreshold = reference > 0 && ratio < 0.3 && 0.3 - ratio > Number.EPSILON * 0.3;

      if (quantity !== 0 && !belowThreshold) return [];
      return [{ key: id, name, unit, quantity, percentage }];
    })
    .sort((a, b) => a.percentage - b.percentage || String(a.name ?? "").localeCompare(String(b.name ?? ""), "uz"));
}
