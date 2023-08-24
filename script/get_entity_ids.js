
/**
 * Get the campaign and ad group ID too
 * @param {string} spreadsheetUrl
 * @return {Object} ids
 */
function getEntityIds(spreadsheetUrl) {
  const spreadsheet = SpreadsheetApp.openByUrl(spreadsheetUrl);
  const inputsSheet = spreadsheet.getSheetByName('Inputs');
  const campaignId = inputsSheet.getRange('C4').getValue();
  const adGroupId = inputsSheet.getRange('C5').getValue();

  if (!campaignId || !adGroupId) {
    const warning = `No campaignId or adGroupId found for 
      ${settings.spreadsheetUrl}. Check the Inputs sheet`;
    LOGS.push(warning);
  }

  return {
    campaignId,
    adGroupId,
  };
}


