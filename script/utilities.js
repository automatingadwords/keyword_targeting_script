function log(x) {
  console.log(x);
}

/**
 * Get the google ads formatted date range
 * @param {number} lookback in days
 * @return {object} date range in format {startDate, endDate}
 */
function getDateRange(lookback) {
  const today = getAdWordsFormattedDate(0, 'yyyyMMdd');

  return {
    startDate: getAdWordsFormattedDate(lookback, 'yyyyMMdd'),
    endDate: today,
  };
}

/**
* Get AdWords Formatted date for n days back
* @param {int} d - Numer of days to go back for start/end date
* @param {String} format - Format of date to return
* @return {String} - Formatted date yyyyMMdd
**/
function getAdWordsFormattedDate(d, format) {
  const date = new Date();
  date.setDate(date.getDate() - d);
  return Utilities.formatDate(
      date,
      AdsApp.currentAccount().getTimeZone(),
      format,
  );
}
