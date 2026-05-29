export function formatDate(isoDate: string): string {
  return isoDate.split("-").reverse().join("-");
}

export function formatCurrency(amount: number): string {
  return amount.toLocaleString("es-CL", {
    style: "currency",
    currency: "CLP",
  });
}
