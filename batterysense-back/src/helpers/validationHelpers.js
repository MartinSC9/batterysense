const { ALLOWED_ROLES_REGISTER } = require('../constants');

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPassword = (password) => {
  // Mínimo 8 caracteres, al menos una mayúscula, una minúscula y un número
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

const isValidRoleForRegister = (role) => {
  return ALLOWED_ROLES_REGISTER.includes(role);
};

const validateRequiredFields = (obj, fields) => {
  const missing = fields.filter(field => !obj[field]);
  return {
    isValid: missing.length === 0,
    missing,
  };
};

const sanitizeString = (value, maxLength = 255) => {
  if (!value) return null;
  return String(value).trim().slice(0, maxLength);
};

module.exports = {
  isValidEmail,
  isValidPassword,
  isValidRoleForRegister,
  validateRequiredFields,
  sanitizeString,
};
