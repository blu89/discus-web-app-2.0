import { number, expirationDate, cvv } from 'card-validator';

export const validateCard = (cardData) => {
  const errors = {};

  // Validate card number
  const numberValidation = number(cardData.cardNumber);
  if (!numberValidation.isValid) {
    errors.cardNumber = 'Invalid card number';
  }

  // Validate cardholder name
  if (!cardData.cardName || cardData.cardName.trim().length < 3) {
    errors.cardName = 'Cardholder name must be at least 3 characters';
  }

  // Validate expiry date (MM/YY format)
  if (!cardData.cardExpiry || !/^\d{2}\/\d{2}$/.test(cardData.cardExpiry)) {
    errors.cardExpiry = 'Expiry date must be in MM/YY format';
  } else {
    const expiryValidation = expirationDate(cardData.cardExpiry);
    if (!expiryValidation.isValid) {
      errors.cardExpiry = 'Card has expired or invalid expiry date';
    }
  }

  // Validate CVV
  const cvvValidation = cvv(cardData.cardCVV);
  if (!cvvValidation.isValid) {
    errors.cardCVV = 'Invalid CVV (3-4 digits)';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Format card number with spaces (e.g., 4111 1111 1111 1111)
export const formatCardNumber = (value) => {
  return value.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim();
};

// Format expiry date (only allow MM/YY format)
export const formatExpiryDate = (value) => {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length === 0) return '';
  if (cleaned.length <= 2) return cleaned;
  return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
};

// Format CVV (only numbers)
export const formatCVV = (value) => {
  return value.replace(/\D/g, '').slice(0, 4);
};

// Get card type from card number
export const getCardType = (cardNumber) => {
  const cleaned = cardNumber.replace(/\s+/g, '');
  
  if (/^4[0-9]{12}(?:[0-9]{3})?$/.test(cleaned)) return 'Visa';
  if (/^5[1-5][0-9]{14}$/.test(cleaned)) return 'Mastercard';
  if (/^3[47][0-9]{13}$/.test(cleaned)) return 'American Express';
  if (/^6(?:011|5[0-9]{2})[0-9]{12}$/.test(cleaned)) return 'Discover';
  
  return 'Unknown';
};
