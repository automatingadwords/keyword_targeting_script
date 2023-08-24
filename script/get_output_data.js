import {APP_ENVIRONMENT, APP_ENVIRONMENTS} from '../script/settings.js';

/**
 * get the phrases from the targeting tool output sheet
  * @param {string} spreadsheetUrl
 * @return {string[]} phrases
 */
function getTargetingToolOutputData(spreadsheetUrl=null) {
  if (APP_ENVIRONMENT === APP_ENVIRONMENTS.LOCAL) {
    const data = [
      ['water', 'pool', 'spout'],
      ['water', '', 'spout'],
      ['water', 'pool', 'scupper'],
      ['water', '', 'scupper'],
    ];
    return data;
  }
  const outputsSheet = SpreadsheetApp.openByUrl(spreadsheetUrl)
      .getSheetByName(OUTPUT_SHEET_NAME);
  if (!outputsSheet.getRange('A1').getValue()) {
    LOGS.push('No output data found. Please check the settings sheet.');
    return [];
  }
  const outputData = outputsSheet.getDataRange().getValues();
  return outputData;
}
