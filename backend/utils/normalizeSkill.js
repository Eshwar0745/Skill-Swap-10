/**
 * Normalize skill title to prevent duplicates from typos and case variations
 * @param {string} title - User-provided skill title
 * @returns {string} - Normalized title
 */
function normalizeSkillTitle(title) {
  if (!title || typeof title !== 'string') {
    return '';
  }
  
  return title
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
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
