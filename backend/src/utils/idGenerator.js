/**
 * Generate a short product ID in the format: CD024PD0
 * Format: 8 characters with random mix of uppercase letters and numbers
 */
export const generateShortId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Generate multiple unique short IDs (for batch operations)
 */
export const generateShortIds = (count = 1) => {
  const ids = new Set();
  while (ids.size < count) {
    ids.add(generateShortId());
  }
  return Array.from(ids);
};
