/**
 * Generate the negatives
 * from the search terms and output data (rules)
 * @param {*} searchTerms
 * @param {*} outputData
 * @return {string[]} negativeKeywords
 */
function getNegativeKeywords(searchTerms,
    outputData) {
  const negativeKeywords = [];
  for (const searchTerm of searchTerms) {
    if (searchTerm.split(' ').length > 10) {
      continue;
    }
    if (isNegativeKeyword(searchTerm, outputData)) {
      negativeKeywords.push(String(searchTerm).toLowerCase());
    }
  }
  NOTES.push('Sample of negative keywords generated (max 500)\n');
  NOTES.push(negativeKeywords.slice(0, 500).join('\n'));
  if (negativeKeywords.length === 0) {
    LOGS.push(`No negative keywords were generated`);
  }
  return negativeKeywords;
}
