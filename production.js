
const APP_ENVIRONMENTS = {
  'PRODUCTION': 'production',
  'LOCAL': 'local',
};

// Set to LOCAL to run tests
const APP_ENVIRONMENT = APP_ENVIRONMENTS.PRODUCTION;


//end of settings.js



/**
 * Majestic Water Supplies Keyword Targeting Script
 * Compare output phrases to search terms
 * generate negative keywords based on contains logic
 * Shopping Ads only
 * @version 1.0
 * @authors shabba.io
 */

const SPREADSHEET_LINKS_HUB_URL = 'https://docs.google.com/spreadsheets/d/1FN70iyi_uz1l_AYFtAHBSVdDG_iS1wob_ev0ZidhQ5A/edit#gid=0';
const LINKS_HUB_SHEET = SpreadsheetApp.openByUrl(SPREADSHEET_LINKS_HUB_URL)
    .getSheets()[0];

// default to the default (first row)
let MANAGEMENT_SPREADSHEET_URL = LINKS_HUB_SHEET.getRange('B7').getValue();
const hubRow = SpreadsheetApp.openByUrl(SPREADSHEET_LINKS_HUB_URL)
    .getSheets()[0]
    .getDataRange().getValues()
    .filter((row) => {
      return row[0] === AdsApp.currentAccount().getCustomerId();
    });

if (hubRow.length > 0) {
  MANAGEMENT_SPREADSHEET_URL = hubRow[0][1];
}
log('Management Spreadsheet URL: ' + MANAGEMENT_SPREADSHEET_URL);
const MANAGEMENT_SPREADSHEET = SpreadsheetApp
    .openByUrl(MANAGEMENT_SPREADSHEET_URL);

const SCRIPT_MANAGER_SHEET_NAME = 'Script Manager';
const SCRIPT_MANAGER_SHEET = MANAGEMENT_SPREADSHEET
    .getSheetByName(SCRIPT_MANAGER_SHEET_NAME);

const OUTPUT_SHEET_NAME = 'Outputs';


//end of constants.js



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



//end of main.js



/**
 * Get the campaign and ad group name from the api
 * add them to the management sheet row
 * @param {string} campaignId
 * @param {string} adGroupId
 * @param {number} managementSheetRow
 */
function addEntityNamesToManagementSheet(
    campaignId,
    adGroupId,
    managementSheetRow,
) {
  const query = `SELECT campaign.name, ad_group.name FROM ad_group
WHERE ad_group.id = ${adGroupId}
AND campaign.id = ${campaignId}
`;
  console.log(`ad_group query: ${query}`);
  const rows = AdsApp.report(query).rows();
  if (!rows.hasNext()) {
    throw new Error(`No ad group found with id ${adGroupId}
    in campaign ${campaignId}`);
  }
  const row = rows.next();
  const campaignName = row['campaign.name'];
  const adGroupName = row['ad_group.name'];
  SCRIPT_MANAGER_SHEET.getRange(managementSheetRow, 1).setValue(campaignName);
  SCRIPT_MANAGER_SHEET.getRange(managementSheetRow, 2).setValue(adGroupName);
}


//end of add_entity_names_to_sheet.js



/**
 * Add logs to management sheet
 * @param {number} rowNumber
 */
function addLogsToManagementSheet(rowNumber) {
  // remove full stops from the end of each log
  LOGS = LOGS.map((log) => {
    if (log.endsWith('.')) {
      return log.slice(0, -1);
    }
    return log;
  });
  SCRIPT_MANAGER_SHEET.getRange(rowNumber, 8).setValue(LOGS.join('. '));
  SCRIPT_MANAGER_SHEET.getRange(rowNumber, 8).setNote(NOTES.join('\n'));
  SCRIPT_MANAGER_SHEET.getRange(rowNumber, 9).setValue(new Date());
}


//end of add_logs_to_management_sheet.js




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


//end of add_negatives_to_ad_group.js




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




//end of get_entity_ids.js



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


//end of get_negative_keywords.js



//import {APP_ENVIRONMENT, APP_ENVIRONMENTS} from '../script/settings.js';

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


//end of get_output_data.js





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


//end of get_search_terms.js



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


//end of get_sheet_settings.js



// Generate negative keywords from sheet data


/**
 * Decide whether the search term is a negative keyword based on
 * the search term and targeted phrases
 * returns false if any of the rows match the search term
 * @param {string} searchTerm
 * @param {string[]} targetedPhrases
 * @return {boolean} isNegative
 */
function isNegativeKeyword(searchTerm, targetedPhrases) {
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


//end of is_negative_keyword.js



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


//end of utilities.js



// Bundle created at 2023-08-24 16:50:13
// Application environment: APP_ENVIRONMENTS.PRODUCTION;