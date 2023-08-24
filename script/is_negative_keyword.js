// Generate negative keywords from sheet data


/**
 * Decide whether the search term is a negative keyword based on
 * the search term and targeted phrases
 * returns false if any of the rows match the search term
 * @param {string} searchTerm
 * @param {string[]} targetedPhrases
 * @return {boolean} isNegative
 */
export function isNegativeKeyword(searchTerm, targetedPhrases) {
  for (const targetedPhrasesRow of targetedPhrases) {
    if (!isNegativeBasedOnRow(searchTerm, targetedPhrasesRow)) {
      return false;
    }
  }

  return true;

  /**
   * Check if the search term contains any of the targeted phrases
   * @param {string} searchTerm
   * @param {string[]} targetedPhrasesRow
   * @return {boolean} isNegative
   */
  function isNegativeBasedOnRow(searchTerm, targetedPhrasesRow) {
    targetedPhrasesRow = targetedPhrasesRow.filter((phrase) => phrase !== '');
    const requiredMatches = targetedPhrasesRow.length;
    const searchTermWords = searchTerm.split(' ')
        .map((word) => String(word).toLowerCase().trim());

    let matches = 0;
    targetedPhrasesRow.forEach((phrase) => {
      if (searchTermWords.indexOf(String(phrase).toLowerCase()) > -1) {
        matches++;
      }
    });
    return matches < requiredMatches;
  }
}
