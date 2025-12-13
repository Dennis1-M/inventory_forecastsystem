// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return "Email is required";
  if (!emailRegex.test(email)) return "Please enter a valid email";
  return null;
};

// Password validation
export const validatePassword = (password, minLength = 6) => {
  if (!password) return "Password is required";
  if (password.length < minLength) return `Password must be at least ${minLength} characters`;
  return null;
};

// Name validation
export const validateName = (name) => {
  if (!name) return "Name is required";
  if (name.trim().length < 2) return "Name must be at least 2 characters";
  if (name.length > 100) return "Name must be less than 100 characters";
  return null;
};

// SKU validation
export const validateSKU = (sku) => {
  if (!sku) return "SKU is required";
  if (sku.length > 50) return "SKU must be less than 50 characters";
  return null;
};

// Price validation
export const validatePrice = (price) => {
  if (price === null || price === undefined || price === "") return "Price is required";
  const numPrice = parseFloat(price);
  if (isNaN(numPrice)) return "Price must be a number";
  if (numPrice < 0) return "Price cannot be negative";
  return null;
};

// Stock validation
export const validateStock = (stock) => {
  if (stock === null || stock === undefined || stock === "") return "Stock is required";
  const numStock = parseInt(stock, 10);
  if (isNaN(numStock)) return "Stock must be a number";
  if (numStock < 0) return "Stock cannot be negative";
  return null;
};

// Generic field validator
export const validateField = (field, value, rules = {}) => {
  const validators = {
    email: validateEmail,
    password: validatePassword,
    name: validateName,
    sku: validateSKU,
    price: validatePrice,
    stock: validateStock,
    required: (val) => !val || !val.toString().trim() ? `${field} is required` : null,
    minLength: (val) => val.length < (rules.minLength || 0) ? `Minimum ${rules.minLength} characters required` : null,
    maxLength: (val) => val.length > (rules.maxLength || Infinity) ? `Maximum ${rules.maxLength} characters allowed` : null,
  };

  if (validators[rules.type || field]) {
    return validators[rules.type || field](value);
  }

  return null;
};

// Validate entire form object
export const validateForm = (formData, validationRules) => {
  const errors = {};
  
  Object.keys(validationRules).forEach((field) => {
    const rules = validationRules[field];
    const value = formData[field];
    
    if (Array.isArray(rules)) {
      for (const rule of rules) {
        const error = validateField(field, value, rule);
        if (error) {
          errors[field] = error;
          break;
        }
      }
    } else {
      const error = validateField(field, value, rules);
      if (error) errors[field] = error;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
