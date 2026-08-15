export function escapeHtml(s: unknown): string {
  return String(s).replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string)
  );
}

export function stars(r: number): string {
  const n = Math.max(0, Math.min(5, Math.round(r)));
  return "★".repeat(n) + "☆".repeat(5 - n);
}
