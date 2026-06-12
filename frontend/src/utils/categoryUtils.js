export const normalizeSlug = (value = '') =>
  String(value || '').toLowerCase().trim().replace(/[_\s]+/g, '-');

export const formatCategoryLabel = (value = '') =>
  String(value || '')
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

export const buildCategoryInfo = (category, products = []) => {
  if (!category) return null;

  const slug = normalizeSlug(category);
  const matchingProducts = products.filter((product) => normalizeSlug(product.category) === slug);
  const backendName = matchingProducts.find((product) => product.category)?.category || category;
  const count = matchingProducts.length;

  return {
    name: formatCategoryLabel(backendName) || 'Products',
    tagline: count > 0 ? `${count} product${count === 1 ? '' : 's'} available` : 'Browse products in this category',
  };
};

export const buildSubcategoryInfo = (category, subcategory, products = []) => {
  if (!category || !subcategory) return null;

  const categorySlug = normalizeSlug(category);
  const subcategorySlug = normalizeSlug(subcategory);
  const matchingProducts = products.filter(
    (product) =>
      normalizeSlug(product.category) === categorySlug &&
      normalizeSlug(product.subcategory) === subcategorySlug
  );
  const backendName = matchingProducts.find((product) => product.subcategory)?.subcategory || subcategory;
  const count = matchingProducts.length;

  return {
    name: formatCategoryLabel(backendName) || 'Products',
    tagline: count > 0 ? `${count} product${count === 1 ? '' : 's'} available` : 'Browse products in this subcategory',
  };
};
