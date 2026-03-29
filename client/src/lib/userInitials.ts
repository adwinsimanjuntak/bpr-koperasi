export function userInitials(user: { name: string; email: string } | null | undefined): string {
  if (!user) return "?";
  const parts = user.name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const a = parts[0][0];
    const b = parts[parts.length - 1][0];
    if (a && b) return (a + b).toUpperCase();
  }
  const single = parts[0];
  if (single && single.length >= 2) return single.slice(0, 2).toUpperCase();
  if (single) return single[0].toUpperCase();
  const e = user.email.trim();
  if (e.length >= 2) return e.slice(0, 2).toUpperCase();
  return e[0]?.toUpperCase() ?? "?";
}
