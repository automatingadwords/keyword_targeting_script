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
