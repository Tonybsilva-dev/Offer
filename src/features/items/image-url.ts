export function imageUrl(name: string) {
  return `/api/images/${encodeURIComponent(name)}`;
}
