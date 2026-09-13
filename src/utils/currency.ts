// src/utils/currency.ts
export const formatCurrency = (amount: number): string => {
  const formattedNumber = new Intl.NumberFormat('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)

  return `${formattedNumber} Bs.`
}