let LOGS = [];
let NOTES = [];

function main() {
  if (!SCRIPT_MANAGER_SHEET.getRange('C6').getValue()) {
    console.error(`Please add settings rows to the management sheet`);
    return;
  }
  const allAdGroupSettings = getSheetSettings();
  // console.log(`allAdGroupSettings: ${JSON.stringify(allAdGroupSettings)}`);
  runRow(allAdGroupSettings[0]);
  addLogsToManagementSheet(allAdGroupSettings[0].rowNumber);
  console.log(`LOGS: ${LOGS}`);
}

/**
 * Run the logic for a single row
 * @param {object} settings
 */
function runRow(settings) {
  LOGS = ['The script has not completed running'];
  NOTES = [];
  // reset the logs and notes
  addLogsToManagementSheet(settings.rowNumber);
  LOGS = [];
  if (AdsApp.getExecutionInfo().isPreview()) {
    LOGS.push(`No negative keywords will be added in preview mode`);
    NOTES.push(`Preview mode`);
  }
  const entityIds = getEntityIds(settings.spreadsheetUrl);
  const {campaignId, adGroupId} = entityIds;
  if (!campaignId || !adGroupId) {
    return;
  }

  addEntityNamesToManagementSheet(campaignId, adGroupId, settings.rowNumber);

  const searchTerms = getSearchTerms(campaignId, adGroupId, settings);

  if (searchTerms.length === 0) {
    return;
  }

  const outputData = getTargetingToolOutputData(settings.spreadsheetUrl);
  if (outputData.length === 0) {
    return;
  }

  const negativeKeywords = getNegativeKeywords(searchTerms,
      outputData);


  addNegativeKeywordsToAdGroup(negativeKeywords, adGroupId);

  LOGS.push(`Ad Group processed successfully`);
  console.log(LOGS.join('\n'));
}

