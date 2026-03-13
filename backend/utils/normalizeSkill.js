/**
 * Normalize skill title to prevent duplicates from typos and case variations
 * @param {string} title - User-provided skill title
 * @returns {string} - Normalized title
 */
function normalizeSkillTitle(title) {
  if (!title || typeof title !== 'string') {
    return '';
  }
  
  let normalized = title.trim().toLowerCase().replace(/\s+/g, ' ');

  // 1. Direct Alias Mapping
  const aliases = {
    'reactjs': 'react',
    'react.js': 'react',
    'nodejs': 'node js',
    'node.js': 'node js',
    'vuejs': 'vue',
    'vue.js': 'vue',
    'front-end': 'frontend',
    'back-end': 'backend',
    'c plus plus': 'c++',
    'c sharp': 'c#',
    'ui/ux': 'ui ux'
  };

  if (aliases[normalized]) {
    normalized = aliases[normalized];
  } else {
    // 2. Strip filler words
    const words = normalized.split(' ');
    if (words.length > 1) {
      const stopWords = [
        'programming', 'development', 'developer', 'coding', 
        'language', 'tutorial', 'tutor', 'tutoring', 
        'basics', 'advanced', 'expert', 'course', 'training'
      ];
      const filteredWords = words.filter(w => !stopWords.includes(w));
      if (filteredWords.length > 0) {
        normalized = filteredWords.join(' ');
      }
    }
  }

  return normalized
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Title case
    .join(' ');
}

/**
 * Normalize tag to prevent duplicates
 * @param {string} tag - User-provided tag
 * @returns {string} - Normalized tag (lowercase, trimmed)
 */
function normalizeTag(tag) {
  if (!tag || typeof tag !== 'string') {
    return '';
  }
  
  return tag
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-'); // Replace spaces with hyphens for multi-word tags
}

/**
 * Normalize multiple tags
 * @param {string[]} tags - Array of user-provided tags
 * @returns {string[]} - Array of unique normalized tags
 */
function normalizeTags(tags) {
  if (!Array.isArray(tags)) {
    return [];
  }
  
  const normalized = tags
    .map(normalizeTag)
    .filter(tag => tag.length > 0)
    .filter((tag, index, self) => self.indexOf(tag) === index); // Remove duplicates
  
  return normalized;
}

module.exports = {
  normalizeSkillTitle,
  normalizeTag,
  normalizeTags
};
