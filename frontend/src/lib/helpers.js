// Debounce utility for search, filters, etc
export const debounce = (func, delay = 300) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Throttle utility
export const throttle = (func, limit = 300) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

// Format date
export const formatDate = (date, format = "MM/DD/YYYY") => {
  if (!date) return "";
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");

  const formats = {
    "MM/DD/YYYY": `${month}/${day}/${year}`,
    "YYYY-MM-DD": `${year}-${month}-${day}`,
    "DD/MM/YYYY": `${day}/${month}/${year}`,
    "YYYY-MM-DD HH:MM": `${year}-${month}-${day} ${hours}:${minutes}`,
  };

  return formats[format] || formats["MM/DD/YYYY"];
};

// Deep clone object
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

// Check if objects are equal
export const isEqual = (obj1, obj2) => {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
};

// Merge objects
export const mergeObjects = (target, source) => {
  return { ...target, ...source };
};

// Array to CSV
export const arrayToCSV = (data, headers) => {
  let csv = headers.join(",") + "\n";
  data.forEach((row) => {
    const values = headers.map((header) => {
      const value = row[header];
      // Escape quotes and wrap in quotes if contains comma
      if (typeof value === "string" && value.includes(",")) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
    csv += values.join(",") + "\n";
  });
  return csv;
};

// Download CSV file
export const downloadCSV = (data, headers, filename = "export.csv") => {
  const csv = arrayToCSV(data, headers);
  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

// Get current theme
export const getTheme = () => {
  return localStorage.getItem("theme") || "light";
};

// Set theme
export const setTheme = (theme) => {
  localStorage.setItem("theme", theme);
  document.documentElement.className = theme === "dark" ? "dark" : "";
};

// Retry function with exponential backoff
export const retryAsync = async (fn, maxRetries = 3, delay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
};

// Local storage with expiry
export const setWithExpiry = (key, value, expiryMinutes = 60) => {
  const now = new Date();
  const item = {
    value: value,
    expiry: now.getTime() + expiryMinutes * 60 * 1000,
  };
  localStorage.setItem(key, JSON.stringify(item));
};

export const getWithExpiry = (key) => {
  const itemStr = localStorage.getItem(key);
  if (!itemStr) return null;

  const item = JSON.parse(itemStr);
  const now = new Date();

  if (now.getTime() > item.expiry) {
    localStorage.removeItem(key);
    return null;
  }

  return item.value;
};
