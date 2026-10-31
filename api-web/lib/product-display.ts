/** Product image & category display helpers for the storefront */

export function getCategoryEmoji(categoryName: string): string {
  const n = categoryName.toLowerCase();
  if (n.includes('elect') || n.includes('mobile') || n.includes('laptop')) return '📱';
  if (n.includes('cloth') || n.includes('fashion')) return '👕';
  if (n.includes('food') || n.includes('grocery')) return '🍔';
  if (n.includes('home')) return '🏠';
  if (n.includes('beauty')) return '💄';
  if (n.includes('sport')) return '⚽';
  return '📦';
}

export function getProductImageUrl(images?: string[] | null): string | null {
  if (!images?.length) return null;
  const src = images.find((u) => u && u.trim());
  if (!src) return null;
  if (src.startsWith('http')) return src;
  if (src.startsWith('/')) return src;
  return `/${src.replace(/^\//, '')}`;
}

export function dedupeCategories<T extends { id: string; name: string }>(categories: T[]): T[] {
  const seen = new Set<string>();
  return categories.filter((c) => {
    const key = c.id || c.name.trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function getProductInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}
