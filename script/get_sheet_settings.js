/**
 * Get the output data from the targeting tool spreadsheet
 * @param {string} spreadsheetUrl
 * @return {array} outputData
 */
function getOutputData(spreadsheetUrl) {
  const spreadsheet = SpreadsheetApp.openByUrl(spreadsheetUrl);
  const outputsSheet = spreadsheet.getSheetByName('Outputs');
  const outputData = outputsSheet.getDataRange().getValues();
  return outputData;
}

/**
 * Get the settings from the management spreadsheet
 * @return {Object[]} settings
 */
function getSheetSettings() {
  const sheetSettings = MANAGEMENT_SPREADSHEET.getDataRange().getValues();
  sheetSettings.shift();
  sheetSettings.shift();
  sheetSettings.shift();
  sheetSettings.shift();
  sheetSettings.shift();
  console.log(`sheetSettings: ${sheetSettings}`);
  settings = [];
  let rowNumber = 6;
  for (const row of sheetSettings) {
    const spreadsheetUrl = row[2].trim();
    if (spreadsheetUrl === '') {
      continue;
    }
    const lookback = row[3];
    const minImpressions = row[4];
    const searchTermContains = row[5].split(',')
        .map((phrase) => String(phrase).trim())
        .filter((phrase) => phrase !== '');
    const searchTermDoesNotContain = row[6].split(',')
        .map((phrase) => String(phrase).trim())
        .filter((phrase) => phrase !== '');

    settings.push({
      spreadsheetUrl,
      lookback,
      minImpressions,
      searchTermContains,
      searchTermDoesNotContain,
      rowNumber,
    });
    rowNumber++;
  }
  return settings;
}
