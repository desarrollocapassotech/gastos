
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const THOUSANDS_REGEX = /\B(?=(\d{3})+(?!\d))/g;

export const formatCurrencyInput = (value: string): string => {
  if (!value) {
    return '';
  }

  const cleanedValue = value.replace(/[^\d.,]/g, '');

  if (!cleanedValue) {
    return '';
  }

  const lastSeparatorIndex = Math.max(
    cleanedValue.lastIndexOf(','),
    cleanedValue.lastIndexOf('.')
  );

  let integerPart = cleanedValue;
  let decimalPart = '';

  if (lastSeparatorIndex !== -1) {
    integerPart = cleanedValue.slice(0, lastSeparatorIndex);
    decimalPart = cleanedValue.slice(lastSeparatorIndex + 1);
  }

  const normalizedInteger = integerPart.replace(/[.,]/g, '').replace(/^0+(?=\d)/, '');
  const formattedInteger = (normalizedInteger || '0').replace(THOUSANDS_REGEX, '.');

  const normalizedDecimal = decimalPart.replace(/\D/g, '').slice(0, 2);

  if (normalizedDecimal) {
    return `${formattedInteger},${normalizedDecimal}`;
  }

  if (lastSeparatorIndex === cleanedValue.length - 1 && lastSeparatorIndex !== -1) {
    return `${formattedInteger},`;
  }

  return formattedInteger;
};

export const parseCurrencyInput = (value: string): number => {
  if (!value) {
    return Number.NaN;
  }

  const normalizedValue = value.replace(/\./g, '').replace(',', '.');
  return parseFloat(normalizedValue);
};

export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const formatMonth = (date: Date): string => {
  return date.toLocaleDateString('es-AR', {
    month: 'long',
    year: 'numeric',
  });
};
