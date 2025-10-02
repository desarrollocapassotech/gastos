
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatCompactCurrency = (amount: number): string => {
  const absoluteAmount = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (absoluteAmount >= 1_000_000) {
    const compactValue = absoluteAmount / 1_000_000;
    const decimals = compactValue >= 10 ? 0 : 1;
    const formatted = new Intl.NumberFormat('es-AR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(compactValue);
    return `${sign}$${formatted}M`;
  }

  if (absoluteAmount >= 1_000) {
    const compactValue = absoluteAmount / 1_000;
    const decimals = compactValue >= 10 ? 0 : 1;
    const formatted = new Intl.NumberFormat('es-AR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(compactValue);
    return `${sign}$${formatted}K`;
  }

  const formatted = new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  }).format(absoluteAmount);

  return `${sign}$${formatted}`;
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

  const commaIndex = cleanedValue.indexOf(',');
  const hasDecimalSeparator = commaIndex !== -1;
  const hasTrailingComma = hasDecimalSeparator && commaIndex === cleanedValue.length - 1;

  const integerRaw = hasDecimalSeparator
    ? cleanedValue.slice(0, commaIndex)
    : cleanedValue;
  const decimalRaw = hasDecimalSeparator ? cleanedValue.slice(commaIndex + 1) : '';

  const integerDigits = integerRaw.replace(/[^\d]/g, '');
  const decimalDigits = decimalRaw.replace(/\D/g, '');

  if (!integerDigits && !decimalDigits) {
    return hasTrailingComma ? '0,' : '';
  }

  const normalizedInteger = integerDigits.replace(/^0+(?=\d)/, '');
  const formattedInteger = (normalizedInteger || '0').replace(THOUSANDS_REGEX, '.');

  const normalizedDecimal = decimalDigits.slice(0, 2);

  if (normalizedDecimal) {
    return `${formattedInteger},${normalizedDecimal}`;
  }

  if (hasTrailingComma) {
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
