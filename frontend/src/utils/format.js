export const formatNaira = (value) => {
  const num = Number(value || 0);
  return `₦${num.toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;
};

export const formatPrice = (value, perMonth = true) =>
  `${formatNaira(value)}${perMonth ? '/mo' : ''}`;
