/** Total repayment: principal * (1 + (annual%/100) * (tenorMonths/12)) */
export function computeTotalRepayment(
  principal: number,
  annualInterestPercent: number,
  tenorMonths: number
): number {
  const multiplier = 1 + (annualInterestPercent / 100) * (tenorMonths / 12);
  return principal * multiplier;
}

export function computeMonthlyPayment(totalRepayment: number, tenorMonths: number): number {
  return totalRepayment / tenorMonths;
}
