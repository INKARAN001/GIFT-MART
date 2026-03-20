/**
 * Build absolute image URL for product images (handles base path and spaces in filenames).
 */
export function getImageSrc(imagePath) {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '') || '';
    const pathPart = (imagePath.startsWith('/') ? imagePath.slice(1) : imagePath)
        .split('/')
        .map(p => encodeURIComponent(p))
        .join('/');
    return (base ? base + '/' : '/') + pathPart;
}
