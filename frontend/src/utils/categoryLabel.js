/** Display label for a category name (matches product.category in DB). */
export function displayCategoryLabel(name) {
  if (name == null || name === '') return '';
  if (name === 'Bouquet') return 'Bouquets';
  if (name === 'Boquet') return 'Bouquets';
  return name;
}
