

/**
 * get the search terms from the api
 * @param {string} campaignId
 * @param {string} adGroupId
 * @param {Object} settings
 * @return {string[]} searchTerms
 */
function getSearchTerms(campaignId, adGroupId, settings) {
  const dateRange = getDateRange(settings.lookback);
  // log( `dateRange: ${JSON.stringify(dateRange)}`);
  const query = `SELECT metrics.clicks, metrics.impressions, 
    search_term_view.search_term
    FROM search_term_view
    WHERE ad_group.id = ${adGroupId}
    AND campaign.id = ${campaignId}
    AND metrics.impressions >= ${settings.minImpressions}
    AND segments.date BETWEEN ${dateRange.startDate}
    AND ${dateRange.endDate}
    `;
  console.log(`search term query: ${query}`);
  const rows = AdsApp.report(query).rows();
  if (!rows.hasNext()) {
    LOGS.push(`No search terms found for ad group ${adGroupId}
      in campaign ${campaignId}`);
  }
  const searchTerms = [];
  while (rows.hasNext()) {
    const row = rows.next();
    const searchTerm = row['search_term_view.search_term'];
    let skip = false;
    for (const searchTermContains in settings.searchTermContains) {
      if (!searchTerm.includes(searchTermContains)) {
        skip = true;
      }
    }
    for (const searchTermDoesNotContain in settings.searchTermDoesNotContain) {
      if (searchTerm.includes(searchTermDoesNotContain)) {
        skip = true;
      }
    }
    if (skip) {
      continue;
    }
    searchTerms.push(searchTerm);
  }
  if (searchTerms.length === 0) {
    LOGS.push(`No search terms found for review`);
    return [];
  }
  LOGS.push(`${searchTerms.length} search terms will be reviewed`);
  return searchTerms;
}
