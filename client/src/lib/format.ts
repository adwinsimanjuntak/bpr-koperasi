export function formatRp(n: number, compact = false): string {
  if (compact && Math.abs(n) >= 1_000_000_000) {
    return `Rp ${(n / 1_000_000_000).toFixed(2)}B`;
  }
  if (compact && Math.abs(n) >= 1_000_000) {
    return `Rp ${(n / 1_000_000).toFixed(1)}M`;
  }
  return `Rp ${n.toLocaleString("id-ID", { maximumFractionDigits: 0 })}`;
}

export function formatRpFull(n: number): string {
  return `Rp ${n.toLocaleString("id-ID", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function computeLoanPreview(principal: number, annualPct: number, tenorMonths: number) {
  const total = principal * (1 + (annualPct / 100) * (tenorMonths / 12));
  const monthly = total / tenorMonths;
  const totalInterest = total - principal;
  const apr = annualPct;
  return { total, monthly, totalInterest, apr };
}
