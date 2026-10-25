// src/utils/formatCurrency.js
// Standard Indian Rupee (INR) formatting utility for Craftly

export const formatINR = (amount) => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '₹0';
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};
