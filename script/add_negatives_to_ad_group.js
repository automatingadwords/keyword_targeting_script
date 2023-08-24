
/**
 * Adds negative keywords to an Ad Group.
 * @param {string[]} negativeKeywords
 * @param {string} adGroupId
 */
function addNegativeKeywordsToAdGroup(negativeKeywords, adGroupId) {
  const adGroup = AdsApp.shoppingAdGroups().withIds([adGroupId]).get().next();
  negativeKeywords.forEach((negativeKeyword) => {
    adGroup.createNegativeKeyword(negativeKeyword);
  });
  LOGS.push(`Added ${negativeKeywords.length} negative keywords`);
}
