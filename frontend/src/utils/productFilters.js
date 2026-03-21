/**
 * Filter mock products by search keyword and filters (category, customizable, maxPrice).
 * Used when API returns no/invalid results so search and filter still work.
 */
export function filterMockProducts(products, searchTerm, filters) {
    let list = [...products];
    const term = (searchTerm || '').trim().toLowerCase();
    if (term) {
        list = list.filter(p => {
            const name = (p.name || '').toLowerCase();
            const desc = (p.shortDescription || p.description || '').toLowerCase();
            const tags = (p.tags || []).join(' ').toLowerCase();
            const cat = (p.category || '').toLowerCase();
            return name.includes(term) || desc.includes(term) || tags.includes(term) || cat.includes(term);
        });
    }
    if (filters.categories && filters.categories.length > 0) {
        list = list.filter(p => filters.categories.includes(p.category));
    }
    if (filters.customizableOnly) {
        list = list.filter(p => p.customizable === true);
    }
    if (filters.maxPrice != null) {
        list = list.filter(p => (p.price || 0) <= filters.maxPrice);
    }
    return list;
}
