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
