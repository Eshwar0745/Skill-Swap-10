// Predefined skill categories to prevent duplicates and typos
const SKILL_CATEGORIES = [
  'Programming',
  'Web Development',
  'Mobile Development',
  'Data Science',
  'Machine Learning',
  'Design',
  'UI/UX Design',
  'Graphic Design',
  'Photography',
  'Video Editing',
  'Music',
  'Language Learning',
  'Business',
  'Marketing',
  'Finance',
  'Writing',
  'Teaching',
  'Cooking',
  'Fitness',
  'Art',
  'Crafts',
  'Other'
];

// Map common variations to standard categories (case-insensitive)
const CATEGORY_ALIASES = {
  'coding': 'Programming',
  'programming': 'Programming',
  'software development': 'Programming',
  'web dev': 'Web Development',
  'frontend': 'Web Development',
  'backend': 'Web Development',
  'fullstack': 'Web Development',
  'mobile dev': 'Mobile Development',
  'ios': 'Mobile Development',
  'android': 'Mobile Development',
  'app development': 'Mobile Development',
  'data analytics': 'Data Science',
  'ai': 'Machine Learning',
  'ml': 'Machine Learning',
  'artificial intelligence': 'Machine Learning',
  'ui design': 'UI/UX Design',
  'ux design': 'UI/UX Design',
  'user experience': 'UI/UX Design',
  'graphic arts': 'Graphic Design',
  'visual design': 'Graphic Design',
  'photo': 'Photography',
  'video production': 'Video Editing',
  'languages': 'Language Learning',
  'foreign languages': 'Language Learning',
  'entrepreneurship': 'Business',
  'digital marketing': 'Marketing',
  'content writing': 'Writing',
  'copywriting': 'Writing',
  'education': 'Teaching',
  'culinary': 'Cooking',
  'exercise': 'Fitness',
  'workout': 'Fitness',
  'handmade': 'Crafts'
};

/**
 * Normalize a category string to a standard predefined value
 * @param {string} category - User-provided category
 * @returns {string} - Normalized category from SKILL_CATEGORIES
 */
function normalizeCategory(category) {
  if (!category || typeof category !== 'string') {
    return 'Other';
  }
  
  const normalized = category.trim().toLowerCase();
  
  // Check if it matches an alias
  if (CATEGORY_ALIASES[normalized]) {
    return CATEGORY_ALIASES[normalized];
  }
  
  // Check if it matches a standard category (case-insensitive)
  const match = SKILL_CATEGORIES.find(
    cat => cat.toLowerCase() === normalized
  );
  
  return match || 'Other';
}

/**
 * Normalize multiple categories
 * @param {string[]} categories - Array of user-provided categories
 * @returns {string[]} - Array of unique normalized categories
 */
function normalizeCategories(categories) {
  if (!Array.isArray(categories) || categories.length === 0) {
    return ['Other'];
  }
  
  const normalized = categories
    .map(normalizeCategory)
    .filter((cat, index, self) => self.indexOf(cat) === index); // Remove duplicates
  
  return normalized.length > 0 ? normalized : ['Other'];
}

module.exports = {
  SKILL_CATEGORIES,
  CATEGORY_ALIASES,
  normalizeCategory,
  normalizeCategories
};
