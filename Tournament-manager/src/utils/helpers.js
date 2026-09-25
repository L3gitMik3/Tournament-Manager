// ============================================
// DATE FORMATTERS
// ============================================

// Format date for display
export const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Format time for display
export const formatTime = (time) => {
  if (!time) return '-';
  return new Date(time).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Format datetime
export const formatDateTime = (datetime) => {
  if (!datetime) return '-';
  return `${formatDate(datetime)} ${formatTime(datetime)}`;
};

// ============================================
// TEXT FORMATTERS
// ============================================

// Truncate text
export const truncate = (text, length = 50) => {
  if (!text) return '';
  return text.length > length ? text.substring(0, length) + '...' : text;
};

// Capitalize first letter
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// ============================================
// STATUS HELPERS
// ============================================

// Get status color (Tailwind classes)
export const getStatusColor = (status) => {
  const colors = {
    scheduled: 'bg-blue-100 text-blue-800',
    ongoing: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    forfeited: 'bg-red-100 text-red-800',
    setup: 'bg-gray-100 text-gray-800',
    active: 'bg-green-100 text-green-800',
    finished: 'bg-blue-100 text-blue-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

// Get status label
export const getStatusLabel = (status) => {
  const labels = {
    scheduled: 'Scheduled',
    ongoing: 'Live',
    completed: 'Completed',
    forfeited: 'Forfeited',
    setup: 'Setup',
    active: 'Active',
    finished: 'Finished',
  };
  return labels[status] || status;
};

// Get status badge color (hex colors)
export const getStatusBadgeColor = (status) => {
  const colors = {
    scheduled: '#3B82F6',    // blue
    ongoing: '#F59E0B',      // yellow
    completed: '#10B981',    // green
    forfeited: '#EF4444',    // red
    setup: '#6B7280',        // gray
    active: '#10B981',       // green
    finished: '#3B82F6',     // blue
  };
  return colors[status] || '#6B7280';
};

// ============================================
// TOURNAMENT HELPERS
// ============================================

// Generate share URL
export const getShareUrl = (tournamentId) => {
  return `${window.location.origin}/t/${tournamentId}`;
};

// Copy to clipboard
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy:', error);
    // Fallback method
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (fallbackError) {
      return false;
    }
  }
};

// ============================================
// VALIDATION HELPERS
// ============================================

// Validate email
export const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// Validate phone number
export const isValidPhone = (phone) => {
  const regex = /^[0-9+\-\s()]{10,15}$/;
  return regex.test(phone);
};

// ============================================
// ARRAY HELPERS
// ============================================

// Group array by key
export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const groupKey = item[key];
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {});
};
// src/utils/helpers.js

/**
 * Get the full image URL from a stored path
 * @param {string} value - The stored logo_url (filename or full URL)
 * @param {string} folder - Folder name (e.g., 'tournaments', 'teams')
 * @returns {string|null} - Full image URL or null
 */
export const getImageUrl = (value, folder = 'tournaments') => {
  if (!value) return null;

  const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '');

  // Keep external URLs, but route stored uploads through the backend.
  if (value.startsWith('http://') || value.startsWith('https://')) {
    const parsedUrl = new URL(value);
    if (parsedUrl.pathname.startsWith('/uploads/')) {
      return `${baseUrl}${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
    }
    return value;
  }

  if (value.startsWith('/uploads/')) {
    return `${baseUrl}${value}`;
  }

  // Remove any leading slashes to prevent double slashes
  const cleanFilename = value.replace(/^\/+/, '');
  return `${baseUrl}/uploads/${folder}/${cleanFilename}`;
};

// Sort array by key
export const sortBy = (array, key, ascending = true) => {
  return [...array].sort((a, b) => {
    if (a[key] < b[key]) return ascending ? -1 : 1;
    if (a[key] > b[key]) return ascending ? 1 : -1;
    return 0;
  });
};

// ============================================
// NUMBER HELPERS
// ============================================

// Format number with commas
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// Get ordinal suffix (1st, 2nd, 3rd, etc.)
export const getOrdinal = (n) => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

// ============================================
// OBJECT HELPERS
// ============================================

// Check if object is empty
export const isEmpty = (obj) => {
  return !obj || Object.keys(obj).length === 0;
};

// Remove null/undefined values from object
export const cleanObject = (obj) => {
  const result = {};
  for (const key in obj) {
    if (obj[key] !== null && obj[key] !== undefined && obj[key] !== '') {
      result[key] = obj[key];
    }
  }
  return result;
};

// ============================================
// URL HELPERS
// ============================================

// src/utils/helpers.js

/**
 * Resolve a stored image path to a full URL.
 * @param {string} value - The stored image path (filename, relative path, or full URL).
 * @param {string} [folder] - Optional folder name (e.g., 'gallery', 'teams').
 * @param {string} [baseUrl] - Optional base URL (defaults to VITE_API_URL or 'http://localhost:5000').
 * @returns {string} - A fully resolvable image URL or a placeholder.
 */
export const resolveImageUrl = (
  value,
  folder = null,
  baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'
) => {
  // 1. Handle empty or non‑string input
  if (!value || typeof value !== 'string') {
    return 'https://via.placeholder.com/400x300?text=No+Image';
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return 'https://via.placeholder.com/400x300?text=No+Image';
  }

  const normalizedBaseUrl = baseUrl.replace(/\/+$/, '');

  // 2. Keep external URLs, but route uploaded files through the backend.
  if (/^https?:\/\//i.test(trimmed)) {
    const parsedUrl = new URL(trimmed);
    if (parsedUrl.pathname.startsWith('/uploads/')) {
      return `${normalizedBaseUrl}${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
    }
    return trimmed;
  }

  if (/^data:/i.test(trimmed)) {
    return trimmed;
  }

  // 3. If it starts with '/', prepend the base URL
  if (trimmed.startsWith('/')) {
    return `${normalizedBaseUrl}${trimmed}`;
  }

  // 4. If it starts with 'uploads/', prepend base URL + '/'
  if (trimmed.startsWith('uploads/')) {
    return `${normalizedBaseUrl}/${trimmed}`;
  }

  // 5. Otherwise, treat as a plain filename and construct a full path
  const folderPath = folder ? `/${folder}` : '';
  return `${normalizedBaseUrl}/uploads${folderPath}/${trimmed}`;
};

// Get URL parameter
export const getUrlParam = (param) => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
};

// Build query string
export const buildQueryString = (params) => {
  const query = new URLSearchParams();
  for (const key in params) {
    if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
      query.append(key, params[key]);
    }
  }
  return query.toString();
};